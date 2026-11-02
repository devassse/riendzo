/**
 * Districts, municipalities, administrative posts, localities and neighbourhoods,
 * registered in the BackOffice (Divisão administrativa) and shown when a province is selected on the map.
 */
import path from "node:path";
import { PROVINCES } from "@/lib/data/mozambique";
import { CMS_DIR, locked, readJson, writeJson } from "./store";
import { slugify } from "./validate";
import { TERRITORY_KINDS, childrenOf, isProvinceParent, kindOf, provinceOf, type Territory, type TerritoryKind } from "./territory-types";

export * from "./territory-types";

const FILE = path.join(CMS_DIR, "_territories.json");

export async function getTerritories(): Promise<Territory[]> {
    return (await readJson<Territory[]>(FILE)) ?? [];
}

const num = (v: unknown, max: number) => {
    const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[\s.]/g, "").replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n) : undefined;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type TerritoryInput = { id?: string; kind: string; name: string; parent: string; population?: unknown; area?: unknown; seat?: string; notes?: string };

/** Which parent a territory of this kind may have (an existing province or territory of an allowed kind). */
function parentProblem(all: Territory[], kind: TerritoryKind, parent: string, selfId?: string): string | null {
    const allowed = kindOf(kind)!.parents;
    if (isProvinceParent(parent)) {
        if (!allowed.includes("province")) return `${kindOf(kind)!.label} não pode pertencer diretamente a uma província.`;
        return PROVINCES.some((p) => `province:${p.id}` === parent) ? null : "Província desconhecida.";
    }
    const p = all.find((t) => t.id === parent);
    if (!p) return "Escolha a que pertence.";
    if (p.id === selfId) return "Não pode pertencer a si próprio.";
    if (!allowed.includes(p.kind)) return `${kindOf(kind)!.label} pertence a: ${allowed.map((a) => (a === "province" ? "Província" : kindOf(a)!.label)).join(", ")}.`;
    // never under one of its own descendants
    let cur: Territory | undefined = p;
    for (let i = 0; i < 10 && cur && selfId; i++) { if (cur.parent === selfId) return "Não pode pertencer a um dos seus próprios elementos."; cur = all.find((t) => t.id === cur!.parent); }
    return null;
}

export function saveTerritory(input: TerritoryInput) {
    return locked(async () => {
        const all = await getTerritories();
        const kind = TERRITORY_KINDS.find((k) => k.id === input.kind)?.id;
        const name = text(input.name, 80);
        if (!kind) return { ok: false as const, error: "Escolha o tipo." };
        if (!name) return { ok: false as const, error: "Indique o nome." };
        const problem = parentProblem(all, kind, input.parent, input.id);
        if (problem) return { ok: false as const, error: problem };
        if (all.some((t) => t.id !== input.id && t.parent === input.parent && t.kind === kind && t.name.toLowerCase() === name.toLowerCase())) {
            return { ok: false as const, error: `Já existe ${kindOf(kind)!.label.toLowerCase()} “${name}” aqui.` };
        }
        const item: Territory = {
            id: input.id ?? "", kind, name, parent: input.parent,
            population: num(input.population, 1e8), area: num(input.area, 1e6),
            seat: text(input.seat, 80) || undefined, notes: text(input.notes, 600) || undefined,
        };
        if (input.id) {
            const i = all.findIndex((t) => t.id === input.id);
            if (i < 0) return { ok: false as const, error: "Não encontrado." };
            all[i] = item;
        } else {
            const base = slugify(`${kind}-${name}`) || "item";
            let id = base, n = 2;
            while (all.some((t) => t.id === id)) id = `${base}-${n++}`;
            all.push({ ...item, id });
        }
        await writeJson(FILE, all);
        return { ok: true as const };
    });
}

/** Paste a list (one name per line, optionally "Name; population") under the same parent. Returns how many were added. */
export async function addMany(kind: string, parent: string, lines: string) {
    let added = 0;
    const skipped: string[] = [];
    for (const raw of lines.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 300)) {
        const [name, pop] = raw.split(/[;\t]/).map((s) => s.trim());
        const r = await saveTerritory({ kind, name, parent, population: pop });
        if (r.ok) added++; else skipped.push(`${name} (${r.error})`);
    }
    return { added, skipped };
}

export function deleteTerritory(id: string) {
    return locked(async () => {
        const all = await getTerritories();
        const kids = childrenOf(all, id).length;
        if (kids) return { ok: false as const, error: `Tem ${kids} elemento(s) por baixo. Apague-os ou mude-os de sítio primeiro.` };
        await writeJson(FILE, all.filter((t) => t.id !== id));
        return { ok: true as const };
    });
}

export { provinceOf };
