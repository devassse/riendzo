"use server";

import { headers } from "next/headers";
import { getMember } from "@/lib/members-auth";
import { isLockedOut, registerFailure } from "@/lib/cms/auth";
import { c2bPayment, mpesaConfigured } from "@/lib/mpesa";
import { createDonation, DONATION_MAX, DONATION_MIN, updateDonation } from "@/lib/donations";

export type DonateState = { status?: "paid" | "failed" | "unknown"; message?: string; ref?: string; amount?: number };

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
    if (!live && isProd) return { status: "failed", message: "Os pagamentos ainda não estão ativos. Obrigado pela intenção!" };

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
