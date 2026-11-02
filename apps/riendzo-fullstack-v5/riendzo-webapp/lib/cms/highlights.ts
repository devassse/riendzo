/**
 * "Prato do dia", house recommendations and most requested items of an establishment.
 * They are marked on the offers (dishes, rooms, vehicles…). Client-safe (no server imports).
 */
import type { OfferGroup, OfferItem } from "@/app/components/sections/catalog-types";

export const HIGHLIGHTS = ["daily", "recommended", "popular"] as const;
export type Highlight = (typeof HIGHLIGHTS)[number];
export type HighlightLabels = { daily: string; recommended: string; popular: string; section: string };

/** What each kind is called, per type of establishment. */
export function highlightLabels(collectionId?: string): HighlightLabels {
    if (collectionId === "gastronomy-restaurants") return { daily: "Prato do dia", recommended: "Recomendação da casa", popular: "Mais pedido", section: "Destaques da casa" };
    if (collectionId === "tourism-lodging") return { daily: "Oferta do dia", recommended: "Recomendação da casa", popular: "Mais procurado", section: "Em destaque" };
    return { daily: "Oferta do dia", recommended: "Recomendado", popular: "Mais procurado", section: "Em destaque" };
}

/** Today's date in Maputo as YYYY-MM-DD. */
export const todayMaputo = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Africa/Maputo" }).format(new Date());

/** The daily highlight only counts until the date chosen by the establishment (so it never goes stale). */
export const isActive = (it: OfferItem, today: string) =>
    Boolean(it.highlight) && it.available !== false && (it.highlight !== "daily" || (it.until ? it.until >= today : false));

export type ActiveHighlight = { kind: Highlight; item: OfferItem; group: string };

/** Active highlights in display order: day, house, most requested. */
export function activeHighlights(offers: OfferGroup[] | undefined, today: string): ActiveHighlight[] {
    const all = (offers ?? []).flatMap((g) => g.items.filter((i) => isActive(i, today)).map((item) => ({ kind: item.highlight as Highlight, item, group: g.title })));
    return HIGHLIGHTS.flatMap((k) => all.filter((a) => a.kind === k));
}

export const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
