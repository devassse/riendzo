/**
 * "Eliminar a minha conta" (server only). Required by the App Store and Google Play.
 *
 *  - Deleted: profile, favourites, avatar, the member's places (and their photos, unless a published page uses them),
 *    pending verification codes.
 *  - Kept without personal data: the order history of the establishments, the Premium payments and the donations
 *    (accounting): name and phone are removed.
 *  - Not allowed while an order is in progress.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/cms/store";
import { checkMemberPassword, getMemberById, removeMember } from "@/lib/members";
import { activeCountOf, anonymizeOrdersOf } from "@/lib/orders";
import { purgePlacesOf } from "@/lib/places";
import { anonymizeSubPaymentsOf } from "@/lib/subscriptions";
import { unlinkDonationsOf } from "@/lib/donations";
import { dropCodes } from "@/lib/verification";

const MEDIA = /^\/api\/media\/(\d{4})\/((?:avatar|place)-[a-z0-9]+\.(?:jpg|png|webp))$/;

/** Deletes an uploaded file, only if the URL is exactly one of the member upload names. Never throws. */
async function removeUpload(url: string) {
    const m = MEDIA.exec(url);
    if (!m) return;
    try { await fs.unlink(path.join(UPLOADS_DIR, m[1], m[2])); } catch { /* already gone */ }
}

export async function deleteAccount(memberId: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!(await checkMemberPassword(memberId, password))) return { ok: false, error: "A palavra-passe não está correta." };
    if ((await activeCountOf(memberId)) > 0) return { ok: false, error: "Tem pedidos em curso. Aguarde que terminem ou cancele-os antes de eliminar a conta." };

    const member = await getMemberById(memberId);
    const photos = await purgePlacesOf(memberId);
    await anonymizeOrdersOf(memberId);
    await anonymizeSubPaymentsOf(memberId);
    await unlinkDonationsOf(memberId);
    await dropCodes(memberId);
    for (const url of [...photos, ...(member?.avatar ? [member.avatar] : [])]) await removeUpload(url);

    if (!(await removeMember(memberId))) return { ok: false, error: "Conta não encontrada." };
    return { ok: true };
}
