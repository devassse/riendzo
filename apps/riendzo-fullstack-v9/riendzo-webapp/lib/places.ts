/**
 * Member places ("Os meus locais") — server only. Stored in data/members/places.json.
 *
 *   private  → only the member sees it
 *   pending  → suggested to the platform team ("Locais sugeridos" in the BackOffice)
 *   approved → reviewed, adjusted and published in a menu (published = where)
 *   rejected → not published (reviewNote says why); the member can fix it and suggest again
 */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";
import { parseCoordinates, validPoint } from "@/lib/cms/geo";
import { isSafeUrl } from "@/lib/cms/validate";
import {
    MAX_PHOTOS, MAX_PLACES, PLACE_KINDS, PLACE_PHOTO_RE, type MemberPlace, type PlaceKindId, type PlaceStatus,
} from "@/lib/place-types";

const FILE = path.join(DATA_DIR, "members", "places.json");
const read = async () => (await readJson<MemberPlace[]>(FILE)) ?? [];

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type PlaceInput = {
    name: unknown; kind: unknown; province: unknown; address: unknown; coords: unknown;
    description: unknown; phone: unknown; website: unknown; photos: unknown; notes: unknown;
};
type Fail = { ok: false; error: string };

/** What a place needs before it can be suggested to the team. */
export function submitProblem(p: Pick<MemberPlace, "name" | "province" | "address" | "location" | "description">): string | null {
    if (!p.name) return "Indique o nome do local.";
    if (!p.province) return "Escolha a província para sugerir o local.";
    if (!p.location && !p.address) return "Indique o endereço ou as coordenadas para sugerir o local.";
    if ((p.description ?? "").length < 20) return "Escreva uma descrição (pelo menos 20 caracteres) para sugerir o local.";
    return null;
}

