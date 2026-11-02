import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../../config";
import { prisma } from "../../db";
import { ENV_USER_ID, loadStaff, requireStaff, signStaffToken } from "../../lib/auth";
import { ah, unauthorized } from "../../lib/errors";
import { safeEqual, verifyPassword } from "../../lib/password";

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

adminAuthRouter.get("/me", requireStaff(), ah(async (req, res) => {
    res.json({ data: publicStaff(req.staff!) });
}));
