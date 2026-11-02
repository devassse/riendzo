import SectionPage from "@/app/components/sections/section-page";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { getPublishedItems } from "@/lib/cms/store";

// Content is managed in the BackOffice (/admin); the seed lives next to this file.
export default async function Page() {
    const items = await getPublishedItems<CatalogItem>("entertainment-games");
    return <SectionPage section="entertainment" pageKey="games" items={items} />;
}
