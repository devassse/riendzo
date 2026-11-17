/** Orders store (server only): data/orders/orders.json. Prices always come from the establishment page, never from the browser. */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, getItem, locked, readJson, writeJson } from "@/lib/cms/store";
import { ownersOf } from "@/lib/cms/users";
import { isPlacePremium } from "@/lib/place-premium";
import { normalizePhone, type PublicMember } from "@/lib/members";
import { todayMaputo } from "@/lib/cms/highlights";
import type { CatalogItem, OfferItem } from "@/app/components/sections/catalog-types";
import {
    ACTIVE, FREE_ORDER_LIMIT, NEXT, ORDER_KINDS, type Order, type OrderLine, type OrderMode, type OrderStatus,
} from "@/lib/order-types";

const FILE = path.join(DATA_DIR, "orders", "orders.json");
const read = async () => (await readJson<Order[]>(FILE)) ?? [];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

type Fail = { ok: false; error: string };

export type OrderInput = {
    collection: string; slug: string;
    lines: { group?: unknown; name?: unknown; qty?: unknown }[];
    mode?: unknown; address?: unknown; from?: unknown; to?: unknown; guests?: unknown; note?: unknown; phone?: unknown;
};

/** Premium establishment (active subscription) with an owner account to answer in the portal. Anyone else gets the order on their registered phone / e-mail. */
export const canReceiveOrders = async (collection: string, slug: string) =>
    (await isPlacePremium(collection, slug)) && (await ownersOf(collection, slug)).length > 0;

export const freeOrdersUsed = async (memberId: string) =>
    (await read()).filter((o) => o.memberId === memberId && o.tier === "free" && o.status !== "declined").length;

