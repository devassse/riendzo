/**
 * File-based content store (server only).
 *
 *   data/cms/<collection>.json   content of one collection (array, in display order)
 *   data/cms/_*.json             lists, menu flags, activity, users
 *   data/members/                Riendzo AI members
 *   data/uploads/<yyyy>/<file>   uploaded images (served by /api/media/…)
 *
 * When RIENDZO_API_URL is set, all content (read and write) goes through the Riendzo API
 * (PostgreSQL) instead: see store-api.ts.
 *
 * It needs a writable, persistent disk (VPS, Docker volume, …). On serverless
 * hosts replace `readJson` / `writeJson` with a database or object storage:
 * nothing else in the app touches the disk.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import type { Artist } from "./artist-types";
import { COLLECTIONS, getCollection } from "./collections";
import { SEEDS } from "./seeds";
import { apiEnabled } from "@/lib/api/client";
import * as remote from "./store-api";

export type Item = CatalogItem | Recipe | Artist;

export const DATA_DIR = path.join(process.cwd(), "data");
export const CMS_DIR = path.join(DATA_DIR, "cms");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

/** Serialises writes so two saves never overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();
export function locked<T>(fn: () => Promise<T>): Promise<T> {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
}

export async function readJson<T>(file: string): Promise<T | null> {
    try {
        return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch {
        return null;
    }
}

export async function writeJson(file: string, data: unknown) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, file);
}

const fileOf = (id: string) => path.join(CMS_DIR, `${id}.json`);

function assertKnown(id: string) {
    if (!getCollection(id)) throw new Error(`Unknown collection "${id}"`);
}

/* ------------------------- Uniform access to any item ------------------------- */

export const titleOf = (i: Item) => ("title" in i ? i.title : i.name);
export const summaryOf = (i: Item) => ("summary" in i ? i.summary : i.description);
export const imagesOf = (i: Item): string[] => ("genre" in i ? (i.photo ? [i.photo] : []) : i.images ?? []);
export const emojiOf = (i: Item) => ("emoji" in i ? i.emoji : "genre" in i ? "🎤" : "🍽️");
export const colorOf = (i: Item) => ("color" in i && i.color ? i.color : "#0054b5");
export const categoriesOf = (i: Item): string[] => ("genre" in i ? [i.genre] : i.categories);
export const tagOf = (i: Item) => ("tag" in i ? i.tag : "region" in i ? i.region : "origin" in i ? i.origin ?? "" : "");

/* ---------------------------------- Reading ---------------------------------- */

/** Everything in a collection (drafts included), in display order. */
export async function getItems<T extends Item = Item>(id: string): Promise<T[]> {
    assertKnown(id);
    if (apiEnabled()) return remote.getItems<T>(id);
    const stored = await readJson<T[]>(fileOf(id));
    return stored ?? ((SEEDS[id] ?? []) as T[]);
}

/** What the public site shows: drafts are hidden; paid listings come first. */
export async function getPublishedItems<T extends Item = Item>(id: string): Promise<T[]> {
    if (apiEnabled()) {
        assertKnown(id);
        return remote.getPublishedItems<T>(id);
    }
    const items = (await getItems<T>(id)).filter((i) => i.status !== "draft");
    const featured = items.filter((i) => (i as CatalogItem).featured);
    return featured.length ? [...featured, ...items.filter((i) => !(i as CatalogItem).featured)] : items;
}

export async function getItem(id: string, slug: string): Promise<Item | undefined> {
    if (apiEnabled()) {
        assertKnown(id);
        return remote.getItem(id, slug);
    }
    return (await getItems(id)).find((i) => i.slug === slug);
}

/* ---------------------------------- Writing ---------------------------------- */

export function saveItem(id: string, originalSlug: string | null, item: Item) {
    if (apiEnabled()) return remote.saveItem(id, originalSlug, item);
    return locked(async () => {
        assertKnown(id);
        const items = await getItems(id);
        const clash = items.some((i) => i.slug === item.slug && i.slug !== originalSlug);
        if (clash) return { ok: false as const, error: "Já existe um conteúdo com este endereço (slug)." };

        const stamped = { ...item, updatedAt: new Date().toISOString() } as Item;
        const index = originalSlug ? items.findIndex((i) => i.slug === originalSlug) : -1;
        if (index >= 0) items[index] = stamped;
        else items.unshift(stamped);

        // "Artist of the week": only one artist can have the flag
        if (getCollection(id)?.kind === "artist" && (stamped as Artist).featuredWeek) {
            items.forEach((i) => {
                if (i.slug !== stamped.slug && (i as Artist).featuredWeek) (i as Artist).featuredWeek = undefined;
            });
        }

        await writeJson(fileOf(id), items);
        return { ok: true as const };
    });
}

