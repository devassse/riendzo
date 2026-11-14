/**
 * Content operations against the Riendzo API (used by store.ts when RIENDZO_API_URL is set).
 * Same signatures and results as the file-based versions in store.ts.
 */
import { ApiError, apiFetch, hasApiKey } from "@/lib/api/client";
import type { Item } from "./store";

const enc = encodeURIComponent;
const base = (id: string) => `/admin/collections/${enc(id)}/items`;

export async function getItems<T extends Item = Item>(id: string): Promise<T[]> {
    return (await apiFetch<{ data: T[] }>(base(id), { staff: true })).data;
}

/** Published content only (public endpoint, no key needed). */
export async function getPublishedItems<T extends Item = Item>(id: string): Promise<T[]> {
    return (await apiFetch<{ data: T[] }>(`/collections/${enc(id)}/items`)).data;
}

export async function getItem(id: string, slug: string): Promise<Item | undefined> {
    try {
        // with the key the BackOffice also sees drafts; without it, only what is published
        const staff = hasApiKey();
        const path = staff ? `${base(id)}/${enc(slug)}` : `/collections/${enc(id)}/items/${enc(slug)}`;
        return (await apiFetch<{ data: Item }>(path, { staff })).data;
    } catch (e) {
        if (e instanceof ApiError && e.status === 404) return undefined;
        throw e;
    }
}

export async function saveItem(id: string, originalSlug: string | null, item: Item) {
    try {
        await apiFetch(originalSlug ? `${base(id)}/${enc(originalSlug)}` : base(id), {
            method: originalSlug ? "PUT" : "POST",
            body: item,
            staff: true,
        });
        return { ok: true as const };
    } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
            return { ok: false as const, error: "Já existe um conteúdo com este endereço (slug)." };
        }
        if (e instanceof ApiError && e.status === 422) return { ok: false as const, error: e.message };
        throw e;
    }
}

export async function deleteItem(id: string, slug: string) {
    await apiFetch(`${base(id)}/${enc(slug)}`, { method: "DELETE", staff: true });
}

export async function setStatus(id: string, slug: string, status: "published" | "draft") {
    await apiFetch(`${base(id)}/${enc(slug)}/status`, { method: "POST", body: { status }, staff: true });
}

export async function setFeaturedWeek(id: string, slug: string, on: boolean) {
    await apiFetch(`${base(id)}/${enc(slug)}/featured-week`, { method: "POST", body: { on }, staff: true });
}

export async function moveItem(id: string, slug: string, direction: -1 | 1) {
    await apiFetch(`${base(id)}/${enc(slug)}/move`, { method: "POST", body: { direction }, staff: true });
}

export async function duplicateItem(id: string, slug: string): Promise<string | null> {
    try {
        return (await apiFetch<{ data: { slug: string } }>(`${base(id)}/${enc(slug)}/duplicate`, { method: "POST", staff: true })).data.slug;
    } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
    }
}
