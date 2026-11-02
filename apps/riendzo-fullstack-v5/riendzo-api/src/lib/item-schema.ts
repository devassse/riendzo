/**
 * Validation of the content sent by the BackOffice. The Next.js editors already
 * normalise everything (lib/cms/validate.ts); this is the API's own safety net, so
 * it also protects clients that call the API directly.
 */
import type { CollectionKind } from "@prisma/client";
import { z } from "zod";
import { sanitizeHtml } from "./sanitize";
import { COLOR, SLUG } from "./text";
import { badRequest } from "./errors";

export const isSafeUrl = (v: string) =>
    (/^https?:\/\/[^\s]+$/i.test(v) || (/^\/[^\s/]/.test(v) && !v.includes(".."))) && v.length <= 500;

const url = z.string().max(500).refine(isSafeUrl, "Endereço inválido (use http(s) ou um caminho do site).");
const text = (max: number) => z.string().trim().max(max);

const common = {
    slug: z.string().trim().max(80).regex(SLUG, "Use só letras minúsculas, números e hífenes."),
    status: z.enum(["published", "draft"]).default("published"),
    color: z.string().regex(COLOR, "Cor inválida.").optional(),
    body: z.string().max(120_000).optional(),
    images: z.array(url).max(24).optional(),
    keywords: z.array(text(40)).max(20).optional(),
    videos: z.array(z.object({ title: text(160), url: z.string().max(300), creator: text(80).optional() }).passthrough()).max(12).optional(),
};

const catalog = z
    .object({
        ...common,
        color: z.string().regex(COLOR, "Cor inválida."),
        title: text(160).min(1, "Indique o título."),
        tag: text(80).default(""),
        categories: z.array(text(80).min(1)).max(20).default([]),
        emoji: text(16).default(""),
        summary: text(600).min(1, "Escreva um resumo."),
        featured: z.boolean().optional(),
        /** establishments present in several provinces (tag shows them joined) */
        provinces: z.array(text(40)).max(12).optional(),
        /** posts of guides and creators */
        posts: z.array(z.object({ id: text(40), title: text(120).min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), text: text(3000).optional(), images: z.array(url).max(12).optional(), videos: z.array(z.object({ title: text(160), url: z.string().max(300) }).passthrough()).max(6).optional() }).passthrough()).max(100).optional(),
        /** Home page (Breve História, Serviços, Emergências, Entretenimento) */
        showOnHome: z.boolean().optional(),
        realm: z.boolean().optional(),
        bgTone: z.enum(["black", "green", "red", "yellow"]).optional(),
        tip: text(600).optional(),
    })
    .passthrough();

const recipe = z
    .object({
        ...common,
        color: z.string().regex(COLOR, "Cor inválida."),
        name: text(160).min(1, "Indique o nome."),
        region: text(60).min(1, "Escolha a região."),
        categories: z.array(text(40).min(1)).min(1, "Escolha pelo menos uma categoria.").max(6),
        minutes: z.number().int().min(1).max(2000),
        servings: z.number().int().min(1).max(200),
        difficulty: z.enum(["easy", "medium", "hard"]),
        description: text(600).min(1, "Escreva uma descrição."),
        ingredients: z.array(text(200).min(1)).min(1, "Adicione os ingredientes.").max(60),
        steps: z.array(text(1000).min(1)).min(1, "Adicione os passos.").max(40),
    })
    .passthrough();

const artist = z
    .object({
        ...common,
        name: text(120).min(1, "Indique o nome artístico."),
        genre: text(40).min(1, "Escolha o estilo musical.").optional(),
        /** several styles allowed; `genre` is the main one */
        genres: z.array(text(40).min(1)).max(6).optional(),
        summary: text(500).min(1, "Escreva um resumo curto."),
        photo: url.optional(),
        cover: url.optional(),
        origin: text(60).optional(),
        albums: z.array(z.object({ slug: z.string().optional(), title: text(160), tracks: z.array(z.object({ title: text(160) }).passthrough()).max(80) }).passthrough()).max(40).default([]),
        photoAlbums: z.array(z.object({ title: text(120), images: z.array(z.object({ src: url }).passthrough()).max(60) }).passthrough()).max(12).default([]),
        featuredWeek: z.boolean().optional(),
    })
    .passthrough();

const SCHEMAS = { catalog, recipe, artist } as const;

/** Keys that live in their own columns (not inside `data`). */
const RESERVED = ["slug", "status", "featured", "featuredWeek", "updatedAt", "createdAt", "id"];

export type PreparedItem = {
    slug: string;
    status: "published" | "draft";
    featured: boolean;
    featuredWeek: boolean;
    data: Record<string, unknown>;
};

export function prepareItem(kind: CollectionKind, input: unknown, allowFeatured: boolean): PreparedItem {
    const parsed = SCHEMAS[kind].parse(input) as Record<string, unknown>;
    const data: Record<string, unknown> = { ...parsed };
    for (const k of RESERVED) delete data[k];

    if (typeof data.body === "string") {
        const clean = sanitizeHtml(data.body);
        if (clean) data.body = clean;
        else delete data.body;
    }
    // drop empty optionals so the JSON stays tidy
    for (const [k, v] of Object.entries(data)) if (v === undefined || v === null || v === "") delete data[k];

    if (JSON.stringify(data).length > 600_000) throw badRequest("Conteúdo demasiado grande.");

    return {
        slug: parsed.slug as string,
        status: parsed.status as "published" | "draft",
        featured: allowFeatured && parsed.featured === true,
        featuredWeek: kind === "artist" && parsed.featuredWeek === true,
        data,
    };
}
