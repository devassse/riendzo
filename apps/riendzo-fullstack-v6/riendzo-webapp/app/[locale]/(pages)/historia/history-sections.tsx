import { getTranslations } from "next-intl/server";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { publicUrlOf } from "@/lib/cms/collections";
import { getHistoryTheme } from "@/lib/cms/history-theme";
import { getPublishedItems } from "@/lib/cms/store";
import Ancient from "./antiga/ancient";
import MaisSobre from "./antiga/mais-sobre";
import Colonial from "./colonial/colonial";
import Independent, { type PanelTone } from "./moderna/independent";

/**
 * The four sections of the Cronologia page. Everything comes from the BackOffice:
 * the entries (História menus), the "Reinos e Impérios" switch and the poster colour of each entry,
 * and the background colour of each section (BackOffice > História).
 */
const TONES: PanelTone[] = ["black", "green", "red", "yellow"];
const first = (a: string[] | undefined) => a?.[0] ?? "";

export async function RealmsSection() {
    const [t, theme, items] = await Promise.all([getTranslations("History.sections.realms"), getHistoryTheme(), getPublishedItems<CatalogItem>("history-ancient")]);
    const realms = items.filter((i) => i.realm).map((i, n) => ({
        number: String(n + 1).padStart(2, "0"), title: i.title, href: publicUrlOf("history-ancient", i.slug),
        region: i.tag, description: i.summary, domain: first(i.meta) || first(i.categories),
    }));
    if (!realms.length) return null;
    return <MaisSobre realms={realms} bg={theme.realms} title={t("title")} subtitle={t("subtitle")} />;
}

export async function AncientSection() {
    const [t, theme, items] = await Promise.all([getTranslations("History.sections.ancient"), getHistoryTheme(), getPublishedItems<CatalogItem>("history-ancient")]);
    if (!items.length) return null;
    return (
        <Ancient
            bg={theme.ancient} title={t("title")} subtitle={t("subtitle")}
            data={items.map((i) => ({
                era: i.tag, title: i.title, href: publicUrlOf("history-ancient", i.slug), description: i.summary,
                detailTitle: i.tipLabel || undefined, detail: i.tip || undefined, tags: i.categories.slice(0, 3), image: i.images?.[0],
            }))}
        />
    );
}

export async function ColonialSection() {
    const [t, theme, items] = await Promise.all([getTranslations("History.sections.colonial"), getHistoryTheme(), getPublishedItems<CatalogItem>("history-colonial")]);
    if (!items.length) return null;
    return (
        <Colonial
            bg={theme.colonial} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} footer={t("footer")}
            data={items.map((i) => ({
                year: i.tag, title: i.title, href: publicUrlOf("history-colonial", i.slug), description: i.summary,
                noteTitle: i.tipLabel || undefined, note: i.tip || undefined, tags: i.categories.slice(0, 3), image: i.images?.[0],
            }))}
        />
    );
}

export async function IndependentSection() {
    const [t, theme, items] = await Promise.all([getTranslations("History.sections.independent"), getHistoryTheme(), getPublishedItems<CatalogItem>("history-modern")]);
    if (!items.length) return null;
    return (
        <Independent
            bg={theme.independent} title={t("title")} subtitle={t("subtitle")} footer={t("footer")}
            data={items.map((i, n) => ({
                year: i.tag, title: i.title, href: publicUrlOf("history-modern", i.slug), description: i.summary,
                tags: i.categories.slice(0, 3), image: i.images?.[0], bg: i.bgTone ?? TONES[n % TONES.length],
            }))}
        />
    );
}
