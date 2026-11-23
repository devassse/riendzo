import { getTranslations } from "next-intl/server";
import { getMember } from "@/lib/members-auth";
import type { RecipeFavorites } from "./recipes-grid";

/**
 * Server-side data for the heart on recipe cards (recipes, seafood, drinks).
 * Favourites are stored per member as `collection:slug`, the same as the catalog cards.
 */
export async function recipeFavorites(collectionId: string): Promise<{
    favorites: RecipeFavorites;
    labels: { addFavorite: string; removeFavorite: string };
}> {
    const [t, member] = await Promise.all([getTranslations("catalog"), getMember()]);
    return {
        favorites: {
            collectionId,
            keys: member?.favorites.map((f) => `${f.collection}:${f.slug}`) ?? [],
            loggedIn: Boolean(member),
        },
        labels: { addFavorite: t("addFavorite"), removeFavorite: t("removeFavorite") },
    };
}
