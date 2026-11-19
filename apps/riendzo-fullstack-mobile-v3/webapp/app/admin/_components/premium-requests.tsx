import { approveSubscriptionAction, rejectSubscriptionAction } from "../actions";
import ConfirmButton from "./confirm-button";
import type { SubPayment } from "@/lib/subscriptions";

/** Pedidos de Premium por transferência manual à espera de aprovação (partilhado pelas duas listas). */
export default function PendingRequests({ items, kind }: { items: SubPayment[]; kind: "member" | "place" }) {
    return (
        <section className="mb-8">
            <h2 className="font-baloo text-xl font-bold">⏳ Pedidos por aprovar <span className="ml-1 rounded-full bg-[#ffc14d]/40 px-2.5 py-0.5 text-sm text-[#7a5200]">{items.length}</span></h2>
            <p className="mb-3 mt-1 text-sm text-[#4b5568]">Confirme o valor no extrato M-Pesa (pela referência, valor ou número) e aprove. O Premium só fica ativo depois da aprovação.</p>
            {items.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-6 text-center text-sm text-[#5b6478]">Não há pedidos pendentes.</p>
            ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                    {items.map((p) => (
                        <li key={p.id} className="rounded-3xl border border-[#ffc14d]/60 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-baloo text-lg font-bold">{kind === "place" ? p.place?.title : p.memberName}</p>
                                    <p className="text-xs text-[#5b6478]">{kind === "place" ? `Pedido por ${p.memberName}` : p.email ?? ""}</p>
                                </div>
                                <span className="rounded-full bg-[#ffc14d]/30 px-2.5 py-0.5 text-xs text-[#7a5200]">Pending</span>
                            </div>
                            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                <dt className="text-[#5b6478]">Plano</dt><dd>{p.months} {p.months === 1 ? "mês" : "meses"}</dd>
                                <dt className="text-[#5b6478]">Valor</dt><dd className="font-medium">{p.amount.toLocaleString("pt-PT")} MT</dd>
                                <dt className="text-[#5b6478]">Enviado de</dt><dd>{p.msisdn ? `+${p.msisdn}` : "—"}</dd>
                                <dt className="text-[#5b6478]">Referência</dt><dd className="font-mono text-xs">{p.ref}</dd>
                                <dt className="text-[#5b6478]">Pedido em</dt><dd>{new Date(p.createdAt).toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })}</dd>
                            </dl>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <form action={approveSubscriptionAction}><input type="hidden" name="id" value={p.id} />
                                    <ConfirmButton message={`Confirma que recebeu ${p.amount} MT? O Premium de ${kind === "place" ? p.place?.title : p.memberName} fica ativo por ${p.months} ${p.months === 1 ? "mês" : "meses"}.`} className="cursor-pointer rounded-full bg-[#238a0c] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">Aprovar</ConfirmButton>
                                </form>
                                <form action={rejectSubscriptionAction} className="flex flex-wrap items-center gap-1.5"><input type="hidden" name="id" value={p.id} />
                                    <input name="reason" placeholder="Motivo (opcional)" maxLength={300} aria-label="Motivo da recusa" className="w-40 rounded-full border border-[#0b1220]/15 px-3 py-1.5 text-xs" />
                                    <ConfirmButton message="Recusar este pedido? O cliente é avisado por e-mail." className="cursor-pointer rounded-full border border-[#d23b25]/50 px-3 py-1.5 text-sm text-[#d23b25] hover:bg-[#fff5f3]">Recusar</ConfirmButton>
                                </form>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
