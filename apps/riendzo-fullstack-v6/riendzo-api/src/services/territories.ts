/** Districts, municipalities, posts, localities and neighbourhoods under each province. */
import { z } from "zod";
import { prisma } from "../db";
import { conflict, notFound, badRequest } from "../lib/errors";
import { slugify } from "../lib/text-slug";

export const PROVINCES = ["cabo-delgado", "niassa", "nampula", "zambezia", "tete", "manica", "sofala", "inhambane", "gaza", "maputo-provincia", "maputo-cidade"];

/** What each kind may belong to ("province" = directly to a province). */
export const KINDS: Record<string, string[]> = {
    distrito: ["province"],
    municipio: ["distrito", "province"],
    posto: ["distrito", "municipio"],
    localidade: ["posto", "distrito", "municipio"],
    bairro: ["municipio", "localidade", "posto", "distrito"],
    outro: ["province", "distrito", "municipio", "posto", "localidade", "bairro"],
};

export const territorySchema = z.object({
    kind: z.enum(["distrito", "municipio", "posto", "localidade", "bairro", "outro"]),
    name: z.string().trim().min(1, "Indique o nome.").max(80),
    parent: z.string().trim().min(1, "Escolha a que pertence.").max(120),
    population: z.number().int().min(0).max(100_000_000).optional(),
    area: z.number().int().min(0).max(1_000_000).optional(),
    seat: z.string().trim().max(80).optional().or(z.literal("").transform(() => undefined)),
    notes: z.string().trim().max(600).optional().or(z.literal("").transform(() => undefined)),
});

async function checkParent(kind: string, parent: string, selfId?: string) {
    const allowed = KINDS[kind];
    if (parent.startsWith("province:")) {
        if (!allowed.includes("province")) throw badRequest("Este tipo não pode pertencer diretamente a uma província.");
        if (!PROVINCES.includes(parent.slice(9))) throw badRequest("Província desconhecida.");
        return;
    }
    const p = await prisma.territory.findUnique({ where: { id: parent } });
    if (!p) throw badRequest("Escolha a que pertence.");
    if (p.id === selfId) throw badRequest("Não pode pertencer a si próprio.");
    if (!allowed.includes(p.kind)) throw badRequest(`Este tipo pertence a: ${allowed.join(", ")}.`);
    // never under one of its own descendants
    let cur: typeof p | null = p;
    for (let i = 0; i < 10 && cur && selfId; i++) {
        if (cur.parent === selfId) throw badRequest("Não pode pertencer a um dos seus próprios elementos.");
        cur = cur.parent.startsWith("province:") ? null : await prisma.territory.findUnique({ where: { id: cur.parent } });
    }
}

export const listTerritories = () => prisma.territory.findMany({ orderBy: [{ parent: "asc" }, { name: "asc" }] });

export async function saveTerritory(input: unknown, id?: string) {
    const b = territorySchema.parse(input);
    await checkParent(b.kind, b.parent, id);
    const dup = await prisma.territory.findFirst({ where: { parent: b.parent, kind: b.kind, name: { equals: b.name, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) } });
    if (dup) throw conflict(`Já existe “${b.name}” aqui.`);
    if (id) {
        if (!(await prisma.territory.findUnique({ where: { id }, select: { id: true } }))) throw notFound("Não encontrado.");
        return prisma.territory.update({ where: { id }, data: b });
    }
    const base = slugify(`${b.kind}-${b.name}`) || "item";
    let nid = base, n = 2;
    while (await prisma.territory.findUnique({ where: { id: nid }, select: { id: true } })) nid = `${base}-${n++}`;
    return prisma.territory.create({ data: { id: nid, ...b } });
}

export async function deleteTerritory(id: string) {
    const kids = await prisma.territory.count({ where: { parent: id } });
    if (kids) throw conflict(`Tem ${kids} elemento(s) por baixo. Apague-os ou mude-os de sítio primeiro.`);
    const r = await prisma.territory.deleteMany({ where: { id } });
    if (!r.count) throw notFound("Não encontrado.");
}
