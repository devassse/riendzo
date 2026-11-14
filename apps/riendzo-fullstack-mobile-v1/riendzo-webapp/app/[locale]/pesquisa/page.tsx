import { Link } from "@/i18n/navigation";
import PageShell from "@/app/components/sections/page-shell";
import { getCollection, publicUrlOf } from "@/lib/cms/collections";
import { emojiOf, imagesOf, searchPublic, summaryOf, tagOf, titleOf } from "@/lib/cms/store";
import Highlight from "@/app/components/utils/highlight";

const PER_PAGE = 12;
export const metadata = { title: "Pesquisar · Riendzo" };

const SUGGESTIONS = ["praias", "matapa", "marrabenta", "restaurantes", "hotel Maputo", "bancos", "Gorongosa", "rent-a-car"];

/** Global search: any word, results from every menu, each result opens its page. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; page?: string }> }) {
    const { q = "", c = "", page = "1" } = await searchParams;
    const all = q.trim() ? await searchPublic(q) : [];

    const counts = new Map<string, number>();
    all.forEach((r) => counts.set(r.collection, (counts.get(r.collection) ?? 0) + 1));
    const filtered = c ? all.filter((r) => r.collection === c) : all;
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const cur = Math.min(Math.max(1, Number(page) || 1), pages);
    const rows = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
    const href = (p: number, cc = c) => `/pesquisa?q=${encodeURIComponent(q)}${cc ? `&c=${cc}` : ""}${p > 1 ? `&page=${p}` : ""}`;

    return (
        <PageShell title="Pesquisar" lead="Escreva qualquer palavra: praias, receitas, artistas, bancos, hotéis…" wide>
            <form action="/pesquisa" role="search" className="mx-auto flex max-w-2xl gap-2">
                <input name="q" defaultValue={q} autoFocus type="search" placeholder="O que procura?" aria-label="Pesquisar" className="min-w-0 flex-1 rounded-full border border-[#0b1220]/20 px-5 py-3 text-base outline-none focus:border-[#0054b5]" />
                <button className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-3 font-baloo font-medium text-white hover:opacity-90">Pesquisar</button>
            </form>

            {!q.trim() && (
                <p className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
                    <span className="text-[#5b6478]">Experimente:</span>
                    {SUGGESTIONS.map((s) => <Link key={s} href={`/pesquisa?q=${encodeURIComponent(s)}`} className="rounded-full border border-[#0b1220]/15 px-3 py-1 hover:bg-[#eef2f8]">{s}</Link>)}
                </p>
            )}

            {q.trim() && (
                <>
                    <p className="mt-8 text-sm text-[#5b6478]" aria-live="polite">{all.length} resultado(s) para “{q}”{all.some((r) => r.fuzzy) && " · inclui resultados com escrita semelhante"}</p>
                    {counts.size > 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link href={href(1, "")} className={`rounded-full border px-3 py-1 text-xs ${!c ? "border-[#0b1220] bg-[#0b1220] text-white" : "border-[#0b1220]/15"}`}>Tudo {all.length}</Link>
                            {[...counts].map(([id, n]) => <Link key={id} href={href(1, id)} className={`rounded-full border px-3 py-1 text-xs ${c === id ? "border-[#0b1220] bg-[#0b1220] text-white" : "border-[#0b1220]/15"}`}>{getCollection(id)?.label} {n}</Link>)}
                        </div>
                    )}

                    {rows.length === 0 ? (
                        <p className="mt-12 text-center text-[#5b6478]">Não encontrámos nada, mesmo com escrita semelhante. Tente outra palavra.</p>
                    ) : (
                        <ul className="mt-6 grid gap-3 md:grid-cols-2">
                            {rows.map(({ collection, item }) => (
                                <li key={`${collection}-${item.slug}`}>
                                    <Link href={publicUrlOf(collection, item.slug)} className="flex h-full gap-4 rounded-2xl border border-[#0b1220]/10 p-4 transition-shadow hover:shadow-md">
                                        <span className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#eef2f8] text-3xl">{imagesOf(item)[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={imagesOf(item)[0]} alt="" className="h-full w-full object-cover" loading="lazy" /> : emojiOf(item)}</span>
                                        <span className="min-w-0">
                                            <span className="block text-[10px] font-montserrat-italic uppercase tracking-[0.16em] text-[#0054b5]">{getCollection(collection)?.label}{tagOf(item) ? <> · <Highlight text={tagOf(item)} query={q} /></> : ""}</span>
                                            <span className="block truncate font-baloo text-lg font-medium text-[#0b1220]"><Highlight text={titleOf(item)} query={q} /></span>
                                            <span className="line-clamp-2 text-sm text-[#4b5568]"><Highlight text={summaryOf(item)} query={q} /></span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {pages > 1 && (
                        <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                            {cur > 1 && <Link href={href(cur - 1)} className="rounded-full border border-[#0b1220]/15 px-4 py-2 text-sm">← Anterior</Link>}
                            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={href(n)} aria-current={n === cur ? "page" : undefined} className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${n === cur ? "border-[#0b1220] bg-[#0b1220] text-white" : "border-[#0b1220]/15"}`}>{n}</Link>)}
                            {cur < pages && <Link href={href(cur + 1)} className="rounded-full border border-[#0b1220]/15 px-4 py-2 text-sm">Seguinte →</Link>}
                        </nav>
                    )}
                </>
            )}
        </PageShell>
    );
}
