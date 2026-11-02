import { getTranslations } from "next-intl/server";
import CatalogGrid from "./catalog-grid";
import type { CatalogItem, CatalogLabels } from "./catalog-types";

/**
 * White section with title, description and the searchable card grid.
 * Same structure as the Receitas Tradicionais section.
 * UI labels come from the shared `catalog` namespace in the messages.
 */
export default async function CatalogSection({
    id,
    title,
    description,
    items,
}: {
    id: string;
    title: string;
    description: string;
    items: CatalogItem[];
}) {
    const t = await getTranslations("catalog");

    const labels: CatalogLabels = {
        all: t("all"),
        searchPlaceholder: t("search"),
        noResults: t("noResults"),
        // raw templates, filled in on the client: "{count} ..."
        results: t.raw("results") as string,
        page: t.raw("page") as string,
        prev: t("prev"),
        next: t("next"),
        close: t("close"),
        open: t("open"),
        photoSoon: t("photoSoon"),
        tip: t("tip"),
        categoriesAria: t("categoriesAria"),
        paginationAria: t("paginationAria"),
    };

    return (
        <section id={id} className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">
                        {title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">
                        {description}
                    </p>
                </header>

                <CatalogGrid items={items} labels={labels} />
            </div>
        </section>
    );
}
