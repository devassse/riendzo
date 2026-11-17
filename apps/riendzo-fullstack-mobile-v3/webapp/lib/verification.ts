/**
 * Account verification codes (server only).
 *
 * After sign-up the member must type a 6-digit code sent by e-mail or SMS. Only an HMAC of the
 * code is stored (never the code itself), it is valid for 10 minutes, allows 5 wrong attempts,
 * a new one can be requested after 60 seconds and at most 6 are sent per hour (protects the
 * SMS bill and the inbox of the person).
 *
 * LOCAL TESTING (no e-mail/SMS service yet): when the channel is not configured and the app is
 * NOT in production, nothing is sent. The code is printed in the server terminal and shown in a
 * yellow "development" box on the verification page. Optionally set DEV_VERIFY_CODE=123456 to
 * always get the same code. In production none of this exists: without a configured service the
 * member sees an error instead.
 */
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR, locked, readJson, writeJson } from "@/lib/cms/store";
import { mailConfigured, sendMailResult } from "@/lib/mailer";
import { smsConfigured, sendSms } from "@/lib/sms";

export type Channel = "email" | "sms";

type Entry = {
    memberId: string;
    channel: Channel;
    /** HMAC of the code */
    hash: string;
    /** the code stops working at this time (ms) */
    exp: number;
    attempts: number;
    sentAt: number;
    /** timestamps (ms) of the codes sent in the last hour */
    history: number[];
    /** development only (nothing was really sent): shown on the page */
    devCode?: string;
};

const FILE = path.join(DATA_DIR, "members", "_codes.json");
const TTL = 10 * 60 * 1000;
const COOLDOWN = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MAX_PER_HOUR = 6;
const MAX_ATTEMPTS = 5;

const isProd = () => process.env.NODE_ENV === "production";
const secret = () => process.env.ADMIN_SESSION_SECRET || "riendzo-verification-dev-secret";
const hashOf = (memberId: string, code: string) => crypto.createHmac("sha256", secret()).update(`${memberId}:${code}`).digest("hex");
const read = async () => ((await readJson<Entry[]>(FILE)) ?? []).filter((e) => Math.max(e.exp, e.sentAt + HOUR) > Date.now());

export const COOLDOWN_SECONDS = COOLDOWN / 1000;
export const CODE_MINUTES = TTL / 60_000;

export const maskEmail = (e?: string) => {
    if (!e) return "";
    const [u, d] = e.split("@");
    return `${u.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(5, u.length - 1)))}@${d}`;
};
export const maskPhone = (p?: string) => (p ? `+${p.slice(0, 3)} ${p.slice(3, 5)} ••• ${p.slice(-4)}` : "");

type Target = { id: string; firstName: string; email?: string; phone?: string };
export type IssueResult = { ok: true; channel: Channel; devCode?: string } | { ok: false; error: string };

