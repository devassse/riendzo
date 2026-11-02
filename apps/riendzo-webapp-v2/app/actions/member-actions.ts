"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMember, createMemberSession, destroyMemberSession } from "@/lib/members-auth";
import { changeMemberPassword, registerMember, toggleFavorite, updateMember, verifyMember } from "@/lib/members";
import { getCollection } from "@/lib/cms/collections";
import { addMessage } from "@/lib/cms/inbox";
import { clearFailures, isLockedOut, registerFailure } from "@/lib/cms/auth";

export type FormState = { error?: string; ok?: string };

/** Only same-site relative paths are accepted as a redirect target. */
const safeNext = (n: unknown) => (typeof n === "string" && /^\/(?!\/)[\w\-/?=&%.#]*$/.test(n) ? n : "/conta");

async function ip() {
    return (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** Heart button on cards. Returns null when nobody is logged in. */
export async function toggleFavoriteAction(collection: string, slug: string) {
    const member = await getMember();
    if (!member) return null;
    if (!getCollection(collection) || !/^[a-z0-9-]{1,100}$/.test(slug)) return null;
    return toggleFavorite(member.id, collection, slug);
}

export async function requireMember(next = "/conta") {
    const m = await getMember();
    if (!m) redirect(`/conta/entrar?next=${encodeURIComponent(next)}`);
    return m;
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
    const who = await ip();
    if (isLockedOut(`reg:${who}`)) return { error: "Demasiadas tentativas. Tente mais tarde." };
    if (fd.get("website")) return { error: "Pedido inválido." }; // honeypot
    const res = await registerMember({
        firstName: String(fd.get("firstName") ?? ""), lastName: String(fd.get("lastName") ?? ""),
        contact: String(fd.get("contact") ?? ""), password: String(fd.get("password") ?? ""), confirm: String(fd.get("confirm") ?? ""),
    });
    if (!res.ok) { registerFailure(`reg:${who}`); return { error: res.error }; }
    await createMemberSession(res.id);
    redirect(safeNext(fd.get("next")) === "/conta" ? "/conta/perfil?novo=1" : safeNext(fd.get("next")));
}

export async function loginMemberAction(_: FormState, fd: FormData): Promise<FormState> {
    const who = await ip();
    if (isLockedOut(who)) return { error: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };
    const m = await verifyMember(String(fd.get("contact") ?? ""), String(fd.get("password") ?? ""));
    if (!m) { registerFailure(who); return { error: "Contacto ou palavra-passe incorretos." }; }
    clearFailures(who);
    await createMemberSession(m.id);
    redirect(safeNext(fd.get("next")));
}

export async function logoutMemberAction() {
    await destroyMemberSession();
    redirect("/");
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const arr = (fd: FormData, k: string, max = 20) => fd.getAll(k).map((v) => str(v, 60)).filter(Boolean).slice(0, max);

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
    const m = await requireMember("/conta/perfil");
    const firstName = str(fd.get("firstName"), 50), lastName = str(fd.get("lastName"), 50);
    if (!firstName || !lastName) return { error: "Indique o nome e o apelido." };
    const year = Math.round(Number(fd.get("birthYear")));
    const avatar = str(fd.get("avatar"), 300);
    await updateMember(m.id, {
        firstName, lastName,
        bio: str(fd.get("bio"), 500) || undefined,
        province: str(fd.get("province"), 40) || undefined,
        birthYear: year >= 1900 && year <= new Date().getFullYear() ? year : undefined,
        travelStyle: str(fd.get("travelStyle"), 40) || undefined,
        languages: arr(fd, "languages"), interests: arr(fd, "interests", 40),
        avatar: /^\/api\/media\/\d{4}\/[a-z0-9-]+\.[a-z0-9]+$/.test(avatar) ? avatar : undefined,
    });
    return { ok: "Perfil guardado." };
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
    const m = await requireMember("/conta/perfil");
    const next = String(fd.get("next") ?? "");
    if (next !== String(fd.get("confirm") ?? "")) return { error: "As palavras-passe não coincidem." };
    const r = await changeMemberPassword(m.id, String(fd.get("current") ?? ""), next);
    return r.ok ? { ok: "Palavra-passe alterada." } : { error: r.error };
}

export async function sendMessageAction(_: FormState, fd: FormData): Promise<FormState> {
    if (fd.get("website")) return { ok: "Mensagem enviada." }; // honeypot: pretend success
    const who = await ip();
    if (isLockedOut(`msg:${who}`)) return { error: "Demasiadas mensagens. Tente mais tarde." };
    const name = str(fd.get("name"), 80), contact = str(fd.get("contact"), 120), message = str(fd.get("message"), 2000);
    if (!name || !contact || message.length < 5) return { error: "Preencha o nome, o contacto e a mensagem." };
    registerFailure(`msg:${who}`); // counts every message: max 5 / 15 min per IP
    await addMessage({ name, contact, message });
    return { ok: "Mensagem enviada. Obrigado!" };
}

export async function removeFavoriteAction(fd: FormData) {
    const m = await requireMember("/conta/favoritos");
    const collection = String(fd.get("collection") ?? ""), slug = String(fd.get("slug") ?? "");
    if (getCollection(collection) && /^[a-z0-9-]{1,100}$/.test(slug)) await toggleFavorite(m.id, collection, slug);
    revalidatePath("/", "layout");
}
