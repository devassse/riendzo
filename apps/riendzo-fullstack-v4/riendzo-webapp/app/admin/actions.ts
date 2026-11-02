"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    authConfig, checkCredentials, clearFailures, createSession, destroySession, getSession, homeFor,
    isLockedOut, registerFailure, requireAdmin, type Session,
} from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { normalizeArtist, normalizeCatalog, normalizeRecipe, type Errors } from "@/lib/cms/validate";
import { addMany, deleteTerritory, saveTerritory, type TerritoryInput } from "@/lib/cms/territories";
import { saveIntro } from "@/lib/cms/page-intros";
import { saveCommsSettings } from "@/lib/cms/comms-settings";
import { sendMailResult } from "@/lib/mailer";
import { sendSms } from "@/lib/sms";
import { saveHistoryTheme, type HistoryTheme } from "@/lib/cms/history-theme";
import { getHomeFlagged, markFlagsManaged, saveHeroVideo, saveHomeConfig, toggleExperience, type ExperienceRef, type HomeHeading } from "@/lib/cms/home";
import * as store from "@/lib/cms/store";
import { deleteMedia as removeMedia } from "@/lib/cms/store";
import { getList, saveList } from "@/lib/cms/lists";
import { saveMenuFlags } from "@/lib/cms/menus";
import { changeOwnPassword, createUser, deleteUser, renameOwnerRefs, saveProfile, updateUser, type OwnerRef, type Role } from "@/lib/cms/users";
import { setMemberStatus } from "@/lib/members";
import { deleteMessage, markMessage } from "@/lib/cms/inbox";
import type { CatalogItem } from "@/app/components/sections/catalog-types";

export type LoginState = { error?: string };
export type SaveState = { ok: boolean; errors: Errors; message?: string };
export type FormState = { ok?: string; error?: string };

/** The public site is cached, so every change must refresh it. */
const refreshSite = () => revalidatePath("/", "layout");

/* -------------------------------- Session -------------------------------- */

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
    if (!authConfig().configured) return { error: "O acesso ainda não está configurado (defina ADMIN_PASSWORD e ADMIN_SESSION_SECRET)." };
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (isLockedOut(ip)) return { error: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };

    const who = await checkCredentials(String(formData.get("username") ?? ""), String(formData.get("password") ?? ""));
    if (!who) {
        registerFailure(ip);
        return { error: "Utilizador ou palavra-passe incorretos." };
    }
    clearFailures(ip);
    await createSession(who.uid, who.user);
    await store.logActivity({ user: who.user, action: "Iniciou sessão" });
    // Each profile goes straight to its own area
    redirect(homeFor(who.role));
}

export async function logoutAction() {
    await destroySession();
    redirect("/admin/login");
}

/* -------------------------------- Content -------------------------------- */

async function actor(): Promise<Session> {
    const s = await getSession();
    if (!s) redirect("/admin/login");
    return s;
}

export async function saveItemAction(collectionId: string, originalSlug: string | null, payload: unknown): Promise<SaveState> {
    const session = await actor();
    const collection = getCollection(collectionId);
    if (!collection) return { ok: false, errors: {}, message: "Coleção desconhecida." };

    const isOwner = session.role === "owner";
    let existing: store.Item | undefined;
    if (isOwner) {
        // Owners can only edit their own, already existing establishment
        const mine = originalSlug && session.ownerOf.some((r) => r.collection === collectionId && r.slug === originalSlug);
        if (!collection.directory || !mine) return { ok: false, errors: {}, message: "Não tem permissão para editar este conteúdo." };
        existing = await store.getItem(collectionId, originalSlug!);
        if (!existing) return { ok: false, errors: {}, message: "Conteúdo não encontrado." };
    } else {
        await requireAdmin();
    }

    let value: store.Item | undefined;
    let errors: Errors = {};
    if (collection.kind === "recipe") {
        const cats = (await getList("recipe-categories")).map((i) => i.value);
        ({ value, errors } = normalizeRecipe(payload, cats));
    } else if (collection.kind === "artist") {
        const genres = (await getList("music-genres")).map((i) => i.value);
        ({ value, errors } = normalizeArtist(payload, genres));
    } else {
        ({ value, errors } = normalizeCatalog(payload));
    }
    if (!value) return { ok: false, errors, message: "Corrija os campos assinalados." };

    if (isOwner && existing) {
        // Fields only the platform team controls
        value = { ...value, slug: existing.slug, status: existing.status, featured: (existing as CatalogItem).featured } as store.Item;
    }

    const saved = await store.saveItem(collectionId, originalSlug, value);
    if (!saved.ok) return { ok: false, errors: { slug: saved.error }, message: saved.error };

    if (originalSlug && originalSlug !== value.slug) await renameOwnerRefs(collectionId, originalSlug, value.slug);
    await store.logActivity({ user: session.user, action: originalSlug ? "Editou" : "Criou", collection: collectionId, slug: value.slug, title: store.titleOf(value) });
    refreshSite();
    return { ok: true, errors: {} };
}

