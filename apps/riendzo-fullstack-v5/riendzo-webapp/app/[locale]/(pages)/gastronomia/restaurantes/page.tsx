import pageStyles from "@/app/css/page.module.css";
import { getTranslations } from "next-intl/server";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import CatalogSection from "@/app/components/sections/catalog-section";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { getPublishedItems } from "@/lib/cms/store";
import GastroHero from "../gastro-hero";

export default async function Page() {
    const t = await getTranslations("gastronomy.restaurantsSection");
    const items = await getPublishedItems<CatalogItem>("gastronomy-restaurants");
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <GastroHero />
            <main>
                <CatalogSection id="restaurantes" title={t("title")} description={t("description")} items={items} collectionId="gastronomy-restaurants" />
            </main>
            <RiendzoFooter />
        </div>
    );
}
