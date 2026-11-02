import { getTranslations } from "next-intl/server";
import CatalogGrid from "./catalog-grid";
import type { CatalogItem, CatalogLabels } from "./catalog-types";
import { getMember } from "@/lib/members-auth";
import { getCollection } from "@/lib/cms/collections";

/**
 * White section with title, description and the searchable, paginated card grid.
 * UI labels come from the shared `catalog` namespace in the messages.
 */
export default async function CatalogSection({
    id, title, description, items, collectionId,
}: {
    id: string; title: string; description: string; items: CatalogItem[];
    /** BackOffice collection: enables favourites and "open page" for establishments */
    collectionId?: string;
}) {
    const t = await getTranslations("catalog");
    const member = collectionId ? await getMember() : null;
    const collection = collectionId ? getCollection(collectionId) : undefined;

    const labels: CatalogLabels = {
        all: t("all"), searchPlaceholder: t("search"), noResults: t("noResults"),
        results: t.raw("results") as string, page: t.raw("page") as string,
        prev: t("prev"), next: t("next"), close: t("close"), open: t("open"), photoSoon: t("photoSoon"), tip: t("tip"),
        categoriesAria: t("categoriesAria"), paginationAria: t("paginationAria"),
        contact: t("contact"), whatsapp: t("whatsapp"), call: t("call"), sendEmail: t("sendEmail"), website: t("website"),
        openMap: t("openMap"), videos: t("videos"), featured: t("featured"), gallery: t("gallery"),
        addFavorite: t("addFavorite"), removeFavorite: t("removeFavorite"), directions: t("directions"),
        openPage: t("openPage"), offersTitle: t("offersTitle"), unavailable: t("unavailable"),
        openNow: t("openNow"), closingSoon: t("closingSoon"), closed: t("closed"),
        opensAt: t.raw("opensAt") as string, open24h: t("open24h"),
    };

    const favorites = member?.favorites.map((f) => `${f.collection}:${f.slug}`);

    return (
        <section id={id} className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">{title}</h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">{description}</p>
                </header>
                <CatalogGrid
                    items={items} labels={labels} collectionId={collectionId}
                    detailBase={collection?.directory ? collection.publicPath : undefined}
                    favorites={favorites} memberLoggedIn={Boolean(member)}
                />
            </div>
        </section>
    );
}
