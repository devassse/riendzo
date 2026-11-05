import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db";
import { ah, notFound } from "../lib/errors";
import { getAllLists, getCollectionOptions, getList } from "../services/lists";
import * as items from "../services/items";
import { getWeather } from "../services/weather";
import { getHistoryTheme, getHome } from "../services/home";
import { recentNotices } from "../services/notifications";
import { listTerritories } from "../services/territories";

export const publicRouter = Router();

const listQuery = z.object({
    q: z.string().trim().max(100).optional(),
    category: z.string().trim().max(80).optional(),
    tag: z.string().trim().max(80).optional(),
    limit: z.coerce.number().int().min(1).max(1000).optional(),
    offset: z.coerce.number().int().min(0).optional(),
});

/** Menu groups with their collections (the site navigation). */
publicRouter.get("/groups", ah(async (_req, res) => {
    const data = await prisma.group.findMany({ orderBy: { position: "asc" }, include: { collections: { orderBy: { position: "asc" } } } });
    res.json({ data });
}));

publicRouter.get("/collections", ah(async (_req, res) => {
    const [cols, counts] = await Promise.all([
        prisma.collection.findMany({ orderBy: { position: "asc" } }),
        prisma.item.groupBy({ by: ["collectionId"], where: { status: "published" }, _count: { _all: true } }),
    ]);
    const n = new Map(counts.map((c) => [c.collectionId, c._count._all]));
    res.json({ data: cols.map((c) => ({ ...c, publishedCount: n.get(c.id) ?? 0 })) });
}));

publicRouter.get("/collections/:id", ah(async (req, res) => {
    const col = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!col) throw notFound("Menu desconhecido.");
    res.json({ data: { ...col, options: await getCollectionOptions(col.id) } });
}));

publicRouter.get("/collections/:id/options", ah(async (req, res) => {
    res.json({ data: await getCollectionOptions(req.params.id) });
}));

publicRouter.get("/collections/:id/items", ah(async (req, res) => {
    const q = listQuery.parse(req.query);
    const { items: data, total } = await items.listPublished(req.params.id, q);
    res.json({ data, meta: { total, limit: q.limit ?? null, offset: q.offset ?? 0 } });
}));

publicRouter.get("/collections/:id/items/:slug", ah(async (req, res) => {
    res.json({ data: await items.getOne(req.params.id, req.params.slug, false) });
}));

publicRouter.get("/search", ah(async (req, res) => {
    const q = z.object({
        q: z.string().trim().min(1).max(100),
        collection: z.string().max(60).optional(),
        limit: z.coerce.number().int().min(1).max(300).optional(),
    }).parse(req.query);
    res.json({ data: await items.searchPublic(q.q, { collection: q.collection, limit: q.limit }) });
}));

publicRouter.get("/lists", ah(async (_req, res) => {
    res.json({ data: await getAllLists() });
}));
publicRouter.get("/lists/:id", ah(async (req, res) => {
    res.json({ data: await getList(req.params.id) });
}));

/** "Em breve" flags of the menus: { "turismo": true, "/turismo/guias": true } */
publicRouter.get("/menus/flags", ah(async (_req, res) => {
    const rows = await prisma.menuFlag.findMany();
    res.json({ data: Object.fromEntries(rows.map((r) => [r.key, true])) });
}));

/** Districts, municipalities, neighbourhoods… (shown when a province is selected on the map). */
publicRouter.get("/territories", ah(async (_req, res) => {
    res.json({ data: await listTerritories() });
}));

/** Home page: the six experiences + every entry flagged "showOnHome" (BackOffice > Home). */
publicRouter.get("/home", ah(async (_req, res) => {
    res.json({ data: await getHome() });
}));
publicRouter.get("/history/theme", ah(async (_req, res) => {
    res.json({ data: await getHistoryTheme() });
}));
/** New published records (shown in the member portal bell). */
publicRouter.get("/notifications", ah(async (req, res) => {
    const limit = z.coerce.number().int().min(1).max(30).default(10).parse(req.query.limit);
    res.json({ data: await recentNotices("member", limit) });
}));

/** Weather card / top bar. Defaults to Maputo. */
publicRouter.get("/weather", ah(async (req, res) => {
    const q = z.object({
        lat: z.coerce.number().min(-90).max(90).default(-25.96),
        lon: z.coerce.number().min(-180).max(180).default(32.59),
        name: z.string().trim().min(1).max(60).default("Maputo"),
    }).parse(req.query);
    try {
        res.set("Cache-Control", "public, max-age=300").json({ data: await getWeather(q.lat, q.lon, q.name) });
    } catch {
        res.status(502).json({ error: { code: "upstream", message: "Tempo indisponível de momento." } });
    }
}));

/** Contact form. */
const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false,
    message: { error: { code: "rate_limited", message: "Demasiadas mensagens. Tente mais tarde." } },
});
publicRouter.post("/contact", contactLimiter, ah(async (req, res) => {
    const b = z.object({
        name: z.string().trim().min(1, "Indique o nome.").max(100),
        contact: z.string().trim().min(3, "Indique um e-mail ou telefone.").max(120),
        message: z.string().trim().min(3, "Escreva a mensagem.").max(2000),
    }).parse(req.body);
    await prisma.inboxMessage.create({ data: b });
    // keep the inbox bounded (500 newest)
    const cutoff = await prisma.inboxMessage.findMany({ orderBy: { createdAt: "desc" }, skip: 500, take: 1, select: { createdAt: true } });
    if (cutoff[0]) await prisma.inboxMessage.deleteMany({ where: { createdAt: { lte: cutoff[0].createdAt } } });
    res.status(201).json({ data: { ok: true } });
}));
