/**
 * BackOffice users (besides the owner account defined by environment variables).
 *   admin  -> everything, including the "Administrador" module
 *   editor -> all content, but not users / lists / menus
 *   owner  -> only the establishment(s) linked to the account
 */
import path from "node:path";
import crypto from "node:crypto";
import { CMS_DIR, locked, readJson, writeJson } from "./store";
import { hashPassword, staffPasswordProblem, verifyPassword } from "./password";

export type Role = "admin" | "editor" | "owner";
export type OwnerRef = { collection: string; slug: string };

export type AdminUser = {
    id: string;
    username: string;
    name: string;
    role: Role;
    ownerOf: OwnerRef[];
    /** For notifications and password recovery */
    email?: string;
    /** digits only, with country code (258…) */
    phone?: string;
    /** /api/media/<year>/<file> */
    avatar?: string;
    passwordHash: string;
    active: boolean;
    createdAt: string;
    lastLogin?: string;
};
export type PublicUser = Omit<AdminUser, "passwordHash">;

const FILE = path.join(CMS_DIR, "_users.json");
const read = async () => (await readJson<AdminUser[]>(FILE)) ?? [];
const strip = ({ passwordHash: _h, ...u }: AdminUser): PublicUser => u;

export const listUsers = async () => (await read()).map(strip);
export const getUserById = async (id: string) => (await read()).find((u) => u.id === id);

export type UserInput = { username: string; name: string; role: Role; password?: string; ownerOf?: OwnerRef[]; active?: boolean; email?: string; phone?: string };

export const normalizePhone = (p: string) => {
    let d = p.replace(/[^\d]/g, "");
    if (/^8\d{8}$/.test(d)) d = `258${d}`;
    return d;
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Checks the optional contact fields shared by the user form and the profile page. */
export function contactProblem(email?: string, phone?: string) {
    if (email && (!EMAIL.test(email.trim()) || email.length > 120)) return "E-mail inválido.";
    if (phone && !/^\d{9,15}$/.test(normalizePhone(phone))) return "Telefone inválido (ex.: 84 123 4567).";
    return null;
}

function validate(i: UserInput, creating: boolean, existing: AdminUser[], selfId?: string) {
    const username = i.username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) return "Utilizador: 3 a 32 caracteres (letras minúsculas, números, . _ -).";
    if (username === (process.env.ADMIN_USERNAME ?? "admin").toLowerCase()) return "Este nome de utilizador está reservado.";
    if (existing.some((u) => u.username === username && u.id !== selfId)) return "Já existe um utilizador com este nome.";
    if (!i.name.trim()) return "Indique o nome.";
    if (!["admin", "editor", "owner"].includes(i.role)) return "Perfil inválido.";
    if (i.role === "owner" && !(i.ownerOf?.length)) return "Associe pelo menos um estabelecimento ao proprietário.";
    const cp = contactProblem(i.email, i.phone);
    if (cp) return cp;
    const mail = i.email?.trim().toLowerCase();
    if (mail && existing.some((u) => u.email === mail && u.id !== selfId)) return "Já existe um utilizador com este e-mail.";
    if (creating || i.password) {
        const p = staffPasswordProblem(i.password ?? "");
        if (p) return p;
    }
    return null;
}

export function createUser(i: UserInput) {
    return locked(async () => {
        const users = await read();
        const problem = validate(i, true, users);
        if (problem) return { ok: false as const, error: problem };
        users.push({
            id: crypto.randomUUID(), username: i.username.trim().toLowerCase(), name: i.name.trim().slice(0, 80),
            role: i.role, ownerOf: i.role === "owner" ? i.ownerOf ?? [] : [], active: true,
            email: i.email?.trim().toLowerCase() || undefined, phone: i.phone ? normalizePhone(i.phone) : undefined,
            passwordHash: hashPassword(i.password!), createdAt: new Date().toISOString(),
        });
        await writeJson(FILE, users);
        return { ok: true as const };
    });
}

export function updateUser(id: string, i: UserInput) {
    return locked(async () => {
        const users = await read();
        const u = users.find((x) => x.id === id);
        if (!u) return { ok: false as const, error: "Utilizador não encontrado." };
        const problem = validate(i, false, users, id);
        if (problem) return { ok: false as const, error: problem };
        if (u.role === "admin" && (i.role !== "admin" || i.active === false) && users.filter((x) => x.role === "admin" && x.active).length <= 1 && !process.env.ADMIN_PASSWORD) {
            return { ok: false as const, error: "Tem de existir pelo menos um administrador ativo." };
        }
        u.username = i.username.trim().toLowerCase();
        u.name = i.name.trim().slice(0, 80);
        u.role = i.role;
        u.ownerOf = i.role === "owner" ? i.ownerOf ?? [] : [];
        if (i.active !== undefined) u.active = i.active;
        u.email = i.email?.trim().toLowerCase() || undefined;
        u.phone = i.phone ? normalizePhone(i.phone) : undefined;
        if (i.password) u.passwordHash = hashPassword(i.password);
        await writeJson(FILE, users);
        return { ok: true as const };
    });
}

