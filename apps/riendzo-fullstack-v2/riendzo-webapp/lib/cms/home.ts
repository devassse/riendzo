/**
 * What the Home page shows, all of it managed in the BackOffice (Home):
 *  - "6 experiências imperdíveis": up to six entries picked from what is registered, with optional text overrides
 *  - Breve História, Serviços Públicos, Emergências, Entretenimento: every entry that has "Mostrar na Home" on
 */
import path from "node:path";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { COLLECTIONS, getCollection, publicUrlOf, type GroupId } from "./collections";
import { CMS_DIR, categoriesOf, colorOf, emojiOf, getItem, getPublishedItems, imagesOf, locked, readJson, summaryOf, tagOf, titleOf, writeJson } from "./store";

import { EXPERIENCE_ICONS, MAX_EXPERIENCES, type ExperienceIcon, type ExperienceRef, type HomeConfig, type HomeHeading } from "./home-types";
export { EXPERIENCE_ICONS, MAX_EXPERIENCES };
export type { ExperienceIcon, ExperienceRef, HomeConfig, HomeHeading };

const FILE = path.join(CMS_DIR, "_home.json");

/** First selection (what the Home showed before it became editable). */
const DEFAULT_EXPERIENCES: ExperienceRef[] = [
    { collection: "tourism-beaches", slug: "tofo-barra", headline: "Nadar com Tubarões-Baleia em Tofo", location: "Tofo, Inhambane", bestTime: "Outubro a Março", tag: "Vida marinha", image: "/home/dolphins.jpg", icon: "whale" },
    { collection: "tourism-beaches", slug: "bazaruto", headline: "Mergulhar no Arquipélago de Bazaruto", location: "Bazaruto, Inhambane", bestTime: "Maio a Novembro", tag: "Mergulho", image: "/home/bazaruto.jpeg", icon: "reef" },
    { collection: "tourism-parks", slug: "gorongosa", headline: "Safári no Parque Nacional da Gorongosa", location: "Sofala", bestTime: "Maio a Outubro", tag: "Safári", image: "/home/gorongosa.png", icon: "paw" },
    { collection: "tourism-beaches", slug: "ilha-de-mocambique", headline: "Explorar a Ilha de Moçambique", location: "Nampula", bestTime: "Todo o ano", tag: "Património", image: "/home/ilha_de_mocambique.jpg", icon: "landmark" },
    { collection: "tourism-beaches", slug: "quirimbas", headline: "Velejar pelo Arquipélago das Quirimbas", location: "Cabo Delgado", bestTime: "Abril a Dezembro", tag: "Ilhas", image: "/home/quirimbas.jpg", icon: "sail" },
    { collection: "tourism-routes", slug: "maputo-3-dias", headline: "Passear pela Baixa de Maputo", location: "Maputo", bestTime: "Todo o ano", tag: "Cidade", image: "/home/maputo_baixa.jpg", icon: "city" },
];

export async function getHomeConfig(): Promise<HomeConfig> {
    const f = await readJson<HomeConfig>(FILE);
    return { experiences: (f?.experiences ?? DEFAULT_EXPERIENCES).slice(0, MAX_EXPERIENCES), heading: f?.heading };
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) || undefined : undefined);
const safeImage = (v: unknown) => {
    const s = clean(v, 300);
    return s && (/^\/(?!\/)[\w\-./]+$/.test(s) || /^https:\/\/\S+$/.test(s)) && !s.includes("..") ? s : undefined;
};

