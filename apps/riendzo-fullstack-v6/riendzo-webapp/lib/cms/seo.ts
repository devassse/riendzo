import type { Metadata } from "next";
import { getCollection } from "./collections";
import { getItem, summaryOf, titleOf } from "./store";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Title, description, share image (a card in the colour of the place: /api/og/…) and the colour of the
 * browser bar for the page of an establishment. This is what WhatsApp, Facebook, etc. show when the link is shared.
 */
export async function establishmentMetadata(collection: string, slug: string): Promise<Metadata> {
    const item = await getItem(collection, slug);
    if (!item || ("status" in item && item.status === "draft")) return { title: "Riendzo" };
    const title = `${titleOf(item)} · ${getCollection(collection)?.label ?? "Riendzo"} · Riendzo`;
    const description = summaryOf(item).slice(0, 200);
    const image = `${SITE}/api/og/${collection}/${slug}`;
    return {
        title,
        description,
        openGraph: { title, description, type: "website", siteName: "Riendzo", images: [{ url: image, width: 1200, height: 630, alt: titleOf(item) }] },
        twitter: { card: "summary_large_image", title, description, images: [image] },
        other: { "theme-color": "color" in item ? item.color : "#0054b5" },
    };
}
