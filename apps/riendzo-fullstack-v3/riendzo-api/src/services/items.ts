import { Prisma, type CollectionKind, type Item } from "@prisma/client";
import { prisma } from "../db";
import { conflict, notFound } from "../lib/errors";
import { prepareItem } from "../lib/item-schema";
import { columnsOf } from "../lib/columns";
import { fold } from "../lib/text";

type Tx = Prisma.TransactionClient;
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Shape the frontend expects: the stored data plus slug/status/featured/updatedAt. */
export function toApi(row: Item): Record<string, unknown> {
    const out: Record<string, unknown> = { ...(row.data as Record<string, unknown>), slug: row.slug, status: row.status };
    if (row.featured) out.featured = true;
    if (row.featuredWeek) out.featuredWeek = true;
    if (row.updatedAt) out.updatedAt = row.updatedAt.toISOString();
    return out;
}

const words = (q?: string) => fold((q ?? "").trim()).split(/\s+/).filter(Boolean);
const ORDER: Prisma.ItemOrderByWithRelationInput[] = [{ featured: "desc" }, { position: "asc" }, { createdAt: "asc" }];

/* --------------------------------- Reading --------------------------------- */

export async function getCollectionOrThrow(id: string) {
    const c = await prisma.collection.findUnique({ where: { id } });
    if (!c) throw notFound("Menu desconhecido.");
    return c;
}

export type ListOptions = { q?: string; category?: string; tag?: string; limit?: number; offset?: number };

/** What the public site shows: drafts hidden; paid listings first. */
export async function listPublished(collectionId: string, o: ListOptions = {}) {
    await getCollectionOrThrow(collectionId);
    const w = words(o.q);
    const where: Prisma.ItemWhereInput = {
        collectionId,
        status: "published",
        ...(o.category ? { categories: { has: o.category } } : {}),
        ...(o.tag ? { tag: o.tag } : {}),
        ...(w.length ? { AND: w.map((x) => ({ searchText: { contains: x } })) } : {}),
    };
    const [rows, total] = await prisma.$transaction([
        prisma.item.findMany({ where, orderBy: ORDER, skip: o.offset ?? 0, take: Math.min(o.limit ?? 1000, 1000) }),
        prisma.item.count({ where }),
    ]);
    return { items: rows.map(toApi), total };
}

export async function getOne(collectionId: string, slug: string, includeDrafts: boolean) {
    const row = await prisma.item.findUnique({ where: { collectionId_slug: { collectionId, slug } } });
    if (!row || (!includeDrafts && row.status === "draft")) throw notFound("Conteúdo não encontrado.");
    return toApi(row);
}

