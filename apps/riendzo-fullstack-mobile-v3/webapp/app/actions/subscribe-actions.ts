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
import { createSubPayment, hasRecentPending, pendingRequestOf, subjectOf, updateSubPayment } from "@/lib/subscriptions";
import { manualAccount } from "@/lib/manual-mpesa";

export type SubscribeState = {
    status?: "paid" | "failed" | "unknown";
    message?: string;
    ref?: string;
    until?: string;
    /** "inactive": o pagamento automático não está ativo; o popup oferece a transferência manual */
    code?: "inactive";
    /** número/nome para a transferência manual (aparece depois de o pagamento automático falhar) */
    manual?: { phone: string; name: string };
};

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
    if (await pendingRequestOf(subjectOf({ memberId: payer.id, place: payer.place }))) return { status: "failed", message: "Já tem um pedido de Premium a aguardar aprovação. Assim que o aprovarmos, o Premium fica ativo." };

    // Sem credenciais M-Pesa o pagamento automático não existe (nem em desenvolvimento): vai direto para a transferência manual.
    // Nada é cobrado nem ativado aqui; o Premium só fica ativo quando o administrador aprovar o pedido.
    if (!mpesaConfigured()) {
        const manual = manualAccount("subscribe");
        return { status: "failed", code: "inactive", manual, message: manual ? "O pagamento automático ainda não está ativo. Faça a transferência M-Pesa abaixo e o Premium é ativado depois da aprovação." : "Os pagamentos ainda não estão ativos. Fale connosco para ativar o Premium." };
    }

    const what = payer.place ? `o Premium de ${payer.place.title}` : "o Premium";
    const pay = await createSubPayment({ memberId: payer.id, memberName: payer.name, place: payer.place, planId: plan.id, months: plan.months, amount: plan.price, msisdn, email: payer.email });

    let ok = false;
    let fail: { unknown?: boolean; message: string; code?: string; desc?: string } | null = null;
    let tx: { code?: string; desc?: string; transactionId?: string } = {};
    const r = await c2bPayment({ amount: plan.price, msisdn, reference: "PREMIUM", thirdParty: pay.ref });
    if (r.ok) { ok = true; tx = { code: r.code, desc: r.desc, transactionId: r.transactionId }; }
    else fail = { unknown: r.unknown, message: r.error, code: r.code, desc: r.desc };

    if (!ok) {
        await updateSubPayment(pay.id, { status: fail!.unknown ? "unknown" : "failed", providerCode: fail!.code, providerDesc: fail!.desc ?? fail!.message });
        if (fail!.unknown) {
            await notifyAdmins(`Subscrição Premium por confirmar (${pay.ref})`, `${payer.name} tentou pagar ${plan.price} MT (${plan.label}) por M-Pesa para ${what}, mas não recebemos a confirmação.\nReferência: ${pay.ref}\nConfirme no extrato M-Pesa e, se o valor foi recebido, ative o Premium em Administrador → Subscrições.\n\nRiendzo`);
            return { status: "unknown", ref: pay.ref, manual: manualAccount("subscribe"), message: `${fail!.message} Se já confirmou o PIN e o valor foi debitado, não envie de novo: contacte-nos com a referência ${pay.ref} e ativamos ${what}.` };
        }
        // O automático falhou: abre-se o mesmo painel da doação, com o número para transferir manualmente
        return { status: "failed", ref: pay.ref, manual: manualAccount("subscribe"), message: fail!.message };
    }

    // Paid: Premium on (adds the months to the end date if it is still active)
    const until = await payer.activate(plan.months);
    await updateSubPayment(pay.id, { status: "paid", providerCode: tx.code, providerDesc: tx.desc, transactionId: tx.transactionId, premiumUntil: until ?? undefined });
    await store.logActivity({ user: payer.name, action: payer.place ? `Subscreveu o Premium de ${payer.place.title}` : "Subscreveu o Premium", title: `${plan.label} · ${plan.price} MT` });
    await notifyAdmins(
        `Nova subscrição Premium: ${payer.place?.title ?? payer.name}`,
        `${payer.name} subscreveu ${what} (${plan.label}) por ${plan.price} MT via M-Pesa.\nNúmero: +${msisdn}\nReferência: ${pay.ref}\nPremium até: ${until ? new Date(until).toLocaleDateString("pt-PT") : "-"}\n\nRiendzo`
    );
    if (payer.email) await sendMail({ to: payer.email, subject: payer.place ? `O Premium de ${payer.place.title} está ativo | Riendzo` : "O seu Premium Riendzo está ativo", text: `Olá ${payer.greeting},\n\nRecebemos o seu pagamento de ${plan.price} MT. ${payer.place ? `${payer.place.title} é agora Premium: já recebe e acompanha os pedidos no seu portal (Pedidos).\n\nPremium` : "O Premium"} ${payer.place ? "ativo" : "está ativo"} até ${until ? new Date(until).toLocaleDateString("pt-PT") : "-"}.\n\nObrigado!\nRiendzo` }).catch(() => false);

    revalidatePath("/", "layout");
    return { status: "paid", ref: pay.ref, until: until ?? undefined };
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

