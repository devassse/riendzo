/** Donations register (server only): data/donations/donations.json. Used to reconcile with the M-Pesa statement. */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";

export type DonationStatus = "pending" | "paid" | "failed" | "unknown";
export type Donation = {
    id: string;
    /** reference sent to the provider (letters and digits) */
    ref: string;
    amount: number;
    currency: "MZN";
    method: "mpesa";
    /** number that was debited */
    msisdn: string;
    status: DonationStatus;
    providerCode?: string;
    providerDesc?: string;
    transactionId?: string;
    memberId?: string;
    simulated?: boolean;
    createdAt: string;
    updatedAt: string;
};

export const DONATION_MIN = 10;
export const DONATION_MAX = 100_000;
export const DONATION_PRESETS = [10, 20, 50, 100] as const;

const FILE = path.join(DATA_DIR, "donations", "donations.json");
const read = async () => (await readJson<Donation[]>(FILE)) ?? [];

export function createDonation(d: Pick<Donation, "amount" | "msisdn" | "memberId" | "simulated">) {
    return locked(async () => {
        const all = await read();
        const now = new Date().toISOString();
        const rec: Donation = {
            id: crypto.randomUUID(), ref: `RDZ${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
            currency: "MZN", method: "mpesa", status: "pending", createdAt: now, updatedAt: now, ...d,
        };
        all.unshift(rec);
        await writeJson(FILE, all.slice(0, 20_000));
        return rec;
    });
}

export function updateDonation(id: string, patch: Partial<Pick<Donation, "status" | "providerCode" | "providerDesc" | "transactionId">>) {
    return locked(async () => {
        const all = await read();
        const d = all.find((x) => x.id === id);
        if (!d) return;
        Object.assign(d, patch, { updatedAt: new Date().toISOString() });
        await writeJson(FILE, all);
    });
}

export const listDonations = read;
