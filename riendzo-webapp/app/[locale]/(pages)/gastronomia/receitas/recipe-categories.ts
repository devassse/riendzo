/**
 * A recipe can have several categories, e.g. Matapa = curry + vegetables.
 *
 * Kept in a plain module (no "use client") so both the server component
 * and the client grid can import the real array.
 *
 * To add a new category: add it here and in the translations
 * (Gastronomy.recipesSection.categories.<key>).
 */
export const CATEGORIES = [
    "seafood",
    "meat",
    "curry",
    "vegetables",
    "sides",
    "snacks",
    "sauces",
    "desserts",
    "drinks",
] as const;

export type Category = (typeof CATEGORIES)[number];