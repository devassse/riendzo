/**
 * E-mail sending (server only), used for password recovery and notifications.
 *
 * Uses the Resend HTTP API (no extra dependency):
 *   RESEND_API_KEY=re_...            https://resend.com
 *   MAIL_FROM="Riendzo <no-reply@riendzo.co.mz>"   (a domain verified in Resend)
 * Without them nothing is sent: in development the message is printed in the server console.
 */
export type Mail = { to: string; subject: string; text: string; html?: string };

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

export async function sendMail(m: Mail): Promise<boolean> {
    if (!mailConfigured()) {
        if (process.env.NODE_ENV !== "production") console.log(`\n[mail:dev] Para: ${m.to}\nAssunto: ${m.subject}\n${m.text}\n`);
        else console.warn("[mail] RESEND_API_KEY / MAIL_FROM não definidos: e-mail não enviado.");
        return false;
    }
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: process.env.MAIL_FROM, to: [m.to], subject: m.subject, text: m.text, html: m.html }),
        });
        if (!res.ok) console.error("[mail] falhou:", res.status, await res.text().catch(() => ""));
        return res.ok;
    } catch (e) {
        console.error("[mail] erro:", e);
        return false;
    }
}
