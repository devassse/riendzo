import { MODES, NEXT, ACTION_LABEL, STATUS_COLOR, statusLabel, type Order, type OrderKind } from "@/lib/order-types";

const KIND_NAME: Record<OrderKind, string> = { food: "Pedido de comida", lodging: "Reserva de alojamento", car: "Reserva de viatura", tour: "Reserva de passeio/serviço" };

const money = (n: number, c: string) => `${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} ${c === "MZN" ? "MT" : c}`;
const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { timeZone: "Africa/Maputo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const date = (d: string) => d.split("-").reverse().join("/");

/** One order with the buttons to move it forward. `action` = owner or Riendzo team server action. */
export default function OrderCard({ o, action, back, showPlace = false, placeContact }: { o: Order; action: (fd: FormData) => Promise<void>; back?: string; showPlace?: boolean; /** Riendzo team: how to reach the establishment that has no account */ placeContact?: { phone?: string; email?: string; whatsapp?: string } }) {
    const next = NEXT[o.status].filter((s) => s !== "declined");
    const canDecline = NEXT[o.status].includes("declined");
    return (
        <li className={`rounded-3xl border bg-white p-5 shadow-sm ${o.status === "sent" ? "border-[#ffc14d]" : "border-[#0b1220]/8"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="font-baloo text-xl font-bold">{o.code} <span className="text-sm font-normal text-[#5b6478]">· {when(o.createdAt)}</span></p>
                    {showPlace && <p className="text-sm font-medium text-[#0b1220]">{o.place} <span className="font-normal text-[#5b6478]">· {KIND_NAME[o.kind]}</span></p>}
                    <p className="text-sm">{o.customerName} · <a href={`tel:+${o.phone}`} className="font-medium text-[#0054b5] hover:underline">📞 +{o.phone}</a></p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${o.tier === "premium" ? "bg-[#ffc14d]/40 text-[#6b4700]" : "bg-[#eef2f8] text-[#4b5568]"}`}>{o.tier === "premium" ? "⭐ Premium" : "Conta gratuita"}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[o.status]}`}>{statusLabel(o.status, o.kind)}</span>
                </div>
            </div>

            {o.viaRiendzo && o.status !== "declined" && o.status !== "cancelled" && o.status !== "done" && (
                <p className="mt-2 rounded-xl bg-[#f3f8ff] px-3 py-2 text-xs text-[#0b4a99]">
                    <b>Sem conta na Riendzo:</b> encaminhe este pedido ao estabelecimento e atualize o estado aqui.
                    {placeContact?.phone && <> · <a href={`tel:${placeContact.phone.replace(/[^\d+]/g, "")}`} className="font-medium underline">📞 {placeContact.phone}</a></>}
                    {placeContact?.whatsapp && <> · <a href={`https://wa.me/${placeContact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-medium underline">WhatsApp</a></>}
                    {placeContact?.email && <> · <a href={`mailto:${placeContact.email}`} className="font-medium underline">✉️ {placeContact.email}</a></>}
                    {!placeContact?.phone && !placeContact?.email && !placeContact?.whatsapp && <> · O estabelecimento não tem contactos registados.</>}
                </p>
            )}
            {o.tier === "free" && o.status !== "declined" && o.status !== "cancelled" && <p className="mt-2 rounded-xl bg-[#fff8e6] px-3 py-1.5 text-xs text-[#6b4700]">Este cliente não vê o progresso: <b>contacte-o por telefone</b> para confirmar.</p>}

            <ul className="mt-3 text-sm">{o.lines.map((l) => <li key={`${l.group}-${l.name}`}>{l.qty > 1 ? `${l.qty}× ` : ""}<b>{l.name}</b>{typeof l.price === "number" && <span className="text-[#4b5568]"> · {money(l.price, o.currency)}{l.priceNote ? ` ${l.priceNote}` : ""}</span>}</li>)}</ul>
            <p className="mt-2 text-sm text-[#3c4658]">
                {o.mode && <b>{MODES[o.mode]}</b>}{o.address ? ` · ${o.address}` : ""}
                {o.from && <><b>{date(o.from)}{o.to ? ` → ${date(o.to)}` : ""}</b>{o.guests ? ` · ${o.guests} ${o.kind === "tour" ? "pessoa(s)" : "hóspede(s)"}` : ""}</>}
                {typeof o.total === "number" && <> · Total <b>{money(o.total, o.currency)}</b></>}
            </p>
            {o.note && <p className="mt-2 rounded-xl bg-[#f3f6fb] px-3 py-2 text-sm">“{o.note}”</p>}
            {o.status === "declined" && o.reason && <p className="mt-2 text-xs text-[#b5311d]">Recusado: {o.reason}</p>}

            {(next.length > 0 || canDecline) && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    {next.map((s) => (
                        <form key={s} action={action}><input type="hidden" name="id" value={o.id} />{back && <input type="hidden" name="back" value={back} />}<input type="hidden" name="to" value={s} />
                            <button className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">{ACTION_LABEL[s]?.(o.kind)}</button></form>
                    ))}
                    {canDecline && (
                        <details className="text-sm">
                            <summary className="cursor-pointer list-none text-[#d23b25] hover:underline">Recusar…</summary>
                            <form action={action} className="mt-2 flex flex-wrap gap-2"><input type="hidden" name="id" value={o.id} />{back && <input type="hidden" name="back" value={back} />}<input type="hidden" name="to" value="declined" />
                                <input name="reason" required minLength={3} maxLength={300} placeholder="Motivo (o cliente vê)" className="min-w-56 flex-1 rounded-xl border border-[#0b1220]/15 px-3 py-2 text-sm" />
                                <button className="cursor-pointer rounded-full border border-[#d23b25] px-4 py-2 text-sm text-[#d23b25] hover:bg-[#fff5f3]">Recusar pedido</button></form>
                        </details>
                    )}
                </div>
            )}
        </li>
    );
}

