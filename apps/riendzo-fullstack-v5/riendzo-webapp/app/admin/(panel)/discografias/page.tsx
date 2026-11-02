import Link from "next/link";
import { getItems } from "@/lib/cms/store";
import type { Artist } from "@/lib/cms/artist-types";

export const dynamic = "force-dynamic";

/**
 * Música > Discografias. Albums and tracks belong to each artist, so this page lists
 * them all in one place and sends you to the artist's editor to add or change them.
 */
export default async function DiscographiesAdmin() {
    const artists = await getItems<Artist>("music-artists");
    const withAlbums = artists.filter((a) => a.albums?.length);
    const without = artists.filter((a) => !a.albums?.length);
    const totalAlbums = artists.reduce((n, a) => n + (a.albums?.length ?? 0), 0);
    const totalTracks = artists.reduce((n, a) => n + (a.albums ?? []).reduce((m, al) => m + al.tracks.length, 0), 0);

    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]"><Link href="/admin" className="hover:underline">Dashboard</Link> / Música</nav>
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-baloo text-3xl font-bold">Discografias</h1>
                    <p className="mt-1 text-sm text-[#5b6478]">{totalAlbums} álbuns · {totalTracks} faixas · {artists.length} artistas. Os álbuns são geridos dentro de cada artista.</p>
                </div>
                <div className="flex gap-2">
                    <a href="/pt/musica/discografias" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#0b1220]/15 px-4 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">Ver no site ↗</a>
                    <Link href="/admin/c/music-artists/new" className="rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">+ Novo artista</Link>
                </div>
            </header>

            {withAlbums.length === 0 && <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#5b6478]">Ainda não há álbuns. Abra um artista e adicione a primeira discografia.</p>}

            <ul className="space-y-3">
                {withAlbums.map((a) => (
                    <li key={a.slug} className="rounded-3xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="font-baloo text-lg font-medium">{a.name}{a.status === "draft" && <span className="ml-2 rounded-full bg-[#ffc14d] px-2 py-0.5 text-[10px] font-medium text-[#5a3b00]">Rascunho</span>}</p>
                                <p className="text-xs text-[#5b6478]">{a.albums.length} álbum(ns)</p>
                            </div>
                            <Link href={`/admin/c/music-artists/${a.slug}`} className="rounded-full border border-[#0b1220]/15 px-4 py-2 text-sm font-medium hover:bg-[#0b1220]/5">Editar discografia</Link>
                        </div>
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {[...a.albums].sort((x, y) => (y.year ?? 0) - (x.year ?? 0)).map((al) => (
                                <li key={al.slug} className="flex items-center gap-3 rounded-2xl bg-[#f3f6fb] p-2.5">
                                    <span className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#0054b5]/10 text-lg">
                                        {al.cover /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={al.cover} alt="" className="h-full w-full object-cover" /> : "💿"}
                                    </span>
                                    <span className="min-w-0"><span className="block truncate text-sm font-medium">{al.title}</span><span className="text-[11px] text-[#5b6478]">{al.year ?? "s/ ano"} · {al.tracks.length} faixa(s)</span></span>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>

            {without.length > 0 && (
                <section className="mt-8">
                    <h2 className="font-baloo text-lg font-bold">Artistas sem álbuns</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {without.map((a) => <Link key={a.slug} href={`/admin/c/music-artists/${a.slug}`} className="rounded-full border border-[#0b1220]/15 bg-white px-4 py-1.5 text-sm hover:bg-[#eef2f8]">{a.name} +</Link>)}
                    </div>
                </section>
            )}
        </div>
    );
}
