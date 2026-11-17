import { requireAdmin } from "@/lib/cms/auth";
import { isPremium, listMembers } from "@/lib/members";
import { cancelPremiumAction, setMemberStatusAction, setPremiumAction } from "../../../actions";
import ConfirmButton from "../../../_components/confirm-button";
import { Pager, SearchBox, matches, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; tipo?: string }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page, tipo = "" } = await searchParams;
    const everyone = await listMembers();
    const premiumCount = everyone.filter(isPremium).length;
    const all = everyone
        .filter((m) => (tipo === "premium" ? isPremium(m) : tipo === "free" ? !isPremium(m) : true))
        .filter((m) => matches(q, m.firstName, m.lastName, m.email, m.phone, m.province));
    const p = paginate(all, page);
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Membros Riendzo AI</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">{everyone.length} membros registados no site · <b>{premiumCount}</b> com Premium ativo.</p>
            <SearchBox q={q} placeholder="Pesquisar por nome, e-mail ou telefone" keep={{ tipo }}>
                <select name="tipo" defaultValue={tipo} aria-label="Tipo de conta" className="rounded-full border border-[#0b1220]/15 bg-white px-3 py-2.5 text-sm">
                    <option value="">Todas as contas</option><option value="premium">Só Premium</option><option value="free">Só gratuitas</option>
                </select>
            </SearchBox>
            <div className="overflow-x-auto rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f3f6fb] text-xs uppercase tracking-wide text-[#5b6478]"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Província</th><th className="px-4 py-3">Premium</th><th className="px-4 py-3">Registo</th><th className="px-4 py-3">Estado</th></tr></thead>
                    <tbody>
                        {p.items.map((m) => (
                            <tr key={m.id} className="border-t border-[#0b1220]/8 align-top">
                                <td className="px-4 py-3 font-medium">{m.firstName} {m.lastName}</td>
                                <td className="px-4 py-3">{m.email ?? (m.phone ? `+${m.phone}` : "—")}</td>
                                <td className="px-4 py-3">{m.province ?? "—"}</td>
                                <td className="px-4 py-3">
                                    <form action={setPremiumAction} className="flex flex-wrap items-center gap-1.5"><input type="hidden" name="id" value={m.id} />
                                        {isPremium(m) ? <span className="rounded-full bg-[#ffc14d]/40 px-2 py-0.5 text-xs text-[#6b4700]">⭐ até {new Date(m.premiumUntil!).toLocaleDateString("pt-PT")}</span> : <span className="text-xs text-[#5b6478]">Gratuito</span>}
                                        <select name="months" defaultValue="1" aria-label="Meses" className="rounded-lg border border-[#0b1220]/15 px-1.5 py-1 text-xs"><option value="1">+1 mês</option><option value="3">+3 meses</option><option value="6">+6 meses</option><option value="12">+12 meses</option></select>
                                        <button className="cursor-pointer text-xs text-[#0054b5] hover:underline">{isPremium(m) ? "Prolongar" : "Ativar"}</button>
                                    </form>
                                    {isPremium(m) && (
                                        <form action={cancelPremiumAction} className="mt-1.5"><input type="hidden" name="id" value={m.id} />
                                            <ConfirmButton message={`Cancelar o Premium de ${m.firstName} ${m.lastName}? A conta volta a ser gratuita de imediato e o membro é avisado por e-mail.`} className="cursor-pointer rounded-full border border-[#d23b25]/50 px-2.5 py-0.5 text-xs text-[#d23b25] hover:bg-[#fff5f3]">Cancelar Premium</ConfirmButton>
                                        </form>
                                    )}
                                </td>
                                <td className="px-4 py-3">{new Date(m.createdAt).toLocaleDateString("pt-PT")}</td>
                                <td className="px-4 py-3">
                                    <form action={setMemberStatusAction} className="flex items-center gap-2"><input type="hidden" name="id" value={m.id} /><input type="hidden" name="to" value={m.status === "active" ? "suspended" : "active"} />
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${m.status === "active" ? "bg-[#35be12]/15 text-[#238a0c]" : "bg-[#d23b25]/12 text-[#b5311d]"}`}>{m.status === "active" ? "Ativo" : "Suspenso"}</span>
                                        <button className="cursor-pointer text-xs text-[#0054b5] hover:underline">{m.status === "active" ? "Suspender" : "Reativar"}</button></form>
                                </td>
                            </tr>
                        ))}
                        {p.total === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#5b6478]">Nenhum membro encontrado.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pager {...p} params={{ q, tipo }} />
        </div>
    );
}
