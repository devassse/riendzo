/**
 * File-based content store (server only).
 *
 *   data/cms/<collection>.json   content of one collection (array, in display order)
 *   data/cms/_activity.json      last 100 BackOffice actions
 *   data/uploads/<yyyy>/<file>   uploaded images (served by /api/media/…)
 *
 * It needs a writable, persistent disk (VPS, Docker volume, …). On serverless
 * hosts (e.g. Vercel) replace the two `readJson` / `writeJson` helpers with a
 * database or object storage: nothing else in the app touches the disk.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import { COLLECTIONS, getCollection } from "./collections";
import { SEEDS } from "./seeds";

export type Item = CatalogItem | Recipe;

export const DATA_DIR = path.join(process.cwd(), "data");
const CMS_DIR = path.join(DATA_DIR, "cms");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

/** Serialises writes so two saves never overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
}

async function readJson<T>(file: string): Promise<T | null> {
    try {
        return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch {
        return null;
    }
}

async function writeJson(file: string, data: unknown) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, file);
}

const fileOf = (id: string) => path.join(CMS_DIR, `${id}.json`);

function assertKnown(id: string) {
    if (!getCollection(id)) throw new Error(`Unknown collection "${id}"`);
}

/** Everything in a collection (drafts included), in display order. */
export async function getItems<T extends Item = Item>(id: string): Promise<T[]> {
    assertKnown(id);
    const stored = await readJson<T[]>(fileOf(id));
    return stored ?? ((SEEDS[id] ?? []) as T[]);
}

/** What the public site shows: drafts are hidden. */
export async function getPublishedItems<T extends Item = Item>(id: string): Promise<T[]> {
    return (await getItems<T>(id)).filter((i) => i.status !== "draft");
}

export const slugOf = (item: Item) => item.slug;
export const titleOf = (item: Item) => ("title" in item ? item.title : item.name);

export async function getItem(id: string, slug: string): Promise<Item | undefined> {
    return (await getItems(id)).find((i) => i.slug === slug);
}

export function saveItem(id: string, originalSlug: string | null, item: Item) {
    return locked(async () => {
        assertKnown(id);
        const items = await getItems(id);
        const clash = items.some((i) => i.slug === item.slug && i.slug !== originalSlug);
        if (clash) return { ok: false as const, error: "Já existe um conteúdo com este endereço (slug)." };

        const stamped = { ...item, updatedAt: new Date().toISOString() } as Item;
        const index = originalSlug ? items.findIndex((i) => i.slug === originalSlug) : -1;
        if (index >= 0) items[index] = stamped;
        else items.unshift(stamped);

        await writeJson(fileOf(id), items);
        return { ok: true as const };
    });
}

export function deleteItem(id: string, slug: string) {
    return locked(async () => {
        const items = await getItems(id);
        await writeJson(fileOf(id), items.filter((i) => i.slug !== slug));
    });
}

export function setStatus(id: string, slug: string, status: "published" | "draft") {
    return locked(async () => {
        const items = await getItems(id);
        const next = items.map((i) =>
            i.slug === slug ? ({ ...i, status, updatedAt: new Date().toISOString() } as Item) : i
        );
        await writeJson(fileOf(id), next);
    });
}

export function moveItem(id: string, slug: string, direction: -1 | 1) {
    return locked(async () => {
        const items = await getItems(id);
        const i = items.findIndex((x) => x.slug === slug);
        const j = i + direction;
        if (i < 0 || j < 0 || j >= items.length) return;
        [items[i], items[j]] = [items[j], items[i]];
        await writeJson(fileOf(id), items);
    });
}

