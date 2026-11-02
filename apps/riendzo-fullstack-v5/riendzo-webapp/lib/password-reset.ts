/**
 * Password recovery tokens (server only). Only a SHA-256 hash of each token is stored,
 * the token itself only travels in the e-mail link. Valid for 1 hour, single use.
 */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";

export type ResetKind = "member" | "staff";
type Entry = { kind: ResetKind; id: string; hash: string; exp: number };

const FILE = path.join(DATA_DIR, "cms", "_resets.json");
const TTL = 60 * 60 * 1000;
const sha = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const read = async () => ((await readJson<Entry[]>(FILE)) ?? []).filter((e) => e.exp > Date.now());

/** Creates a token for the account (replaces any older one). */
export function createReset(kind: ResetKind, id: string) {
    return locked(async () => {
        const token = crypto.randomBytes(32).toString("hex");
        const all = (await read()).filter((e) => !(e.kind === kind && e.id === id));
        all.push({ kind, id, hash: sha(token), exp: Date.now() + TTL });
        await writeJson(FILE, all);
        return token;
    });
}

/** Looks the token up without using it (to show the form). */
export async function peekReset(kind: ResetKind, token: string) {
    const h = sha(token);
    const e = (await read()).find((x) => x.kind === kind && x.hash === h);
    return e ? e.id : null;
}

/** Uses the token (single use). */
export function consumeReset(kind: ResetKind, token: string) {
    return locked(async () => {
        const h = sha(token);
        const all = await read();
        const e = all.find((x) => x.kind === kind && x.hash === h);
        if (!e) return null;
        await writeJson(FILE, all.filter((x) => x !== e));
        return e.id;
    });
}
