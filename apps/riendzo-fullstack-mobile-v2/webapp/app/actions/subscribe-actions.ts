"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getMember } from "@/lib/members-auth";
import { setPremium } from "@/lib/members";
import { listUsers } from "@/lib/cms/users";
import { isLockedOut, registerFailure } from "@/lib/cms/auth";
import * as store from "@/lib/cms/store";
import { sendMail } from "@/lib/mailer";
import { c2bPayment, mpesaConfigured } from "@/lib/mpesa";
import { planById } from "@/lib/premium-plans";
import { createSubPayment, hasRecentPending, updateSubPayment } from "@/lib/subscriptions";

export type SubscribeState = { status?: "paid" | "failed" | "unknown"; message?: string; ref?: string; until?: string };

const isProd = process.env.NODE_ENV === "production";

/** Tell the administrators (best effort: the payment is already registered and shows in Administrador → Subscrições). */
async function notifyAdmins(subject: string, text: string) {
    try {
        const to = (await listUsers()).filter((u) => u.role === "admin" && u.active !== false && u.email).map((u) => u.email!);
        if (process.env.CONTACT_EMAIL) to.push(process.env.CONTACT_EMAIL);
        for (const t of [...new Set(to)]) await sendMail({ to: t, subject, text });
    } catch { /* never block the member */ }
}

/** "Efetuar Pagamento" in the Premium popup: M-Pesa sends the PIN prompt; once confirmed, Premium is active. */
export async function subscribePremiumAction(_: SubscribeState, fd: FormData): Promise<SubscribeState> {
    const member = await getMember();
    if (!member) return { status: "failed", message: "Inicie sessão para subscrever." };

    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const key = `subscribe:${ip}`;
    if (isLockedOut(key)) return { status: "failed", message: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };
    registerFailure(key); // every attempt counts: 5 per 15 minutes per IP

    if (fd.get("method") !== "mpesa") return { status: "failed", message: "Por agora só o M-Pesa está disponível. Em breve: e-Mola e mKesh." };
    // The price always comes from the server plan list, never from the browser
    const plan = planById(fd.get("plan"));
    if (!plan) return { status: "failed", message: "Escolha um plano." };

    let msisdn = String(fd.get("phone") ?? "").replace(/\D/g, "");
    if (/^8\d{8}$/.test(msisdn)) msisdn = `258${msisdn}`;
    if (!/^258(84|85)\d{7}$/.test(msisdn)) return { status: "failed", message: "Número M-Pesa inválido. Use um número Vodacom (84 ou 85), ex.: 84 123 4567." };

    if (await hasRecentPending(member.id)) return { status: "failed", message: "Já tem um pagamento a aguardar confirmação no telemóvel. Confirme-o ou aguarde 3 minutos." };

    const live = mpesaConfigured();
    if (!live && isProd) return { status: "failed", message: "Os pagamentos ainda não estão ativos. Fale connosco para ativar o Premium." };

    const name = `${member.firstName} ${member.lastName}`.trim();
    const pay = await createSubPayment({ memberId: member.id, memberName: name, planId: plan.id, months: plan.months, amount: plan.price, msisdn, simulated: !live || undefined });

    let ok = false;
    let fail: { unknown?: boolean; message: string; code?: string; desc?: string } | null = null;
    let tx: { code?: string; desc?: string; transactionId?: string } = {};
    if (!live) {
        // Development without M-Pesa credentials: nothing is charged, the flow is only simulated
        await new Promise((r) => setTimeout(r, 1500));
        ok = true;
        tx = { code: "SIMULADO", desc: "Simulação (sem credenciais M-Pesa)" };
    } else {
        const r = await c2bPayment({ amount: plan.price, msisdn, reference: "PREMIUM", thirdParty: pay.ref });
        if (r.ok) { ok = true; tx = { code: r.code, desc: r.desc, transactionId: r.transactionId }; }
        else fail = { unknown: r.unknown, message: r.error, code: r.code, desc: r.desc };
    }

    if (!ok) {
        await updateSubPayment(pay.id, { status: fail!.unknown ? "unknown" : "failed", providerCode: fail!.code, providerDesc: fail!.desc ?? fail!.message });
        if (fail!.unknown) {
            await notifyAdmins(`Subscrição Premium por confirmar (${pay.ref})`, `${name} tentou pagar ${plan.price} MT (${plan.label}) por M-Pesa, mas não recebemos a confirmação.\nReferência: ${pay.ref}\nConfirme no extrato M-Pesa e, se o valor foi recebido, ative o Premium em Administrador → Membros.\n\nRiendzo`);
            return { status: "unknown", ref: pay.ref, message: `${fail!.message} Se o valor foi debitado, contacte-nos com a referência ${pay.ref}: ativamos o seu Premium.` };
        }
        return { status: "failed", ref: pay.ref, message: fail!.message };
    }

    // Paid: Premium on (adds the months to the end date if it is still active)
    const until = await setPremium(member.id, plan.months);
    await updateSubPayment(pay.id, { status: "paid", providerCode: tx.code, providerDesc: tx.desc, transactionId: tx.transactionId, premiumUntil: until ?? undefined });
    await store.logActivity({ user: name, action: "Subscreveu o Premium", title: `${plan.label} · ${plan.price} MT${live ? "" : " (simulado)"}` });
    await notifyAdmins(
        `Nova subscrição Premium: ${name}`,
        `${name} subscreveu o Premium (${plan.label}) por ${plan.price} MT via M-Pesa${live ? "" : " [SIMULADO]"}.\nNúmero: +${msisdn}\nReferência: ${pay.ref}\nPremium até: ${until ? new Date(until).toLocaleDateString("pt-PT") : "-"}\n\nRiendzo`
    );
    if (member.email) await sendMail({ to: member.email, subject: "O seu Premium Riendzo está ativo", text: `Olá ${member.firstName},\n\nRecebemos o seu pagamento de ${plan.price} MT. O Premium está ativo até ${until ? new Date(until).toLocaleDateString("pt-PT") : "-"}.\n\nObrigado!\nRiendzo` }).catch(() => false);

    revalidatePath("/", "layout");
    return { status: "paid", ref: pay.ref, until: until ?? undefined, message: live ? undefined : "Pagamento simulado (modo de desenvolvimento: nada foi debitado)." };
}
