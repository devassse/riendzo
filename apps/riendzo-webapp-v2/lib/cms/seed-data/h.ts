import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Paragraphs -> HTML (seed content for the rich-text field). */
export const html = (...paras: string[]) => paras.map((p) => `<p>${p}</p>`).join("");

type Base = Pick<CatalogItem, "slug" | "title" | "tag" | "categories" | "color" | "emoji" | "summary"> & Partial<CatalogItem>;
export const entry = (b: Base): CatalogItem => b;

/** Chronological hours helper: same schedule on several days. */
export const week = (ranges: [string, string][], days: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[]) =>
    Object.fromEntries(days.map((d) => [d, ranges.map(([open, close]) => ({ open, close }))]));
export const ALL = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
