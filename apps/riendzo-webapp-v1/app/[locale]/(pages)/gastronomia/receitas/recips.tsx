import { getTranslations } from "next-intl/server";
import { getPublishedItems } from "@/lib/cms/store";
import RecipesGrid, {
    type Recipe,
    type RecipesGridLabels,
} from "./recipes-grid";
import { CATEGORIES, type Category } from "./recipe-categories";

export default async function ReceitasSection() {
    const t = await getTranslations("gastronomy.recipesSection");
    const recipes = await getPublishedItems<Recipe>("gastronomy-recipes");

    const labels: RecipesGridLabels = {
        ingredients: t("ingredients"),
        steps: t("steps"),
        tip: t("tip"),
        // raw templates, filled in on the client: "{count} ..."
        minutes: t.raw("minutes") as string,
        servings: t.raw("servings") as string,
        difficulty: {
            easy: t("difficulty.easy"),
            medium: t("difficulty.medium"),
            hard: t("difficulty.hard"),
        },
        categories: Object.fromEntries(
            CATEGORIES.map((c) => [c, t(`categories.${c}`)])
        ) as Record<Category, string>,
        all: t("all"),
        searchPlaceholder: t("search"),
        noResults: t("noResults"),
        // raw templates, filled in on the client: "{count} ..."
        results: t.raw("results") as string,
        page: t.raw("page") as string,
        prev: t("prev"),
        next: t("next"),
        close: t("close"),
        viewRecipe: t("viewRecipe"),
        photoSoon: t("photoSoon"),
    };

    return (
        <section id="receitas" className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">
                        {t("description")}
                    </p>
                </header>

                <RecipesGrid recipes={recipes} labels={labels} />
            </div>
        </section>
    );
}