/** BackOffice: everything, drafts included, in display order. */
export async function listAll(collectionId: string) {
    await getCollectionOrThrow(collectionId);
    const rows = await prisma.item.findMany({ where: { collectionId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
    return rows.map(toApi);
}

export async function searchPublic(q: string, opts: { collection?: string; limit?: number } = {}) {
    const w = words(q);
    if (!w.length) return [];
    const rows = await prisma.item.findMany({
        where: {
            status: "published",
            ...(opts.collection ? { collectionId: opts.collection } : {}),
            AND: w.map((x) => ({ searchText: { contains: x } })),
        },
        orderBy: [{ collection: { position: "asc" } }, { position: "asc" }],
        take: 600,
    });
    return rows
        .map((row) => {
            const title = fold(row.title);
            const score = w.reduce((n, x) => n + (title.includes(x) ? 3 : 1), 0) + (row.featured ? 1 : 0);
            return { collection: row.collectionId, item: toApi(row), score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(opts.limit ?? 120, 300));
}

/* --------------------------------- Writing --------------------------------- */

async function renumber(tx: Tx, collectionId: string, orderedIds: string[]) {
    await Promise.all(orderedIds.map((id, i) => tx.item.update({ where: { id }, data: { position: i } })));
    void collectionId;
}

export type SaveOptions = { allowFeatured: boolean };

/** Create (originalSlug = null) or update an item. */
export async function saveItem(collectionId: string, originalSlug: string | null, input: unknown, opts: SaveOptions) {
    const col = await getCollectionOrThrow(collectionId);
    const p = prepareItem(col.kind, input, opts.allowFeatured && col.featured);
    const cols = columnsOf(col.kind, p.slug, p.data);
    const now = new Date();

    const row = await prisma.$transaction(async (tx) => {
        const clash = await tx.item.findUnique({ where: { collectionId_slug: { collectionId, slug: p.slug } }, select: { slug: true } });
        if (clash && clash.slug !== originalSlug) throw conflict("Já existe um conteúdo com este endereço (slug).");

        let saved: Item;
        if (originalSlug) {
            const existing = await tx.item.findUnique({ where: { collectionId_slug: { collectionId, slug: originalSlug } } });
            if (!existing) throw notFound("Conteúdo não encontrado.");
            saved = await tx.item.update({
                where: { id: existing.id },
                data: {
                    slug: p.slug, status: p.status, ...cols,
                    // owners cannot change the paid flag: keep what is stored
                    featured: opts.allowFeatured && col.featured ? p.featured : existing.featured,
                    featuredWeek: col.kind === "artist" ? p.featuredWeek : false,
                    data: p.data as Prisma.InputJsonValue, updatedAt: now,
                },
            });
        } else {
            const min = await tx.item.aggregate({ where: { collectionId }, _min: { position: true } });
            saved = await tx.item.create({
                data: {
                    collectionId, slug: p.slug, status: p.status, ...cols,
                    featured: p.featured, featuredWeek: p.featuredWeek,
                    position: (min._min.position ?? 1) - 1, // new content goes first, as in the BackOffice
                    data: p.data as Prisma.InputJsonValue, updatedAt: now,
                },
            });
        }
        // "Artist of the week": only one artist can have the flag
        if (col.kind === "artist" && saved.featuredWeek) {
            await tx.item.updateMany({ where: { collectionId, featuredWeek: true, NOT: { id: saved.id } }, data: { featuredWeek: false } });
        }
        return saved;
    });
    return toApi(row);
}

export async function deleteItem(collectionId: string, slug: string) {
    const r = await prisma.item.deleteMany({ where: { collectionId, slug } });
    if (!r.count) throw notFound("Conteúdo não encontrado.");
}

export async function setStatus(collectionId: string, slug: string, status: "published" | "draft") {
    const r = await prisma.item.updateMany({ where: { collectionId, slug }, data: { status, updatedAt: new Date() } });
    if (!r.count) throw notFound("Conteúdo não encontrado.");
}

export async function setFeaturedWeek(collectionId: string, slug: string, on: boolean) {
    await prisma.$transaction([
        prisma.item.updateMany({ where: { collectionId, featuredWeek: true }, data: { featuredWeek: false } }),
        ...(on ? [prisma.item.updateMany({ where: { collectionId, slug }, data: { featuredWeek: true } })] : []),
    ]);
}

export async function moveItem(collectionId: string, slug: string, direction: -1 | 1) {
    await prisma.$transaction(async (tx) => {
        const rows = await tx.item.findMany({ where: { collectionId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { id: true, slug: true } });
        const i = rows.findIndex((r) => r.slug === slug);
        const j = i + direction;
        if (i < 0) throw notFound("Conteúdo não encontrado.");
        if (j < 0 || j >= rows.length) return;
        [rows[i], rows[j]] = [rows[j], rows[i]];
        await renumber(tx, collectionId, rows.map((r) => r.id));
    });
}

/** Copy as a draft, placed right after the original. Returns the new slug. */
export async function duplicateItem(collectionId: string, slug: string) {
    return prisma.$transaction(async (tx) => {
        const rows = await tx.item.findMany({ where: { collectionId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
        const i = rows.findIndex((r) => r.slug === slug);
        if (i < 0) throw notFound("Conteúdo não encontrado.");
        const src = rows[i];
        const taken = new Set(rows.map((r) => r.slug));
        let n = 1;
        const make = () => `${slug}-copia${n > 1 ? `-${n}` : ""}`;
        while (taken.has(make())) n++;
        const newSlug = make();

        const data = { ...(src.data as Record<string, unknown>) };
        const key = "title" in data ? "title" : "name";
        data[key] = `${s(data[key])} (cópia)`;
        const col = await tx.collection.findUniqueOrThrow({ where: { id: collectionId }, select: { kind: true } });
        const cols = columnsOf(col.kind, newSlug, data);

        const copy = await tx.item.create({
            data: {
                collectionId, slug: newSlug, status: "draft", ...cols, featured: src.featured, featuredWeek: false,
                position: src.position, data: data as Prisma.InputJsonValue, updatedAt: new Date(),
            },
        });
        const ids = rows.map((r) => r.id);
        ids.splice(i + 1, 0, copy.id);
        await renumber(tx, collectionId, ids);
        return newSlug;
    });
}

/* ------------------------------ Dashboard data ------------------------------ */

const hasImages = (kind: CollectionKind, d: Record<string, unknown>) =>
    kind === "artist" ? Boolean(d.photo) : Array.isArray(d.images) && d.images.length > 0;

export async function getStats() {
    const [cols, rows] = await Promise.all([
        prisma.collection.findMany({ orderBy: { position: "asc" }, select: { id: true, kind: true } }),
        prisma.item.findMany({ select: { collectionId: true, status: true, updatedAt: true, data: true } }),
    ]);
    return cols.map((c) => {
        const mine = rows.filter((r) => r.collectionId === c.id);
        const dates = mine.map((r) => r.updatedAt?.toISOString()).filter((x): x is string => Boolean(x)).sort();
        return {
            id: c.id,
            total: mine.length,
            published: mine.filter((r) => r.status !== "draft").length,
            drafts: mine.filter((r) => r.status === "draft").length,
            withoutImages: mine.filter((r) => !hasImages(c.kind, r.data as Record<string, unknown>)).length,
            lastUpdated: dates.at(-1) ?? null,
        };
    });
}

export async function getRecent(limit = 3) {
    const rows = await prisma.item.findMany({
        orderBy: [{ updatedAt: { sort: "desc", nulls: "last" } }, { collection: { position: "asc" } }, { position: "asc" }],
        take: Math.min(limit, 20),
    });
    return rows.map((r) => ({ collection: r.collectionId, item: toApi(r) }));
}

/** BackOffice search: everything, drafts included. */
export async function searchAll(q: string, limit = 40) {
    const w = words(q);
    if (!w.length) return [];
    const rows = await prisma.item.findMany({
        where: { AND: w.map((x) => ({ searchText: { contains: x } })) },
        orderBy: [{ collection: { position: "asc" } }, { position: "asc" }],
        take: Math.min(limit, 100),
    });
    return rows.map((r) => ({ collection: r.collectionId, item: toApi(r) }));
}
