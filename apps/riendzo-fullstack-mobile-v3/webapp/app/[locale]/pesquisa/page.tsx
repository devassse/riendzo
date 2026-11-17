import PageShell from "@/app/components/sections/page-shell";
import SearchResults from "@/app/components/search/search-results";

export const metadata = { title: "Pesquisar · Riendzo" };

/** Global search: any word, results from every menu, each result opens its page. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; page?: string }> }) {
    const { q = "", c = "", page = "1" } = await searchParams;
    return (
        <PageShell title="Pesquisar" lead="Escreva qualquer palavra: praias, receitas, artistas, bancos, hotéis…" wide>
            <SearchResults q={q} c={c} page={page} />
        </PageShell>
    );
}
