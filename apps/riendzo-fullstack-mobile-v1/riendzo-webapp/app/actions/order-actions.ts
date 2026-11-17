"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMember } from "@/lib/members-auth";
import { isPremium, listMembers } from "@/lib/members";
import { getEnvProfile, listUsers, ownersOf } from "@/lib/cms/users";
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

    // Tell the establishment, or the Riendzo team when it has no owner account (best effort: the Pedidos pages also refresh by themselves)
    try {
        if (r.order.viaRiendzo) {
            const staff = [(await getEnvProfile()).email, ...(await listUsers()).filter((u) => u.role === "admin" && u.active && u.email).map((u) => u.email)];
            for (const to of [...new Set(staff.filter(Boolean) as string[])]) {
                await sendMail({ to, subject: `Pedido para encaminhar ${r.order.code} | ${r.order.place}`, text: `${r.order.place} ainda não tem conta na Riendzo.\nNovo pedido ${r.order.code} de ${r.order.customerName} (+${r.order.phone}).\n\nBackOffice > Administrador > Pedidos e reservas.\n\nRiendzo` });
            }
        } else {
            for (const o of await ownersOf(collection, slug)) {
                if (o.email) await sendMail({ to: o.email, subject: `Novo pedido ${r.order.code} | ${r.order.place}`, text: `Recebeu um novo pedido ${r.order.code} de ${r.order.customerName} (${r.order.phone}).\n\nAbra o seu portal: Pedidos.\n\nRiendzo` });
            }
        }
    } catch { /* never block the customer */ }

    revalidatePath("/conta/pedidos");
    revalidatePath("/admin/administrador/pedidos");
    redirect(`/conta/pedidos?novo=${encodeURIComponent(r.order.code.slice(1))}`);
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
