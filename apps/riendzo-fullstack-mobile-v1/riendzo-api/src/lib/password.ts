import crypto from "node:crypto";

/** scrypt$<salt>$<hash> — o mesmo formato do frontend, por isso os hashes são compatíveis. */
export function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    return `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

const DUMMY = hashPassword("dummy-password-for-timing");

export function verifyPassword(password: string, stored: string | undefined | null) {
    const [scheme, salt, hash] = (stored ?? DUMMY).split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const a = crypto.scryptSync(password, salt, 64);
    const b = Buffer.from(hash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b) && Boolean(stored);
}

export const passwordProblem = (p: string) =>
    p.length < 8 ? "A palavra-passe deve ter pelo menos 8 caracteres." : p.length > 200 ? "Palavra-passe demasiado longa." : null;

/** BackOffice accounts: at least 8 characters, with letters AND numbers (alphanumeric). */
export const staffPasswordProblem = (p: string) =>
    passwordProblem(p) ?? (!/[A-Za-z]/.test(p) || !/\d/.test(p) ? "A palavra-passe deve ter letras e números (alfanumérica)." : null);

export const safeEqual = (a: string, b: string) => {
    const ha = crypto.createHash("sha256").update(a).digest();
    const hb = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
};
