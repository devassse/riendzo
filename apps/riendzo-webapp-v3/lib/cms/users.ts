/**
 * BackOffice users (besides the owner account defined by environment variables).
 *   admin  -> everything, including the "Administrador" module
 *   editor -> all content, but not users / lists / menus
 *   owner  -> only the establishment(s) linked to the account
 */
import path from "node:path";
import crypto from "node:crypto";
import { CMS_DIR, locked, readJson, writeJson } from "./store";
import { hashPassword, passwordProblem, verifyPassword } from "./password";

export type Role = "admin" | "editor" | "owner";
export type OwnerRef = { collection: string; slug: string };

export type AdminUser = {
    id: string;
    username: string;
    name: string;
    role: Role;
    ownerOf: OwnerRef[];
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

export type UserInput = { username: string; name: string; role: Role; password?: string; ownerOf?: OwnerRef[]; active?: boolean };

function validate(i: UserInput, creating: boolean, existing: AdminUser[], selfId?: string) {
    const username = i.username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) return "Utilizador: 3 a 32 caracteres (letras minúsculas, números, . _ -).";
    if (username === (process.env.ADMIN_USERNAME ?? "admin").toLowerCase()) return "Este nome de utilizador está reservado.";
    if (existing.some((u) => u.username === username && u.id !== selfId)) return "Já existe um utilizador com este nome.";
    if (!i.name.trim()) return "Indique o nome.";
    if (!["admin", "editor", "owner"].includes(i.role)) return "Perfil inválido.";
    if (i.role === "owner" && !(i.ownerOf?.length)) return "Associe pelo menos um estabelecimento ao proprietário.";
    if (creating || i.password) {
        const p = passwordProblem(i.password ?? "");
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
        const p = passwordProblem(next);
        if (p) return { ok: false as const, error: p };
        u.passwordHash = hashPassword(next);
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
