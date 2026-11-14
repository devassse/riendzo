import { getSession } from "@/lib/cms/auth";
import { listOrdersFor } from "@/lib/orders";
import { setOrderStatusAction } from "../../../order-actions";
import AutoRefresh from "@/app/components/orders/auto-refresh";
import { ACTION_LABEL, MODES, NEXT, STATUS_COLOR, statusLabel, type Order } from "@/lib/order-types";

export const dynamic = "force-dynamic";

const money = (n: number, c: string) => `${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} ${c === "MZN" ? "MT" : c}`;
const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { timeZone: "Africa/Maputo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const date = (d: string) => d.split("-").reverse().join("/");

function Card({ o }: { o: Order }) {
    const next = NEXT[o.status].filter((s) => s !== "declined");
    const canDecline = NEXT[o.status].includes("declined");
    return (
        <li className={`rounded-3xl border bg-white p-5 shadow-sm ${o.status === "sent" ? "border-[#ffc14d]" : "border-[#0b1220]/8"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="font-baloo text-xl font-bold">{o.code} <span className="text-sm font-normal text-[#5b6478]">· {when(o.createdAt)}</span></p>
                    <p className="text-sm">{o.customerName} · <a href={`tel:+${o.phone}`} className="font-medium text-[#0054b5] hover:underline">📞 +{o.phone}</a></p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${o.tier === "premium" ? "bg-[#ffc14d]/40 text-[#6b4700]" : "bg-[#eef2f8] text-[#4b5568]"}`}>{o.tier === "premium" ? "⭐ Premium" : "Conta gratuita"}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[o.status]}`}>{statusLabel(o.status, o.kind)}</span>
                </div>
            </div>

            {o.tier === "free" && o.status !== "declined" && o.status !== "cancelled" && <p className="mt-2 rounded-xl bg-[#fff8e6] px-3 py-1.5 text-xs text-[#6b4700]">Este cliente não vê o progresso: <b>contacte-o por telefone</b> para confirmar.</p>}

            <ul className="mt-3 text-sm">{o.lines.map((l) => <li key={`${l.group}-${l.name}`}>{l.qty > 1 ? `${l.qty}× ` : ""}<b>{l.name}</b>{typeof l.price === "number" && <span className="text-[#4b5568]"> · {money(l.price, o.currency)}{l.priceNote ? ` ${l.priceNote}` : ""}</span>}</li>)}</ul>
            <p className="mt-2 text-sm text-[#3c4658]">
                {o.mode && <b>{MODES[o.mode]}</b>}{o.address ? ` · ${o.address}` : ""}
                {o.from && o.to && <><b>{date(o.from)} → {date(o.to)}</b>{o.guests ? ` · ${o.guests} hóspede(s)` : ""}</>}
                {typeof o.total === "number" && <> · Total <b>{money(o.total, o.currency)}</b></>}
            </p>
            {o.note && <p className="mt-2 rounded-xl bg-[#f3f6fb] px-3 py-2 text-sm">“{o.note}”</p>}
            {o.status === "declined" && o.reason && <p className="mt-2 text-xs text-[#b5311d]">Recusado: {o.reason}</p>}

            {(next.length > 0 || canDecline) && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    {next.map((s) => (
                        <form key={s} action={setOrderStatusAction}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value={s} />
                            <button className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">{ACTION_LABEL[s]?.(o.kind)}</button></form>
                    ))}
                    {canDecline && (
                        <details className="text-sm">
                            <summary className="cursor-pointer list-none text-[#d23b25] hover:underline">Recusar…</summary>
                            <form action={setOrderStatusAction} className="mt-2 flex flex-wrap gap-2"><input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value="declined" />
                                <input name="reason" required minLength={3} maxLength={300} placeholder="Motivo (o cliente vê)" className="min-w-56 flex-1 rounded-xl border border-[#0b1220]/15 px-3 py-2 text-sm" />
                                <button className="cursor-pointer rounded-full border border-[#d23b25] px-4 py-2 text-sm text-[#d23b25] hover:bg-[#fff5f3]">Recusar pedido</button></form>
                        </details>
                    )}
                </div>
            )}
        </li>
    );
}

export default async function OwnerOrders({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
    const s = (await getSession())!;
    const { erro } = await searchParams;
    const all = await listOrdersFor(s.ownerOf);
    const fresh = all.filter((o) => o.status === "sent");
    const running = all.filter((o) => o.status === "processing" || o.status === "ready");
    const past = all.filter((o) => ["done", "declined", "cancelled"].includes(o.status)).slice(0, 20);
    const Section = ({ title, list }: { title: string; list: Order[] }) => list.length ? <section className="mt-6"><h2 className="font-baloo text-xl font-bold">{title} <span className="text-sm font-normal text-[#5b6478]">{list.length}</span></h2><ul className="mt-3 space-y-4">{list.map((o) => <Card key={o.id} o={o} />)}</ul></section> : null;

    return (
        <div>
            <AutoRefresh seconds={10} />
            <h1 className="font-baloo text-3xl font-bold">Pedidos</h1>
            <p className="mt-1 text-sm text-[#4b5568]">Os pedidos e reservas dos clientes chegam aqui. Esta página atualiza-se sozinha.</p>
            {erro && <p role="alert" className="mt-4 rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{erro}</p>}
            {all.length === 0 && <p className="mt-8 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Ainda não recebeu pedidos.</p>}
            <Section title="Novos" list={fresh} />
            <Section title="Em curso" list={running} />
            <Section title="Anteriores" list={past} />
        </div>
    );
}
