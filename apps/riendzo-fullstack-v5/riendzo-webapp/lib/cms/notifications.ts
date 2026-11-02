/**
 * Notifications = recent records created in the BackOffice (new restaurant, beach, place…).
 * Built from the activity log, so nothing extra has to be stored.
 * Staff see everything (and can open it in the BackOffice); members only see what is published.
 */
import { getCollection, getGroup, portalUrlOf } from "./collections";
import { getActivity, getItem, titleOf } from "./store";

export type Notice = {
    id: string;
    at: string;
    /** who registered it (only filled for staff) */
    by?: string;
    collection: string;
    slug: string;
    title: string;
    /** "Novo restaurante" */
    label: string;
    emoji: string;
    /** link without locale */
    href: string;
};

const DAYS = 30;

export async function recentNotices(audience: "staff" | "member", limit = 8): Promise<Notice[]> {
    const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;
    const seen = new Set<string>();
    const out: Notice[] = [];

    for (const a of await getActivity()) {
        if (out.length >= limit) break;
        if (a.action !== "Criou" || !a.collection || !a.slug) continue;
        if (new Date(a.at).getTime() < since) continue;
        const key = `${a.collection}:${a.slug}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const def = getCollection(a.collection);
        if (!def) continue;
        const item = await getItem(a.collection, a.slug);
        if (!item) continue; // deleted meanwhile
        if (audience === "member" && "status" in item && item.status === "draft") continue;

        out.push({
            id: `${a.at}-${key}`, at: a.at, by: audience === "staff" ? a.user : undefined,
            collection: a.collection, slug: a.slug, title: titleOf(item) || a.title || a.slug,
            label: `Novo ${def.singular}`, emoji: getGroup(def.group).emoji,
            href: audience === "staff" ? `/admin/c/${a.collection}/${a.slug}` : portalUrlOf(a.collection, a.slug),
        });
    }
    return out;
}