export async function createOrder(member: PublicMember, premium: boolean, i: OrderInput) {
    const kind = ORDER_KINDS[i.collection];
    if (!kind) return { ok: false, error: "Este estabelecimento não aceita pedidos." } satisfies Fail;
    if (!premium && kind !== "food") return { ok: false, error: "As reservas de alojamento, viaturas e passeios são para membros Premium." } satisfies Fail;

    const item = (await getItem(i.collection, i.slug)) as CatalogItem | undefined;
    if (!item || item.status === "draft") return { ok: false, error: "Estabelecimento não encontrado." } satisfies Fail;
    // Without an owner account (not Premium) the order is sent to the phone / e-mail the establishment registered with; it has no portal to answer in
    const direct = !(await canReceiveOrders(i.collection, i.slug));

    // The lines must exist in the menu / rooms / vehicles; the price is read from there
    const find = (group: string, name: string): { item: OfferItem; group: string } | null => {
        for (const g of item.offers ?? []) {
            if (group && g.title !== group) continue;
            const it = g.items.find((x) => x.name === name);
            if (it) return { item: it, group: g.title };
        }
        return null;
    };
    const lines: OrderLine[] = [];
    for (const raw of (Array.isArray(i.lines) ? i.lines : []).slice(0, 30)) {
        const qty = Math.round(Number(raw.qty));
        if (!(qty >= 1)) continue;
        const f = find(str(raw.group, 100), str(raw.name, 160));
        if (!f) return { ok: false, error: "Um dos itens já não existe no menu. Atualize a página." } satisfies Fail;
        if (f.item.available === false) return { ok: false, error: `“${f.item.name}” está indisponível.` } satisfies Fail;
        lines.push({ name: f.item.name, group: f.group, qty: Math.min(qty, kind === "food" ? 20 : 1), price: f.item.price, priceNote: f.item.priceNote });
    }
    if (!lines.length) return { ok: false, error: kind === "food" ? "Escolha pelo menos um prato." : "Escolha uma opção." } satisfies Fail;
    if (kind !== "food" && lines.length !== 1) return { ok: false, error: "Escolha apenas uma opção." } satisfies Fail;

    const phone = normalizePhone(str(i.phone, 30) || member.phone || "");
    if (!/^\d{9,15}$/.test(phone)) return { ok: false, error: "Indique um telefone de contacto válido (ex.: 84 123 4567)." } satisfies Fail;
    if (!premium && !str(i.phone, 30)) return { ok: false, error: "Deixe um telefone de contacto: o restaurante vai ligar-lhe." } satisfies Fail;

    const order: Order = {
        id: crypto.randomUUID(), code: `#${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        memberId: member.id, customerName: `${member.firstName} ${member.lastName}`.trim(),
        tier: premium ? "premium" : "free", kind, collection: i.collection, slug: i.slug, place: item.title,
        lines, currency: item.currency ?? "MZN", phone, status: "sent", history: [], createdAt: "", updatedAt: "", direct: direct || undefined,
        note: str(i.note, 500) || undefined,
    };

    if (kind === "food") {
        const mode = (["dine_in", "pickup", "delivery"] as const).find((m) => m === i.mode);
        if (!mode) return { ok: false, error: "Escolha: comer no local, levantar ou entrega." } satisfies Fail;
        order.mode = mode as OrderMode;
        if (mode === "delivery") {
            order.address = str(i.address, 200) || undefined;
            if (!order.address) return { ok: false, error: "Indique o endereço de entrega." } satisfies Fail;
        }
        const priced = lines.every((l) => typeof l.price === "number");
        if (priced) order.total = Math.round(lines.reduce((n, l) => n + l.price! * l.qty, 0) * 100) / 100;
    } else if (kind === "tour") {
        // a guided tour / transport service: one date and the number of people
        const from = str(i.from, 10);
        if (!DATE.test(from)) return { ok: false, error: "Indique a data." } satisfies Fail;
        if (from < todayMaputo()) return { ok: false, error: "A data já passou." } satisfies Fail;
        order.from = from;
        const g = Math.round(Number(i.guests));
        order.guests = g >= 1 && g <= 50 ? g : 1;
        const l = lines[0];
        if (typeof l.price === "number") order.total = Math.round(l.price * (/pessoa|pax|cada/i.test(l.priceNote ?? "") ? order.guests : 1) * 100) / 100;
    } else {
        const from = str(i.from, 10), to = str(i.to, 10);
        if (!DATE.test(from) || !DATE.test(to)) return { ok: false, error: "Indique as datas." } satisfies Fail;
        if (from < todayMaputo()) return { ok: false, error: "A data de início já passou." } satisfies Fail;
        const n = days(from, to);
        if (n < 1 || n > 60) return { ok: false, error: "A data de fim deve ser depois da de início (máximo 60 dias)." } satisfies Fail;
        order.from = from; order.to = to;
        const g = Math.round(Number(i.guests));
        order.guests = g >= 1 && g <= 30 ? g : 1;
        const l = lines[0];
        // lodging per night / car per day: total only when the price note says so
        if (typeof l.price === "number" && /noite|dia/i.test(l.priceNote ?? "")) order.total = Math.round(l.price * n * 100) / 100;
    }

    return locked(async () => {
        const all = await read();
        if (!premium) {
            const used = all.filter((o) => o.memberId === member.id && o.tier === "free" && o.status !== "declined").length;
            if (used >= FREE_ORDER_LIMIT) return { ok: false, error: `Já usou os seus ${FREE_ORDER_LIMIT} pedidos gratuitos. Subscreva o Premium para continuar a pedir.` } satisfies Fail;
        }
        if (all.filter((o) => o.memberId === member.id && o.status === "sent").length >= 8) return { ok: false, error: "Tem demasiados pedidos por confirmar. Aguarde as respostas." } satisfies Fail;
        const now = new Date().toISOString();
        order.createdAt = order.updatedAt = now;
        order.history = [{ status: "sent", at: now }];
        all.unshift(order);
        await writeJson(FILE, all.slice(0, 5000));
        return { ok: true, order } as const;
    });
}

/** Every order (Riendzo team), newest first. */
export const listAllOrders = async () => read();

export async function listOrdersOf(memberId: string) {
    return (await read()).filter((o) => o.memberId === memberId);
}
export const getOrder = async (id: string) => (await read()).find((o) => o.id === id) ?? null;

export const activeCountOf = async (memberId: string) => (await read()).filter((o) => o.memberId === memberId && ACTIVE.includes(o.status)).length;

type Ref = { collection: string; slug: string };
const mine = (refs: Ref[]) => (o: Order) => refs.some((r) => r.collection === o.collection && r.slug === o.slug);
export async function listOrdersFor(refs: Ref[]) {
    return (await read()).filter(mine(refs));
}
export const newCountFor = async (refs: Ref[]) => (await read()).filter((o) => mine(refs)(o) && o.status === "sent").length;

/** The customer withdraws an order the establishment has not received yet. */
export function cancelOrder(memberId: string, id: string) {
    return locked(async () => {
        const all = await read();
        const o = all.find((x) => x.id === id && x.memberId === memberId);
        if (!o || o.status !== "sent") return false;
        o.status = "cancelled"; o.updatedAt = new Date().toISOString(); o.history.push({ status: "cancelled", at: o.updatedAt });
        await writeJson(FILE, all);
        return true;
    });
}

/** The establishment moves the order forward (only the allowed next steps). `refs` = what the user may manage; null = everything (admin). */
export function advanceOrder(id: string, to: OrderStatus, refs: Ref[] | null, reason?: string) {
    return locked(async (): Promise<{ ok: true; order: Order } | Fail> => {
        const all = await read();
        const o = all.find((x) => x.id === id);
        if (!o || (refs && !mine(refs)(o))) return { ok: false, error: "Pedido não encontrado." };
        if (!NEXT[o.status].includes(to)) return { ok: false, error: "Esse passo não é possível neste momento." };
        if (to === "declined") {
            const r = (reason ?? "").trim().slice(0, 300);
            if (r.length < 3) return { ok: false, error: "Escreva o motivo da recusa." };
            o.reason = r;
        }
        o.status = to; o.updatedAt = new Date().toISOString(); o.history.push({ status: to, at: o.updatedAt });
        await writeJson(FILE, all);
        return { ok: true, order: o };
    });
}

/** Account deletion: the establishments keep their order history, without the customer's personal data. */
export function anonymizeOrdersOf(memberId: string) {
    return locked(async () => {
        const all = await read();
        let n = 0;
        for (const o of all) {
            if (o.memberId !== memberId) continue;
            o.customerName = "Cliente eliminado"; o.phone = ""; o.note = undefined; o.address = undefined; n++;
        }
        if (n) await writeJson(FILE, all);
        return n;
    });
}
