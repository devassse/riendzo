"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/app/actions/member-actions";
import { deletePlace, savePlace, withdrawPlace } from "@/lib/places";

/** `id`: the place was saved (as private) even though the suggestion failed. */
export type PlaceState = { error?: string; id?: string };

/** Save a place. intent = "submit" also suggests it to the team. */
export async function savePlaceAction(_: PlaceState, fd: FormData): Promise<PlaceState> {
    const m = await requireMember("/conta/locais");
    const id = String(fd.get("id") ?? "") || null;
    const suggest = fd.get("intent") === "submit";
    const r = await savePlace(m.id, id, {
        name: fd.get("name"), kind: fd.get("kind"), province: fd.get("province"), address: fd.get("address"),
        coords: fd.get("coords"), description: fd.get("description"), phone: fd.get("phone"), website: fd.get("website"),
        photos: fd.getAll("photos"), notes: fd.get("notes"),
    }, suggest);
    if (!r.ok) return { error: r.error, id: "id" in r ? r.id : undefined };
    revalidatePath("/", "layout");
    redirect(`/conta/locais/${r.id}?ok=${r.status === "pending" ? "sugerido" : "guardado"}`);
}

const idOf = (fd: FormData) => String(fd.get("id") ?? "");

export async function withdrawPlaceAction(fd: FormData) {
    const m = await requireMember("/conta/locais");
    await withdrawPlace(m.id, idOf(fd));
    revalidatePath("/", "layout");
    redirect(`/conta/locais/${idOf(fd)}?ok=retirado`);
}

export async function deletePlaceAction(fd: FormData) {
    const m = await requireMember("/conta/locais");
    await deletePlace(m.id, idOf(fd));
    revalidatePath("/", "layout");
    redirect("/conta/locais?ok=eliminado");
}
