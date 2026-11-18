"use server";

import { headers } from "next/headers";
import { getMember } from "@/lib/members-auth";
import { isLockedOut, registerFailure } from "@/lib/cms/auth";
import { c2bPayment, mpesaConfigured } from "@/lib/mpesa";
import { createDonation, DONATION_MAX, DONATION_MIN, updateDonation } from "@/lib/donations";

export type DonateState = {
    status?: "paid" | "failed" | "unknown";
    message?: string;
    ref?: string;
    amount?: number;
    /** "inactive": online payments are off, the form offers the manual M-Pesa transfer instead */
    code?: "inactive";
    manual?: { phone: string; name: string };
};

/** Account that receives manual M-Pesa transfers (set in the environment, see .env.example) */
function manualAccount() {
    const phone = (process.env.DONATE_MANUAL_MPESA_NUMBER ?? "").trim();
    const name = (process.env.DONATE_MANUAL_MPESA_NAME ?? "").trim();
    return phone ? { phone, name } : undefined;
}

const isProd = process.env.NODE_ENV === "production";

/** "Efetuar Pagamento": M-Pesa sends the PIN prompt to the number typed by the donor. */
export async function donateAction(_: DonateState, fd: FormData): Promise<DonateState> {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const key = `donate:${ip}`;
    if (isLockedOut(key)) return { status: "failed", message: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };
    registerFailure(key); // every attempt counts: 5 per 15 minutes per IP

    if (fd.get("method") !== "mpesa") return { status: "failed", message: "Por agora só o M-Pesa está disponível. Em breve: e-Mola e mKesh." };

    const choice = String(fd.get("choice") ?? "");
    const amount = Math.round(Number(choice === "other" ? String(fd.get("other") ?? "").replace(",", ".") : choice));
    if (!Number.isFinite(amount) || amount < DONATION_MIN || amount > DONATION_MAX) {
        return { status: "failed", message: `Escolha um valor entre ${DONATION_MIN} e ${DONATION_MAX.toLocaleString("pt-PT")} MT.` };
    }

    let msisdn = String(fd.get("phone") ?? "").replace(/\D/g, "");
    if (/^8\d{8}$/.test(msisdn)) msisdn = `258${msisdn}`;
    if (!/^258(84|85)\d{7}$/.test(msisdn)) return { status: "failed", message: "Número M-Pesa inválido. Use um número Vodacom (84 ou 85), ex.: 84 123 4567." };

    const member = await getMember();
    const live = mpesaConfigured();
    if (!live && isProd) return { status: "failed", code: "inactive", manual: manualAccount(), message: "Os pagamentos ainda não estão ativos. Obrigado pela intenção!" };

    const d = await createDonation({ amount, msisdn, memberId: member?.id, simulated: !live || undefined });

    // Development without M-Pesa credentials: nothing is charged, the flow is only simulated
    if (!live) {
        await new Promise((r) => setTimeout(r, 1500));
        await updateDonation(d.id, { status: "paid", providerCode: "SIMULADO", providerDesc: "Simulação (sem credenciais M-Pesa)" });
        return { status: "paid", ref: d.ref, amount, message: "Pagamento simulado (modo de desenvolvimento: nada foi debitado)." };
    }

    const r = await c2bPayment({ amount, msisdn, reference: "DOACAO", thirdParty: d.ref });
    if (r.ok) {
        await updateDonation(d.id, { status: "paid", providerCode: r.code, providerDesc: r.desc, transactionId: r.transactionId });
        return { status: "paid", ref: d.ref, amount };
    }
    await updateDonation(d.id, { status: r.unknown ? "unknown" : "failed", providerCode: r.code, providerDesc: r.desc ?? r.error });
    return r.unknown
        ? { status: "unknown", ref: d.ref, message: `${r.error} Se o valor foi debitado, contacte-nos com a referência ${d.ref}.` }
        : { status: "failed", ref: d.ref, message: r.error };
}

export type ManualDonationResult = { ok: true; ref: string; amount: number } | { ok: false; message: string };

/** "Já enviei": the donor says they sent the money by M-Pesa to our number. Saved as "por confirmar" to check against the statement. */
export async function manualDonationAction(rawAmount: number, rawName: string): Promise<ManualDonationResult> {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const key = `donate-manual:${ip}`;
    if (isLockedOut(key)) return { ok: false, message: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };
    registerFailure(key);

    if (!manualAccount()) return { ok: false, message: "Esta opção não está disponível de momento." };
    const amount = Math.round(Number(rawAmount));
    if (!Number.isFinite(amount) || amount < DONATION_MIN || amount > DONATION_MAX) {
        return { ok: false, message: `Escolha um valor entre ${DONATION_MIN} e ${DONATION_MAX.toLocaleString("pt-PT")} MT.` };
    }
    const donorName = String(rawName ?? "").replace(/\s+/g, " ").trim().slice(0, 80) || undefined;
    const member = await getMember();
    const d = await createDonation({ amount, msisdn: "", memberId: member?.id, manual: true, donorName });
    await updateDonation(d.id, { status: "unknown", providerDesc: "Transferência manual: confirmar no extrato M-Pesa" });
    return { ok: true, ref: d.ref, amount };
}