export function deleteItem(id: string, slug: string) {
    if (apiEnabled()) return remote.deleteItem(id, slug);
    return locked(async () => {
        const items = await getItems(id);
        await writeJson(fileOf(id), items.filter((i) => i.slug !== slug));
    });
}

export function setStatus(id: string, slug: string, status: "published" | "draft") {
    if (apiEnabled()) return remote.setStatus(id, slug, status);
    return locked(async () => {
        const items = await getItems(id);
        await writeJson(
            fileOf(id),
            items.map((i) => (i.slug === slug ? ({ ...i, status, updatedAt: new Date().toISOString() } as Item) : i))
        );
    });
}

export function setFeaturedWeek(id: string, slug: string, on: boolean) {
    if (apiEnabled()) return remote.setFeaturedWeek(id, slug, on);
    return locked(async () => {
        const items = await getItems<Artist>(id);
        await writeJson(
            fileOf(id),
            items.map((i) => ({ ...i, featuredWeek: on && i.slug === slug ? true : undefined }))
        );
    });
}

export function moveItem(id: string, slug: string, direction: -1 | 1) {
    if (apiEnabled()) return remote.moveItem(id, slug, direction);
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
    if (apiEnabled()) return remote.duplicateItem(id, slug);
    return locked(async () => {
        const items = await getItems(id);
        const i = items.findIndex((x) => x.slug === slug);
        if (i < 0) return null;
        const source = items[i];
        let n = 1;
        const make = () => `${slug}-copia${n > 1 ? `-${n}` : ""}`;
        while (items.some((x) => x.slug === make())) n++;
        const newSlug = make();
        const copy = {
            ...source,
            slug: newSlug,
            status: "draft",
            featuredWeek: undefined,
            updatedAt: new Date().toISOString(),
            ...("title" in source ? { title: `${source.title} (cópia)` } : { name: `${source.name} (cópia)` }),
        } as Item;
        items.splice(i + 1, 0, copy);
        await writeJson(fileOf(id), items);
        return newSlug;
    });
}

/* ------------------------------ Dashboard & search ------------------------------ */

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
                withoutImages: items.filter((i) => !imagesOf(i).length).length,
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

const haystack = (i: Item) =>
    [
        titleOf(i), i.slug, tagOf(i), categoriesOf(i).join(" "), summaryOf(i),
        ("keywords" in i ? i.keywords ?? [] : []).join(" "),
    ].join(" ").toLowerCase();

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** BackOffice search: everything, drafts included. */
export async function searchAll(query: string, limit = 40) {
    const q = fold(query.trim());
    if (!q) return [];
    const out: { collection: string; item: Item }[] = [];
    for (const c of COLLECTIONS) {
        for (const item of await getItems(c.id)) {
            if (fold(haystack(item)).includes(q)) out.push({ collection: c.id, item });
            if (out.length >= limit) return out;
        }
    }
    return out;
}

/** Public search: published content only, best matches first. */
export async function searchPublic(query: string, limit = 120) {
    const words = fold(query.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const out: { collection: string; item: Item; score: number }[] = [];
    for (const c of COLLECTIONS) {
        for (const item of await getPublishedItems(c.id)) {
            const hay = fold(haystack(item));
            if (!words.every((w) => hay.includes(w))) continue;
            const title = fold(titleOf(item));
            const score = words.reduce((n, w) => n + (title.includes(w) ? 3 : 1), 0) + ((item as CatalogItem).featured ? 1 : 0);
            out.push({ collection: c.id, item, score });
        }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

/* --------------------------------- Activity --------------------------------- */

export type Activity = { at: string; user: string; action: string; collection?: string; slug?: string; title?: string };

const ACTIVITY_FILE = path.join(CMS_DIR, "_activity.json");

export const getActivity = async () => (await readJson<Activity[]>(ACTIVITY_FILE)) ?? [];

export function logActivity(entry: Omit<Activity, "at">) {
    return locked(async () => {
        const all = await getActivity();
        all.unshift({ at: new Date().toISOString(), ...entry });
        await writeJson(ACTIVITY_FILE, all.slice(0, 150));
    });
}

/* ----------------------------------- Media ----------------------------------- */

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
            if (stat?.isFile()) out.push({ url: `/api/media/${year}/${name}`, name, size: stat.size, at: stat.mtime.toISOString() });
        }
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
}

export async function deleteMedia(url: string) {
    const m = /^\/api\/media\/(\d{4})\/([a-z0-9-]+\.(?:jpg|png|webp|gif|avif|mp3|m4a|ogg|wav))$/.exec(url);
    if (!m) return false;
    await fs.rm(path.join(UPLOADS_DIR, m[1], m[2]), { force: true });
    return true;
}
