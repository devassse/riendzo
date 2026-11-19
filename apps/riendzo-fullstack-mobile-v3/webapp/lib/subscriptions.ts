/** Premium subscription payments (server only): data/subscriptions/payments.json. Used to reconcile with the M-Pesa statement. */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";

/**
 * pending  = pedido manual à espera de aprovação do administrador (o Premium ainda NÃO está ativo)
 * paid     = pago e Premium ativo (M-Pesa confirmou, ou o administrador aprovou)
 * rejected = pedido manual recusado pelo administrador
 * failed / unknown = tentativa automática que falhou / sem resposta do M-Pesa
 */
export type SubStatus = "pending" | "paid" | "failed" | "unknown" | "rejected";
export type SubPayment = {
    id: string;
    /** reference sent to the provider (letters and digits) */
    ref: string;
    /** the member, or "owner:<user id>" when an establishment owner paid for a place */
    memberId: string;
    memberName: string;
    /** set when the payment activates the Premium of an establishment (not of a member) */
    place?: { collection: string; slug: string; title: string };
    planId: string;
    months: number;
    amount: number;
    method: "mpesa";
    msisdn: string;
    status: SubStatus;
    providerCode?: string;
    providerDesc?: string;
    transactionId?: string;
    simulated?: boolean;
    /** transferência manual: o cliente enviou o dinheiro para o nosso número M-Pesa e pediu a ativação (aguarda aprovação) */
    manual?: boolean;
    /** e-mail de quem pediu, para o avisar da decisão */
    email?: string;
    /** the member's Premium end date after this payment */
    premiumUntil?: string;
    /** aprovação / recusa do administrador */
    decidedAt?: string;
    decidedBy?: string;
    rejectReason?: string;
    createdAt: string;
    updatedAt: string;
};

const DIR = path.join(DATA_DIR, "subscriptions");
const FILE = path.join(DIR, "payments.json");
const SEEN = path.join(DIR, "seen.json");
const read = async () => (await readJson<SubPayment[]>(FILE)) ?? [];

export function createSubPayment(d: Pick<SubPayment, "memberId" | "memberName" | "place" | "planId" | "months" | "amount" | "msisdn" | "simulated" | "manual" | "email"> & Partial<Pick<SubPayment, "status">>) {
    return locked(async () => {
        const all = await read();
        const now = new Date().toISOString();
        const rec: SubPayment = { id: crypto.randomUUID(), ref: `RDZP${crypto.randomBytes(5).toString("hex").toUpperCase()}`, method: "mpesa", status: "pending", createdAt: now, updatedAt: now, ...d };
        all.unshift(rec);
        await writeJson(FILE, all.slice(0, 20_000));
        return rec;
    });
}

export function updateSubPayment(id: string, patch: Partial<Pick<SubPayment, "status" | "providerCode" | "providerDesc" | "transactionId" | "premiumUntil" | "decidedAt" | "decidedBy" | "rejectReason">>) {
    return locked(async () => {
        const all = await read();
        const p = all.find((x) => x.id === id);
        if (!p) return;
        Object.assign(p, patch, { updatedAt: new Date().toISOString() });
        await writeJson(FILE, all);
    });
}

export const listSubPayments = read;

/** A payment of this member still waiting for the PIN (avoids double charges from a double click). */
export async function hasRecentPending(memberId: string) {
    return (await read()).some((p) => p.memberId === memberId && p.status === "pending" && !p.manual && Date.now() - Date.parse(p.createdAt) < 3 * 60_000);
}

/** Quem/o quê é subscrito: um estabelecimento ("collection/slug") ou um membro. */
export const subjectOf = (p: Pick<SubPayment, "memberId" | "place">) => (p.place ? `place:${p.place.collection}/${p.place.slug}` : `member:${p.memberId}`);

/** O pedido manual por aprovar deste membro / estabelecimento (no máximo um de cada vez). */
export async function pendingRequestOf(subject: string) {
    return (await read()).find((p) => p.status === "pending" && p.manual && subjectOf(p) === subject);
}

/** Todos os pedidos manuais por aprovar (os mais antigos primeiro, para serem tratados por ordem). */
export async function listPendingRequests(kind?: "member" | "place") {
    return (await read())
        .filter((p) => p.status === "pending" && p.manual && (kind === "place" ? p.place : kind === "member" ? !p.place : true))
        .reverse();
}

export async function countPendingPremium() {
    const all = await listPendingRequests();
    return { users: all.filter((p) => !p.place).length, places: all.filter((p) => p.place).length };
}

export async function getSubPayment(id: string) {
    return (await read()).find((p) => p.id === id);
}

/* "New" for the staff = paid (or waiting to be confirmed) after the last time the Subscrições page was opened */
export async function countNewSubscriptions() {
    const seen = (await readJson<{ at: string }>(SEEN))?.at ?? "1970-01-01T00:00:00.000Z";
    return (await read()).filter((p) => (p.status === "paid" || p.status === "unknown") && p.createdAt > seen).length;
}
export const markSubscriptionsSeen = () => locked(() => writeJson(SEEN, { at: new Date().toISOString() }));

/** Account deletion: the payment records stay (accounting), without the member's name. */
export function anonymizeSubPaymentsOf(memberId: string) {
    return locked(async () => {
        const all = await read();
        let n = 0;
        for (const p of all) if (p.memberId === memberId) { p.memberName = "Conta eliminada"; n++; }
        if (n) await writeJson(FILE, all);
        return n;
    });
}
