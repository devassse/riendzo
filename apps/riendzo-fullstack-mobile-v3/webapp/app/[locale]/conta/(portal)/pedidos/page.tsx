import { Link } from "@/i18n/navigation";
import { requireMember, } from "@/app/actions/member-actions";
import { cancelOrderAction } from "@/app/actions/order-actions";
import AutoRefresh from "@/app/components/orders/auto-refresh";
import { isPremium } from "@/lib/members";
import { freeOrdersUsed, listOrdersOf } from "@/lib/orders";
import { ACTIVE, FREE_ORDER_LIMIT, MODES, STATUS_COLOR, STEPS, statusLabel, type Order } from "@/lib/order-types";
import { portalUrlOf } from "@/lib/cms/collections";

export const dynamic = "force-dynamic";

const money = (n: number, c: string) => `${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} ${c === "MZN" ? "MT" : c}`;
const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { timeZone: "Africa/Maputo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Live progress (Premium only): the four steps with the time each was reached. */
function Progress({ o }: { o: Order }) {
    const at = (s: string) => o.history.find((h) => h.status === s)?.at;
    const cur = STEPS.indexOf(o.status);
    return (
        <ol className="mt-4 grid grid-cols-4 gap-1" aria-label="Progresso do pedido">
            {STEPS.map((s, i) => (
                <li key={s} className="text-center">
                    <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= cur ? "bg-[#0054b5] text-white" : "bg-[#eef2f8] text-[#8a94a6]"} ${i === cur && o.status !== "done" ? "ring-4 ring-[#0054b5]/20" : ""}`}>{i < cur || o.status === "done" ? "✓" : i + 1}</span>
                    <span className={`mt-1 block text-[11px] leading-tight ${i <= cur ? "font-medium text-[#0b1220]" : "text-[#8a94a6]"}`}>{statusLabel(s, o.kind)}</span>
                    {at(s) && <span className="block text-[10px] text-[#5b6478]">{when(at(s)!)}</span>}
                </li>
            ))}
        </ol>
    );
}

export default async function MyOrders({ searchParams }: { searchParams: Promise<{ novo?: string; direto?: string }> }) {
    const m = await requireMember("/conta/pedidos");
    const { novo, direto } = await searchParams;
    const premium = isPremium(m);
    const orders = await listOrdersOf(m.id);
    const live = premium && orders.some((o) => ACTIVE.includes(o.status));
    const used = premium ? 0 : await freeOrdersUsed(m.id);

    return (
        <div className="mx-auto max-w-4xl">
            {live && <AutoRefresh seconds={10} />}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-baloo text-3xl font-bold">Os meus pedidos</h1>
                    <p className="mt-1 text-sm text-[#4b5568]">{premium ? "Acompanhe cada pedido em tempo real." : "O restaurante contacta-o por telefone para confirmar."}</p>
                </div>
                {premium ? <span className="rounded-full bg-[#ffc14d]/40 px-3 py-1 text-xs font-medium text-[#6b4700]">⭐ Premium</span>
                    : <Link href="/conta/premium" className="rounded-full border border-[#0054b5] px-4 py-2 text-sm font-medium text-[#0054b5] hover:bg-white">Subscrever Premium</Link>}
            </div>

            {novo && <p role="status" className="mt-4 rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">Pedido <b>#{novo}</b> enviado! {direto ? "Este estabelecimento não é Premium: o pedido foi enviado para o telefone e e-mail dele e não verá o progresso aqui. Aguarde o contacto." : premium ? "Vai ver aqui quando o estabelecimento o receber." : "O estabelecimento vai contactá-lo por telefone."}</p>}

            {!premium && (
                <p className="mt-4 rounded-2xl bg-[#f3f8ff] px-4 py-3 text-sm text-[#0b4a99]">
                    Conta gratuita: usou <b>{Math.min(used, FREE_ORDER_LIMIT)} de {FREE_ORDER_LIMIT}</b> pedidos. Com o Premium acompanha o progresso em tempo real, recebe notificações e pode reservar alojamentos, viaturas e passeios.
                </p>
            )}

            {orders.length === 0 ? (
                <p className="mt-6 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Ainda não fez pedidos. Abra a página de um restaurante, alojamento, rent-a-car ou guia turístico e escolha o que quer.</p>
            ) : (
                <ul className="mt-6 space-y-4">
                    {orders.map((o) => (
                        <li key={o.id} className="rounded-3xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <Link href={portalUrlOf(o.collection, o.slug)} className="font-baloo text-xl font-bold hover:underline">{o.place}</Link>
                                    <p className="text-xs text-[#5b6478]">{o.code} · {when(o.createdAt)}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[o.status]}`}>{statusLabel(o.status, o.kind)}</span>
                            </div>

                            <ul className="mt-3 text-sm">
                                {o.lines.map((l) => <li key={`${l.group}-${l.name}`}>{l.qty > 1 ? `${l.qty}× ` : ""}{l.name}</li>)}
                            </ul>
                            <p className="mt-2 text-xs text-[#4b5568]">
                                {o.mode && MODES[o.mode]}{o.address ? ` · ${o.address}` : ""}{o.from ? `${o.from.split("-").reverse().join("/")}${o.to ? ` → ${o.to.split("-").reverse().join("/")}` : ""}${o.guests ? ` · ${o.guests} ${o.kind === "tour" ? "pessoa(s)" : "hóspede(s)"}` : ""}` : ""}
                                {typeof o.total === "number" && <> · Total {money(o.total, o.currency)}</>}
                            </p>

                            {premium && !o.direct && STEPS.includes(o.status) && <Progress o={o} />}
                            {o.direct && o.status !== "cancelled" && <p className="mt-3 rounded-xl bg-[#fff8e6] px-3 py-2 text-xs text-[#6b4700]">Estabelecimento não Premium: o pedido foi enviado para o contacto dele e não tem acompanhamento aqui. Se ainda não o contactaram, ligue para confirmar.</p>}
                            {o.status === "declined" && o.reason && <p className="mt-3 rounded-xl bg-[#fff5f3] px-3 py-2 text-sm text-[#7a2515]">Motivo: {o.reason}</p>}
                            {!premium && o.status === "sent" && <p className="mt-3 text-xs text-[#5b6478]">Aguarde o contacto do estabelecimento no {o.phone.startsWith("258") ? `+${o.phone}` : o.phone}.</p>}

                            {o.status === "sent" && (
                                <form action={cancelOrderAction} className="mt-3"><input type="hidden" name="id" value={o.id} />
                                    <button className="cursor-pointer text-xs text-[#d23b25] hover:underline">Cancelar pedido</button></form>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
