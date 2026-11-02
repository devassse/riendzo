"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    authConfig, checkCredentials, clearFailures, createSession, destroySession,
    isLockedOut, registerFailure, requireAdmin,
} from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { normalizeCatalog, normalizeRecipe, type Errors } from "@/lib/cms/validate";
import * as store from "@/lib/cms/store";
import { deleteMedia as removeMedia } from "@/lib/cms/store";

export type LoginState = { error?: string };
export type SaveState = { ok: boolean; errors: Errors; message?: string };

/** The public site is cached, so every change must refresh it. */
const refreshSite = () => revalidatePath("/", "layout");

/* -------------------------------- Session -------------------------------- */

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
    if (!authConfig().configured) {
        return { error: "O acesso ainda não está configurado (defina ADMIN_PASSWORD e ADMIN_SESSION_SECRET)." };
    }
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";

    if (isLockedOut(ip)) return { error: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };

    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!checkCredentials(username, password)) {
        registerFailure(ip);
        return { error: "Utilizador ou palavra-passe incorretos." };
    }
    clearFailures(ip);
    await createSession(username);
    await store.logActivity({ user: username, action: "Iniciou sessão" });
    redirect("/admin");
}

export async function logoutAction() {
    await destroySession();
    redirect("/admin/login");
}

/* -------------------------------- Content -------------------------------- */

export async function saveItemAction(
    collectionId: string,
    originalSlug: string | null,
    payload: unknown
): Promise<SaveState> {
    const session = await requireAdmin();
    const collection = getCollection(collectionId);
    if (!collection) return { ok: false, errors: {}, message: "Coleção desconhecida." };

    const result =
        collection.kind === "recipe" ? normalizeRecipe(payload) : normalizeCatalog(payload);
    if (!result.value) {
        return { ok: false, errors: result.errors, message: "Corrija os campos assinalados." };
    }

    const saved = await store.saveItem(collectionId, originalSlug, result.value);
    if (!saved.ok) return { ok: false, errors: { slug: saved.error }, message: saved.error };

    await store.logActivity({
        user: session.user,
        action: originalSlug ? "Editou" : "Criou",
        collection: collectionId,
        title: store.titleOf(result.value),
    });
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
    await store.logActivity({
        user: session.user,
        action: next === "published" ? "Publicou" : "Passou a rascunho",
        collection,
        title,
    });
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
    if (await removeMedia(url)) {
        await store.logActivity({ user: session.user, action: "Eliminou imagem", title: url.split("/").pop() });
    }
    revalidatePath("/admin/media");
}
