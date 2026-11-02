/**
 * Generic lists ("Administrador > Dados genéricos"): provinces, music styles,
 * recipe categories, lodging types…, plus the tag/category lists that are
 * generated from the existing content of each menu.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { COLLECTIONS, getCollection } from "./collections";
import { LIST_DEFAULTS, type ListDef, type ListItem } from "./lists-defaults";
import { SEEDS } from "./seeds";
import { DATA_DIR } from "./store";

const FILE = path.join(DATA_DIR, "cms", "_lists.json");
type Stored = Record<string, ListItem[]>;

async function readStored(): Promise<Stored> {
    try {
        return JSON.parse(await fs.readFile(FILE, "utf8")) as Stored;
    } catch {
        return {};
    }
}

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))];

/** Tag / category lists generated from the seed content of each menu. */
function autoLists(): ListDef[] {
    const out: ListDef[] = [];
    for (const c of COLLECTIONS) {
        if (c.kind !== "catalog") continue;
        const seeds = (SEEDS[c.id] ?? []) as { tag?: string; categories?: string[] }[];
        if (!c.tagList) {
            out.push({
                id: `tags:${c.id}`, label: `Etiquetas · ${c.label}`, group: "Etiquetas por menu",
                description: `Valores do campo “Etiqueta” em ${c.label}.`,
                items: uniq(seeds.map((s) => s.tag ?? "")).map((v) => ({ value: v, label: v })),
            });
        }
        if (!c.categoryList) {
            out.push({
                id: `cats:${c.id}`, label: `Categorias · ${c.label}`, group: "Categorias por menu",
                description: `Categorias disponíveis em ${c.label}.`,
                items: uniq(seeds.flatMap((s) => s.categories ?? [])).map((v) => ({ value: v, label: v })),
            });
        }
    }
    return out;
}

export async function getAllLists(): Promise<ListDef[]> {
    const stored = await readStored();
    return [...LIST_DEFAULTS, ...autoLists()].map((l) => ({ ...l, items: stored[l.id] ?? l.items }));
}

export async function getList(id: string): Promise<ListItem[]> {
    return (await getAllLists()).find((l) => l.id === id)?.items ?? [];
}

export async function saveList(id: string, items: ListItem[]) {
    const known = (await getAllLists()).some((l) => l.id === id);
    if (!known) throw new Error("Lista desconhecida");
    const stored = await readStored();
    const seen = new Set<string>();
    stored[id] = items
        .map((i) => ({ value: i.value.trim().slice(0, 80), label: i.label.trim().slice(0, 80), color: /^#[0-9a-fA-F]{6}$/.test(i.color ?? "") ? i.color : undefined }))
        .filter((i) => i.value && i.label && !seen.has(i.value) && seen.add(i.value));
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(stored, null, 2), "utf8");
}

/** Options for the tag and category selects of a collection. */
export async function getCollectionOptions(collectionId: string) {
    const c = getCollection(collectionId);
    if (!c) return { tags: [] as ListItem[], categories: [] as ListItem[] };
    const [tags, categories] = await Promise.all([
        getList(c.tagList ?? `tags:${c.id}`),
        getList(c.categoryList ?? `cats:${c.id}`),
    ]);
    return { tags, categories };
}
