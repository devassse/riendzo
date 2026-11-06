/**
 * BackOffice authentication (server only).
 *
 * Two kinds of accounts share the same login screen:
 *  - the OWNER account from environment variables (ADMIN_USERNAME / ADMIN_PASSWORD)
 *  - users created in "Administrador > Utilizadores" (admin, editor or owner of an establishment)
 * After login each role is sent to its own area (see `homeFor`).
 *
 * The session is a signed (HMAC-SHA256), httpOnly cookie that expires in 8h.
 * ADMIN_SESSION_SECRET (32+ chars) is required in production.
 */
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEnvProfile, getUserById, verifyLogin, type OwnerRef, type Role } from "./users";

const COOKIE = "riendzo_admin";
const MAX_AGE = 60 * 60 * 8;
const isProd = process.env.NODE_ENV === "production";
const secureCookie = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ?? isProd;

export function authConfig() {
    const password = process.env.ADMIN_PASSWORD ?? (isProd ? "" : "riendzo-admin");
    const secret = process.env.ADMIN_SESSION_SECRET ?? (isProd ? "" : "dev-only-secret-change-me-please-0123456789");
    return {
        username: process.env.ADMIN_USERNAME ?? "admin",
        password,
        secret,
        configured: Boolean(password && secret.length >= 32),
        usingDevDefaults: !isProd && !process.env.ADMIN_PASSWORD,
    };
}

export type Session = { userId: string; user: string; name: string; role: Role; ownerOf: OwnerRef[]; avatar?: string; email?: string; phone?: string };

const sha = (v: string) => crypto.createHash("sha256").update(v).digest();
const safeEqual = (a: string, b: string) => crypto.timingSafeEqual(sha(a), sha(b));
export const sign = (payload: string, secret: string) => crypto.createHmac("sha256", secret).update(payload).digest("base64url");

/** Returns who is logging in, or null. */
export async function checkCredentials(username: string, password: string) {
    const cfg = authConfig();
    if (!cfg.configured) return null;
    // Both comparisons always run, so timing doesn't reveal which one failed
    const userOk = safeEqual(username.trim(), cfg.username);
    const passOk = safeEqual(password, cfg.password);
    if (userOk && passOk) return { uid: "env", user: cfg.username, role: "admin" as Role };

    const u = await verifyLogin(username, password);
    return u ? { uid: u.id, user: u.username, role: u.role } : null;
}

export async function createSession(uid: string, user: string) {
    const { secret } = authConfig();
    const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
    const payload = Buffer.from(JSON.stringify({ uid, u: user, exp })).toString("base64url");
    (await cookies()).set(COOKIE, `${payload}.${sign(payload, secret)}`, {
        httpOnly: true, sameSite: "lax", secure: secureCookie, path: "/", maxAge: MAX_AGE,
    });
}

export async function destroySession() {
    (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
    const cfg = authConfig();
    if (!cfg.configured) return null;

    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = sign(payload, cfg.secret);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    try {
        const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { uid: string; u: string; exp: number };
        if (data.exp < Math.floor(Date.now() / 1000)) return null;
        if (data.uid === "env") {
            const p = await getEnvProfile();
            return { userId: "env", user: data.u, name: p.name || "Administrador", role: "admin", ownerOf: [], avatar: p.avatar, email: p.email, phone: p.phone };
        }
        // Always reload: a disabled or deleted user loses access immediately
        const u = await getUserById(data.uid);
        if (!u || !u.active) return null;
        return { userId: u.id, user: u.username, name: u.name, role: u.role, ownerOf: u.ownerOf, avatar: u.avatar, email: u.email, phone: u.phone };
    } catch {
        return null;
    }
}

/** Where each profile lands after logging in. */
export const homeFor = (role: Role) => (role === "owner" ? "/admin/meu-espaco" : "/admin");

/** For pages and server actions of the staff area (admin + editor). Owners are sent to their own portal. */
export async function requireAdmin(roles: Role[] = ["admin", "editor"]) {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    if (!roles.includes(session.role)) redirect(homeFor(session.role));
    return session;
}

/** Owner of this establishment, or staff (admin/editor). */
export async function requireAccessTo(collection: string, slug: string) {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    const allowed =
        session.role === "admin" || session.role === "editor" ||
        session.ownerOf.some((r) => r.collection === collection && r.slug === slug);
    if (!allowed) redirect(homeFor(session.role));
    return session;
}

/* Very small in-memory brute-force guard: 5 failures per IP / 15 minutes. */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 15 * 60 * 1000;

export function isLockedOut(ip: string) {
    const a = attempts.get(ip);
    if (!a) return false;
    if (Date.now() - a.first > WINDOW) {
        attempts.delete(ip);
        return false;
    }
    return a.count >= 5;
}
export function registerFailure(ip: string) {
    const a = attempts.get(ip);
    if (!a || Date.now() - a.first > WINDOW) attempts.set(ip, { count: 1, first: Date.now() });
    else a.count++;
}
export const clearFailures = (ip: string) => void attempts.delete(ip);
