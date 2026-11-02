import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import { NAV_SECTIONS } from "@/app/components/utils/riendzo-nav-data";
import SectionHero from "./section-hero";
import SectionHub from "./section-hub";
import CatalogSection from "./catalog-section";
import { SECTIONS, type SectionId } from "./section-config";
import type { CatalogItem } from "./catalog-types";
import { getPublishedItems } from "@/lib/cms/store";

/**
 * Full page for Turismo, Serviços Públicos, Entretenimento and Blog.
 *
 * - Without `pageKey`: the section's landing page (hero + submenu cards,
 *   plus anything passed as `children`).
 * - With `pageKey` and `items`: a submenu page (hero + searchable catalog).
 */
export default async function SectionPage({
    section,
    pageKey,
    items,
    children,
}: {
    section: SectionId;
    pageKey?: string;
    items?: CatalogItem[];
    children?: ReactNode;
}) {
    const config = SECTIONS[section];
    const t = await getTranslations(config.ns);

    if (pageKey) {
        const page = config.pages.find((p) => p.key === pageKey);
        if (!page) throw new Error(`Unknown page "${pageKey}" in section "${section}"`);

        return (
            <div className={pageStyles.page}>
                <RiendzoNavbar />
                <SectionHero
                    section={section}
                    currentHref={`${config.basePath}/${page.slug}`}
                />
                <main>
                    <CatalogSection
                        id={page.slug}
                        title={t(`pages.${pageKey}.title`)}
                        description={t(`pages.${pageKey}.description`)}
                        items={items ?? (await getPublishedItems<CatalogItem>(page.collection))}
                        collectionId={page.collection}
                    />
                    {children}
                </main>
                <RiendzoFooter />
            </div>
        );
    }

    const navLinks = NAV_SECTIONS.find((s) => s.id === config.navId)?.links ?? [];

    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <SectionHero section={section} />
            <main>
                <SectionHub
                    title={t("hub.title")}
                    description={t("hub.description")}
                    cta={t("hub.cta")}
                    cards={config.pages.map((page, i) => ({
                        icon: navLinks[i]?.icon,
                        label: t(`pages.${page.key}.label`),
                        title: t(`pages.${page.key}.title`),
                        description: t(`pages.${page.key}.description`),
                        href: `${config.basePath}/${page.slug}`,
                        color: page.color,
                    }))}
                >
                    {children}
                </SectionHub>
            </main>
            <RiendzoFooter />
        </div>
    );
}
