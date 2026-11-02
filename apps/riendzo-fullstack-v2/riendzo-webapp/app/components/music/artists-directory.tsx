"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Artist } from "@/lib/cms/artist-types";
import { songCount } from "@/lib/cms/artist-types";
import Avatar from "./avatar";

type Genre = { value: string; label: string; color?: string };
const PAGE_SIZE = 12;
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Searchable, paginated grid of artists. */
export default function ArtistsDirectory({ artists, genres, basePath = "/musica/artistas" }: { artists: Artist[]; genres: Genre[]; /** address of the artist pages (the member portal passes its own) */ basePath?: string }) {
    const [q, setQ] = useState("");
    const [genre, setGenre] = useState("all");
    const [page, setPage] = useState(1);

    const colorOf = (g: string) => genres.find((x) => x.value === g)?.color ?? "#0054b5";
    const labelOf = (g: string) => genres.find((x) => x.value === g)?.label ?? g;
    const used = genres.filter((g) => artists.some((a) => a.genre === g.value));

    const filtered = useMemo(() => {
        const n = fold(q.trim());
        return artists.filter((a) => (genre === "all" || a.genre === genre) && (!n || fold(`${a.name} ${a.realName ?? ""} ${a.summary}`).includes(n)));
    }, [artists, q, genre]);

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, pages);
    const visible = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    return (
        <div id="lista" className="scroll-mt-24">
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Pesquisar artista…" aria-label="Pesquisar artista" className="w-full rounded-full border border-[#0b1220]/15 bg-white px-5 py-3 text-sm outline-none focus:border-[#0b1220]/50" />
            <div role="tablist" aria-label="Estilos musicais" className="mt-4 flex flex-wrap gap-2">
                {[{ value: "all", label: "Todos", color: "#0b1220" }, ...used].map((g) => {
                    const active = genre === g.value;
                    const c = g.color ?? "#0b1220";
                    return (
                        <button key={g.value} type="button" role="tab" aria-selected={active} onClick={() => { setGenre(g.value); setPage(1); }} className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium transition-colors" style={{ borderColor: active ? c : `${c}33`, backgroundColor: active ? c : "transparent", color: active ? "#fff" : "#0b1220" }}>
                            {g.label}
                        </button>
                    );
                })}
            </div>
            <p className="mt-4 text-xs text-[#5b6478]" aria-live="polite">{filtered.length} artistas</p>

            {visible.length === 0 ? (
                <p className="mt-16 text-center text-sm text-[#5b6478]">Sem resultados</p>
            ) : (
                <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {visible.map((a) => {
                        const c = colorOf(a.genre);
                        return (
                            <li key={a.slug}>
                                <Link href={`${basePath}/${a.slug}`} className="group flex h-full flex-col items-center rounded-3xl border border-[#0b1220]/10 bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    <span className="relative block h-28 w-28 overflow-hidden rounded-full ring-4 transition-transform duration-300 group-hover:scale-105" style={{ ["--tw-ring-color" as string]: `${c}55` }}>
                                        <Avatar name={a.name} photo={a.photo} color={c} />
                                    </span>
                                    <span className="mt-4 font-baloo text-lg font-medium leading-tight text-[#0b1220]">{a.name}</span>
                                    <span className="mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${c}1f`, color: c }}>{labelOf(a.genre)}</span>
                                    <span className="mt-2 text-xs text-[#5b6478]">{a.albums.length} álbuns · {songCount(a)} faixas</span>
                                    {a.featuredWeek && <span className="mt-2 rounded-full bg-[#f0a83a] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#3a2500]">★ Artista da semana</span>}
                                </Link>
                            </li>
                        );
                    })}
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
        </div>
    );
}
