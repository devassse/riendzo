/**
 * Server-side validation / normalisation of everything coming from the editor.
 * The browser is never trusted: every field is trimmed, length-limited and
 * checked here before anything is stored.
 */
import type { CatalogBlock, CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import { RECIPE_CATEGORIES } from "./collections";

export type Errors = Record<string, string>;
export type Result<T> = { value?: T; errors: Errors };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
    Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];
const COLOR = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (text: string) =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

/** Only http(s) links and site-relative paths: blocks javascript: and data: URLs. */
export const isSafeUrl = (v: string) =>
    (/^https?:\/\/[^\s]+$/i.test(v) || (/^\/[^\s/]/.test(v) && !v.includes(".."))) && v.length <= 500;

const images = (v: unknown) => list(v, 12, 500).filter(isSafeUrl);
const status = (v: unknown): "published" | "draft" => (v === "draft" ? "draft" : "published");

export function normalizeCatalog(raw: unknown): Result<CatalogItem> {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const errors: Errors = {};

    const title = str(r.title, 160);
    const slug = str(r.slug, 80) || slugify(title);
    const tag = str(r.tag, 60);
    const summary = str(r.summary, 600);
    const categories = list(r.categories, 6, 40);
    const color = str(r.color, 7);
    const emoji = str(r.emoji, 8) || "✨";

    if (!title) errors.title = "Indique o título.";
    if (!SLUG.test(slug)) errors.slug = "Use só letras minúsculas, números e hífenes.";
    if (!tag) errors.tag = "Indique a etiqueta (ex.: província ou tipo).";
    if (!categories.length) errors.categories = "Adicione pelo menos uma categoria.";
    if (!summary) errors.summary = "Escreva um resumo.";
    if (!COLOR.test(color)) errors.color = "Escolha uma cor válida.";

    const facts = (Array.isArray(r.facts) ? r.facts : [])
        .map((f) => {
            const o = (f ?? {}) as Record<string, unknown>;
            return { label: str(o.label, 60), value: str(o.value, 300) };
        })
        .filter((f) => f.label && f.value)
        .slice(0, 10);

    const blocks: CatalogBlock[] = (Array.isArray(r.blocks) ? r.blocks : [])
        .map((b): CatalogBlock | null => {
            const o = (b ?? {}) as Record<string, unknown>;
            const kind = o.kind;
            const heading = str(o.heading, 100);
            const items = list(o.items, 40, 1500);
            if (!items.length) return null;
            if (kind === "text") return { kind, heading: heading || undefined, items };
            if (kind === "list" || kind === "steps" || kind === "tags") {
                return { kind, heading: heading || "Detalhes", items };
            }
            return null;
        })
        .filter((b): b is CatalogBlock => b !== null)
        .slice(0, 8);

    const linkRaw = (r.link ?? {}) as Record<string, unknown>;
    const linkHref = str(linkRaw.href, 500);
    const linkLabel = str(linkRaw.label, 80);
    let link: CatalogItem["link"];
    if (linkHref || linkLabel) {
        if (!isSafeUrl(linkHref)) errors.link = "O link deve começar por http:// ou https://.";
        else link = { label: linkLabel || "Saber mais", href: linkHref };
    }

    if (Object.keys(errors).length) return { errors };

    return {
        errors,
        value: {
            slug, title, tag, categories, color, emoji, summary,
            meta: list(r.meta, 3, 80),
            facts,
            blocks,
            tip: str(r.tip, 600) || undefined,
            tipLabel: str(r.tipLabel, 40) || undefined,
            link,
            keywords: list(r.keywords, 20, 40),
            images: images(r.images),
            status: status(r.status),
        },
    };
}

export function normalizeRecipe(raw: unknown): Result<Recipe> {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const errors: Errors = {};

    const name = str(r.name, 160);
    const slug = str(r.slug, 80) || slugify(name);
    const region = str(r.region, 60);
    const description = str(r.description, 600);
    const color = str(r.color, 7);
    const categories = list(r.categories, 6, 20).filter((c): c is Recipe["categories"][number] =>
        (RECIPE_CATEGORIES as readonly string[]).includes(c)
    );
    const ingredients = list(r.ingredients, 60, 200);
    const steps = list(r.steps, 40, 1000);
    const minutes = Math.round(Number(r.minutes));
    const servings = Math.round(Number(r.servings));
    const difficulty = r.difficulty === "medium" || r.difficulty === "hard" ? r.difficulty : "easy";

    if (!name) errors.name = "Indique o nome.";
    if (!SLUG.test(slug)) errors.slug = "Use só letras minúsculas, números e hífenes.";
    if (!region) errors.region = "Indique a região.";
    if (!categories.length) errors.categories = "Escolha pelo menos uma categoria.";
    if (!description) errors.description = "Escreva uma descrição.";
    if (!COLOR.test(color)) errors.color = "Escolha uma cor válida.";
    if (!(minutes > 0 && minutes <= 2000)) errors.minutes = "Tempo inválido.";
    if (!(servings > 0 && servings <= 200)) errors.servings = "Porções inválidas.";
    if (!ingredients.length) errors.ingredients = "Adicione os ingredientes.";
    if (!steps.length) errors.steps = "Adicione os passos.";

    if (Object.keys(errors).length) return { errors };

    return {
        errors,
        value: {
            slug, name, region, categories, color, minutes, servings, difficulty,
            description, ingredients, steps,
            tip: str(r.tip, 600) || undefined,
            images: images(r.images),
            status: status(r.status),
        },
    };
}