async function titleFor(collection: string, slug: string) {
    const item = await store.getItem(collection, slug);
    return item ? store.titleOf(item) : slug;
}

function ids(formData: FormData) {
    const collection = String(formData.get("collection") ?? "");
    const slug = String(formData.get("slug") ?? "");
    if (!getCollection(collection) || !slug) throw new Error("Pedido inválido");
    return { collection, slug };
}

export async function deleteItemAction(formData: FormData) {
    const session = await requireAdmin();
    const { collection, slug } = ids(formData);
    const title = await titleFor(collection, slug);
    await store.deleteItem(collection, slug);
    await renameOwnerRefs(collection, slug, null);
    await store.logActivity({ user: session.user, action: "Eliminou", collection, title });
    refreshSite();
    revalidatePath(`/admin/c/${collection}`);
}

export async function toggleStatusAction(formData: FormData) {
    const session = await requireAdmin();
    const { collection, slug } = ids(formData);
    const next = formData.get("to") === "draft" ? "draft" : "published";
    const title = await titleFor(collection, slug);
    await store.setStatus(collection, slug, next);
    await store.logActivity({ user: session.user, action: next === "published" ? "Publicou" : "Passou a rascunho", collection, slug, title });
    refreshSite();
    revalidatePath(`/admin/c/${collection}`);
}

export async function setFeaturedWeekAction(formData: FormData) {
    const session = await requireAdmin();
    const { collection, slug } = ids(formData);
    if (getCollection(collection)?.kind !== "artist") return;
    const on = formData.get("on") === "1";
    await store.setFeaturedWeek(collection, slug, on);
    await store.logActivity({ user: session.user, action: on ? "Definiu artista da semana" : "Retirou artista da semana", collection, title: await titleFor(collection, slug) });
    refreshSite();
    revalidatePath(`/admin/c/${collection}`);
}

export async function moveItemAction(formData: FormData) {
    await requireAdmin();
    const { collection, slug } = ids(formData);
    await store.moveItem(collection, slug, formData.get("dir") === "up" ? -1 : 1);
    refreshSite();
    revalidatePath(`/admin/c/${collection}`);
}

export async function duplicateItemAction(formData: FormData) {
    const session = await requireAdmin();
    const { collection, slug } = ids(formData);
    const title = await titleFor(collection, slug);
    const newSlug = await store.duplicateItem(collection, slug);
    await store.logActivity({ user: session.user, action: "Duplicou", collection, title });
    refreshSite();
    if (newSlug) redirect(`/admin/c/${collection}/${newSlug}`);
}

export async function deleteMediaAction(formData: FormData) {
    const session = await requireAdmin();
    const url = String(formData.get("url") ?? "");
    if (await removeMedia(url)) await store.logActivity({ user: session.user, action: "Eliminou imagem", title: url.split("/").pop() });
    revalidatePath("/admin/media");
}

/* ------------------------- Administrador (admin only) ------------------------- */

