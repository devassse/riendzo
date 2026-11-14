import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import { isPremium } from "@/lib/members";
import { FREE_ORDER_LIMIT } from "@/lib/order-types";

export const dynamic = "force-dynamic";

const PERKS = [
    ["🍽️", "Pedidos sem limite nos restaurantes", `Sem o limite de ${FREE_ORDER_LIMIT} pedidos da conta gratuita.`],
    ["🛏️", "Reservas de alojamento e viaturas", "Peça quartos e rent-a-car diretamente no seu portal."],
    ["📡", "Progresso em tempo real", "Enviado → Em processamento → Pronto → Concluído, sem recarregar a página."],
    ["🔔", "Notificações", "Aviso no portal e por e-mail quando o estabelecimento recebe ou responde ao seu pedido."],
];

export default async function Premium() {
    const m = await requireMember("/conta/premium");
    const on = isPremium(m);
    return (
        <div className="mx-auto max-w-3xl">
            <section className="rounded-3xl bg-gradient-to-r from-[#00306e] via-[#0054b5] to-[#0370d6] px-7 py-9 text-white shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/80">Riendzo</p>
                <h1 className="mt-1 font-baloo text-4xl font-bold">⭐ Premium</h1>
                <p className="mt-2 max-w-xl text-white/90">Peça, reserve e acompanhe tudo num só sítio.</p>
                {on && <p className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm">Ativo até {new Date(m.premiumUntil!).toLocaleDateString("pt-PT")}</p>}
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

            <section className="mt-6 rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
                <h2 className="font-baloo text-xl font-bold">{on ? "Renovar" : "Como subscrever"}</h2>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[#3c4658]">
                    <li>Fale connosco em <Link href="/contactos" className="font-medium text-[#0054b5] underline">Contactos</Link> e indique o e-mail da sua conta: <b>{m.email ?? `+${m.phone}`}</b>.</li>
                    <li>Efetue o pagamento da subscrição (M-Pesa, e-Mola ou mKesh) segundo as instruções que lhe enviarmos.</li>
                    <li>Depois de confirmarmos o pagamento ativamos o Premium na sua conta, com a data de validade.</li>
                </ol>
            </section>
        </div>
    );
}
