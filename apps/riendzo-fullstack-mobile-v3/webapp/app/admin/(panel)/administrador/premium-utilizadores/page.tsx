import { requireAdmin } from "@/lib/cms/auth";
import { isPremium, listMembers } from "@/lib/members";
import { listPendingRequests } from "@/lib/subscriptions";
import { cancelPremiumAction, setPremiumAction } from "../../../actions";
import ConfirmButton from "../../../_components/confirm-button";
import PendingRequests from "../../../_components/premium-requests";
import { Pager, SearchBox, matches, one, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

/** Lista de Premium dos utilizadores (membros): pedidos por aprovar + ativos + expirados. */
export default async function PremiumUsers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; estado?: string | string[] }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page, estado: rawEstado } = await searchParams;
    const estado = one(rawEstado);
    const pending = await listPendingRequests("member");
    const withPremium = (await listMembers()).filter((m) => m.premiumUntil);
    const activeCount = withPremium.filter(isPremium).length;
    const all = withPremium
        .filter((m) => (estado === "ativo" ? isPremium(m) : estado === "expirado" ? !isPremium(m) : true))
        .filter((m) => matches(q, m.firstName, m.lastName, m.email, m.phone))
        .sort((a, b) => Number(isPremium(b)) - Number(isPremium(a)) || Date.parse(a.premiumUntil!) - Date.parse(b.premiumUntil!));
    const pg = paginate(all, page);
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Premium · Utilizadores</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]"><b>{activeCount}</b> utilizadores com Premium ativo · <b>{pending.length}</b> pedidos por aprovar. Quando o período termina, a conta volta automaticamente a gratuita.</p>

            <PendingRequests items={pending} kind="member" />

            <h2 className="mb-3 font-baloo text-xl font-bold">Premium ativo e expirado</h2>
            <SearchBox q={q} placeholder="Pesquisar por nome, e-mail ou telefone">
                <select name="estado" defaultValue={estado} aria-label="Estado" className="rounded-full border border-[#0b1220]/15 bg-white px-3 py-2.5 text-sm">
                    <option value="">Ativos e expirados</option><option value="ativo">Só ativos</option><option value="expirado">Só expirados</option>
                </select>
            </SearchBox>
            <div className="overflow-x-auto rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f3f6fb] text-xs uppercase tracking-wide text-[#5b6478]"><tr><th className="px-4 py-3">Utilizador</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Válido até</th><th className="px-4 py-3">Ações</th></tr></thead>
                    <tbody>
                        {pg.items.map((m) => {
                            const on = isPremium(m);
                            return (
                                <tr key={m.id} className="border-t border-[#0b1220]/8 align-top">
                                    <td className="px-4 py-3 font-medium">{m.firstName} {m.lastName}</td>
                                    <td className="px-4 py-3 text-xs text-[#4b5568]">{m.email}{m.phone && <span className="block">+{m.phone.replace(/\D/g, "")}</span>}</td>
                                    <td className="px-4 py-3">{on ? <span className="rounded-full bg-[#ffc14d]/40 px-2.5 py-0.5 text-xs text-[#6b4700]">⭐ Ativo</span> : <span className="rounded-full bg-[#eef2f8] px-2.5 py-0.5 text-xs text-[#4b5568]">Expirado</span>}</td>
                                    <td className="px-4 py-3">{new Date(m.premiumUntil!).toLocaleDateString("pt-PT")}</td>
                                    <td className="px-4 py-3">
                                        <form action={setPremiumAction} className="flex flex-wrap items-center gap-1.5"><input type="hidden" name="id" value={m.id} />
                                            <select name="months" defaultValue="1" aria-label="Meses" className="rounded-lg border border-[#0b1220]/15 px-1.5 py-1 text-xs"><option value="1">+1 mês</option><option value="3">+3 meses</option><option value="6">+6 meses</option><option value="12">+12 meses</option></select>
                                            <button className="cursor-pointer text-xs text-[#0054b5] hover:underline">{on ? "Prolongar" : "Reativar"}</button>
                                        </form>
                                        {on && (
                                            <form action={cancelPremiumAction} className="mt-1.5"><input type="hidden" name="id" value={m.id} />
                                                <ConfirmButton message={`Cancelar o Premium de ${m.firstName} ${m.lastName}? A conta volta a ser gratuita de imediato e o membro é avisado por e-mail.`} className="cursor-pointer rounded-full border border-[#d23b25]/50 px-2.5 py-0.5 text-xs text-[#d23b25] hover:bg-[#fff5f3]">Cancelar Premium</ConfirmButton>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {pg.total === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#5b6478]">Nenhum utilizador com Premium.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pager {...pg} params={{ q, estado }} />
        </div>
    );
}
