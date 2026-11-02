import crypto from "node:crypto";

/** scrypt hash in the form scrypt$<salt>$<hash> (salted, memory-hard). */
export function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    return `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

const DUMMY = hashPassword("dummy-password-for-timing");

export function verifyPassword(password: string, stored: string | undefined) {
    const [scheme, salt, hash] = (stored ?? DUMMY).split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const a = crypto.scryptSync(password, salt, 64);
    const b = Buffer.from(hash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b) && Boolean(stored);
}

export const passwordProblem = (p: string) =>
    p.length < 8 ? "A palavra-passe deve ter pelo menos 8 caracteres." : p.length > 200 ? "Palavra-passe demasiado longa." : null;
