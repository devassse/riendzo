/** Premium subscription payments (server only): data/subscriptions/payments.json. Used to reconcile with the M-Pesa statement. */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";

export type SubStatus = "pending" | "paid" | "failed" | "unknown";
export type SubPayment = {
    id: string;
    /** reference sent to the provider (letters and digits) */
    ref: string;
    memberId: string;
    memberName: string;
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
    /** the member's Premium end date after this payment */
    premiumUntil?: string;
    createdAt: string;
    updatedAt: string;
};

const DIR = path.join(DATA_DIR, "subscriptions");
const FILE = path.join(DIR, "payments.json");
const SEEN = path.join(DIR, "seen.json");
const read = async () => (await readJson<SubPayment[]>(FILE)) ?? [];

export function createSubPayment(d: Pick<SubPayment, "memberId" | "memberName" | "planId" | "months" | "amount" | "msisdn" | "simulated">) {
    return locked(async () => {
        const all = await read();
        const now = new Date().toISOString();
        const rec: SubPayment = { id: crypto.randomUUID(), ref: `RDZP${crypto.randomBytes(5).toString("hex").toUpperCase()}`, method: "mpesa", status: "pending", createdAt: now, updatedAt: now, ...d };
        all.unshift(rec);
        await writeJson(FILE, all.slice(0, 20_000));
        return rec;
    });
}

export function updateSubPayment(id: string, patch: Partial<Pick<SubPayment, "status" | "providerCode" | "providerDesc" | "transactionId" | "premiumUntil">>) {
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
    return (await read()).some((p) => p.memberId === memberId && p.status === "pending" && Date.now() - Date.parse(p.createdAt) < 3 * 60_000);
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