export function deleteUser(id: string) {
    return locked(async () => writeJson(FILE, (await read()).filter((u) => u.id !== id)));
}

export function changeOwnPassword(id: string, current: string, next: string) {
    return locked(async () => {
        const users = await read();
        const u = users.find((x) => x.id === id);
        if (!u || !verifyPassword(current, u.passwordHash)) return { ok: false as const, error: "A palavra-passe atual não está correta." };
        const p = staffPasswordProblem(next);
        if (p) return { ok: false as const, error: p };
        u.passwordHash = hashPassword(next);
        await writeJson(FILE, users);
        return { ok: true as const };
    });
}

/** Password recovery: sets a new password without asking for the current one (the e-mail link proves ownership). */
export function setUserPassword(id: string, next: string) {
    return locked(async () => {
        const users = await read();
        const u = users.find((x) => x.id === id);
        if (!u || !u.active) return { ok: false as const, error: "Conta não encontrada." };
        const p = staffPasswordProblem(next);
        if (p) return { ok: false as const, error: p };
        u.passwordHash = hashPassword(next);
        await writeJson(FILE, users);
        return { ok: true as const };
    });
}

export async function findUserByEmail(email: string) {
    const mail = email.trim().toLowerCase();
    return (await read()).find((u) => u.email === mail && u.active);
}

/* ------------------------- Profile (name, contacts, photo) ------------------------- */

export type Profile = { name?: string; email?: string; phone?: string; avatar?: string };
const ENV_PROFILE = path.join(CMS_DIR, "_profile-env.json");

/** The owner account (from environment variables) has no user record: its profile lives in its own file. */
export const getEnvProfile = async () => (await readJson<Profile>(ENV_PROFILE)) ?? {};

export function saveProfile(userId: string, patch: Profile) {
    return locked(async () => {
        const name = patch.name?.trim().slice(0, 80) || undefined;
        const problem = contactProblem(patch.email, patch.phone);
        if (problem) return { ok: false as const, error: problem };
        const email = patch.email?.trim().toLowerCase() || undefined;
        const phone = patch.phone ? normalizePhone(patch.phone) : undefined;

        if (userId === "env") {
            await writeJson(ENV_PROFILE, { name, email, phone, avatar: patch.avatar || undefined } satisfies Profile);
            return { ok: true as const };
        }
        const users = await read();
        const u = users.find((x) => x.id === userId);
        if (!u) return { ok: false as const, error: "Utilizador não encontrado." };
        if (!name) return { ok: false as const, error: "Indique o nome." };
        if (email && users.some((x) => x.email === email && x.id !== userId)) return { ok: false as const, error: "Já existe um utilizador com este e-mail." };
        u.name = name; u.email = email; u.phone = phone; u.avatar = patch.avatar || undefined;
        await writeJson(FILE, users);
        return { ok: true as const };
    });
}

export function verifyLogin(username: string, password: string) {
    return locked(async () => {
        const users = await read();
        const u = users.find((x) => x.username === username.trim().toLowerCase());
        const ok = verifyPassword(password, u?.passwordHash); // always runs (timing)
        if (!u || !ok || !u.active) return null;
        u.lastLogin = new Date().toISOString();
        await writeJson(FILE, users);
        return strip(u);
    });
}

/** Keeps owner links valid when an establishment's slug changes or it is deleted. */
export function renameOwnerRefs(collection: string, oldSlug: string, newSlug: string | null) {
    return locked(async () => {
        const users = await read();
        let changed = false;
        for (const u of users) {
            const next = u.ownerOf.flatMap((r) =>
                r.collection === collection && r.slug === oldSlug ? (newSlug ? [{ collection, slug: newSlug }] : []) : [r]
            );
            if (next.length !== u.ownerOf.length || next.some((r, i) => r.slug !== u.ownerOf[i].slug)) {
                u.ownerOf = next;
                changed = true;
            }
        }
        if (changed) await writeJson(FILE, users);
    });
}

export async function ownersOf(collection: string, slug: string) {
    return (await read()).filter((u) => u.ownerOf.some((r) => r.collection === collection && r.slug === slug)).map(strip);
}
