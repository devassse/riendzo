import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../db";
import { forbidden, unauthorized } from "./errors";
import { safeEqual } from "./password";

export type OwnerRef = { collection: string; slug: string };

export type StaffPrincipal = {
    id: string;
    username: string;
    name: string;
    role: Role;
    ownerOf: OwnerRef[];
    via: "jwt" | "key";
};

type Claims = { kind: "staff" | "member" };

const ALG = "HS256" as const;

export const signStaffToken = (id: string) =>
    jwt.sign({ kind: "staff" } satisfies Claims, config.jwtSecret, { subject: id, expiresIn: "8h", algorithm: ALG });

export const signMemberToken = (id: string) =>
    jwt.sign({ kind: "member" } satisfies Claims, config.jwtSecret, { subject: id, expiresIn: "30d", algorithm: ALG });

function bearer(req: Request) {
    const h = req.header("authorization");
    return h && /^Bearer\s+\S+$/i.test(h) ? h.split(/\s+/)[1] : null;
}

function claimsOf(token: string): { sub: string; kind: Claims["kind"] } {
    try {
        const p = jwt.verify(token, config.jwtSecret, { algorithms: [ALG] }) as jwt.JwtPayload & Partial<Claims>;
        if (!p.sub || (p.kind !== "staff" && p.kind !== "member")) throw new Error("claims");
        return { sub: p.sub, kind: p.kind };
    } catch {
        throw unauthorized();
    }
}

/** The owner account from the environment (ADMIN_USERNAME / ADMIN_PASSWORD) has the fixed id "env". */
export const ENV_USER_ID = "env";

export async function loadStaff(id: string): Promise<StaffPrincipal | null> {
    if (id === ENV_USER_ID) {
        return { id, username: config.adminUsername, name: "Administrador", role: "admin", ownerOf: [], via: "jwt" };
    }
    const u = await prisma.adminUser.findUnique({ where: { id } });
    if (!u || !u.active) return null;
    return {
        id: u.id, username: u.username, name: u.name, role: u.role,
        ownerOf: Array.isArray(u.ownerOf) ? (u.ownerOf as OwnerRef[]) : [], via: "jwt",
    };
}

/**
 * Staff access: a staff JWT (BackOffice login) or the service key used by the
 * Next.js server (header x-api-key). Pass roles to restrict further.
 */
export const requireStaff =
    (...roles: Role[]) =>
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const key = req.header("x-api-key");
            if (key && config.serviceApiKey && safeEqual(key, config.serviceApiKey)) {
                const acting = (req.header("x-acting-user") ?? "").slice(0, 60).trim();
                req.staff = { id: "service", username: acting || "frontend", name: acting || "Frontend", role: "admin", ownerOf: [], via: "key" };
            } else {
                const token = bearer(req);
                if (!token) throw unauthorized();
                const c = claimsOf(token);
                if (c.kind !== "staff") throw unauthorized();
                const staff = await loadStaff(c.sub);
                if (!staff) throw unauthorized();
                req.staff = staff;
            }
            if (roles.length && !roles.includes(req.staff.role)) throw forbidden();
            next();
        } catch (e) {
            next(e);
        }
    };

export async function requireMember(req: Request, _res: Response, next: NextFunction) {
    try {
        const token = bearer(req);
        if (!token) throw unauthorized();
        const c = claimsOf(token);
        if (c.kind !== "member") throw unauthorized();
        const m = await prisma.member.findUnique({ where: { id: c.sub }, select: { id: true, status: true } });
        if (!m || m.status !== "active") throw unauthorized();
        req.member = { id: m.id };
        next();
    } catch (e) {
        next(e);
    }
}
