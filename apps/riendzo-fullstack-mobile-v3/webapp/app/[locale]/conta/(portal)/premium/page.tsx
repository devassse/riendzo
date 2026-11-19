import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import { isPremium } from "@/lib/members";
import { FREE_ORDER_LIMIT } from "@/lib/order-types";
import SubscribeDialog from "@/app/components/premium/subscribe-dialog";
import { PREMIUM_PLANS } from "@/lib/premium-plans";
import { pendingRequestOf, subjectOf } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

const PERKS = [
    ["🍽️", "Pedidos sem limite nos restaurantes", `Sem o limite de ${FREE_ORDER_LIMIT} pedidos da conta gratuita.`],
    ["🛏️", "Reservas de alojamento, viaturas e passeios", "Peça quartos, rent-a-car e passeios com guias diretamente no site ou no seu portal."],
    ["📡", "Progresso em tempo real", "Enviado → Em processamento → Pronto → Concluído, sem recarregar a página."],
    ["🔔", "Notificações", "Aviso no portal e por e-mail quando o estabelecimento recebe ou responde ao seu pedido."],
];

export default async function Premium() {
    const m = await requireMember("/conta/premium");
    const on = isPremium(m);
    // Pedido por transferência manual ainda por aprovar: o Premium só fica ativo depois de o administrador o aprovar
    const pending = await pendingRequestOf(subjectOf({ memberId: m.id }));
    return (
        <div className="mx-auto max-w-3xl">
            <section className="rounded-3xl bg-gradient-to-r from-[#00306e] via-[#0054b5] to-[#0370d6] px-7 py-9 text-white shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/80">Riendzo</p>
                <h1 className="mt-1 font-baloo text-4xl font-bold">⭐ Premium</h1>
                <p className="mt-2 max-w-xl text-white/90">Peça, reserve e acompanhe tudo num só sítio.</p>
                {on && <p className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm">Ativo até {new Date(m.premiumUntil!).toLocaleDateString("pt-PT")}</p>}
                {pending && <p className="mt-4 ml-2 inline-block rounded-full bg-[#ffc14d] px-4 py-1.5 text-sm font-medium text-[#5a3b00]">⏳ Pedido pendente de aprovação</p>}
                {!on && !pending && m.premiumUntil && <p className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm">Expirou em {new Date(m.premiumUntil).toLocaleDateString("pt-PT")}: a conta voltou a ser gratuita</p>}
            </section>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {PERKS.map(([e, t, d]) => (
                    <li key={t} className="rounded-2xl border border-[#0b1220]/8 bg-white p-4 shadow-sm">
                        <span className="text-2xl" aria-hidden="true">{e}</span>
                        <p className="mt-1 font-baloo font-medium">{t}</p>
                        <p className="text-sm text-[#4b5568]">{d}</p>
                    </li>
                ))}
            </ul>

            <section className="mt-6 rounded-3xl border border-[#0b1220]/8 bg-white p-6 text-center shadow-sm">
                <h2 className="font-baloo text-xl font-bold">{on ? "Renovar o Premium" : "Torne-se Premium"}</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-[#4b5568]">A partir de <b>{Math.min(...PREMIUM_PLANS.map((p) => Math.round(p.price / p.months))).toLocaleString("pt-PT")} MT por mês</b>. Pague com M-Pesa: se o pagamento automático não estiver disponível, envie o valor por transferência e o Premium fica ativo assim que o pedido for aprovado.</p>
                {pending ? (
                    <p className="mx-auto mt-4 max-w-md rounded-2xl bg-[#ffc14d]/25 px-4 py-3 text-sm text-[#6b4700]">⏳ O seu pedido <b>({pending.months} {pending.months === 1 ? "mês" : "meses"} · {pending.amount.toLocaleString("pt-PT")} MT · ref. {pending.ref})</b> está pendente. Vamos confirmar a transferência e aprovar em breve; receberá um e-mail.</p>
                ) : (
                    <div className="mt-4"><SubscribeDialog phone={m.phone} renew={on} /></div>
                )}
                <p className="mt-4 text-xs text-[#5b6478]">Precisa de ajuda ou prefere outra forma de pagamento? <Link href="/contactos" className="font-medium text-[#0054b5] underline">Fale connosco</Link>.</p>
            </section>
        </div>
    );
}
