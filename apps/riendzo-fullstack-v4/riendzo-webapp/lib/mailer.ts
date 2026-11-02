/**
 * E-mail sending (server only) through the Resend HTTP API.
 * The key and sender are set in the BackOffice (Administrador > Configurações) or with
 * RESEND_API_KEY / MAIL_FROM. Without them nothing is sent (in development the message is
 * printed in the server console).
 */
import { getCommsSettings } from "@/lib/cms/comms-settings";

export type Mail = { to: string; subject: string; text: string; html?: string };
export type SendResult = { ok: boolean; error?: string };

export async function mailConfigured() {
    const { email } = await getCommsSettings();
    return Boolean(email.apiKey && email.from);
}

export async function sendMailResult(m: Mail): Promise<SendResult> {
    const { email } = await getCommsSettings();
    if (!email.apiKey || !email.from) {
        if (process.env.NODE_ENV !== "production") console.log(`\n[mail:dev] Para: ${m.to}\nAssunto: ${m.subject}\n${m.text}\n`);
        return { ok: false, error: "E-mail não configurado (chave e remetente)." };
    }
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${email.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: email.from, to: [m.to], subject: m.subject, text: m.text, html: m.html }),
            signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) return { ok: true };
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        console.error("[mail] falhou:", res.status, body);
        return { ok: false, error: body?.message ?? `O serviço de e-mail respondeu ${res.status}.` };
    } catch (e) {
        console.error("[mail] erro:", e);
        return { ok: false, error: "Não foi possível contactar o serviço de e-mail." };
    }
}

export async function sendMail(m: Mail): Promise<boolean> {
    return (await sendMailResult(m)).ok;
}
