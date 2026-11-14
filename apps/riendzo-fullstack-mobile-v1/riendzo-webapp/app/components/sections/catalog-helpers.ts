import type { CatalogItem } from "./catalog-types";

/**
 * Builds a blog-style catalog item: short reading-time meta, author fact and
 * the body as text paragraphs. Used by the four Blog pages.
 */
export function article(a: {
    slug: string;
    title: string;
    tag: string;
    categories: string[];
    color: string;
    emoji: string;
    summary: string;
    minutes: number;
    author?: string;
    body: string[];
    takeaway?: string;
    keywords?: string[];
    image?: string;
}): CatalogItem {
    return {
        slug: a.slug,
        title: a.title,
        tag: a.tag,
        categories: a.categories,
        color: a.color,
        emoji: a.emoji,
        summary: a.summary,
        meta: [`${a.minutes} min de leitura`],
        facts: [{ label: "Autoria", value: a.author ?? "Redação Riendzo" }],
        blocks: [{ kind: "text", items: a.body }],
        tip: a.takeaway,
        tipLabel: a.takeaway ? "Em resumo" : undefined,
        keywords: a.keywords,
        images: a.image ? [a.image] : undefined,
    };
}