export function duplicateItem(id: string, slug: string) {
    return locked(async () => {
        const items = await getItems(id);
        const i = items.findIndex((x) => x.slug === slug);
        if (i < 0) return null;
        const source = items[i];
        let n = 2;
        while (items.some((x) => x.slug === `${slug}-copia${n > 2 ? `-${n}` : ""}`)) n++;
        const newSlug = `${slug}-copia${n > 2 ? `-${n}` : ""}`;
        const copy = {
            ...source,
            slug: newSlug,
            status: "draft",
            updatedAt: new Date().toISOString(),
            ...("title" in source ? { title: `${source.title} (cópia)` } : { name: `${source.name} (cópia)` }),
        } as Item;
        items.splice(i + 1, 0, copy);
        await writeJson(fileOf(id), items);
        return newSlug;
    });
}

/* ------------------------------ Dashboard ------------------------------ */

export type CollectionStats = {
    id: string;
    total: number;
    published: number;
    drafts: number;
    withoutImages: number;
    lastUpdated: string | null;
};

export async function getStats(): Promise<CollectionStats[]> {
    return Promise.all(
        COLLECTIONS.map(async (c) => {
            const items = await getItems(c.id);
            const dates = items.map((i) => i.updatedAt).filter(Boolean) as string[];
            return {
                id: c.id,
                total: items.length,
                drafts: items.filter((i) => i.status === "draft").length,
                published: items.filter((i) => i.status !== "draft").length,
                withoutImages: items.filter((i) => !i.images?.length).length,
                lastUpdated: dates.sort().at(-1) ?? null,
            };
        })
    );
}

export async function getRecentItems(limit = 3) {
    const all = await Promise.all(
        COLLECTIONS.map(async (c) => (await getItems(c.id)).map((item, index) => ({ collection: c.id, item, index })))
    );
    // Edited items first (newest first); never-edited seed content fills the rest
    return all
        .flat()
        .sort((a, b) => (b.item.updatedAt ?? "").localeCompare(a.item.updatedAt ?? "") || a.index - b.index)
        .slice(0, limit);
}

export async function searchAll(query: string, limit = 40) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: { collection: string; item: Item }[] = [];
    for (const c of COLLECTIONS) {
        for (const item of await getItems(c.id)) {
            const hay = `${titleOf(item)} ${item.slug} ${(item as { categories: string[] }).categories.join(" ")} ${
                "summary" in item ? item.summary : item.description
            }`.toLowerCase();
            if (hay.includes(q)) out.push({ collection: c.id, item });
            if (out.length >= limit) return out;
        }
    }
    return out;
}

/* ------------------------------- Activity ------------------------------- */

export type Activity = {
    at: string;
    user: string;
    action: string;
    collection?: string;
    title?: string;
};

const ACTIVITY_FILE = path.join(CMS_DIR, "_activity.json");

export const getActivity = async () => (await readJson<Activity[]>(ACTIVITY_FILE)) ?? [];

export function logActivity(entry: Omit<Activity, "at">) {
    return locked(async () => {
        const all = await getActivity();
        all.unshift({ at: new Date().toISOString(), ...entry });
        await writeJson(ACTIVITY_FILE, all.slice(0, 100));
    });
}

/* -------------------------------- Media -------------------------------- */

export type MediaFile = { url: string; name: string; size: number; at: string };

export async function listMedia(): Promise<MediaFile[]> {
    const out: MediaFile[] = [];
    let years: string[] = [];
    try {
        years = await fs.readdir(UPLOADS_DIR);
    } catch {
        return out;
    }
    for (const year of years) {
        const dir = path.join(UPLOADS_DIR, year);
        let files: string[] = [];
        try {
            files = await fs.readdir(dir);
        } catch {
            continue;
        }
        for (const name of files) {
            const stat = await fs.stat(path.join(dir, name)).catch(() => null);
            if (stat?.isFile()) {
                out.push({ url: `/api/media/${year}/${name}`, name, size: stat.size, at: stat.mtime.toISOString() });
            }
        }
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
}

export async function deleteMedia(url: string) {
    const m = /^\/api\/media\/(\d{4})\/([a-z0-9-]+\.[a-z0-9]+)$/.exec(url);
    if (!m) return false;
    await fs.rm(path.join(UPLOADS_DIR, m[1], m[2]), { force: true });
    return true;
}
