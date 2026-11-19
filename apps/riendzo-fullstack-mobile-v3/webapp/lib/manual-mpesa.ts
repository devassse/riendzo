/**
 * Conta que recebe as transferências M-Pesa manuais (server only).
 * Subscrições Premium usam SUBSCRIBE_MANUAL_MPESA_*; se não estiverem definidas, usam as mesmas
 * da doação (DONATE_MANUAL_MPESA_*), para não ser preciso configurar duas vezes.
 */
export type ManualAccount = { phone: string; name: string };

export function manualAccount(kind: "subscribe" | "donate" = "subscribe"): ManualAccount | undefined {
    const env = process.env;
    const phone = ((kind === "subscribe" ? env.SUBSCRIBE_MANUAL_MPESA_NUMBER : "") || env.DONATE_MANUAL_MPESA_NUMBER || "").trim();
    const name = ((kind === "subscribe" ? env.SUBSCRIBE_MANUAL_MPESA_NAME : "") || env.DONATE_MANUAL_MPESA_NAME || "").trim();
    return phone ? { phone, name } : undefined;
}