/** Validates and stores the selection. Returns an error message or null. */
export function saveHomeConfig(input: { experiences: ExperienceRef[]; heading?: HomeHeading }) {
    return locked(async () => {
        const seen = new Set<string>();
        const refs: ExperienceRef[] = [];
        for (const r of input.experiences ?? []) {
            if (!getCollection(r.collection) || typeof r.slug !== "string" || !r.slug) continue;
            const key = `${r.collection}:${r.slug}`;
            if (seen.has(key)) return { ok: false as const, error: "A mesma experiência está repetida." };
            seen.add(key);
            refs.push({
                collection: r.collection, slug: r.slug,
                headline: clean(r.headline, 120), location: clean(r.location, 80), bestTime: clean(r.bestTime, 60), tag: clean(r.tag, 40),
                image: safeImage(r.image), icon: EXPERIENCE_ICONS.some((i) => i.value === r.icon) ? r.icon : undefined,
            });
        }
        if (refs.length > MAX_EXPERIENCES) return { ok: false as const, error: `No máximo ${MAX_EXPERIENCES} experiências.` };
        const heading: HomeHeading = { eyebrow: clean(input.heading?.eyebrow, 60), title: clean(input.heading?.title, 100), subtitle: clean(input.heading?.subtitle, 300) };
        await writeJson(FILE, { experiences: refs, heading: heading.eyebrow || heading.title || heading.subtitle ? heading : undefined });
        return { ok: true as const };
    });
}

export async function isExperience(collection: string, slug: string) {
    return (await getHomeConfig()).experiences.some((r) => r.collection === collection && r.slug === slug);
}

/** "Definir como uma das 6 experiências" button inside each place. */
export async function toggleExperience(collection: string, slug: string, on: boolean) {
    const cfg = await getHomeConfig();
    const rest = cfg.experiences.filter((r) => !(r.collection === collection && r.slug === slug));
    if (on && rest.length >= MAX_EXPERIENCES) {
        return { ok: false as const, error: `Já existem ${MAX_EXPERIENCES} experiências. Retire uma em Home antes de adicionar.` };
    }
    return saveHomeConfig({ experiences: on ? [...rest, { collection, slug }] : rest, heading: cfg.heading });
}

export type ExperienceCard = {
    key: string; collection: string; slug: string; headline: string; location: string; bestTime: string; tag: string;
    description: string; image?: string; color: string; emoji: string; icon: ExperienceIcon; href: string;
};

const BEST_TIME = /([ée]poca|quando|melhor)/i;
const defaultIcon = (collection: string): ExperienceIcon =>
    collection === "tourism-parks" ? "paw" : collection === "tourism-routes" ? "city" : collection.startsWith("history") ? "landmark" : "reef";

/** The cards the Home shows: registered content + the BackOffice overrides. Missing or hidden entries are skipped. */
export async function getExperienceCards(): Promise<ExperienceCard[]> {
    const cfg = await getHomeConfig();
    const out: ExperienceCard[] = [];
    for (const r of cfg.experiences) {
        const item = await getItem(r.collection, r.slug);
        if (!item || item.status === "draft") continue;
        const facts = "facts" in item ? (item as CatalogItem).facts ?? [] : [];
        out.push({
            key: `${r.collection}:${r.slug}`, collection: r.collection, slug: r.slug,
            headline: r.headline ?? titleOf(item),
            location: r.location ?? tagOf(item),
            bestTime: r.bestTime ?? facts.find((f) => BEST_TIME.test(f.label))?.value ?? "",
            tag: r.tag ?? categoriesOf(item)[0] ?? "",
            description: summaryOf(item),
            image: r.image ?? imagesOf(item)[0],
            color: colorOf(item), emoji: emojiOf(item), icon: r.icon ?? defaultIcon(r.collection),
            href: publicUrlOf(r.collection, r.slug),
        });
    }
    return out;
}

/** Published entries with "Mostrar na Home" on, per collection, for the collections of the given groups. */
export async function getHomeFlagged(groups: GroupId[], opts: { exclude?: string[] } = {}) {
    const out: { collection: (typeof COLLECTIONS)[number]; items: CatalogItem[] }[] = [];
    for (const def of COLLECTIONS.filter((c) => groups.includes(c.group) && c.kind === "catalog" && !opts.exclude?.includes(c.id))) {
        const items = (await getPublishedItems<CatalogItem>(def.id)).filter((i) => i.showOnHome);
        if (items.length) out.push({ collection: def, items });
    }
    return out;
}