export async function saveListAction(listId: string, items: { value: string; label: string; color?: string }[]): Promise<FormState> {
    const s = await requireAdmin(["admin"]);
    try {
        await saveList(listId, items);
    } catch {
        return { error: "Lista desconhecida." };
    }
    await store.logActivity({ user: s.user, action: "Atualizou dados genéricos", title: listId });
    refreshSite();
    revalidatePath("/admin/administrador/listas");
    return { ok: "Lista guardada." };
}

export async function saveMenuFlagsAction(flags: Record<string, boolean>): Promise<FormState> {
    const s = await requireAdmin(["admin"]);
    await saveMenuFlags(flags);
    await store.logActivity({ user: s.user, action: "Atualizou as marcas “Em breve” dos menus" });
    refreshSite();
    return { ok: "Menus guardados." };
}

const roles: Role[] = ["admin", "editor", "owner"];

function parseOwnerRefs(raw: string): OwnerRef[] {
    return raw.split("\n").map((l) => l.trim()).filter(Boolean).flatMap((l) => {
        const [collection, slug] = l.split(":");
        return getCollection(collection)?.directory && slug ? [{ collection, slug }] : [];
    });
}

export async function createUserAction(_: FormState, fd: FormData): Promise<FormState> {
    const s = await requireAdmin(["admin"]);
    const role = String(fd.get("role")) as Role;
    if (!roles.includes(role)) return { error: "Perfil inválido." };
    const res = await createUser({
        username: String(fd.get("username") ?? ""), name: String(fd.get("name") ?? ""), role,
        email: String(fd.get("email") ?? "") || undefined, phone: String(fd.get("phone") ?? "") || undefined,
        password: String(fd.get("password") ?? ""), ownerOf: parseOwnerRefs(String(fd.get("ownerOf") ?? "")),
    });
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: "Criou utilizador", title: String(fd.get("username")) });
    revalidatePath("/admin/administrador/utilizadores");
    return { ok: "Utilizador criado." };
}

export async function updateUserAction(_: FormState, fd: FormData): Promise<FormState> {
    const s = await requireAdmin(["admin"]);
    const role = String(fd.get("role")) as Role;
    if (!roles.includes(role)) return { error: "Perfil inválido." };
    const res = await updateUser(String(fd.get("id")), {
        username: String(fd.get("username") ?? ""), name: String(fd.get("name") ?? ""), role,
        email: String(fd.get("email") ?? "") || undefined, phone: String(fd.get("phone") ?? "") || undefined,
        password: String(fd.get("password") ?? "") || undefined, active: fd.get("active") === "on",
        ownerOf: parseOwnerRefs(String(fd.get("ownerOf") ?? "")),
    });
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: "Atualizou utilizador", title: String(fd.get("username")) });
    revalidatePath("/admin/administrador/utilizadores");
    return { ok: "Utilizador atualizado." };
}

export async function deleteUserAction(fd: FormData) {
    const s = await requireAdmin(["admin"]);
    await deleteUser(String(fd.get("id")));
    await store.logActivity({ user: s.user, action: "Eliminou utilizador", title: String(fd.get("username") ?? "") });
    revalidatePath("/admin/administrador/utilizadores");
}

export async function setMemberStatusAction(fd: FormData) {
    const s = await requireAdmin(["admin"]);
    await setMemberStatus(String(fd.get("id")), fd.get("to") === "suspended" ? "suspended" : "active");
    await store.logActivity({ user: s.user, action: "Alterou o estado de um membro" });
    revalidatePath("/admin/administrador/membros");
}

export async function markMessageAction(fd: FormData) {
    await requireAdmin(["admin"]);
    await markMessage(String(fd.get("id")), fd.get("read") === "1");
    revalidatePath("/admin/administrador/mensagens");
}
export async function deleteMessageAction(fd: FormData) {
    await requireAdmin(["admin"]);
    await deleteMessage(String(fd.get("id")));
    revalidatePath("/admin/administrador/mensagens");
}