/* --------------------- Transferência manual (aprovação do administrador) --------------------- */

export type ManualRequestResult = { ok: true; ref: string; amount: number; label: string } | { ok: false; message: string };

/**
 * "Já enviei": o cliente diz que enviou o valor por M-Pesa para o nosso número. Fica com o estado "pending"
 * e o Premium só é ativado quando o administrador aprovar (Administrador → Premium · Utilizadores / Estabelecimentos).
 * Para um estabelecimento, `collection` e `slug` vêm preenchidos; sem eles é o Premium do próprio membro.
 */
export async function requestManualPremiumAction(input: { plan: string; collection?: string; slug?: string; sender?: string }): Promise<ManualRequestResult> {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const key = `subscribe-manual:${ip}`;
    if (isLockedOut(key)) return { ok: false, message: "Demasiadas tentativas. Tente novamente dentro de 15 minutos." };
    registerFailure(key);

    if (!manualAccount("subscribe")) return { ok: false, message: "Esta opção não está disponível de momento. Fale connosco para ativar o Premium." };
    // O preço vem sempre da lista de planos do servidor, nunca do browser
    const plan = planById(input.plan);
    if (!plan) return { ok: false, message: "Escolha um plano." };

    let sender = String(input.sender ?? "").replace(/\D/g, "");
    if (/^8\d{8}$/.test(sender)) sender = `258${sender}`;
    if (sender && !/^258(84|85)\d{7}$/.test(sender)) return { ok: false, message: "O número de onde enviou é inválido. Use um número Vodacom (84 ou 85) ou deixe em branco." };

    let payerId: string;
    let name: string;
    let email: string | undefined;
    let place: { collection: string; slug: string; title: string } | undefined;
    if (input.collection || input.slug) {
        const s = await getSession();
        if (!s || s.role !== "owner") return { ok: false, message: "Inicie sessão no portal do estabelecimento para subscrever." };
        const collection = String(input.collection ?? "");
        const slug = String(input.slug ?? "");
        if (!ORDER_KINDS[collection] || !s.ownerOf.some((r) => r.collection === collection && r.slug === slug)) return { ok: false, message: "Este estabelecimento não está associado à sua conta." };
        const item = await getItem(collection, slug);
        if (!item) return { ok: false, message: "Estabelecimento não encontrado." };
        place = { collection, slug, title: titleOf(item) };
        payerId = `owner:${s.userId}`; name = s.name; email = s.email;
    } else {
        const m = await getMember();
        if (!m) return { ok: false, message: "Inicie sessão para subscrever." };
        payerId = m.id; name = `${m.firstName} ${m.lastName}`.trim(); email = m.email;
    }

    if (await pendingRequestOf(subjectOf({ memberId: payerId, place }))) return { ok: false, message: "Já tem um pedido de Premium a aguardar aprovação. Assim que o aprovarmos, o Premium fica ativo." };

    const pay = await createSubPayment({
        memberId: payerId, memberName: name, place, planId: plan.id, months: plan.months, amount: plan.price,
        msisdn: sender, manual: true, email, status: "pending",
    });
    await updateSubPayment(pay.id, { providerDesc: "Transferência manual: confirmar no extrato M-Pesa e aprovar" });
    await store.logActivity({ user: name, action: place ? `Pediu o Premium de ${place.title} (por aprovar)` : "Pediu o Premium (por aprovar)", title: `${plan.label} · ${plan.price} MT` });
    await notifyAdmins(
        `Pedido de Premium por aprovar: ${place?.title ?? name}`,
        `${name} pediu ${place ? `o Premium de ${place.title}` : "o Premium"} (${plan.label}, ${plan.price} MT) por transferência manual M-Pesa.\n${sender ? `Enviado do número: +${sender}\n` : ""}Referência: ${pay.ref}\n\nConfirme o valor no extrato M-Pesa e aprove em Administrador → ${place ? "Premium · Estabelecimentos" : "Premium · Utilizadores"}.\n\nRiendzo`,
    );
    if (email) {
        await sendMail({ to: email, subject: "Recebemos o seu pedido de Premium | Riendzo", text: `Olá ${name},\n\nRecebemos o seu pedido de ${place ? `Premium para ${place.title}` : "Premium"} (${plan.label}, ${plan.price} MT). Vamos confirmar a transferência M-Pesa e aprovar o pedido em breve: só então o Premium fica ativo e recebe um novo e-mail.\n\nReferência: ${pay.ref}\n\nObrigado!\nRiendzo` }).catch(() => false);
    }
    revalidatePath("/", "layout");
    return { ok: true, ref: pay.ref, amount: plan.price, label: plan.label };
}
