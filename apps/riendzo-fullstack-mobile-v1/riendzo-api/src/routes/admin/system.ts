import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db";
import { requireStaff } from "../../lib/auth";
import { ah, badRequest, conflict, notFound } from "../../lib/errors";
import { hashPassword, staffPasswordProblem } from "../../lib/password";
import { config } from "../../config";
import { logActivity } from "../../services/activity";
import { saveList } from "../../services/lists";
import { getHistoryTheme, getHomeConfig, saveHistoryTheme, saveHomeConfig } from "../../services/home";
import { recentNotices } from "../../services/notifications";
import { deleteTerritory, saveTerritory } from "../../services/territories";
import { normalizePhone, toPublicMember } from "../members";

/** Everything that only the "Administrador" module can touch (role admin) + activity for editors. */
export const adminSystemRouter = Router();

/* ----------------------------------- Lists ----------------------------------- */
adminSystemRouter.put("/lists/:id", requireStaff("admin"), ah(async (req, res) => {
    const b = z.object({
        items: z.array(z.object({ value: z.string(), label: z.string(), color: z.string().optional() })).max(500),
    }).parse(req.body);
    const count = await saveList(req.params.id, b.items);
    await logActivity(req.staff!, "Editou lista", undefined, req.params.id);
    res.json({ data: { count } });
}));

/* ------------------------------------ Home ------------------------------------ */
adminSystemRouter.get("/home", requireStaff("admin", "editor"), ah(async (_req, res) => {
    res.json({ data: await getHomeConfig() });
}));
adminSystemRouter.put("/home", requireStaff("admin", "editor"), ah(async (req, res) => {
    const cfg = await saveHomeConfig(req.body);
    await logActivity(req.staff!, "Editou a Home");
    res.json({ data: cfg });
}));
adminSystemRouter.get("/history-theme", requireStaff("admin", "editor"), ah(async (_req, res) => {
    res.json({ data: await getHistoryTheme() });
}));
adminSystemRouter.put("/history-theme", requireStaff("admin", "editor"), ah(async (req, res) => {
    const theme = await saveHistoryTheme(z.record(z.string(), z.string()).parse(req.body));
    await logActivity(req.staff!, "Editou as cores da Cronologia");
    res.json({ data: theme });
}));
adminSystemRouter.get("/notifications", requireStaff("admin", "editor"), ah(async (_req, res) => {
    res.json({ data: await recentNotices("staff", 10) });
}));

/* ------------------------------ Divisão administrativa ------------------------------ */
adminSystemRouter.post("/territories", requireStaff("admin", "editor"), ah(async (req, res) => {
    const t = await saveTerritory(req.body);
    await logActivity(req.staff!, "Registou território", undefined, t.name);
    res.status(201).json({ data: t });
}));
adminSystemRouter.put("/territories/:id", requireStaff("admin", "editor"), ah(async (req, res) => {
    const t = await saveTerritory(req.body, req.params.id);
    await logActivity(req.staff!, "Editou território", undefined, t.name);
    res.json({ data: t });
}));
adminSystemRouter.delete("/territories/:id", requireStaff("admin", "editor"), ah(async (req, res) => {
    await deleteTerritory(req.params.id);
    await logActivity(req.staff!, "Eliminou território", undefined, req.params.id);
    res.status(204).end();
}));

/* ------------------------------------ Menus ----------------------------------- */
adminSystemRouter.put("/menus/flags", requireStaff("admin"), ah(async (req, res) => {
    const flags = z.record(z.string(), z.boolean()).parse(req.body);
    const keys = Object.entries(flags).filter(([k, v]) => v === true && /^[a-z0-9/_-]{1,80}$/i.test(k)).map(([k]) => k);
    await prisma.$transaction([prisma.menuFlag.deleteMany(), prisma.menuFlag.createMany({ data: keys.map((key) => ({ key })) })]);
    await logActivity(req.staff!, "Editou menus");
    res.json({ data: Object.fromEntries(keys.map((k) => [k, true])) });
}));

/* ----------------------------------- Users ------------------------------------ */
const ownerRef = z.object({ collection: z.string().max(60), slug: z.string().max(80) });
const userBody = z.object({
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,32}$/, "Utilizador: 3 a 32 caracteres (letras minúsculas, números, . _ -)."),
    name: z.string().trim().min(1, "Indique o nome.").max(80),
    role: z.enum(["admin", "editor", "owner"]),
    password: z.string().max(200).optional(),
    email: z.string().trim().toLowerCase().email("E-mail inválido.").max(120).optional().or(z.literal("").transform(() => undefined)),
    phone: z.string().trim().max(30).optional().or(z.literal("").transform(() => undefined)),
    ownerOf: z.array(ownerRef).max(50).optional(),
    active: z.boolean().optional(),
});

const publicUser = <T extends { passwordHash: string }>(user: T): Omit<T, "passwordHash"> => {
    const { passwordHash: _h, ...rest } = user;
    return rest;
};

adminSystemRouter.get("/users", requireStaff("admin"), ah(async (_req, res) => {
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
    res.json({ data: users.map(publicUser) });
}));

