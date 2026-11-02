/**
 * Home page content, all of it managed in the BackOffice:
 *  - "6 experiências imperdíveis" (setting "home": up to six picks with optional text overrides)
 *  - entries with "showOnHome" on (Breve História, Serviços, Emergências, Entretenimento)
 *  - background colours of the Cronologia sections (setting "history_theme")
 */
import { z } from "zod";
import { prisma } from "../db";
import { toApi } from "./items";
import { getSetting, setSetting } from "./settings";
import { conflict } from "../lib/errors";

export const MAX_EXPERIENCES = 6;
const ICONS = ["whale", "reef", "paw", "landmark", "sail", "city"] as const;

const opt = (max: number) => z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));
const imageUrl = z.string().max(300).refine((v) => (/^\/(?!\/)[\w\-./]+$/.test(v) || /^https:\/\/\S+$/.test(v)) && !v.includes(".."), "Imagem inválida.");

export const homeSchema = z.object({
    experiences: z.array(z.object({
        collection: z.string().max(60), slug: z.string().max(80),
        headline: opt(120), location: opt(80), bestTime: opt(60), tag: opt(40),
        image: imageUrl.optional().or(z.literal("").transform(() => undefined)), icon: z.enum(ICONS).optional(),
    })).max(MAX_EXPERIENCES, `No máximo ${MAX_EXPERIENCES} experiências.`),
    heading: z.object({ eyebrow: opt(60), title: opt(100), subtitle: opt(300) }).optional(),
});
export type HomeConfig = z.infer<typeof homeSchema>;

export async function getHomeConfig(): Promise<HomeConfig> {
    return (await getSetting<HomeConfig>("home")) ?? { experiences: [] };
}

export async function saveHomeConfig(input: unknown) {
    const cfg = homeSchema.parse(input);
    const keys = cfg.experiences.map((e) => `${e.collection}:${e.slug}`);
    if (new Set(keys).size !== keys.length) throw conflict("A mesma experiência está repetida.");
    await setSetting("home", cfg);
    return cfg;
}

/** Public payload: resolved experiences (+ the registered content) and everything flagged for the Home. */
export async function getHome() {
    const cfg = await getHomeConfig();
    const experiences = [];
    for (const e of cfg.experiences) {
        const row = await prisma.item.findUnique({ where: { collectionId_slug: { collectionId: e.collection, slug: e.slug } } });
        if (row && row.status === "published") experiences.push({ ...e, item: toApi(row) });
    }
    const flagged = await prisma.item.findMany({
        where: { status: "published", data: { path: ["showOnHome"], equals: true }, collection: { groupId: { in: ["history", "services", "entertainment"] } } },
        orderBy: [{ collection: { position: "asc" } }, { position: "asc" }],
    });
    const byCollection: Record<string, Record<string, unknown>[]> = {};
    for (const r of flagged) (byCollection[r.collectionId] ??= []).push(toApi(r));
    return { heading: cfg.heading ?? null, experiences, flagged: byCollection };
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const SECTIONS = ["realms", "ancient", "colonial", "independent"] as const;

export async function getHistoryTheme(): Promise<Record<string, string>> {
    return (await getSetting<Record<string, string>>("history_theme")) ?? {};
}
export async function saveHistoryTheme(input: Record<string, string>) {
    const out: Record<string, string> = {};
    for (const s of SECTIONS) if (input[s] && HEX.test(input[s])) out[s] = input[s];
    await setSetting("history_theme", out);
    return out;
}
