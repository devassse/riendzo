import { requireAdmin } from "@/lib/cms/auth";
import { listMembers } from "@/lib/members";
import { setMemberStatusAction } from "../../../actions";

const PAGE = 20;
export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page = "1" } = await searchParams;
    const all = (await listMembers()).filter((m) => `${m.firstName} ${m.lastName} ${m.email ?? ""} ${m.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));
    const pages = Math.max(1, Math.ceil(all.length / PAGE));
    const cur = Math.min(Math.max(1, Number(page) || 1), pages);
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Membros Riendzo AI</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">{all.length} membros registados no site.</p>
            <form className="mb-4"><input name="q" defaultValue={q} placeholder="Pesquisar por nome, e-mail ou telefone" className="w-full max-w-md rounded-full border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm" /></form>
            <div className="overflow-x-auto rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f3f6fb] text-xs uppercase tracking-wide text-[#5b6478]"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Província</th><th className="px-4 py-3">Favoritos</th><th className="px-4 py-3">Registo</th><th className="px-4 py-3">Estado</th></tr></thead>
                    <tbody>
                        {all.slice((cur - 1) * PAGE, cur * PAGE).map((m) => (
                            <tr key={m.id} className="border-t border-[#0b1220]/8">
                                <td className="px-4 py-3 font-medium">{m.firstName} {m.lastName}</td>
                                <td className="px-4 py-3">{m.email ?? (m.phone ? `+${m.phone}` : "—")}</td>
                                <td className="px-4 py-3">{m.province ?? "—"}</td>
                                <td className="px-4 py-3">{m.favorites.length}</td>
                                <td className="px-4 py-3">{new Date(m.createdAt).toLocaleDateString("pt-PT")}</td>
                                <td className="px-4 py-3">
                                    <form action={setMemberStatusAction} className="flex items-center gap-2"><input type="hidden" name="id" value={m.id} /><input type="hidden" name="to" value={m.status === "active" ? "suspended" : "active"} />
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${m.status === "active" ? "bg-[#35be12]/15 text-[#238a0c]" : "bg-[#d23b25]/12 text-[#b5311d]"}`}>{m.status === "active" ? "Ativo" : "Suspenso"}</span>
                                        <button className="cursor-pointer text-xs text-[#0054b5] hover:underline">{m.status === "active" ? "Suspender" : "Reativar"}</button></form>
                                </td>
                            </tr>
                        ))}
                        {all.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#5b6478]">Nenhum membro encontrado.</td></tr>}
                    </tbody>
                </table>
            </div>
            {pages > 1 && <p className="mt-4 text-center text-sm">{cur > 1 && <a className="mr-4 text-[#0054b5]" href={`?q=${encodeURIComponent(q)}&page=${cur - 1}`}>← Anterior</a>}Página {cur} de {pages}{cur < pages && <a className="ml-4 text-[#0054b5]" href={`?q=${encodeURIComponent(q)}&page=${cur + 1}`}>Seguinte →</a>}</p>}
        </div>
    );
}
