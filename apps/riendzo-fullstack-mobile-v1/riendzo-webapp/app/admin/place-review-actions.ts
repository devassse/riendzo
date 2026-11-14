"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/auth";
import { getCollection, publicUrlOf } from "@/lib/cms/collections";
import { parseCoordinates, mapUrl } from "@/lib/cms/geo";
import { normalizeCatalog, slugify } from "@/lib/cms/validate";
import * as store from "@/lib/cms/store";
import { listMembers } from "@/lib/members";
import { sendMail } from "@/lib/mailer";
import { approvePlace, getSuggestion, rejectPlace } from "@/lib/places";
import { kindOf, PLACE_COLLECTIONS } from "@/lib/place-types";

export type ReviewState = { error?: string };

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const str = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Plain text with blank lines → paragraphs (the page body is sanitised HTML). */
const toHtml = (t: string) => t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

async function notifyMember(memberId: string, subject: string, text: string) {
    try {
        const m = (await listMembers()).find((x) => x.id === memberId);
        if (m?.email) await sendMail({ to: m.email, subject, text });
    } catch { /* the e-mail is a courtesy: never block the review */ }
}

/** Approve: the (adjusted) place is created as a published entry in the chosen menu. */
export async function approveSuggestionAction(_: ReviewState, fd: FormData): Promise<ReviewState> {
    const session = await requireAdmin();
    const id = str(fd.get("id"), 60);
    const place = await getSuggestion(id);
    if (!place || place.status !== "pending") return { error: "Esta sugestão já não está pendente." };

    const collectionId = str(fd.get("collection"), 60);
    const collection = getCollection(collectionId);
    if (!collection || !PLACE_COLLECTIONS.includes(collectionId)) return { error: "Escolha o menu onde o local será publicado." };

    // Categories: the ticked ones plus new ones typed by the reviewer
    const categories = [...new Set([...fd.getAll("categories").map((c) => str(c, 40)), ...str(fd.get("newCategories"), 200).split(",").map((c) => c.trim().slice(0, 40))].filter(Boolean))];

    const coordsRaw = str(fd.get("coords"), 600);
    const point = coordsRaw ? parseCoordinates(coordsRaw) : undefined;
    if (coordsRaw && !point) return { error: "Não percebi as coordenadas. Use “-25.9692, 32.5732” ou um link do Google Maps." };

    const title = str(fd.get("title"), 160);
    const province = str(fd.get("province"), 40);
    const photos = fd.getAll("photos").map((p) => str(p, 200)).filter((p) => place.photos.includes(p));

    const raw = {
        title, slug: slugify(str(fd.get("slug"), 120) || title),
        tag: province, provinces: province ? [province] : [],
        categories, color: collection.color, emoji: kindOf(place.kind).emoji,
        summary: str(fd.get("summary"), 600),
        body: toHtml(str(fd.get("description"), 4000)),
        location: point ? { lat: point.lat, lng: point.lng } : undefined,
        contact: {
            phone: str(fd.get("phone"), 30), website: str(fd.get("website"), 300), address: str(fd.get("address"), 200),
            mapUrl: point ? mapUrl(point) : "",
        },
        images: photos,
        status: "published",
    };

    const { value, errors } = normalizeCatalog(raw);
    if (!value) return { error: Object.values(errors).join(" ") || "Corrija os campos." };

    // The address must be free: add -2, -3… if another entry already uses it
    const base = value.slug;
    for (let n = 2; await store.getItem(collectionId, value.slug); n++) value.slug = `${base}-${n}`.slice(0, 85);

    const saved = await store.saveItem(collectionId, null, value);
    if (!saved.ok) return { error: saved.error };
    await store.logActivity({ user: session.user, action: "Criou", collection: collectionId, slug: value.slug, title: value.title });

    const note = str(fd.get("note"), 500);
    await approvePlace(id, { collection: collectionId, slug: value.slug }, note);
    await store.logActivity({ user: session.user, action: "Aprovou um local sugerido", title: value.title });

    await notifyMember(place.memberId, "O seu local foi publicado na Riendzo",
        `Boas notícias! O local “${value.title}” que sugeriu foi aprovado e já está disponível para todos.\n\n${SITE}/pt${publicUrlOf(collectionId, value.slug)}\n${note ? `\nNota da equipa: ${note}\n` : ""}\nObrigado por partilhar Moçambique connosco.\nRiendzo`);

    revalidatePath("/", "layout");
    redirect(`/admin/locais-sugeridos?estado=aprovado&ok=aprovado&ref=${encodeURIComponent(`${collectionId}/${value.slug}`)}`);
}

/** Reject, with the reason the member will see. */
export async function rejectSuggestionAction(_: ReviewState, fd: FormData): Promise<ReviewState> {
    const session = await requireAdmin();
    const id = str(fd.get("id"), 60);
    const reason = str(fd.get("reason"), 500);
    if (reason.length < 5) return { error: "Escreva o motivo para o membro perceber o que ajustar." };

    const place = await rejectPlace(id, reason);
    if (!place) return { error: "Esta sugestão já não está pendente." };
    await store.logActivity({ user: session.user, action: "Não aprovou um local sugerido", title: place.name });
    await notifyMember(place.memberId, "Sobre o local que sugeriu à Riendzo",
        `Obrigado por sugerir “${place.name}”. Desta vez não o conseguimos publicar.\n\nMotivo: ${reason}\n\nPode ajustar as informações na sua conta (Os meus locais) e sugeri-lo outra vez.\n\nRiendzo`);

    revalidatePath("/admin/locais-sugeridos");
    redirect("/admin/locais-sugeridos?estado=rejeitado&ok=rejeitado");
}
