/**
 * Simple suggestions based on a member's interests and province.
 * (A placeholder until the AI engine arrives: same inputs, smarter ranking.)
 */
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { COLLECTIONS } from "@/lib/cms/collections";
import { categoriesOf, getPublishedItems, tagOf, titleOf } from "@/lib/cms/store";
import type { PublicMember } from "@/lib/members";

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export async function recommendFor(m: PublicMember, limit = 6) {
    const interests = m.interests.map(fold);
    if (!interests.length && !m.province) return [];
    const have = new Set(m.favorites.map((f) => `${f.collection}:${f.slug}`));
    const out: { collection: string; item: CatalogItem; score: number }[] = [];

    for (const c of COLLECTIONS) {
        if (c.kind !== "catalog") continue;
        for (const item of await getPublishedItems<CatalogItem>(c.id)) {
            if (have.has(`${c.id}:${item.slug}`)) continue;
            const hay = fold([titleOf(item), tagOf(item), categoriesOf(item).join(" "), (item.keywords ?? []).join(" ")].join(" "));
            let score = interests.reduce((n, i) => n + (hay.includes(i) ? 2 : 0), 0);
            if (m.province && [item.tag, ...(item.provinces ?? [])].some((t) => fold(t) === fold(m.province!))) score += 1;
            if (score > 0) out.push({ collection: c.id, item, score: score + (item.featured ? 1 : 0) });
        }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
