import type { CollectionKind } from "@prisma/client";
import { fold } from "./text";

const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Columns used for filtering / searching, derived from the content itself. */
export function columnsOf(kind: CollectionKind, slug: string, d: Record<string, unknown>) {
    const title = s(kind === "catalog" ? d.title : d.name);
    const tag = kind === "catalog" ? s(d.tag) : kind === "recipe" ? s(d.region) : s(d.origin);
    const categories = kind === "artist" ? [s(d.genre)].filter(Boolean) : arr(d.categories);
    const summary = kind === "recipe" ? s(d.description) : s(d.summary);
    const keywords = arr(d.keywords);
    const searchText = fold([title, slug, tag, categories.join(" "), summary, keywords.join(" ")].join(" "));
    return { title, tag, categories, summary, keywords, searchText };
}
