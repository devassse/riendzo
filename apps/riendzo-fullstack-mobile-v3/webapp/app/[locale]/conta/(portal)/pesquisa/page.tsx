import { requireMember } from "@/app/actions/member-actions";
import SearchResults from "@/app/components/search/search-results";

export const dynamic = "force-dynamic";

/** The same global search as the site, inside the member portal: results open in the portal. */
export default async function PortalSearch({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; page?: string }> }) {
    const { q = "", c = "", page = "1" } = await searchParams;
    await requireMember(`/conta/pesquisa${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    return (
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#0b1220]/8 bg-white px-5 py-8 shadow-sm sm:px-8">
            <h1 className="mb-1 text-center font-baloo text-3xl font-bold">Pesquisar</h1>
            <p className="mb-6 text-center text-sm text-[#5b6478]">Escreva qualquer palavra: praias, receitas, artistas, bancos, hotéis…</p>
            <SearchResults q={q} c={c} page={page} area="portal" />
        </div>
    );
}
