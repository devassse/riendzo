"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getMember } from "@/lib/members-auth";
import { getSession } from "@/lib/cms/auth";
import { setPlacePremium } from "@/lib/place-premium";
import { ORDER_KINDS } from "@/lib/order-types";
import { getItem, titleOf } from "@/lib/cms/store";
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

type Payer = {
    /** member id, or "owner:<user id>" */ id: string; name: string; email?: string; greeting: string;
    /** the establishment being upgraded (omitted = the member's own Premium) */ place?: { collection: string; slug: string; title: string };
    /** adds the months and returns the new end date */ activate: (months: number) => Promise<string | null>;
};

/** The payment itself (shared by members and establishment owners): M-Pesa PIN prompt, then the Premium is activated. */
async function charge(payer: Payer, fd: FormData): Promise<SubscribeState> {
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

    if (await hasRecentPending(payer.id)) return { status: "failed", message: "Já tem um pagamento a aguardar confirmação no telemóvel. Confirme-o ou aguarde 3 minutos." };

    const live = mpesaConfigured();
    if (!live && isProd) return { status: "failed", message: "Os pagamentos ainda não estão ativos. Fale connosco para ativar o Premium." };

    const what = payer.place ? `o Premium de ${payer.place.title}` : "o Premium";
    const pay = await createSubPayment({ memberId: payer.id, memberName: payer.name, place: payer.place, planId: plan.id, months: plan.months, amount: plan.price, msisdn, simulated: !live || undefined });

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
            await notifyAdmins(`Subscrição Premium por confirmar (${pay.ref})`, `${payer.name} tentou pagar ${plan.price} MT (${plan.label}) por M-Pesa para ${what}, mas não recebemos a confirmação.\nReferência: ${pay.ref}\nConfirme no extrato M-Pesa e, se o valor foi recebido, ative o Premium em Administrador → Subscrições.\n\nRiendzo`);
            return { status: "unknown", ref: pay.ref, message: `${fail!.message} Se o valor foi debitado, contacte-nos com a referência ${pay.ref}: ativamos ${what}.` };
        }
        return { status: "failed", ref: pay.ref, message: fail!.message };
    }

    // Paid: Premium on (adds the months to the end date if it is still active)
    const until = await payer.activate(plan.months);
    await updateSubPayment(pay.id, { status: "paid", providerCode: tx.code, providerDesc: tx.desc, transactionId: tx.transactionId, premiumUntil: until ?? undefined });
    await store.logActivity({ user: payer.name, action: payer.place ? `Subscreveu o Premium de ${payer.place.title}` : "Subscreveu o Premium", title: `${plan.label} · ${plan.price} MT${live ? "" : " (simulado)"}` });
    await notifyAdmins(
        `Nova subscrição Premium: ${payer.place?.title ?? payer.name}`,
        `${payer.name} subscreveu ${what} (${plan.label}) por ${plan.price} MT via M-Pesa${live ? "" : " [SIMULADO]"}.\nNúmero: +${msisdn}\nReferência: ${pay.ref}\nPremium até: ${until ? new Date(until).toLocaleDateString("pt-PT") : "-"}\n\nRiendzo`
    );
    if (payer.email) await sendMail({ to: payer.email, subject: payer.place ? `O Premium de ${payer.place.title} está ativo | Riendzo` : "O seu Premium Riendzo está ativo", text: `Olá ${payer.greeting},\n\nRecebemos o seu pagamento de ${plan.price} MT. ${payer.place ? `${payer.place.title} é agora Premium: já recebe e acompanha os pedidos no seu portal (Pedidos).\n\nPremium` : "O Premium"} ${payer.place ? "ativo" : "está ativo"} até ${until ? new Date(until).toLocaleDateString("pt-PT") : "-"}.\n\nObrigado!\nRiendzo` }).catch(() => false);

    revalidatePath("/", "layout");
    return { status: "paid", ref: pay.ref, until: until ?? undefined, message: live ? undefined : "Pagamento simulado (modo de desenvolvimento: nada foi debitado)." };
}

/** "Efetuar Pagamento" in the Premium popup: M-Pesa sends the PIN prompt; once confirmed, Premium is active. */
export async function subscribePremiumAction(_: SubscribeState, fd: FormData): Promise<SubscribeState> {
    const member = await getMember();
    if (!member) return { status: "failed", message: "Inicie sessão para subscrever." };
    return charge({ id: member.id, name: `${member.firstName} ${member.lastName}`.trim(), email: member.email, greeting: member.firstName, activate: (months) => setPremium(member.id, months) }, fd);
}

/** Same steps for an establishment: the owner subscribes for one of their places, which then receives its orders in the portal. */
export async function subscribePlacePremiumAction(_: SubscribeState, fd: FormData): Promise<SubscribeState> {
    const s = await getSession();
    if (!s || s.role !== "owner") return { status: "failed", message: "Inicie sessão no portal do estabelecimento para subscrever." };
    const collection = String(fd.get("collection") ?? "");
    const slug = String(fd.get("slug") ?? "");
    if (!ORDER_KINDS[collection] || !s.ownerOf.some((r) => r.collection === collection && r.slug === slug)) return { status: "failed", message: "Este estabelecimento não está associado à sua conta." };
    const item = await getItem(collection, slug);
    if (!item) return { status: "failed", message: "Estabelecimento não encontrado." };
    const place = { collection, slug, title: titleOf(item) };
    return charge({ id: `owner:${s.userId}`, name: s.name, email: s.email, greeting: s.name, place, activate: (months) => setPlacePremium(collection, slug, months) }, fd);
}
