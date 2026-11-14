"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/cms/auth";
import { advanceOrder } from "@/lib/orders";
import { notifyCustomer } from "@/app/actions/order-actions";
import { statusLabel, type OrderStatus } from "@/lib/order-types";

const STATES: OrderStatus[] = ["processing", "ready", "done", "declined"];

/** The establishment owner moves an order forward: confirm receipt → ready/confirmed → done, or decline with a reason. */
export async function setOrderStatusAction(fd: FormData) {
    const s = await getSession();
    if (!s || s.role !== "owner") redirect("/admin/login");

    const to = STATES.find((x) => x === fd.get("to"));
    if (!to) redirect("/admin/meu-espaco/pedidos");
    const r = await advanceOrder(String(fd.get("id") ?? ""), to, s.ownerOf, String(fd.get("reason") ?? ""));

    if (r.ok && r.order.tier === "premium") {
        const label = statusLabel(to, r.order.kind);
        await notifyCustomer(
            r.order.memberId, `${r.order.place}: o seu pedido ${r.order.code} está “${label}”`,
            `O estado do seu pedido ${r.order.code} em ${r.order.place} mudou para: ${label}.${r.order.reason ? `\nMotivo: ${r.order.reason}` : ""}\n\nAcompanhe em Os meus pedidos.\nRiendzo`
        );
    }
    revalidatePath("/admin/meu-espaco/pedidos");
    revalidatePath("/conta/pedidos");
    redirect(r.ok ? "/admin/meu-espaco/pedidos" : `/admin/meu-espaco/pedidos?erro=${encodeURIComponent(r.error)}`);
}
