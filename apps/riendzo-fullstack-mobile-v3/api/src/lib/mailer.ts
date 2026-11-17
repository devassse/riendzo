/**
 * E-mail sending through the Resend HTTP API (no extra dependency).
 *   RESEND_API_KEY=re_...      MAIL_FROM="Riendzo <no-reply@riendzo.co.mz>"
 * Without them nothing is sent (in development the message is printed in the console).
 */
import { config } from "../config";

export type Mail = { to: string; subject: string; text: string; html?: string };

export async function sendMail(m: Mail): Promise<boolean> {
    if (!config.resendApiKey || !config.mailFrom) {
        if (!config.isProd) console.log(`\n[mail:dev] Para: ${m.to}\nAssunto: ${m.subject}\n${m.text}\n`);
        else console.warn("[mail] RESEND_API_KEY / MAIL_FROM não definidos: e-mail não enviado.");
        return false;
    }
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${config.resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: config.mailFrom, to: [m.to], subject: m.subject, text: m.text, html: m.html }),
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) console.error("[mail] falhou:", res.status, await res.text().catch(() => ""));
        return res.ok;
    } catch (e) {
        console.error("[mail] erro:", e);
        return false;
    }
}
