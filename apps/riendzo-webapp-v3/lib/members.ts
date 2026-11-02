/**
 * Riendzo AI members (public registration) — server only.
 * Stored in data/members/members.json. Passwords are scrypt-hashed.
 */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/cms/password";

export type Favorite = { collection: string; slug: string; at: string };

export type Member = {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    /** digits only, with country code */
    phone?: string;
    passwordHash: string;
    avatar?: string;
    bio?: string;
    province?: string;
    birthYear?: number;
    languages: string[];
    /** Interests (music styles, cuisines, travel…): will feed the AI suggestions */
    interests: string[];
    travelStyle?: string;
    favorites: Favorite[];
    status: "active" | "suspended";
    createdAt: string;
};
export type PublicMember = Omit<Member, "passwordHash">;

const FILE = path.join(DATA_DIR, "members", "members.json");
const read = async () => (await readJson<Member[]>(FILE)) ?? [];
const strip = ({ passwordHash: _h, ...m }: Member): PublicMember => m;

export const normalizePhone = (p: string) => {
    let d = p.replace(/[^\d]/g, "");
    if (/^8\d{8}$/.test(d)) d = `258${d}`;
    return d;
};

export type RegisterInput = {
    firstName: string; lastName: string; contact: string; password: string; confirm: string;
};

export function registerMember(i: RegisterInput) {
    return locked(async () => {
        const firstName = i.firstName.trim().slice(0, 50);
        const lastName = i.lastName.trim().slice(0, 50);
        const contact = i.contact.trim();
        if (!firstName || !lastName) return { ok: false as const, error: "Indique o nome e o apelido." };

        const isEmail = contact.includes("@");
        const email = isEmail ? contact.toLowerCase() : undefined;
        const phone = isEmail ? undefined : normalizePhone(contact);
        if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) return { ok: false as const, error: "E-mail inválido." };
        if (!isEmail && !/^\d{9,15}$/.test(phone ?? "")) return { ok: false as const, error: "Indique um e-mail ou um número de telefone válido." };

        const problem = passwordProblem(i.password);
        if (problem) return { ok: false as const, error: problem };
        if (i.password !== i.confirm) return { ok: false as const, error: "As palavras-passe não coincidem." };

        const members = await read();
        if (members.some((m) => (email && m.email === email) || (phone && m.phone === phone))) {
            return { ok: false as const, error: "Já existe uma conta com este contacto." };
        }
        const member: Member = {
            id: crypto.randomUUID(), firstName, lastName, email, phone, passwordHash: hashPassword(i.password),
            languages: [], interests: [], favorites: [], status: "active", createdAt: new Date().toISOString(),
        };
        members.push(member);
        await writeJson(FILE, members);
        return { ok: true as const, id: member.id };
    });
}

export async function verifyMember(contact: string, password: string) {
    const members = await read();
    const c = contact.trim();
    const m = c.includes("@") ? members.find((x) => x.email === c.toLowerCase()) : members.find((x) => x.phone === normalizePhone(c));
    const ok = verifyPassword(password, m?.passwordHash);
    return m && ok && m.status === "active" ? strip(m) : null;
}

export const getMemberById = async (id: string) => {
    const m = (await read()).find((x) => x.id === id);
    return m && m.status === "active" ? strip(m) : null;
};

export const listMembers = async () => (await read()).map(strip);

export function updateMember(id: string, patch: Partial<Pick<Member, "firstName" | "lastName" | "avatar" | "bio" | "province" | "birthYear" | "languages" | "interests" | "travelStyle">>) {
    return locked(async () => {
        const members = await read();
        const m = members.find((x) => x.id === id);
        if (!m) return false;
        Object.assign(m, patch);
        await writeJson(FILE, members);
        return true;
    });
}

export function toggleFavorite(id: string, collection: string, slug: string) {
    return locked(async () => {
        const members = await read();
        const m = members.find((x) => x.id === id);
        if (!m) return null;
        const has = m.favorites.some((f) => f.collection === collection && f.slug === slug);
        m.favorites = has
            ? m.favorites.filter((f) => !(f.collection === collection && f.slug === slug))
            : [{ collection, slug, at: new Date().toISOString() }, ...m.favorites].slice(0, 500);
        await writeJson(FILE, members);
        return !has;
    });
}

export function setMemberStatus(id: string, status: Member["status"]) {
    return locked(async () => {
        const members = await read();
        const m = members.find((x) => x.id === id);
        if (m) m.status = status;
        await writeJson(FILE, members);
    });
}

export function changeMemberPassword(id: string, current: string, next: string) {
    return locked(async () => {
        const members = await read();
        const m = members.find((x) => x.id === id);
        if (!m || !verifyPassword(current, m.passwordHash)) return { ok: false as const, error: "A palavra-passe atual não está correta." };
        const p = passwordProblem(next);
        if (p) return { ok: false as const, error: p };
        m.passwordHash = hashPassword(next);
        await writeJson(FILE, members);
        return { ok: true as const };
    });
}
