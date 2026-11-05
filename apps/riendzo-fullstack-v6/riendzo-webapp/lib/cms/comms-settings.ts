/**
 * E-mail and SMS settings, edited in the BackOffice (Administrador > Configurações).
 * Secrets are stored encrypted (AES-256-GCM) in data/cms/_comms.json; the key comes from
 * SETTINGS_SECRET (or ADMIN_SESSION_SECRET). Environment variables are the fallback.
 */
import path from "node:path";
import crypto from "node:crypto";
import { CMS_DIR, locked, readJson, writeJson } from "./store";

export type SmsProvider = "none" | "twilio" | "africastalking";

export type CommsSettings = {
    email: { apiKey?: string; from?: string };
    sms: {
        provider: SmsProvider;
        twilioSid?: string; twilioToken?: string; twilioFrom?: string;
        atUsername?: string; atApiKey?: string; atSender?: string;
    };
};

const FILE = path.join(CMS_DIR, "_comms.json");
const SECRET_FIELDS = ["email.apiKey", "sms.twilioToken", "sms.atApiKey"] as const;

const keyMaterial = () =>
    process.env.SETTINGS_SECRET || process.env.ADMIN_SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-only-secret-change-me-please-0123456789");

function encrypt(plain: string) {
    const secret = keyMaterial();
    if (!secret) return plain; // no secret configured: stored as is (set SETTINGS_SECRET in production)
    const key = crypto.scryptSync(secret, "riendzo-comms", 32);
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
    return `enc:v1:${iv.toString("base64")}:${c.getAuthTag().toString("base64")}:${ct.toString("base64")}`;
}

function decrypt(value: string) {
    if (!value.startsWith("enc:v1:")) return value;
    try {
        const [, , iv, tag, ct] = value.split(":");
        const key = crypto.scryptSync(keyMaterial(), "riendzo-comms", 32);
        const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
        d.setAuthTag(Buffer.from(tag, "base64"));
        return Buffer.concat([d.update(Buffer.from(ct, "base64")), d.final()]).toString("utf8");
    } catch {
        return ""; // wrong key (SETTINGS_SECRET changed): treated as not set
    }
}

const get = (o: Record<string, unknown>, p: string) => p.split(".").reduce<unknown>((a, k) => (a as Record<string, unknown> | undefined)?.[k], o);
const set = (o: Record<string, unknown>, p: string, v: string) => {
    const [a, b] = p.split(".");
    (o[a] as Record<string, unknown>)[b] = v;
};

const empty = (): CommsSettings => ({ email: {}, sms: { provider: "none" } });

async function readRaw(): Promise<CommsSettings> {
    const f = await readJson<Partial<CommsSettings>>(FILE);
    return { email: { ...(f?.email ?? {}) }, sms: { provider: "none", ...(f?.sms ?? {}) } };
}

/** Effective settings (decrypted), with environment variables as fallback. Server only. */
export async function getCommsSettings(): Promise<CommsSettings> {
    const s = await readRaw();
    for (const p of SECRET_FIELDS) {
        const v = get(s as unknown as Record<string, unknown>, p);
        if (typeof v === "string" && v) set(s as unknown as Record<string, unknown>, p, decrypt(v));
    }
    s.email.apiKey ||= process.env.RESEND_API_KEY || undefined;
    s.email.from ||= process.env.MAIL_FROM || undefined;
    if (s.sms.provider === "none" && process.env.TWILIO_ACCOUNT_SID) {
        s.sms = { provider: "twilio", twilioSid: process.env.TWILIO_ACCOUNT_SID, twilioToken: process.env.TWILIO_AUTH_TOKEN, twilioFrom: process.env.TWILIO_FROM };
    }
    return s;
}

/** What the form shows: never the secrets themselves, only whether they are set. */
export async function getCommsPublic() {
    const s = await getCommsSettings();
    return {
        email: { from: s.email.from ?? "", hasKey: Boolean(s.email.apiKey) },
        sms: {
            provider: s.sms.provider, twilioSid: s.sms.twilioSid ?? "", twilioFrom: s.sms.twilioFrom ?? "", hasTwilioToken: Boolean(s.sms.twilioToken),
            atUsername: s.sms.atUsername ?? "", atSender: s.sms.atSender ?? "", hasAtKey: Boolean(s.sms.atApiKey),
        },
    };
}

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Saves what was typed. A secret left empty keeps the stored one. */
export function saveCommsSettings(input: Record<string, unknown>) {
    return locked(async () => {
        const cur = await readRaw();
        const next = empty();
        next.email.from = clean(input.emailFrom) || undefined;
        const keep = (typed: string, stored?: string) => (typed ? encrypt(typed) : stored);
        next.email.apiKey = keep(clean(input.emailApiKey, 300), cur.email.apiKey);

        const provider = (["none", "twilio", "africastalking"] as const).find((p) => p === input.smsProvider) ?? "none";
        next.sms = {
            provider,
            twilioSid: clean(input.twilioSid) || undefined, twilioFrom: clean(input.twilioFrom) || undefined,
            twilioToken: keep(clean(input.twilioToken, 300), cur.sms.twilioToken),
            atUsername: clean(input.atUsername) || undefined, atSender: clean(input.atSender) || undefined,
            atApiKey: keep(clean(input.atApiKey, 300), cur.sms.atApiKey),
        };
        if (next.email.from && !/^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$|^.+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(next.email.from)) {
            return { ok: false as const, error: "Remetente inválido. Exemplo: Riendzo <no-reply@riendzo.co.mz>" };
        }
        await writeJson(FILE, next);
        return { ok: true as const };
    });
}
