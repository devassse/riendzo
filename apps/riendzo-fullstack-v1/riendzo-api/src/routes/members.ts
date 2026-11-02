import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db";
import { requireMember, signMemberToken } from "../lib/auth";
import { ah, badRequest, conflict, notFound, unauthorized } from "../lib/errors";
import { hashPassword, passwordProblem, verifyPassword } from "../lib/password";
import type { Favorite, Member } from "@prisma/client";

export const membersRouter = Router();

export const normalizePhone = (p: string) => {
    let d = p.replace(/[^\d]/g, "");
    if (/^8\d{8}$/.test(d)) d = `258${d}`;
    return d;
};

type Full = Member & { favorites: Favorite[] };
/** The member without the password hash; null columns are left out (same shape as the old JSON store). */
export const toPublicMember = ({ passwordHash: _h, favorites, createdAt, ...m }: Full) =>
    Object.fromEntries(
        Object.entries({
            ...m,
            createdAt: createdAt.toISOString(),
            favorites: [...favorites]
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((f) => ({ collection: f.collection, slug: f.slug, at: f.createdAt.toISOString() })),
        }).filter(([, v]) => v !== null)
    );

const withFavorites = { favorites: true } as const;

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, standardHeaders: "draft-7", legacyHeaders: false,
    message: { error: { code: "rate_limited", message: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." } },
});

membersRouter.post("/register", authLimiter, ah(async (req, res) => {
    const b = z.object({
        firstName: z.string().trim().min(1, "Indique o nome e o apelido.").max(50),
        lastName: z.string().trim().min(1, "Indique o nome e o apelido.").max(50),
        contact: z.string().trim().min(3).max(120),
        password: z.string().max(200),
        confirm: z.string().max(200),
    }).parse(req.body);

    const isEmail = b.contact.includes("@");
    const email = isEmail ? b.contact.toLowerCase() : undefined;
    const phone = isEmail ? undefined : normalizePhone(b.contact);
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.contact)) throw badRequest("E-mail inválido.");
    if (!isEmail && !/^\d{9,15}$/.test(phone ?? "")) throw badRequest("Indique um e-mail ou um número de telefone válido.");
    const problem = passwordProblem(b.password);
    if (problem) throw badRequest(problem);
    if (b.password !== b.confirm) throw badRequest("As palavras-passe não coincidem.");

    const exists = await prisma.member.findFirst({ where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] }, select: { id: true } });
    if (exists) throw conflict("Já existe uma conta com este contacto.");

    const m = await prisma.member.create({
        data: { firstName: b.firstName, lastName: b.lastName, email, phone, passwordHash: hashPassword(b.password) },
        include: withFavorites,
    });
    res.status(201).json({ data: { token: signMemberToken(m.id), member: toPublicMember(m) } });
}));

membersRouter.post("/login", authLimiter, ah(async (req, res) => {
    const b = z.object({ contact: z.string().trim().min(3).max(120), password: z.string().max(200) }).parse(req.body);
    const m = await prisma.member.findFirst({
        where: b.contact.includes("@") ? { email: b.contact.toLowerCase() } : { phone: normalizePhone(b.contact) },
        include: withFavorites,
    });
    // always runs the hash comparison, so timing does not reveal whether the account exists
    const ok = verifyPassword(b.password, m?.passwordHash);
    if (!m || !ok || m.status !== "active") throw unauthorized("Contacto ou palavra-passe incorretos.");
    res.json({ data: { token: signMemberToken(m.id), member: toPublicMember(m) } });
}));

membersRouter.get("/me", requireMember, ah(async (req, res) => {
    const m = await prisma.member.findUniqueOrThrow({ where: { id: req.member!.id }, include: withFavorites });
    res.json({ data: toPublicMember(m) });
}));

membersRouter.patch("/me", requireMember, ah(async (req, res) => {
    const b = z.object({
        firstName: z.string().trim().min(1).max(50).optional(),
        lastName: z.string().trim().min(1).max(50).optional(),
        avatar: z.string().max(500).nullable().optional(),
        bio: z.string().trim().max(500).nullable().optional(),
        province: z.string().trim().max(60).nullable().optional(),
        birthYear: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
        languages: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
        interests: z.array(z.string().trim().min(1).max(40)).max(40).optional(),
        travelStyle: z.string().trim().max(60).nullable().optional(),
    }).strict().parse(req.body);
    const m = await prisma.member.update({ where: { id: req.member!.id }, data: b, include: withFavorites });
    res.json({ data: toPublicMember(m) });
}));

membersRouter.post("/me/password", requireMember, authLimiter, ah(async (req, res) => {
    const b = z.object({ current: z.string().max(200), next: z.string().max(200) }).parse(req.body);
    const m = await prisma.member.findUniqueOrThrow({ where: { id: req.member!.id } });
    if (!verifyPassword(b.current, m.passwordHash)) throw badRequest("A palavra-passe atual não está correta.");
    const problem = passwordProblem(b.next);
    if (problem) throw badRequest(problem);
    await prisma.member.update({ where: { id: m.id }, data: { passwordHash: hashPassword(b.next) } });
    res.json({ data: { ok: true } });
}));

membersRouter.get("/me/favorites", requireMember, ah(async (req, res) => {
    const rows = await prisma.favorite.findMany({ where: { memberId: req.member!.id }, orderBy: { createdAt: "desc" } });
    res.json({ data: rows.map((f) => ({ collection: f.collection, slug: f.slug, at: f.createdAt.toISOString() })) });
}));

/** Adds the favourite, or removes it if it already exists. Returns { favorited }. */
membersRouter.post("/me/favorites/toggle", requireMember, ah(async (req, res) => {
    const b = z.object({ collection: z.string().max(60), slug: z.string().max(80) }).parse(req.body);
    const memberId = req.member!.id;
    const key = { memberId_collection_slug: { memberId, collection: b.collection, slug: b.slug } };

    const existing = await prisma.favorite.findUnique({ where: key });
    if (existing) {
        await prisma.favorite.delete({ where: key });
        return res.json({ data: { favorited: false } });
    }
    const target = await prisma.item.findUnique({ where: { collectionId_slug: { collectionId: b.collection, slug: b.slug } }, select: { status: true } });
    if (!target || target.status === "draft") throw notFound("Conteúdo não encontrado.");
    await prisma.favorite.create({ data: { memberId, collection: b.collection, slug: b.slug } });
    // keep the newest 500
    const old = await prisma.favorite.findMany({ where: { memberId }, orderBy: { createdAt: "desc" }, skip: 500, select: { collection: true, slug: true } });
    if (old.length) await prisma.favorite.deleteMany({ where: { memberId, OR: old.map((o) => ({ collection: o.collection, slug: o.slug })) } });
    res.json({ data: { favorited: true } });
}));
