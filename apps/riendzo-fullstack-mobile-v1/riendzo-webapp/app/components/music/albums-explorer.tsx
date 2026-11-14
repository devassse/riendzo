"use client";

import { useMemo, useState } from "react";
import { AlbumPanel, Cover, type AlbumRef } from "./album-panel";

type Row = AlbumRef & { genre: string; genreLabel: string };
const PAGE_SIZE = 12;
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** All albums of all artists: search, filter by style, paginate, open the track list. */
export default function AlbumsExplorer({ rows }: { rows: Row[] }) {
    const [q, setQ] = useState("");
    const [genre, setGenre] = useState("all");
    const [page, setPage] = useState(1);
    const [sel, setSel] = useState<AlbumRef | null>(null);

    const genres = useMemo(() => [...new Map(rows.map((r) => [r.genre, r.genreLabel])).entries()], [rows]);
    const filtered = useMemo(() => {
        const n = fold(q.trim());
        return rows.filter((r) => (genre === "all" || r.genre === genre) && (!n || fold(`${r.album.title} ${r.artistName} ${r.album.year ?? ""}`).includes(n)));
    }, [rows, q, genre]);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, pages);
    const visible = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    return (
        <div>
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Pesquisar álbum, artista ou ano…" aria-label="Pesquisar álbuns" className="w-full rounded-full border border-[#0b1220]/15 bg-white px-5 py-3 text-sm outline-none focus:border-[#0b1220]/50" />
            <div role="tablist" className="mt-4 flex flex-wrap gap-2">
                {[["all", "Todos"] as const, ...genres].map(([v, l]) => (
                    <button key={v} type="button" role="tab" aria-selected={genre === v} onClick={() => { setGenre(v); setPage(1); }} className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium" style={{ borderColor: genre === v ? "#0b1220" : "#0b12201a", backgroundColor: genre === v ? "#0b1220" : "transparent", color: genre === v ? "#fff" : "#0b1220" }}>{l}</button>
                ))}
            </div>
            <p className="mt-4 text-xs text-[#5b6478]" aria-live="polite">{filtered.length} álbuns</p>

            {visible.length === 0 ? (
                <p className="mt-16 text-center text-sm text-[#5b6478]">Sem resultados</p>
            ) : (
                <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {visible.map((r) => (
                        <li key={`${r.artistName}-${r.album.slug}`}>
                            <button type="button" onClick={() => setSel(r)} aria-haspopup="dialog" className="group block w-full cursor-pointer text-left">
                                <div className="aspect-square overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"><Cover src={r.album.cover} title={r.album.title} color={r.color} /></div>
                                <p className="mt-2 truncate font-baloo text-[15px] font-medium">{r.album.title}</p>
                                <p className="truncate text-xs text-[#5b6478]">{r.artistName}{r.album.year ? ` · ${r.album.year}` : ""}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {pages > 1 && (
                <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Anterior" className="h-10 w-10 cursor-pointer rounded-full border border-[#0b1220]/15 disabled:opacity-30">←</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                        <button key={n} type="button" aria-current={n === cur ? "page" : undefined} onClick={() => setPage(n)} className="h-10 w-10 cursor-pointer rounded-full border text-sm font-baloo font-medium" style={{ borderColor: n === cur ? "#0b1220" : "#0b122026", backgroundColor: n === cur ? "#0b1220" : "transparent", color: n === cur ? "#fff" : "#0b1220" }}>{n}</button>
                    ))}
                    <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Seguinte" className="h-10 w-10 cursor-pointer rounded-full border border-[#0b1220]/15 disabled:opacity-30">→</button>
                </nav>
            )}
            <AlbumPanel data={sel} onClose={() => setSel(null)} />
        </div>
    );
}
