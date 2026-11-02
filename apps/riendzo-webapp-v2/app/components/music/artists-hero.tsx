import { Link } from "@/i18n/navigation";
import type { Artist } from "@/lib/cms/artist-types";
import { songCount } from "@/lib/cms/artist-types";
import Avatar from "./avatar";

/**
 * Hero of Música > Artistas. When an artist has the "Artista da semana" flag in the
 * BackOffice, a spotlight card appears on the right; otherwise the hero is centred.
 */
export default function ArtistsHero({
    weekly, genreLabel, genreColor = "#35be12", totals,
}: { weekly?: Artist; genreLabel?: string; genreColor?: string; totals: { artists: number; albums: number; genres: number } }) {
    const playable = weekly?.albums.some((a) => a.tracks.some((t) => t.audioUrl || t.youtubeUrl));
    return (
        <section className="relative overflow-hidden bg-[#0b1220] text-[#f4ecd8]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 top-[-10rem] h-[40rem] w-[40rem] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #35be12 0%, transparent 70%)" }} />
                <div className="absolute -right-32 bottom-[-8rem] h-[34rem] w-[34rem] rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${genreColor} 0%, transparent 70%)` }} />
                <svg className="absolute inset-x-0 bottom-0 h-40 w-full opacity-[0.07]" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none" stroke="#f4ecd8" strokeWidth="2">
                    <path d="M0 80 Q 60 20 120 80 T 240 80 T 360 80 T 480 80 T 600 80 T 720 80 T 840 80 T 960 80 T 1080 80 T 1200 80 T 1320 80 T 1440 80" />
                    <path d="M0 100 Q 90 30 180 100 T 360 100 T 540 100 T 720 100 T 900 100 T 1080 100 T 1260 100 T 1440 100" />
                </svg>
            </div>

            <div className={`relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-14 pt-6 ${weekly ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
                <div className={weekly ? "" : "mx-auto max-w-3xl text-center"}>
                    <p className="text-[10px] font-montserrat-italic uppercase tracking-[0.3em] text-[#35be12]">Música · Moçambique</p>
                    <h1 className="mt-3 text-5xl font-bold leading-[1.05] sm:text-7xl">Artistas Moçambicanos</h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#a7b0c4] [text-wrap:pretty]">
                        As vozes, as guitarras e as batidas que fazem a música do país. Conheça a história de cada artista, ouça os seus álbuns e descubra novos nomes.
                    </p>
                    <dl className={`mt-8 flex flex-wrap gap-8 ${weekly ? "" : "justify-center"}`}>
                        {[["Artistas", totals.artists], ["Álbuns", totals.albums], ["Estilos", totals.genres]].map(([l, v]) => (
                            <div key={l as string}><dd className="font-baloo text-4xl font-bold text-[#f4ecd8]">{v}</dd><dt className="text-xs uppercase tracking-[0.18em] text-[#a7b0c4]">{l}</dt></div>
                        ))}
                    </dl>
                    <div className={`mt-9 flex flex-wrap gap-3 ${weekly ? "" : "justify-center"}`}>
                        <Link href="/musica/discografias" className="rounded-full bg-[#35be12] px-6 py-3 font-baloo text-sm font-medium text-[#05210a] transition-opacity hover:opacity-90">Ver discografias</Link>
                        <Link href="/musica/generos" className="rounded-full border border-white/25 px-6 py-3 font-baloo text-sm font-medium transition-colors hover:bg-white/10">Explorar géneros</Link>
                    </div>
                </div>

                {weekly && (
                    <article aria-label="Artista da semana" className="relative mx-auto w-full max-w-md">
                        <div aria-hidden="true" className="absolute -inset-3 rounded-[2.5rem] opacity-40 blur-2xl" style={{ background: `linear-gradient(135deg, ${genreColor}, transparent)` }} />
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] p-7 text-center backdrop-blur-md">
                            <p className="inline-flex items-center gap-2 rounded-full bg-[#f0a83a] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3a2500]">★ Artista da semana</p>

                            <div className="relative mx-auto mt-7 h-52 w-52">
                                <svg aria-hidden="true" viewBox="0 0 200 200" className="spin-slow absolute -inset-5 h-[calc(100%+2.5rem)] w-[calc(100%+2.5rem)]">
                                    <circle cx="100" cy="100" r="97" fill="none" stroke={genreColor} strokeWidth="2" strokeDasharray="3 9" opacity="0.8" />
                                    <circle cx="100" cy="100" r="88" fill="none" stroke="#f4ecd8" strokeWidth="1" strokeDasharray="1 7" opacity="0.4" />
                                </svg>
                                <div className="h-full w-full overflow-hidden rounded-full ring-4 ring-white/20"><Avatar name={weekly.name} photo={weekly.photo} color={genreColor} text="text-6xl" /></div>
                            </div>

                            <div aria-hidden="true" className="mx-auto mt-5 flex h-7 items-end justify-center gap-1">
                                {[0.1, 0.5, 0.3, 0.8, 0.2, 0.6, 0.4, 0.9, 0.35, 0.7].map((d, i) => (
                                    <span key={i} className="eq-bar block w-1.5 rounded-full" style={{ height: "100%", backgroundColor: genreColor, animationDelay: `${d}s` }} />
                                ))}
                            </div>

                            <h2 className="mt-3 font-baloo text-4xl font-bold leading-tight">{weekly.name}</h2>
                            <p className="mt-1 text-sm text-[#a7b0c4]">{genreLabel}{weekly.origin ? ` · ${weekly.origin}` : ""}</p>
                            {weekly.quote ? <p className="mx-auto mt-4 max-w-xs text-base italic leading-snug text-[#f4ecd8]">“{weekly.quote}”</p> : <p className="mx-auto mt-4 max-w-xs text-sm leading-snug text-[#d9dfec]">{weekly.summary}</p>}
                            <p className="mt-3 text-xs text-[#a7b0c4]">{weekly.albums.length} álbuns · {songCount(weekly)} faixas</p>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Link href={`/musica/artistas/${weekly.slug}`} className="rounded-full px-5 py-2.5 font-baloo text-sm font-medium text-[#05210a] transition-opacity hover:opacity-90" style={{ backgroundColor: genreColor }}>Ver perfil</Link>
                                {playable && <Link href={`/musica/artistas/${weekly.slug}#discografia`} className="rounded-full border border-white/30 px-5 py-2.5 font-baloo text-sm font-medium hover:bg-white/10">▶ Ouvir</Link>}
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}
