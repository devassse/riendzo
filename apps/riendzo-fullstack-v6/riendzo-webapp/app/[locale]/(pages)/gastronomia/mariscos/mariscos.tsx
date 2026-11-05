import { getTranslations } from "next-intl/server";
import { getPublishedItems } from "@/lib/cms/store";
import { getList } from "@/lib/cms/lists";
import RecipesGrid, { type Recipe, type RecipesGridLabels } from "../receitas/recipes-grid";

export default async function MariscosSection() {
    const t = await getTranslations("gastronomy.mariscosSection");
    // search, categories and pagination texts are shared with the other recipe pages
    const c = await getTranslations("gastronomy.drinksSection");
    const categoryList = await getList("recipe-categories");
    const recipes = await getPublishedItems<Recipe>("gastronomy-seafood");

    const labels: RecipesGridLabels = {
        ingredients: t("ingredients"),
        steps: t("steps"),
        tip: t("tip"),
        // raw templates, filled in on the client: "{count} ..."
        minutes: t.raw("minutes") as string,
        servings: t.raw("servings") as string,
        difficulty: { easy: t("difficulty.easy"), medium: t("difficulty.medium"), hard: t("difficulty.hard") },
        // managed in the BackOffice: Administrador > Dados genéricos
        categories: Object.fromEntries(categoryList.map((i) => [i.value, i.label])),
        all: c("all"),
        searchPlaceholder: c("search"),
        noResults: c("noResults"),
        results: c.raw("results") as string,
        page: c.raw("page") as string,
        prev: c("prev"),
        next: c("next"),
        close: t("close"),
        viewRecipe: t("viewRecipe"),
        photoSoon: t("photoSoon"),
    };

    return (
        <section id="mariscos" className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">{t("title")}</h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">{t("description")}</p>
                </header>

                <RecipesGrid recipes={recipes} labels={labels} />
            </div>
        </section>
    );
}