adminSystemRouter.post("/users", requireStaff("admin"), ah(async (req, res) => {
    const b = userBody.parse(req.body);
    if (b.username === config.adminUsername) throw badRequest("Este nome de utilizador está reservado.");
    const problem = staffPasswordProblem(b.password ?? "");
    if (problem) throw badRequest(problem);
    if (b.role === "owner" && !b.ownerOf?.length) throw badRequest("Associe pelo menos um estabelecimento ao proprietário.");
    if (b.email && (await prisma.adminUser.findUnique({ where: { email: b.email }, select: { id: true } }))) throw conflict("Já existe um utilizador com este e-mail.");
    if (await prisma.adminUser.findUnique({ where: { username: b.username }, select: { id: true } })) throw conflict("Já existe um utilizador com este nome.");

    const u = await prisma.adminUser.create({
        data: {
            username: b.username, name: b.name, role: b.role, active: true,
            email: b.email ?? null, phone: b.phone ? normalizePhone(b.phone) : null,
            ownerOf: b.role === "owner" ? b.ownerOf ?? [] : [], passwordHash: hashPassword(b.password!),
        },
    });
    await logActivity(req.staff!, "Criou utilizador", undefined, u.username);
    res.status(201).json({ data: publicUser(u) });
}));

adminSystemRouter.put("/users/:id", requireStaff("admin"), ah(async (req, res) => {
    const b = userBody.parse(req.body);
    const cur = await prisma.adminUser.findUnique({ where: { id: req.params.id } });
    if (!cur) throw notFound("Utilizador não encontrado.");
    if (b.username === config.adminUsername) throw badRequest("Este nome de utilizador está reservado.");
    if (b.password) {
        const problem = staffPasswordProblem(b.password);
        if (problem) throw badRequest(problem);
    }
    if (b.role === "owner" && !b.ownerOf?.length) throw badRequest("Associe pelo menos um estabelecimento ao proprietário.");
    const clash = await prisma.adminUser.findUnique({ where: { username: b.username }, select: { id: true } });
    if (clash && clash.id !== cur.id) throw conflict("Já existe um utilizador com este nome.");

    const u = await prisma.adminUser.update({
        where: { id: cur.id },
        data: {
            username: b.username, name: b.name, role: b.role, active: b.active ?? cur.active,
            email: b.email ?? null, phone: b.phone ? normalizePhone(b.phone) : null,
            ownerOf: b.role === "owner" ? b.ownerOf ?? [] : [],
            ...(b.password ? { passwordHash: hashPassword(b.password) } : {}),
        },
    });
    await logActivity(req.staff!, "Editou utilizador", undefined, u.username);
    res.json({ data: publicUser(u) });
}));

adminSystemRouter.delete("/users/:id", requireStaff("admin"), ah(async (req, res) => {
    const r = await prisma.adminUser.deleteMany({ where: { id: req.params.id } });
    if (!r.count) throw notFound("Utilizador não encontrado.");
    await logActivity(req.staff!, "Eliminou utilizador", undefined, req.params.id);
    res.status(204).end();
}));

/* ---------------------------------- Members ----------------------------------- */
adminSystemRouter.get("/members", requireStaff("admin"), ah(async (_req, res) => {
    const rows = await prisma.member.findMany({ orderBy: { createdAt: "desc" }, include: { favorites: true } });
    res.json({ data: rows.map(toPublicMember) });
}));
adminSystemRouter.post("/members/:id/status", requireStaff("admin"), ah(async (req, res) => {
    const { status } = z.object({ status: z.enum(["active", "suspended"]) }).parse(req.body);
    const r = await prisma.member.updateMany({ where: { id: req.params.id }, data: { status } });
    if (!r.count) throw notFound("Membro não encontrado.");
    await logActivity(req.staff!, status === "active" ? "Reativou membro" : "Suspendeu membro", undefined, req.params.id);
    res.json({ data: { ok: true } });
}));

/* ----------------------------------- Inbox ------------------------------------ */
const inboxOut = (m: { id: string; createdAt: Date; name: string; contact: string; message: string; read: boolean }) => ({
    id: m.id, at: m.createdAt.toISOString(), name: m.name, contact: m.contact, message: m.message, read: m.read,
});
adminSystemRouter.get("/inbox", requireStaff("admin"), ah(async (_req, res) => {
    const rows = await prisma.inboxMessage.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    res.json({ data: rows.map(inboxOut) });
}));
adminSystemRouter.post("/inbox/:id/read", requireStaff("admin"), ah(async (req, res) => {
    const { read } = z.object({ read: z.boolean() }).parse(req.body);
    await prisma.inboxMessage.updateMany({ where: { id: req.params.id }, data: { read } });
    res.json({ data: { ok: true } });
}));
adminSystemRouter.delete("/inbox/:id", requireStaff("admin"), ah(async (req, res) => {
    await prisma.inboxMessage.deleteMany({ where: { id: req.params.id } });
    res.status(204).end();
}));

/* ---------------------------------- Activity ---------------------------------- */
adminSystemRouter.get("/activity", requireStaff("admin", "editor"), ah(async (_req, res) => {
    const rows = await prisma.activity.findMany({ orderBy: { id: "desc" }, take: 150 });
    res.json({
        data: rows.map((a) => ({
            at: a.at.toISOString(), user: a.userName, action: a.action,
            ...(a.collection ? { collection: a.collection } : {}), ...(a.title ? { title: a.title } : {}),
        })),
    });
}));
