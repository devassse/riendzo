import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import Avatar from "@/app/components/music/avatar";
import { AlbumShelf } from "@/app/components/music/album-panel";
import PhotoAlbums from "@/app/components/music/photo-albums";
import RichText from "@/app/components/sections/rich-text";
import type { Artist } from "@/lib/cms/artist-types";
import { songCount } from "@/lib/cms/artist-types";
import { getList } from "@/lib/cms/lists";
import { getItem, getPublishedItems } from "@/lib/cms/store";

const LINKS: [keyof NonNullable<Artist["links"]>, string][] = [["youtube", "YouTube"], ["spotify", "Spotify"], ["instagram", "Instagram"], ["facebook", "Facebook"], ["website", "Website"]];

/**
 * Full profile of one artist. `embedded` = inside the member portal: no site navbar/footer
 * and every link stays in the portal (`base` is the portal address of the artists menu).
 */
export default async function ArtistProfile({ slug, embedded = false, base = "/musica/artistas" }: { slug: string; embedded?: boolean; base?: string }) {
    const a = (await getItem("music-artists", slug)) as Artist | undefined;
    if (!a || a.status === "draft") notFound();

    const [genres, all] = await Promise.all([getList("music-genres"), getPublishedItems<Artist>("music-artists")]);
    const g = genres.find((x) => x.value === a.genre);
    const color = g?.color ?? "#35be12";
    const related = all.filter((x) => x.genre === a.genre && x.slug !== a.slug).slice(0, 4);
    const years = a.birthYear ? `${a.birthYear}${a.deathYear ? ` – ${a.deathYear}` : ""}` : undefined;
    const facts = [
        a.realName && ["Nome", a.realName], years && ["Anos", years], a.origin && ["Origem", a.origin],
        a.activeSince && ["Ativo desde", a.activeSince], ["Estilo", g?.label ?? a.genre],
    ].filter(Boolean) as [string, string][];

    return (
        <div className={embedded ? undefined : pageStyles.page}>
            {!embedded && <RiendzoNavbar />}
            <header className="relative overflow-hidden bg-[#0b1220] text-[#f4ecd8]">
                {a.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
                <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${color}40 0%, #0b1220ee 90%)` }} />
                <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-14 pt-8 sm:flex-row sm:items-end">
                    <div className="h-44 w-44 flex-none overflow-hidden rounded-full ring-4 ring-white/25 sm:h-56 sm:w-56"><Avatar name={a.name} photo={a.photo} color={color} text="text-7xl" /></div>
                    <div className="text-center sm:text-left">
                        <nav className="text-xs text-[#f4ecd8]/70">
                            {embedded
                                ? <Link href={base} className="font-medium hover:underline">← Artistas</Link>
                                : <><Link href="/musica" className="hover:underline">Música</Link> / <Link href="/musica/artistas" className="hover:underline">Artistas</Link></>}
                        </nav>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <span className="rounded-full px-3 py-1 text-xs font-medium text-[#05210a]" style={{ backgroundColor: color }}>{g?.label ?? a.genre}</span>
                            {a.featuredWeek && <span className="rounded-full bg-[#f0a83a] px-3 py-1 text-[10px] font-bold uppercase text-[#3a2500]">★ Artista da semana</span>}
                        </div>
                        <h1 className="mt-3 text-5xl font-bold leading-tight sm:text-7xl">{a.name}</h1>
                        <p className="mt-2 text-[#d9dfec]">{[years, a.origin].filter(Boolean).join(" · ")}</p>
                        <p className="mt-1 text-sm text-[#a7b0c4]">{a.albums.length} álbuns · {songCount(a)} faixas</p>
                        {a.links && (
                            <p className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                                {LINKS.filter(([k]) => a.links?.[k]).map(([k, l]) => <a key={k} href={a.links![k]} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-4 py-1.5 text-xs hover:bg-white/10">{l} ↗</a>)}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <main className="bg-white">
                <div className="mx-auto max-w-6xl space-y-16 px-6 py-14">
                    <section id="biografia" className="scroll-mt-24">
                        <h2 className="font-baloo text-3xl font-bold text-[#0b1220]">Biografia</h2>
                        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                            <div>
                                {a.quote && <blockquote className="mb-5 border-l-4 pl-4 text-lg italic text-[#3c4658]" style={{ borderColor: color }}>“{a.quote}”</blockquote>}
                                <p className="text-[#3c4658]">{a.summary}</p>
                                <RichText html={a.body} className="mt-4" />
                            </div>
                            <dl className="h-fit rounded-3xl border border-[#0b1220]/10 p-5">
                                {facts.map(([l, v]) => <div key={l} className="py-2 first:pt-0 last:pb-0"><dt className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color }}>{l}</dt><dd className="mt-0.5 text-sm">{v}</dd></div>)}
                            </dl>
                        </div>
                    </section>

                    <section id="discografia" className="scroll-mt-24">
                        <h2 className="font-baloo text-3xl font-bold text-[#0b1220]">Discografia</h2>
                        <p className="mt-1 mb-6 text-sm text-[#5b6478]">Clique num álbum para ver as faixas e ouvir o que estiver disponível.</p>
                        <AlbumShelf albums={a.albums.map((al) => ({ album: al, artistName: a.name, artistSlug: a.slug, color }))} />
                    </section>

                    <section id="fotos" className="scroll-mt-24">
                        <h2 className="font-baloo text-3xl font-bold text-[#0b1220]">Álbuns de fotografias</h2>
                        <div className="mt-5"><PhotoAlbums albums={a.photoAlbums} artist={a.name} color={color} /></div>
                    </section>

                    {related.length > 0 && (
                        <section>
                            <h2 className="font-baloo text-2xl font-bold text-[#0b1220]">Mais {g?.label}</h2>
                            <ul className="mt-5 flex flex-wrap gap-4">
                                {related.map((r) => (
                                    <li key={r.slug}><Link href={`${base}/${r.slug}`} className="flex items-center gap-3 rounded-full border border-[#0b1220]/10 py-1.5 pl-1.5 pr-5 hover:shadow-md"><span className="h-11 w-11 overflow-hidden rounded-full"><Avatar name={r.name} photo={r.photo} color={color} text="text-base" /></span><span className="font-baloo text-sm font-medium">{r.name}</span></Link></li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </main>
            {!embedded && <RiendzoFooter />}
        </div>
    );
}