/** Validates what came from the form. Nothing from the browser is trusted. */
function clean(i: PlaceInput): { ok: true; v: Omit<MemberPlace, "id" | "memberId" | "status" | "createdAt" | "updatedAt"> } | Fail {
    const name = str(i.name, 100);
    if (!name) return { ok: false, error: "Indique o nome do local." };
    const kind = PLACE_KINDS.find((k) => k.id === i.kind)?.id as PlaceKindId | undefined;
    if (!kind) return { ok: false, error: "Escolha o tipo de local." };

    const coordsRaw = str(i.coords, 600);
    let location: MemberPlace["location"];
    if (coordsRaw) {
        const p = parseCoordinates(coordsRaw);
        if (!p || !validPoint(p)) return { ok: false, error: "Não percebi as coordenadas. Cole “-25.9692, 32.5732” ou um link do Google Maps." };
        location = { lat: Math.round(p.lat * 1e6) / 1e6, lng: Math.round(p.lng * 1e6) / 1e6 };
    }

    const phone = str(i.phone, 30);
    if (phone && !/^[+0-9 ()-]{6,30}$/.test(phone)) return { ok: false, error: "Telefone inválido." };
    const website = str(i.website, 300);
    if (website && (!/^https?:\/\//i.test(website) || !isSafeUrl(website))) return { ok: false, error: "O site deve começar por http:// ou https://." };

    const photos = (Array.isArray(i.photos) ? i.photos : []).map((x) => str(x, 200)).filter((x) => PLACE_PHOTO_RE.test(x)).slice(0, MAX_PHOTOS);

    return {
        ok: true,
        v: {
            name, kind,
            province: str(i.province, 40) || undefined,
            address: str(i.address, 200) || undefined,
            location,
            description: str(i.description, 1500) || undefined,
            phone: phone || undefined,
            website: website || undefined,
            photos,
            notes: str(i.notes, 1000) || undefined,
        },
    };
}

/* --------------------------------- Member side --------------------------------- */

export async function listPlacesOf(memberId: string) {
    return (await read()).filter((p) => p.memberId === memberId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPlaceOf(memberId: string, id: string) {
    return (await read()).find((p) => p.id === id && p.memberId === memberId) ?? null;
}

/** Creates (id = null) or updates a place of the member. Pending and published places are locked. */
export function savePlace(memberId: string, id: string | null, input: PlaceInput, suggest: boolean) {
    return locked(async (): Promise<{ ok: true; id: string; status: PlaceStatus } | Fail> => {
        const c = clean(input);
        if (!c.ok) return c;
        const all = await read();
        const now = new Date().toISOString();
        let place = id ? all.find((p) => p.id === id && p.memberId === memberId) : undefined;

        if (id && !place) return { ok: false, error: "Local não encontrado." };
        if (place && (place.status === "pending" || place.status === "approved")) {
            return { ok: false, error: place.status === "pending" ? "Este local está em revisão. Retire a sugestão para o editar." : "Este local já foi publicado e não pode ser alterado." };
        }
        if (!place) {
            if (all.filter((p) => p.memberId === memberId).length >= MAX_PLACES) return { ok: false, error: `Chegou ao limite de ${MAX_PLACES} locais.` };
            place = { id: crypto.randomUUID(), memberId, ...c.v, status: "private", createdAt: now, updatedAt: now };
            all.push(place);
        } else {
            Object.assign(place, c.v, { updatedAt: now });
        }

        if (suggest) {
            const problem = submitProblem(place);
            if (problem) {
                await writeJson(FILE, all); // the edits are kept even if it cannot be suggested yet
                return { ok: false, error: problem };
            }
            place.status = "pending";
            place.submittedAt = now;
            place.reviewNote = undefined;
        } else if (place.status === "rejected") {
            place.status = "private"; // edited after a rejection: back to private until suggested again
        }
        await writeJson(FILE, all);
        return { ok: true, id: place.id, status: place.status };
    });
}

/** The member takes the suggestion back (only while it is waiting for review). */
export function withdrawPlace(memberId: string, id: string) {
    return locked(async () => {
        const all = await read();
        const p = all.find((x) => x.id === id && x.memberId === memberId);
        if (!p || p.status !== "pending") return false;
        p.status = "private";
        p.submittedAt = undefined;
        await writeJson(FILE, all);
        return true;
    });
}

/** Deletes the member's own copy. Not while it is in review. A published place stays published. */
export function deletePlace(memberId: string, id: string) {
    return locked(async () => {
        const all = await read();
        const p = all.find((x) => x.id === id && x.memberId === memberId);
        if (!p || p.status === "pending") return false;
        await writeJson(FILE, all.filter((x) => x !== p));
        return true;
    });
}

/* ------------------------------- Platform team side ------------------------------- */

export async function listSuggestions(status?: PlaceStatus) {
    const all = (await read()).filter((p) => p.status !== "private" && (!status || p.status === status));
    return all.sort((a, b) => (b.submittedAt ?? b.updatedAt).localeCompare(a.submittedAt ?? a.updatedAt));
}

export const countPending = async () => (await read()).filter((p) => p.status === "pending").length;

export async function getSuggestion(id: string) {
    const p = (await read()).find((x) => x.id === id);
    return p && p.status !== "private" ? p : null;
}

export function approvePlace(id: string, published: { collection: string; slug: string }, note?: string) {
    return locked(async () => {
        const all = await read();
        const p = all.find((x) => x.id === id);
        if (!p || p.status !== "pending") return null;
        p.status = "approved";
        p.published = published;
        p.reviewedAt = new Date().toISOString();
        p.reviewNote = note?.trim().slice(0, 500) || undefined;
        await writeJson(FILE, all);
        return p;
    });
}

export function rejectPlace(id: string, reason: string) {
    return locked(async () => {
        const all = await read();
        const p = all.find((x) => x.id === id);
        if (!p || p.status !== "pending") return null;
        p.status = "rejected";
        p.reviewedAt = new Date().toISOString();
        p.reviewNote = reason.trim().slice(0, 500);
        await writeJson(FILE, all);
        return p;
    });
}
