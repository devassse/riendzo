import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../../config";
import { prisma } from "../../db";
import { ENV_USER_ID, loadStaff, requireStaff, signStaffToken } from "../../lib/auth";
import { ah, unauthorized } from "../../lib/errors";
import { hashPassword, safeEqual, staffPasswordProblem, verifyPassword } from "../../lib/password";
import { badRequest } from "../../lib/errors";
import { sendMail } from "../../lib/mailer";
import { consumeReset, createReset, resetMail } from "../../services/resets";
import { getSetting, setSetting } from "../../services/settings";
import { normalizePhone } from "../members";

export const adminAuthRouter = Router();

// Blocks brute force: 5 failed attempts per IP, then 15 minutes off
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 5, skipSuccessfulRequests: true, standardHeaders: "draft-7", legacyHeaders: false,
    message: { error: { code: "rate_limited", message: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." } },
});

const publicStaff = (s: NonNullable<Awaited<ReturnType<typeof loadStaff>>>) => ({
    id: s.id, username: s.username, name: s.name, role: s.role, ownerOf: s.ownerOf,
});

adminAuthRouter.post("/login", loginLimiter, ah(async (req, res) => {
    const b = z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(200) }).parse(req.body);

    // Both comparisons always run, so timing does not reveal which one failed
    const userOk = safeEqual(b.username.toLowerCase(), config.adminUsername);
    const passOk = safeEqual(b.password, config.adminPassword);
    let id: string | null = userOk && passOk ? ENV_USER_ID : null;

    if (!id) {
        const u = await prisma.adminUser.findUnique({ where: { username: b.username.toLowerCase() } });
        const ok = verifyPassword(b.password, u?.passwordHash);
        if (u && ok && u.active) {
            id = u.id;
            await prisma.adminUser.update({ where: { id: u.id }, data: { lastLogin: new Date() } });
        }
    }
    if (!id) throw unauthorized("Utilizador ou palavra-passe incorretos.");

    const staff = (await loadStaff(id))!;
    res.json({ data: { token: signStaffToken(id), user: publicStaff(staff) } });
}));

/** Profile (name, e-mail, phone, photo) of whoever is logged in. The main account (from .env) keeps its profile in settings. */
const profileBody = z.object({
    name: z.string().trim().max(80).optional(),
    email: z.string().trim().toLowerCase().email("E-mail inválido.").max(120).optional().or(z.literal("").transform(() => undefined)),
    phone: z.string().trim().max(30).optional().or(z.literal("").transform(() => undefined)),
    avatar: z.string().regex(/^\/api\/media\/\d{4}\/[a-f0-9]{24}\.(?:jpg|png|webp)$/).optional().or(z.literal("").transform(() => undefined)),
});

async function fullProfile(id: string) {
    const s = (await loadStaff(id))!;
    if (id === ENV_USER_ID) {
        const p = (await getSetting<Record<string, string>>("profile_env")) ?? {};
        return { ...publicStaff(s), name: p.name || s.name, email: p.email, phone: p.phone, avatar: p.avatar };
    }
    const u = await prisma.adminUser.findUniqueOrThrow({ where: { id } });
    return { ...publicStaff(s), email: u.email ?? undefined, phone: u.phone ?? undefined, avatar: u.avatar ?? undefined };
}

adminAuthRouter.get("/me", requireStaff(), ah(async (req, res) => {
    const s = req.staff!;
    res.json({ data: s.via === "key" ? publicStaff(s) : await fullProfile(s.id) });
}));

adminAuthRouter.patch("/me", requireStaff(), ah(async (req, res) => {
    const s = req.staff!;
    const b = profileBody.parse(req.body);
    if (b.phone && !/^\d{9,15}$/.test(normalizePhone(b.phone))) throw badRequest("Telefone inválido.");
    const phone = b.phone ? normalizePhone(b.phone) : undefined;
    if (s.id === ENV_USER_ID) {
        await setSetting("profile_env", { name: b.name, email: b.email, phone, avatar: b.avatar });
    } else if (s.via === "jwt") {
        if (!b.name) throw badRequest("Indique o nome.");
        await prisma.adminUser.update({ where: { id: s.id }, data: { name: b.name, email: b.email ?? null, phone: phone ?? null, avatar: b.avatar ?? null } });
    } else throw badRequest("Inicie sessão para editar o perfil.");
    res.json({ data: await fullProfile(s.id) });
}));

/** Reset link by e-mail (only for users with an e-mail; the main account is changed in the server settings). */
adminAuthRouter.post("/forgot", loginLimiter, ah(async (req, res) => {
    const { email } = z.object({ email: z.string().trim().toLowerCase().email().max(120) }).parse(req.body);
    const u = await prisma.adminUser.findUnique({ where: { email } });
    if (u && u.active) {
        const token = await createReset("staff", u.id);
        await sendMail({ to: email, ...resetMail(`${config.siteUrl}/admin/repor?token=${token}`) });
    }
    res.json({ data: { ok: true } });
}));

adminAuthRouter.post("/reset", loginLimiter, ah(async (req, res) => {
    const b = z.object({ token: z.string().length(64), password: z.string().max(200), confirm: z.string().max(200) }).parse(req.body);
    if (b.password !== b.confirm) throw badRequest("As palavras-passe não coincidem.");
    const problem = staffPasswordProblem(b.password);
    if (problem) throw badRequest(problem);
    const id = await consumeReset("staff", b.token);
    if (!id) throw badRequest("Este link já não é válido. Peça um novo.");
    await prisma.adminUser.update({ where: { id }, data: { passwordHash: hashPassword(b.password) } });
    res.json({ data: { ok: true } });
}));
