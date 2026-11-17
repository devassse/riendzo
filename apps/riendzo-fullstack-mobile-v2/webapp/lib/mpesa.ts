/**
 * M-Pesa Open API (Vodacom Moçambique) — C2B "single stage" (server only).
 *
 * The customer types the number to be debited, the API sends a PIN prompt to that phone and the
 * request answers when the customer confirms (or refuses / lets it expire).
 *
 *   MPESA_API_KEY               API key (Developer Portal → application)
 *   MPESA_PUBLIC_KEY            public key of the portal (base64 or PEM): the API key is encrypted with it
 *   MPESA_SERVICE_PROVIDER_CODE shortcode that receives the money
 *   MPESA_ENV                   "live" for production; anything else = sandbox
 *   MPESA_ORIGIN                optional, default "*"
 *   MPESA_BASE_URL              optional, overrides host and port (tests)
 */
import crypto from "node:crypto";

export const mpesaConfigured = () =>
    Boolean(process.env.MPESA_API_KEY && process.env.MPESA_PUBLIC_KEY && process.env.MPESA_SERVICE_PROVIDER_CODE);

const baseUrl = () =>
    (process.env.MPESA_BASE_URL || (process.env.MPESA_ENV === "live" ? "https://api.vm.co.mz:18352" : "https://api.sandbox.vm.co.mz:18352")).replace(/\/$/, "");

const pem = (k: string) => (k.includes("BEGIN") ? k : `-----BEGIN PUBLIC KEY-----\n${k.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`);

/** The bearer token is the API key encrypted with the portal public key (RSA, PKCS#1 v1.5), in base64. */
export function bearerToken(apiKey: string, publicKey: string) {
    return crypto.publicEncrypt({ key: pem(publicKey), padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(apiKey)).toString("base64");
}

const FRIENDLY: Record<string, string> = {
    "INS-2006": "Saldo M-Pesa insuficiente.",
    "INS-2051": "Número M-Pesa inválido.",
    "INS-9": "O pedido expirou: não confirmou a tempo no telemóvel.",
};

export type C2BResult =
    | { ok: true; transactionId?: string; code: string; desc?: string }
    | { ok: false; unknown?: boolean; code?: string; desc?: string; error: string };

/** Asks the customer to pay `amount` MT. `msisdn` = 258 + number. References: letters and digits only. */
export async function c2bPayment(i: { amount: number; msisdn: string; reference: string; thirdParty: string }): Promise<C2BResult> {
    const { MPESA_API_KEY: key, MPESA_PUBLIC_KEY: pub, MPESA_SERVICE_PROVIDER_CODE: spc } = process.env;
    if (!key || !pub || !spc) return { ok: false, error: "Pagamentos M-Pesa ainda não configurados." };
    try {
        const res = await fetch(`${baseUrl()}/ipg/v1x/c2bPayment/singleStage/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearerToken(key, pub)}`, Origin: process.env.MPESA_ORIGIN || "*" },
            body: JSON.stringify({
                input_TransactionReference: i.reference, input_CustomerMSISDN: i.msisdn, input_Amount: String(i.amount),
                input_ThirdPartyReference: i.thirdParty, input_ServiceProviderCode: spc,
            }),
            signal: AbortSignal.timeout(100_000),
        });
        const j = (await res.json().catch(() => null)) as { output_ResponseCode?: string; output_ResponseDesc?: string; output_TransactionID?: string } | null;
        const code = j?.output_ResponseCode;
        if (code === "INS-0") return { ok: true, code, desc: j?.output_ResponseDesc, transactionId: j?.output_TransactionID };
        return { ok: false, code, desc: j?.output_ResponseDesc, error: (code && FRIENDLY[code]) || j?.output_ResponseDesc || `O M-Pesa respondeu ${res.status}.` };
    } catch (e) {
        // No answer: the customer may still have paid. Never say "failed" for sure.
        const timeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
        return { ok: false, unknown: true, error: timeout ? "Não recebemos a confirmação do M-Pesa a tempo." : "Não foi possível contactar o M-Pesa." };
    }
}
