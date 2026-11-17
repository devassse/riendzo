"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMember } from "@/lib/members-auth";
import { isPremium, listMembers, normalizePhone } from "@/lib/members";
import { ownersOf } from "@/lib/cms/users";
import { getItem } from "@/lib/cms/store";
import { sendSms } from "@/lib/sms";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { MODES } from "@/lib/order-types";
import { sendMail } from "@/lib/mailer";
import { cancelOrder, createOrder } from "@/lib/orders";
import { getCollection } from "@/lib/cms/collections";

export type OrderState = { error?: string };

/** Sends the order/reservation to the establishment. Premium: everything. Free: restaurants, limited. */
export async function placeOrderAction(_: OrderState, fd: FormData): Promise<OrderState> {
    const m = await getMember();
    if (!m) return { error: "Inicie sessão para fazer um pedido." };
    const collection = String(fd.get("collection") ?? "");
    const slug = String(fd.get("slug") ?? "");
    if (!getCollection(collection) || !/^[a-z0-9-]{1,100}$/.test(slug)) return { error: "Pedido inválido." };

    let lines: unknown = [];
    try { lines = JSON.parse(String(fd.get("lines") ?? "[]")); } catch { /* handled below */ }

    const premium = isPremium(m);
    const r = await createOrder(m, premium, {
        collection, slug, lines: Array.isArray(lines) ? lines : [],
        mode: fd.get("mode"), address: fd.get("address"), from: fd.get("from"), to: fd.get("to"),
        guests: fd.get("guests"), note: fd.get("note"), phone: fd.get("phone"),
    });
    if (!r.ok) return { error: r.error };

    // Tell the establishment (best effort: the Pedidos pages also refresh by themselves).
    // Premium (has an owner account): e-mail + the portal. Not Premium: the order goes to the phone and e-mail it registered with.
    try {
        const o = r.order;
        if (o.direct) {
            const c = ((await getItem(collection, slug)) as CatalogItem | undefined)?.contact;
            const items = o.lines.map((l) => `${l.qty > 1 ? `${l.qty}× ` : ""}${l.name}`).join(", ");
            const when = o.from ? ` | ${o.from}${o.to ? ` → ${o.to}` : ""}` : "";
            const mode = o.mode ? ` | ${MODES[o.mode]}${o.address ? `: ${o.address}` : ""}` : "";
            const detail = `${items}${mode}${when}${typeof o.total === "number" ? ` | Total ${o.total} ${o.currency}` : ""}${o.note ? ` | Nota: ${o.note}` : ""}`;
            if (c?.email) {
                await sendMail({ to: c.email, subject: `Novo pedido ${o.code} | ${o.place}`, text: `Recebeu um novo pedido pela Riendzo.\n\nPedido ${o.code}\nCliente: ${o.customerName}\nTelefone: +${o.phone}\n${detail.split(" | ").join("\n")}\n\nContacte o cliente para confirmar.\n\nRiendzo` });
            }
            const to = normalizePhone(c?.phone ?? c?.whatsapp ?? "");
            if (/^\d{9,15}$/.test(to)) await sendSms(to, `Riendzo: novo pedido ${o.code} de ${o.customerName} (+${o.phone}). ${detail}`.slice(0, 300));
        } else {
            for (const ow of await ownersOf(collection, slug)) {
                if (ow.email) await sendMail({ to: ow.email, subject: `Novo pedido ${o.code} | ${o.place}`, text: `Recebeu um novo pedido ${o.code} de ${o.customerName} (${o.phone}).\n\nAbra o seu portal: Pedidos.\n\nRiendzo` });
            }
        }
    } catch { /* never block the customer */ }

    revalidatePath("/conta/pedidos");
    revalidatePath("/admin/meu-espaco/pedidos");
    redirect(`/conta/pedidos?novo=${encodeURIComponent(r.order.code.slice(1))}${r.order.direct ? "&direto=1" : ""}`);
}

/** The customer withdraws an order the establishment has not received yet. */
export async function cancelOrderAction(fd: FormData) {
    const m = await getMember();
    if (!m) redirect("/conta/entrar?next=%2Fconta%2Fpedidos");
    await cancelOrder(m.id, String(fd.get("id") ?? ""));
    revalidatePath("/conta/pedidos");
    revalidatePath("/admin/meu-espaco/pedidos");
    redirect("/conta/pedidos");
}

/** Used by the owner action: tells a Premium customer that the order moved. */
export async function notifyCustomer(memberId: string, subject: string, text: string) {
    try {
        const c = (await listMembers()).find((x) => x.id === memberId);
        if (c?.email) await sendMail({ to: c.email, subject, text });
    } catch { /* courtesy only */ }
}
