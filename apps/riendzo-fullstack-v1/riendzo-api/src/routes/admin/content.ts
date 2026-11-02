import { Router } from "express";
import { z } from "zod";
import type { StaffPrincipal } from "../../lib/auth";
import { requireStaff } from "../../lib/auth";
import { ah, forbidden } from "../../lib/errors";
import { logActivity } from "../../services/activity";
import * as items from "../../services/items";

export const adminContentRouter = Router();

const owns = (s: StaffPrincipal, collection: string, slug: string) =>
    s.ownerOf.some((o) => o.collection === collection && o.slug === slug);

const titleOf = (i: Record<string, unknown>) => String(i.title ?? i.name ?? i.slug ?? "");

// Dashboard & search (admin / editor)
adminContentRouter.get("/stats", requireStaff("admin", "editor"), ah(async (_req, res) => {
    res.json({ data: await items.getStats() });
}));
adminContentRouter.get("/recent", requireStaff("admin", "editor"), ah(async (req, res) => {
    const limit = z.coerce.number().int().min(1).max(20).default(3).parse(req.query.limit);
    res.json({ data: await items.getRecent(limit) });
}));
adminContentRouter.get("/search", requireStaff("admin", "editor"), ah(async (req, res) => {
    const q = z.object({ q: z.string().trim().min(1).max(100), limit: z.coerce.number().int().min(1).max(100).default(40) }).parse(req.query);
    res.json({ data: await items.searchAll(q.q, q.limit) });
}));

// Items of a menu (drafts included)
adminContentRouter.get("/collections/:id/items", requireStaff(), ah(async (req, res) => {
    const all = await items.listAll(req.params.id);
    const s = req.staff!;
    // owners only see their own establishments
    res.json({ data: s.role === "owner" ? all.filter((i) => owns(s, req.params.id, String(i.slug))) : all });
}));

adminContentRouter.get("/collections/:id/items/:slug", requireStaff(), ah(async (req, res) => {
    const s = req.staff!;
    if (s.role === "owner" && !owns(s, req.params.id, req.params.slug)) throw forbidden();
    res.json({ data: await items.getOne(req.params.id, req.params.slug, true) });
}));

adminContentRouter.post("/collections/:id/items", requireStaff("admin", "editor"), ah(async (req, res) => {
    const saved = await items.saveItem(req.params.id, null, req.body, { allowFeatured: true });
    await logActivity(req.staff!, "Criou", req.params.id, titleOf(saved));
    res.status(201).json({ data: saved });
}));

adminContentRouter.put("/collections/:id/items/:slug", requireStaff(), ah(async (req, res) => {
    const s = req.staff!;
    const isOwner = s.role === "owner";
    if (isOwner && !owns(s, req.params.id, req.params.slug)) throw forbidden();
    // an owner cannot move the establishment to a different address
    const body = isOwner ? { ...(req.body ?? {}), slug: req.params.slug } : req.body;
    const saved = await items.saveItem(req.params.id, req.params.slug, body, { allowFeatured: !isOwner });
    await logActivity(s, "Editou", req.params.id, titleOf(saved));
    res.json({ data: saved });
}));

adminContentRouter.delete("/collections/:id/items/:slug", requireStaff("admin", "editor"), ah(async (req, res) => {
    await items.deleteItem(req.params.id, req.params.slug);
    await logActivity(req.staff!, "Eliminou", req.params.id, req.params.slug);
    res.status(204).end();
}));

adminContentRouter.post("/collections/:id/items/:slug/status", requireStaff("admin", "editor"), ah(async (req, res) => {
    const { status } = z.object({ status: z.enum(["published", "draft"]) }).parse(req.body);
    await items.setStatus(req.params.id, req.params.slug, status);
    await logActivity(req.staff!, status === "draft" ? "Ocultou" : "Publicou", req.params.id, req.params.slug);
    res.json({ data: { ok: true } });
}));

adminContentRouter.post("/collections/:id/items/:slug/featured-week", requireStaff("admin", "editor"), ah(async (req, res) => {
    const { on } = z.object({ on: z.boolean() }).parse(req.body);
    await items.setFeaturedWeek(req.params.id, req.params.slug, on);
    await logActivity(req.staff!, on ? "Artista da semana" : "Retirou artista da semana", req.params.id, req.params.slug);
    res.json({ data: { ok: true } });
}));

adminContentRouter.post("/collections/:id/items/:slug/move", requireStaff("admin", "editor"), ah(async (req, res) => {
    const { direction } = z.object({ direction: z.union([z.literal(-1), z.literal(1)]) }).parse(req.body);
    await items.moveItem(req.params.id, req.params.slug, direction);
    res.json({ data: { ok: true } });
}));

adminContentRouter.post("/collections/:id/items/:slug/duplicate", requireStaff("admin", "editor"), ah(async (req, res) => {
    const slug = await items.duplicateItem(req.params.id, req.params.slug);
    await logActivity(req.staff!, "Duplicou", req.params.id, req.params.slug);
    res.status(201).json({ data: { slug } });
}));