/** Owners (and staff) change their own password. */
export async function changeOwnPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
    const s = await actor();
    if (s.userId === "env") return { error: "A palavra-passe desta conta é definida no servidor (ADMIN_PASSWORD)." };
    const next = String(fd.get("next") ?? "");
    if (next !== String(fd.get("confirm") ?? "")) return { error: "As palavras-passe não coincidem." };
    const r = await changeOwnPassword(s.userId, String(fd.get("current") ?? ""), next);
    return r.ok ? { ok: "Palavra-passe alterada." } : { error: r.error };
}

/** Name, contacts and photo of whoever is logged in (any profile). */
export async function updateStaffProfileAction(_: FormState, fd: FormData): Promise<FormState> {
    const s = await actor();
    const avatar = String(fd.get("avatar") ?? "");
    const res = await saveProfile(s.userId, {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? "").trim() || undefined,
        phone: String(fd.get("phone") ?? "").trim() || undefined,
        avatar: /^\/api\/media\/\d{4}\/[a-z0-9-]+\.(?:jpg|png|webp)$/.test(avatar) ? avatar : undefined,
    });
    if (!res.ok) return { error: res.error };
    revalidatePath("/admin", "layout");
    return { ok: "Perfil guardado." };
}

/* ---------------------------------- Home page ---------------------------------- */

async function staffOnly() {
    const s = await actor();
    if (s.role === "owner") redirect(homeFor(s.role));
    return s;
}

/** "Definir como uma das 6 experiências…" (button inside each place). */
export async function toggleExperienceAction(collection: string, slug: string, on: boolean): Promise<FormState> {
    const s = await staffOnly();
    const res = await toggleExperience(collection, slug, on);
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: on ? "Adicionou às 6 experiências" : "Retirou das 6 experiências", collection, slug });
    refreshSite();
    revalidatePath("/admin/home");
    return { ok: "Guardado." };
}

/** Home > the six experiences (order, texts and photo) and the heading of the section. */
export async function saveHomeAction(experiences: ExperienceRef[], heading: HomeHeading): Promise<FormState> {
    const s = await staffOnly();
    const res = await saveHomeConfig({ experiences, heading, flagsManaged: true });
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: "Editou a Home" });
    refreshSite();
    revalidatePath("/admin/home");
    return { ok: "Home guardada. Já está no site." };
}

/** Home > "Mostrar na Home" for a history article, public service, emergency contact or entertainment entry. */
export async function toggleHomeFlagAction(collection: string, slug: string, on: boolean): Promise<FormState> {
    const s = await staffOnly();
    const item = (await store.getItem(collection, slug)) as CatalogItem | undefined;
    if (!item || !("title" in item)) return { error: "Conteúdo não encontrado." };
    // first time in the BackOffice: freeze the initial set as real flags, so removing one does not bring the others back
    await freezeInitialHomeFlags();
    const res = await store.saveItem(collection, slug, { ...item, showOnHome: on ? true : undefined } as store.Item);
    if (!res.ok) return { error: res.error };
    await markFlagsManaged();
    await store.logActivity({ user: s.user, action: on ? "Mostrou na Home" : "Retirou da Home", collection, slug, title: item.title });
    refreshSite();
    revalidatePath("/admin/home");
    return { ok: "Guardado." };
}

/** História > background colour of each section of the Cronologia page. */
export async function saveHistoryThemeAction(theme: HistoryTheme): Promise<FormState> {
    const s = await staffOnly();
    await saveHistoryTheme(theme);
    await store.logActivity({ user: s.user, action: "Editou as cores da Cronologia" });
    refreshSite();
    revalidatePath("/admin/historia");
    return { ok: "Cores guardadas. Já estão no site." };
}

/** Turns the initial Home set into real "Mostrar na Home" flags (only the first time). */
async function freezeInitialHomeFlags() {
    const groups = await getHomeFlagged(["history", "services", "entertainment"]);
    for (const { collection, items } of groups) {
        for (const i of items) {
            if (i.showOnHome) continue;
            await store.saveItem(collection.id, i.slug, { ...i, showOnHome: true } as store.Item);
        }
    }
}

/* ------------------------- E-mail and SMS (Configurações) ------------------------- */

async function adminOnly() {
    const s = await actor();
    return s.role === "admin" ? s : null;
}

