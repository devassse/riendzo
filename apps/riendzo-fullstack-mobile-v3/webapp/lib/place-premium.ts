/**
 * Premium of an establishment (server only): data/places-premium/premium.json = { "collection/slug": ISO end date }.
 * Same idea as the member's Premium: an owner subscribes (M-Pesa) and the months are added to the end date.
 * Premium establishments answer their orders in the owner portal (with live progress for the customer);
 * the others receive the order on the phone / e-mail they registered with.
 */
import path from "node:path";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";

const FILE = path.join(DATA_DIR, "places-premium", "premium.json");
const read = async () => (await readJson<Record<string, string>>(FILE)) ?? {};
const keyOf = (collection: string, slug: string) => `${collection}/${slug}`;
const active = (until?: string) => Boolean(until && new Date(until).getTime() > Date.now());

/** Every establishment with a Premium record (active or expired): { "collection/slug": end date }. */
export const allPlacePremium = read;
export const placePremiumUntil = async (collection: string, slug: string) => (await read())[keyOf(collection, slug)];
export const isPlacePremium = async (collection: string, slug: string) => active(await placePremiumUntil(collection, slug));

/** Which of these establishments are Premium right now. */
export async function premiumPlacesOf<T extends { collection: string; slug: string }>(refs: T[]) {
    const all = await read();
    return refs.filter((r) => active(all[keyOf(r.collection, r.slug)]));
}

/** +N months (added to the current end date while still active); 0 = remove. Returns the new end date. */
export function setPlacePremium(collection: string, slug: string, months: number) {
    return locked(async () => {
        const all = await read();
        const k = keyOf(collection, slug);
        if (months <= 0) {
            delete all[k];
            await writeJson(FILE, all);
            return null;
        }
        const base = active(all[k]) ? new Date(all[k]) : new Date();
        base.setMonth(base.getMonth() + months);
        all[k] = base.toISOString();
        await writeJson(FILE, all);
        return all[k];
    });
}
