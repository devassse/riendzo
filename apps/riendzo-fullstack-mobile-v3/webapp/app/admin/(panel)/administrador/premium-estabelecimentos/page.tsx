import { requireAdmin } from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { getItem, titleOf } from "@/lib/cms/store";
import { allPlacePremium } from "@/lib/place-premium";
import { listPendingRequests } from "@/lib/subscriptions";
import { cancelPlacePremiumAction, setPlacePremiumAction } from "../../../actions";
import ConfirmButton from "../../../_components/confirm-button";
import PendingRequests from "../../../_components/premium-requests";
import { Pager, SearchBox, matches, one, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

/** Lista de Premium dos estabelecimentos: pedidos por aprovar + ativos + expirados. */
export default async function PremiumPlaces({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; estado?: string | string[] }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page, estado: rawEstado } = await searchParams;
    const estado = one(rawEstado);
    const pending = await listPendingRequests("place");
    const records = await allPlacePremium();
    const rows = (await Promise.all(Object.entries(records).map(async ([key, until]) => {
        const [collection, ...rest] = key.split("/");
        const slug = rest.join("/");
        const item = await getItem(collection, slug);
        return { key, collection, slug, until, title: item ? titleOf(item) : slug, label: getCollection(collection)?.label ?? collection, on: new Date(until).getTime() > Date.now(), removed: !item };
    })));
    const activeCount = rows.filter((r) => r.on).length;
    const all = rows
        .filter((r) => (estado === "ativo" ? r.on : estado === "expirado" ? !r.on : true))
        .filter((r) => matches(q, r.title, r.label, r.slug))
        .sort((a, b) => Number(b.on) - Number(a.on) || Date.parse(a.until) - Date.parse(b.until));
    const pg = paginate(all, page);
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Premium · Estabelecimentos</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]"><b>{activeCount}</b> estabelecimentos com Premium ativo · <b>{pending.length}</b> pedidos por aprovar. Quando o período termina, o estabelecimento volta automaticamente ao normal (pedidos para o telefone/e-mail).</p>

            <PendingRequests items={pending} kind="place" />

            <h2 className="mb-3 font-baloo text-xl font-bold">Premium ativo e expirado</h2>
            <SearchBox q={q} placeholder="Pesquisar por estabelecimento ou categoria">
                <select name="estado" defaultValue={estado} aria-label="Estado" className="rounded-full border border-[#0b1220]/15 bg-white px-3 py-2.5 text-sm">
                    <option value="">Ativos e expirados</option><option value="ativo">Só ativos</option><option value="expirado">Só expirados</option>
                </select>
            </SearchBox>
            <div className="overflow-x-auto rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f3f6fb] text-xs uppercase tracking-wide text-[#5b6478]"><tr><th className="px-4 py-3">Estabelecimento</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Válido até</th><th className="px-4 py-3">Ações</th></tr></thead>
                    <tbody>
                        {pg.items.map((r) => (
                            <tr key={r.key} className="border-t border-[#0b1220]/8 align-top">
                                <td className="px-4 py-3 font-medium">{r.title}{r.removed && <span className="block text-xs font-normal text-[#b5311d]">página removida</span>}</td>
                                <td className="px-4 py-3 text-xs text-[#4b5568]">{r.label}</td>
                                <td className="px-4 py-3">{r.on ? <span className="rounded-full bg-[#ffc14d]/40 px-2.5 py-0.5 text-xs text-[#6b4700]">⭐ Ativo</span> : <span className="rounded-full bg-[#eef2f8] px-2.5 py-0.5 text-xs text-[#4b5568]">Expirado</span>}</td>
                                <td className="px-4 py-3">{new Date(r.until).toLocaleDateString("pt-PT")}</td>
                                <td className="px-4 py-3">
                                    <form action={setPlacePremiumAction} className="flex flex-wrap items-center gap-1.5"><input type="hidden" name="collection" value={r.collection} /><input type="hidden" name="slug" value={r.slug} />
                                        <select name="months" defaultValue="1" aria-label="Meses" className="rounded-lg border border-[#0b1220]/15 px-1.5 py-1 text-xs"><option value="1">+1 mês</option><option value="3">+3 meses</option><option value="6">+6 meses</option><option value="12">+12 meses</option></select>
                                        <button className="cursor-pointer text-xs text-[#0054b5] hover:underline">{r.on ? "Prolongar" : "Reativar"}</button>
                                    </form>
                                    {r.on && (
                                        <form action={cancelPlacePremiumAction} className="mt-1.5"><input type="hidden" name="collection" value={r.collection} /><input type="hidden" name="slug" value={r.slug} />
                                            <ConfirmButton message={`Cancelar o Premium de ${r.title}? Os novos pedidos passam a ir para o telefone e e-mail do estabelecimento.`} className="cursor-pointer rounded-full border border-[#d23b25]/50 px-2.5 py-0.5 text-xs text-[#d23b25] hover:bg-[#fff5f3]">Cancelar Premium</ConfirmButton>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {pg.total === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#5b6478]">Nenhum estabelecimento com Premium.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pager {...pg} params={{ q, estado }} />
        </div>
    );
}
