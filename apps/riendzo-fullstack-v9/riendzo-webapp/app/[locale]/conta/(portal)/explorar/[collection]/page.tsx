import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import CatalogSection from "@/app/components/sections/catalog-section";
import ArtistsDirectory from "@/app/components/music/artists-directory";
import AlbumsExplorer from "@/app/components/music/albums-explorer";
import RecipesGrid, { type Recipe, type RecipesGridLabels } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Artist } from "@/lib/cms/artist-types";
import { getCollection } from "@/lib/cms/collections";
import { getList } from "@/lib/cms/lists";
import { getPublishedItems } from "@/lib/cms/store";

/** Same white card, centred title, description and search on every menu (catalog, recipes, artists, discographies). */
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="px-6 py-10 sm:py-14">
            <header className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">{title}</h2>
                <p className="mt-4 text-base leading-relaxed text-[#5b6478]">{description}</p>
            </header>
            {children}
        </div>
    );
}

async function recipeLabels(ns: string): Promise<RecipesGridLabels> {
    const t = await getTranslations(ns);
    const categoryList = await getList("recipe-categories");
    return {
        ingredients: t("ingredients"), steps: t("steps"), tip: t("tip"),
        minutes: t.raw("minutes") as string, servings: t.raw("servings") as string,
        difficulty: { easy: t("difficulty.easy"), medium: t("difficulty.medium"), hard: t("difficulty.hard") },
        categories: Object.fromEntries(categoryList.map((i) => [i.value, i.label])),
        all: t("all"), searchPlaceholder: t("search"), noResults: t("noResults"),
        results: t.raw("results") as string, page: t.raw("page") as string,
        prev: t("prev"), next: t("next"), close: t("close"), viewRecipe: t("viewRecipe"), photoSoon: t("photoSoon"),
    };
}

/** View-only browsing of any menu, inside the member portal. */
export default async function Explore({ params }: { params: Promise<{ collection: string }> }) {
    const { collection } = await params;
    await requireMember(`/conta/explorar/${collection}`);

    // Discographies are built from the artists' albums (there is no collection of its own)
    if (collection === "discografias") {
        const [artists, genres] = await Promise.all([getPublishedItems<Artist>("music-artists"), getList("music-genres")]);
        const rows = artists.flatMap((a) => {
            const g = genres.find((x) => x.value === a.genre);
            return a.albums.map((album) => ({ album, artistName: a.name, artistSlug: a.slug, color: g?.color ?? "#35be12", genre: a.genre, genreLabel: g?.label ?? a.genre }));
        }).sort((x, y) => (y.album.year ?? 0) - (x.album.year ?? 0));
        return (
            <Shell title="Discografias" publicPath="/musica/discografias">
                <Section title="Discografias" description="Todos os álbuns dos artistas moçambicanos. Clique numa capa para ver as faixas."><AlbumsExplorer rows={rows} /></Section>
            </Shell>
        );
    }

    const def = getCollection(collection);
    if (!def) notFound();

    return (
        <Shell title={def.label} publicPath={def.publicPath}>
            {def.kind === "catalog" && <CatalogSection id={def.id} title={def.label} description={def.description} items={await getPublishedItems<CatalogItem>(collection)} collectionId={collection} detailBase={def.directory ? `/conta/explorar/${def.id}` : undefined} />}
            {def.kind === "artist" && (
                <Section title={def.label} description={def.description}>
                    <ArtistsDirectory artists={await getPublishedItems<Artist>(collection)} genres={await getList("music-genres")} basePath={`/conta/explorar/${def.id}`} />
                </Section>
            )}
            {def.kind === "recipe" && (
                <Section title={def.label} description={def.description}>
                    <RecipesGrid recipes={await getPublishedItems<Recipe>(collection)} labels={await recipeLabels(collection === "gastronomy-drinks" ? "gastronomy.drinksSection" : "gastronomy.recipesSection")} />
                </Section>
            )}
        </Shell>
    );
}

function Shell({ title, publicPath, children }: { title: string; publicPath: string; children: React.ReactNode }) {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-baloo text-3xl font-bold">{title}</h1>
                <Link href={publicPath} className="rounded-full border border-[#0b1220]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#eef2f8]">Abrir no site ↗</Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">{children}</div>
        </div>
    );
}