export async function saveCommsSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
    const s = await adminOnly();
    if (!s) return { error: "Só o administrador pode alterar as configurações." };
    const res = await saveCommsSettings(Object.fromEntries(fd.entries()));
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: "Editou as configurações de e-mail e SMS" });
    revalidatePath("/admin/administrador/configuracoes");
    return { ok: "Configurações guardadas." };
}

export async function testEmailAction(_: FormState, fd: FormData): Promise<FormState> {
    if (!(await adminOnly())) return { error: "Sem permissão." };
    const to = String(fd.get("to") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return { error: "Indique um e-mail válido." };
    const r = await sendMailResult({ to, subject: "Teste de e-mail | Riendzo", text: "Se recebeu esta mensagem, o envio de e-mails do Riendzo está a funcionar.", html: "<p>Se recebeu esta mensagem, o envio de e-mails do <b>Riendzo</b> está a funcionar.</p>" });
    return r.ok ? { ok: `E-mail de teste enviado para ${to}.` } : { error: r.error ?? "Falha no envio." };
}

export async function testSmsAction(_: FormState, fd: FormData): Promise<FormState> {
    if (!(await adminOnly())) return { error: "Sem permissão." };
    let to = String(fd.get("to") ?? "").replace(/[^\d]/g, "");
    if (/^8\d{8}$/.test(to)) to = `258${to}`;
    if (!/^\d{9,15}$/.test(to)) return { error: "Indique um telefone válido (ex.: 84 123 4567)." };
    const r = await sendSms(to, "Riendzo: teste de SMS. Se recebeu esta mensagem, o envio está a funcionar.");
    return r.ok ? { ok: `SMS de teste enviado para +${to}.` } : { error: r.error ?? "Falha no envio." };
}

/** Textos das páginas: the short story that opens a page (e.g. Evolução Musical). */
export async function savePageIntroAction(id: string, title: string, story: string): Promise<FormState> {
    const s = await staffOnly();
    const res = await saveIntro(id, { title, story });
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: "Editou o texto de uma página" });
    refreshSite();
    revalidatePath("/admin/textos");
    return { ok: "Guardado. Já está no site." };
}

/* ------------------------ Divisão administrativa (Territórios) ------------------------ */

export async function saveTerritoryAction(input: TerritoryInput): Promise<FormState> {
    const s = await staffOnly();
    const res = await saveTerritory(input);
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: input.id ? "Editou território" : "Registou território", title: input.name });
    refreshSite();
    revalidatePath("/admin/territorios");
    return { ok: "Guardado." };
}

export async function deleteTerritoryAction(id: string): Promise<FormState> {
    const s = await staffOnly();
    const res = await deleteTerritory(id);
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: "Eliminou território", title: id });
    refreshSite();
    revalidatePath("/admin/territorios");
    return { ok: "Eliminado." };
}

export async function addManyTerritoriesAction(kind: string, parent: string, lines: string): Promise<FormState> {
    const s = await staffOnly();
    const { added, skipped } = await addMany(kind, parent, lines);
    if (added) {
        await store.logActivity({ user: s.user, action: `Registou ${added} territórios` });
        refreshSite();
        revalidatePath("/admin/territorios");
    }
    if (!added && skipped.length) return { error: skipped.slice(0, 3).join("; ") };
    return { ok: `${added} adicionado(s)${skipped.length ? `; ${skipped.length} ignorado(s): ${skipped.slice(0, 3).join("; ")}` : ""}.` };
}

/** Home > background video of the hero (empty = back to the original). */
export async function saveHeroVideoAction(src: string, poster: string): Promise<FormState> {
    const s = await staffOnly();
    const res = await saveHeroVideo({ src, poster });
    if (!res.ok) return { error: res.error };
    await store.logActivity({ user: s.user, action: src ? "Mudou o vídeo do hero" : "Repôs o vídeo do hero" });
    refreshSite();
    revalidatePath("/admin/home");
    return { ok: src ? "Vídeo guardado. Já está na Home." : "Voltou ao vídeo original." };
}
