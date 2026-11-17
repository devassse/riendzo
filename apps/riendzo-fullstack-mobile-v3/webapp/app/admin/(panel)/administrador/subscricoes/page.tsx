import { requireAdmin } from "@/lib/cms/auth";
import { isPremium, listMembers } from "@/lib/members";
import { listSubPayments, markSubscriptionsSeen, type SubStatus } from "@/lib/subscriptions";
import { allPlacePremium } from "@/lib/place-premium";
import { cancelPlacePremiumAction, cancelPremiumAction, setPlacePremiumAction, setPremiumAction } from "../../../actions";
import ConfirmButton from "../../../_components/confirm-button";
import { Pager, SearchBox, matches, one, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

const LABEL: Record<SubStatus, [string, string]> = {
    paid: ["Pago", "bg-[#35be12]/15 text-[#238a0c]"],
    pending: ["A aguardar", "bg-[#ffc14d]/30 text-[#7a5200]"],
    failed: ["Falhou", "bg-[#d23b25]/12 text-[#b5311d]"],
    unknown: ["Por confirmar", "bg-[#0370d6]/12 text-[#0b4a99]"],
};

export default async function Subscriptions({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; estado?: string | string[] }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page, estado: rawEstado } = await searchParams;
    const estado = one(rawEstado);
    const everything = await listSubPayments();
    await markSubscriptionsSeen(); // opening the list clears the "new subscriptions" notification
    const members = new Map((await listMembers()).map((m) => [m.id, m]));
    const placeUntil = await allPlacePremium();
    const paid = everything.filter((p) => p.status === "paid" && !p.simulated);
    const total = paid.reduce((n, p) => n + p.amount, 0);
    const unknown = everything.filter((p) => p.status === "unknown").length;
    const all = everything
        .filter((p) => (estado ? p.status === estado : true))
        .filter((p) => matches(q, p.memberName, p.msisdn, p.ref, p.transactionId, members.get(p.memberId)?.email));
    const pg = paginate(all, page);
    // the cancel button is shown once per member: on their most recent payment
    // (an establishment is its own subject: one button per place, not per owner)
    const subject = (p: (typeof everything)[number]) => (p.place ? `${p.place.collection}/${p.place.slug}` : p.memberId);
    const latest = new Set<string>();
    const firstOf = new Map<string, string>();
    for (const p of everything) if (!firstOf.has(subject(p))) { firstOf.set(subject(p), p.id); latest.add(p.id); }
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Subscrições Premium</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">{paid.length} subscrições pagas · <b>{total.toLocaleString("pt-PT")} MT</b> recebidos. O Premium é ativado automaticamente quando o M-Pesa confirma.{unknown > 0 && <> <b className="text-[#0b4a99]">{unknown} por confirmar</b>: confirme no extrato M-Pesa pela referência e, se recebeu, ative em Membros.</>}</p>
            <SearchBox q={q} placeholder="Pesquisar por membro, número ou referência" >
                <select name="estado" defaultValue={estado} aria-label="Estado" className="rounded-full border border-[#0b1220]/15 bg-white px-3 py-2.5 text-sm">
                    <option value="">Todos os estados</option>
                    {(Object.keys(LABEL) as SubStatus[]).map((k) => <option key={k} value={k}>{LABEL[k][0]}</option>)}
                </select>
            </SearchBox>
            <div className="overflow-x-auto rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f3f6fb] text-xs uppercase tracking-wide text-[#5b6478]"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Membro / Estabelecimento</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Número</th><th className="px-4 py-3">Referência</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Premium</th></tr></thead>
                    <tbody>
                        {pg.items.map((p) => {
                            const m = members.get(p.memberId);
                            const active = m ? isPremium(m) : false;
                            return (
                                <tr key={p.id} className="border-t border-[#0b1220]/8 align-top">
                                    <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })}</td>
                                    <td className="px-4 py-3">{p.place ? <><b>{p.place.title}</b><span className="block text-xs text-[#5b6478]">Estabelecimento · pago por {p.memberName}</span></> : <>{p.memberName}{m?.email && <span className="block text-xs text-[#5b6478]">{m.email}</span>}</>}</td>
                                    <td className="px-4 py-3">{p.months} {p.months === 1 ? "mês" : "meses"}</td>
                                    <td className="px-4 py-3 font-medium">{p.amount.toLocaleString("pt-PT")} MT</td>
                                    <td className="px-4 py-3">+{p.msisdn}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{p.ref}{p.transactionId ? ` · ${p.transactionId}` : ""}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs ${LABEL[p.status][1]}`}>{LABEL[p.status][0]}</span>{p.simulated && <span className="ml-1 text-[10px] text-[#8a5a00]">simulado</span>}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {p.place ? (() => {
                                            const until = placeUntil[`${p.place.collection}/${p.place.slug}`];
                                            const on = Boolean(until && new Date(until).getTime() > Date.now());
                                            return (
                                                <>
                                                    {on ? <span className="rounded-full bg-[#ffc14d]/40 px-2 py-0.5 text-[#6b4700]">⭐ até {new Date(until!).toLocaleDateString("pt-PT")}</span> : <span className="text-[#5b6478]">Sem Premium</span>}
                                                    {latest.has(p.id) && (
                                                        <form action={setPlacePremiumAction} className="mt-1.5 flex flex-wrap items-center gap-1.5"><input type="hidden" name="collection" value={p.place.collection} /><input type="hidden" name="slug" value={p.place.slug} />
                                                            <select name="months" defaultValue={String(p.months)} aria-label="Meses" className="rounded-lg border border-[#0b1220]/15 px-1.5 py-1 text-xs"><option value="1">+1 mês</option><option value="3">+3 meses</option><option value="6">+6 meses</option><option value="12">+12 meses</option></select>
                                                            <button className="cursor-pointer rounded-full border border-[#0054b5]/50 px-2.5 py-0.5 text-[#0054b5] hover:bg-[#f3f8ff]">{on ? "Prolongar" : "Definir como Premium"}</button>
                                                        </form>
                                                    )}
                                                    {on && latest.has(p.id) && (
                                                        <form action={cancelPlacePremiumAction} className="mt-1.5"><input type="hidden" name="collection" value={p.place.collection} /><input type="hidden" name="slug" value={p.place.slug} />
                                                            <ConfirmButton message={`Cancelar o Premium de ${p.place.title}? Os novos pedidos passam a ir para o telefone e e-mail do estabelecimento.`} className="cursor-pointer rounded-full border border-[#d23b25]/50 px-2.5 py-0.5 text-[#d23b25] hover:bg-[#fff5f3]">Cancelar Premium</ConfirmButton>
                                                        </form>
                                                    )}
                                                </>
                                            );
                                        })() : (<>
                                        {active ? <span className="rounded-full bg-[#ffc14d]/40 px-2 py-0.5 text-[#6b4700]">⭐ até {new Date(m!.premiumUntil!).toLocaleDateString("pt-PT")}</span> : <span className="text-[#5b6478]">{m ? "Sem Premium" : "Conta eliminada"}</span>}
                                        {m && latest.has(p.id) && (
                                            <form action={setPremiumAction} className="mt-1.5 flex flex-wrap items-center gap-1.5"><input type="hidden" name="id" value={p.memberId} />
                                                <select name="months" defaultValue={String(p.months)} aria-label="Meses" className="rounded-lg border border-[#0b1220]/15 px-1.5 py-1 text-xs"><option value="1">+1 mês</option><option value="3">+3 meses</option><option value="6">+6 meses</option><option value="12">+12 meses</option></select>
                                                <button className="cursor-pointer rounded-full border border-[#0054b5]/50 px-2.5 py-0.5 text-[#0054b5] hover:bg-[#f3f8ff]">{active ? "Prolongar" : "Definir como Premium"}</button>
                                            </form>
                                        )}
                                        {active && latest.has(p.id) && (
                                            <form action={cancelPremiumAction} className="mt-1.5"><input type="hidden" name="id" value={p.memberId} />
                                                <ConfirmButton message={`Cancelar o Premium de ${p.memberName}? A conta volta a ser gratuita de imediato e o membro é avisado por e-mail.`} className="cursor-pointer rounded-full border border-[#d23b25]/50 px-2.5 py-0.5 text-[#d23b25] hover:bg-[#fff5f3]">Cancelar Premium</ConfirmButton>
                                            </form>
                                        )}
                                        </>)}
                                    </td>
                                </tr>
                            );
                        })}
                        {pg.total === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-[#5b6478]">{everything.length ? "Nenhuma subscrição encontrada." : "Ainda não há subscrições."}</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pager {...pg} params={{ q, estado }} />
        </div>
    );
}
