/**
 * SMS sending (server only). Providers: Twilio or Africa's Talking, chosen in the BackOffice
 * (Administrador > Configurações). Numbers are digits with the country code (258…).
 */
import { getCommsSettings } from "@/lib/cms/comms-settings";
import type { SendResult } from "./mailer";

export async function smsConfigured() {
    const { sms } = await getCommsSettings();
    if (sms.provider === "twilio") return Boolean(sms.twilioSid && sms.twilioToken && sms.twilioFrom);
    if (sms.provider === "africastalking") return Boolean(sms.atUsername && sms.atApiKey);
    return false;
}

export async function sendSms(to: string, text: string): Promise<SendResult> {
    const { sms } = await getCommsSettings();
    const number = `+${to.replace(/\D/g, "")}`;
    const body = text.slice(0, 640);
    try {
        if (sms.provider === "twilio" && sms.twilioSid && sms.twilioToken && sms.twilioFrom) {
            const form = new URLSearchParams({ To: number, Body: body });
            if (sms.twilioFrom.startsWith("MG")) form.set("MessagingServiceSid", sms.twilioFrom);
            else form.set("From", sms.twilioFrom);
            const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sms.twilioSid)}/Messages.json`, {
                method: "POST",
                headers: { Authorization: `Basic ${Buffer.from(`${sms.twilioSid}:${sms.twilioToken}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
                body: form, signal: AbortSignal.timeout(10_000),
            });
            if (res.ok) return { ok: true };
            const j = (await res.json().catch(() => null)) as { message?: string } | null;
            return { ok: false, error: j?.message ?? `Twilio respondeu ${res.status}.` };
        }
        if (sms.provider === "africastalking" && sms.atUsername && sms.atApiKey) {
            const host = sms.atUsername === "sandbox" ? "api.sandbox.africastalking.com" : "api.africastalking.com";
            const form = new URLSearchParams({ username: sms.atUsername, to: number, message: body });
            if (sms.atSender) form.set("from", sms.atSender);
            const res = await fetch(`https://${host}/version1/messaging`, {
                method: "POST",
                headers: { apiKey: sms.atApiKey, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
                body: form, signal: AbortSignal.timeout(10_000),
            });
            const j = (await res.json().catch(() => null)) as { SMSMessageData?: { Recipients?: { status?: string }[]; Message?: string } } | null;
            const status = j?.SMSMessageData?.Recipients?.[0]?.status;
            if (res.ok && (!status || status === "Success")) return { ok: true };
            return { ok: false, error: status ?? j?.SMSMessageData?.Message ?? `Africa's Talking respondeu ${res.status}.` };
        }
        if (process.env.NODE_ENV !== "production") console.log(`\n[sms:dev] Para: ${number}\n${body}\n`);
        return { ok: false, error: "SMS não configurado." };
    } catch (e) {
        console.error("[sms] erro:", e);
        return { ok: false, error: "Não foi possível contactar o serviço de SMS." };
    }
}