/** Creates a new code and sends it (or, in development without a service, prints it). */
export async function issueCode(member: Target, channel: Channel): Promise<IssueResult> {
    if (channel === "email" && !member.email) return { ok: false, error: "Esta conta não tem e-mail." };
    if (channel === "sms" && !member.phone) return { ok: false, error: "Esta conta não tem telefone." };

    const all = await read();
    const prev = all.find((e) => e.memberId === member.id);
    const now = Date.now();
    if (prev && now - prev.sentAt < COOLDOWN) {
        const left = Math.ceil((COOLDOWN - (now - prev.sentAt)) / 1000);
        return { ok: false, error: `Aguarde ${left} segundos antes de pedir outro código.` };
    }
    const history = (prev?.history ?? []).filter((t) => now - t < HOUR);
    if (history.length >= MAX_PER_HOUR) return { ok: false, error: "Pediu códigos a mais. Tente novamente dentro de uma hora." };

    const fixed = !isProd() && /^\d{6}$/.test(process.env.DEV_VERIFY_CODE ?? "") ? process.env.DEV_VERIFY_CODE! : null;
    const code = fixed ?? String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

    const configured = channel === "email" ? await mailConfigured() : await smsConfigured();
    let devCode: string | undefined;

    if (configured) {
        const sent = channel === "email"
            ? await sendMailResult({
                to: member.email!,
                subject: `${code} é o seu código de verificação | Riendzo`,
                text: `Olá ${member.firstName},\n\nO seu código de verificação Riendzo é: ${code}\n\nÉ válido durante ${CODE_MINUTES} minutos. Se não criou uma conta na Riendzo, ignore esta mensagem.\n\nRiendzo`,
                html: `<p>Olá ${escapeHtml(member.firstName)},</p><p>O seu código de verificação Riendzo é:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0054b5;margin:8px 0">${code}</p><p style="color:#5b6478;font-size:13px">É válido durante ${CODE_MINUTES} minutos. Se não criou uma conta na Riendzo, ignore esta mensagem.</p>`,
            })
            : await sendSms(member.phone!, `Riendzo: o seu código de verificação é ${code}. Válido ${CODE_MINUTES} min. Não o partilhe com ninguém.`);
        if (!sent.ok) return { ok: false, error: sent.error ?? "Não foi possível enviar o código. Tente o outro método." };
    } else if (!isProd()) {
        // Development: no provider configured. Print the code instead of sending it.
        devCode = code;
        const to = channel === "email" ? member.email : `+${member.phone}`;
        console.log(`\n┌──────────────────────────────────────────────\n│ [verificação:dev] ${channel === "email" ? "E-mail" : "SMS"} para ${to}\n│ CÓDIGO: ${code}\n└──────────────────────────────────────────────\n`);
    } else {
        return { ok: false, error: channel === "email" ? "O envio de e-mail ainda não está configurado. Tente por SMS ou contacte o suporte." : "O envio de SMS ainda não está configurado. Tente por e-mail ou contacte o suporte." };
    }

    await locked(async () => {
        const cur = (await read()).filter((e) => e.memberId !== member.id);
        cur.push({ memberId: member.id, channel, hash: hashOf(member.id, code), exp: now + TTL, attempts: 0, sentAt: now, history: [...history, now], devCode });
        await writeJson(FILE, cur);
    });
    return { ok: true, channel, devCode };
}

export type CodeStatus = { channel: Channel; sentAt: number; exp: number; devCode?: string };

/** What the verification page shows: where the last code went and when it expires. */
export async function codeStatus(memberId: string): Promise<CodeStatus | null> {
    const e = (await read()).find((x) => x.memberId === memberId);
    if (!e || e.exp < Date.now()) return null;
    return { channel: e.channel, sentAt: e.sentAt, exp: e.exp, devCode: isProd() ? undefined : e.devCode };
}

export type CheckResult = { ok: true; channel: Channel } | { ok: false; error: string };

/** Checks the typed code (single use). */
export function checkCode(memberId: string, typed: string): Promise<CheckResult> {
    return locked(async (): Promise<CheckResult> => {
        const all = await read();
        const e = all.find((x) => x.memberId === memberId);
        if (!e || e.exp < Date.now()) return { ok: false, error: "O código expirou ou ainda não foi enviado. Peça um novo código." };
        if (e.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Demasiadas tentativas erradas. Peça um novo código." };

        const a = Buffer.from(hashOf(memberId, typed.replace(/\D/g, "")));
        const b = Buffer.from(e.hash);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            e.attempts += 1;
            await writeJson(FILE, all);
            const left = MAX_ATTEMPTS - e.attempts;
            return { ok: false, error: left > 0 ? `Código incorreto. Restam ${left} tentativas.` : "Demasiadas tentativas erradas. Peça um novo código." };
        }
        await writeJson(FILE, all.filter((x) => x !== e));
        return { ok: true, channel: e.channel };
    });
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Account deletion: forget any pending code of the member. */
export function dropCodes(memberId: string) {
    return locked(async () => {
        const all = await read();
        if (all.some((e) => e.memberId === memberId)) await writeJson(FILE, all.filter((e) => e.memberId !== memberId));
    });
}
