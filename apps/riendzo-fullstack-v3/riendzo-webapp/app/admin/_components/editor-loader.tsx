import { getCollection } from "@/lib/cms/collections";
import { getCollectionOptions, getList } from "@/lib/cms/lists";
import { getItems, getItem } from "@/lib/cms/store";
import { isExperience, MAX_EXPERIENCES } from "@/lib/cms/home";
import { qrPage } from "@/lib/cms/paths";
import type { Artist } from "@/lib/cms/artist-types";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import ItemEditor from "./item-editor";
import ArtistEditor from "./artist-editor";

/** Loads the lists the editor needs and renders the right editor for the collection kind. */
export default async function EditorFor({ collectionId, slug, mode, backHref }: { collectionId: string; slug: string | null; mode: "admin" | "owner"; backHref: string }) {
    const def = getCollection(collectionId)!;
    const item = slug ? await getItem(collectionId, slug) : undefined;
    const publicHref = item && (def.directory || def.kind === "artist") ? `/pt${def.publicPath}/${item.slug}` : undefined;

    if (def.kind === "artist") {
        const [genres, provinces] = await Promise.all([getList("music-genres"), getList("provinces")]);
        return <ArtistEditor originalSlug={slug} initial={(item as Artist) ?? null} genres={genres} provinces={provinces} backHref={backHref} publicHref={publicHref} />;
    }

    const isRecipe = def.kind === "recipe";
    const [opts, provinces, recipeCats, creators] = await Promise.all([
        getCollectionOptions(collectionId),
        getList("provinces"),
        isRecipe ? getList("recipe-categories") : Promise.resolve([]),
        getItems<CatalogItem>("blog-creators"),
    ]);

    return (
        <ItemEditor
            collectionId={collectionId} kind={isRecipe ? "recipe" : "catalog"} originalSlug={slug} initial={(item as CatalogItem | Recipe) ?? null}
            tags={isRecipe ? provinces : opts.tags} categories={isRecipe ? recipeCats : opts.categories}
            creators={creators.map((c) => c.title)} defaultColor={def.color} singular={def.singular}
            tagLabel={isRecipe ? "Região" : def.tagLabel ?? "Etiqueta"} contact={Boolean(def.contact)} featured={Boolean(def.featured)}
            directory={Boolean(def.directory)} offers={def.offers} mode={mode} backHref={backHref}
            publicHref={publicHref} qrHref={item && def.directory ? qrPage(collectionId, item.slug) : undefined}
            history={{ realm: collectionId === "history-ancient", tone: collectionId === "history-modern" }}
            homeToggle={["history", "services", "entertainment"].includes(def.group)}
            experience={["tourism", "gastronomy", "entertainment", "history"].includes(def.group) && item ? { on: await isExperience(collectionId, item.slug), max: MAX_EXPERIENCES } : undefined}
        />
    );
}
