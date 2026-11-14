"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Album } from "@/lib/cms/artist-types";
import { youtubeId } from "@/lib/cms/sanitize";
import SidePanel from "./side-panel";
import { KaraokeLines, KaraokeOverlay, useAudioTime } from "./karaoke";
import { isSynced } from "@/lib/cms/lrc";

export type AlbumRef = { album: Album; artistName: string; artistSlug?: string; color: string };

const Play = ({ playing }: { playing: boolean }) => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">{playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
);

/** Album cover: image or a vinyl-record placeholder. */
export function Cover({ src, title, color, className = "" }: { src?: string; title: string; color: string; className?: string }) {
    return src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={title} loading="lazy" className={`h-full w-full object-cover ${className}`} />
    ) : (
        <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${color}, ${color}66)` }} role="img" aria-label={title}>
            <svg viewBox="0 0 100 100" className="h-3/4 w-3/4" aria-hidden="true">
                <circle cx="50" cy="50" r="46" fill="#0b1220" />
                {[38, 30, 22].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#ffffff22" strokeWidth="1" />)}
                <circle cx="50" cy="50" r="14" fill={color} />
                <circle cx="50" cy="50" r="2.5" fill="#0b1220" />
            </svg>
        </div>
    );
}

/**
 * Side panel with the track list. Tracks that have an audio file (rights-cleared)
 * play in the page; tracks with an official YouTube video open the embedded player.
 */
export function AlbumPanel({ data, onClose, labels }: {
    data: AlbumRef | null; onClose: () => void;
    labels?: { tracks: string; noTracks: string; noAudio: string; rights: string; close: string };
}) {
    const L = { tracks: "Faixas", noTracks: "A lista de faixas estará disponível em breve.", noAudio: "Sem áudio disponível", rights: "Só reproduzimos faixas cedidas pelos artistas ou vídeos oficiais.", close: "Fechar", ...labels };
    const audioRef = useRef<HTMLAudioElement>(null);
    const [current, setCurrent] = useState<number | null>(null);
    const [playing, setPlaying] = useState(false);
    const [lyricsOpen, setLyricsOpen] = useState(true);

    const tracks = data?.album.tracks ?? [];
    const playable = (i: number) => Boolean(tracks[i]?.audioUrl || tracks[i]?.youtubeUrl);

    // Reset when the album changes or the panel closes
    useEffect(() => {
        setCurrent(null);
        setPlaying(false);
        audioRef.current?.pause();
    }, [data?.album.slug, data?.artistName]);

    /** Stops the music and closes the player and the lyrics of the open track. */
    const closePlayer = () => {
        audioRef.current?.pause();
        setCurrent(null);
        setPlaying(false);
        setKaraoke(false);
    };

    // a new track opens with its lyrics visible
    useEffect(() => { setLyricsOpen(true); }, [current]);

    const toggle = (i: number) => {
        const t = tracks[i];
        if (!t) return;
        if (current === i) {
            if (t.audioUrl) {
                if (audioRef.current?.paused) void audioRef.current.play();
                else audioRef.current?.pause();
            } else setCurrent(null);
            return;
        }
        audioRef.current?.pause();
        setCurrent(i);
    };

    // Start playback when a track with a direct audio file is selected
    useEffect(() => {
        const a = audioRef.current;
        if (current === null || !a || !tracks[current]?.audioUrl) return;
        a.src = tracks[current].audioUrl as string;
        void a.play().catch(() => setPlaying(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);

    const next = useCallback(() => {
        if (current === null) return;
        const n = tracks.findIndex((_, i) => i > current && playable(i));
        setCurrent(n >= 0 ? n : null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, tracks]);

    const close = () => { audioRef.current?.pause(); onClose(); };
    const cur = current !== null ? tracks[current] : null;
    const yt = cur?.youtubeUrl && !cur.audioUrl ? youtubeId(cur.youtubeUrl) : null;
    const color = data?.color ?? "#0054b5";
    const [karaoke, setKaraoke] = useState(false);
    const lyrics = cur?.lyrics;
    const hasAudio = Boolean(cur?.audioUrl);
    const time = useAudioTime(audioRef, playing && hasAudio);
    const seek = (t: number) => { if (audioRef.current) { audioRef.current.currentTime = t; if (audioRef.current.paused) void audioRef.current.play(); } };
    const toggleAudio = () => { const a = audioRef.current; if (!a) return; if (a.paused) void a.play(); else a.pause(); };
    useEffect(() => { if (current === null) setKaraoke(false); }, [current]);

    return (
        <SidePanel open={Boolean(data)} onClose={close} label={data?.album.title ?? "Álbum"} closeLabel={L.close}>
            {data && (
                <>
                    <div className="relative h-72 overflow-hidden">
                        <Cover src={data.album.cover} title={data.album.title} color={color} />
                    </div>
                    <div className="px-6 pb-12 pt-6">
                        <p className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color }}>
                            {data.artistName}{data.album.year ? ` · ${data.album.year}` : ""}{data.album.label ? ` · ${data.album.label}` : ""}
                        </p>
                        <h3 className="mt-1 font-baloo text-3xl font-bold leading-tight text-[#0b1220]">{data.album.title}</h3>
                        {data.album.description && <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{data.album.description}</p>}

                        <h4 className="mt-7 font-baloo text-lg font-medium">{L.tracks} <span className="text-sm font-normal text-[#5b6478]">({tracks.length})</span></h4>

                        {tracks.length === 0 ? (
                            <p className="mt-3 rounded-2xl bg-[#eef2f8] p-4 text-sm text-[#4b5568]">{L.noTracks}</p>
                        ) : (
                            <ol className="mt-3 divide-y divide-[#0b1220]/8 rounded-2xl border border-[#0b1220]/10">
                                {tracks.map((t, i) => {
                                    const can = playable(i);
                                    const active = current === i;
                                    return (
                                        <li key={t.title + i} className="flex items-center gap-3 px-3 py-2.5" style={active ? { backgroundColor: `${color}12` } : undefined}>
                                            <span className="w-5 text-center text-xs text-[#5b6478]">{i + 1}</span>
                                            <button type="button" disabled={!can} onClick={() => toggle(i)} aria-label={can ? `${active && playing ? "Pausar" : "Ouvir"}: ${t.title}` : L.noAudio}
                                                className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30" style={{ backgroundColor: color }}>
                                                <Play playing={active && (t.audioUrl ? playing : true)} />
                                            </button>
                                            <span className="min-w-0 flex-1">
                                                <span className={`block truncate text-sm ${active ? "font-semibold" : ""}`}>{t.title}</span>
                                                {!can && <span className="text-[11px] text-[#5b6478]">{L.noAudio}</span>}
                                                {t.lyrics?.length ? <span className="ml-1 rounded-full bg-[#eef2f8] px-1.5 text-[10px] text-[#4b5568]">♪ Letra</span> : null}
                                            </span>
                                            {t.duration && <span className="text-xs text-[#5b6478]">{t.duration}</span>}
                                        </li>
                                    );
                                })}
                            </ol>
                        )}

                        {/* Close the track that is open (player + lyrics) */}
                        {cur && (
                            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#eef2f8] px-4 py-2">
                                <span className="min-w-0 truncate text-sm font-medium text-[#0b1220]">{cur.title}</span>
                                <button type="button" onClick={closePlayer} className="flex-none cursor-pointer rounded-full border border-[#0b1220]/20 px-3 py-1 text-xs font-medium text-[#0b1220] hover:bg-white">✕ Fechar faixa</button>
                            </div>
                        )}
                        {/* Player */}
                        <audio ref={audioRef} controls className={`mt-4 w-full ${cur?.audioUrl ? "" : "hidden"}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={next} preload="none" />
                        {yt && (
                            <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-[#0b1220]">
                                <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} title={cur?.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />
                            </div>
                        )}
                        {lyrics?.length && lyricsOpen ? (
                            <section className="mt-6" aria-label="Letra">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="font-baloo text-lg font-medium">Letra {isSynced(lyrics) && hasAudio && <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-[#05210a]" style={{ backgroundColor: color }}>Karaoke</span>}</h4>
                                    <button type="button" onClick={() => setLyricsOpen(false)} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-3 py-1 text-xs font-medium hover:bg-[#0b1220]/5">Esconder letra</button>
                                    {isSynced(lyrics) && hasAudio && (
                                        <button type="button" onClick={() => { setKaraoke(true); if (audioRef.current?.paused) void audioRef.current.play(); }} className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium hover:bg-[#0b1220]/5" style={{ borderColor: `${color}88`, color }}>🎤 Ecrã inteiro</button>
                                    )}
                                </div>
                                <div className="mt-3 rounded-2xl border border-[#0b1220]/10 bg-[#f8f9fc] p-4">
                                    <KaraokeLines lines={hasAudio ? lyrics : lyrics.map((l) => ({ text: l.text }))} time={time} duration={audioRef.current?.duration} color={color} onSeek={hasAudio ? seek : undefined} />
                                </div>
                                {isSynced(lyrics) && hasAudio && <p className="mt-2 text-[11px] text-[#5b6478]">Toque num verso para saltar para esse momento.</p>}
                            </section>
                        ) : null}
                        {lyrics?.length && !lyricsOpen ? <button type="button" onClick={() => setLyricsOpen(true)} className="mt-4 cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-1.5 text-xs font-medium hover:bg-[#0b1220]/5">♪ Mostrar letra</button> : null}
                        {cur && (
                            <KaraokeOverlay open={karaoke && Boolean(lyrics?.length)} onClose={() => setKaraoke(false)} title={cur.title} artist={data.artistName} lines={lyrics ?? []} time={time} duration={audioRef.current?.duration} color={color} playing={playing} onToggle={toggleAudio} onSeek={seek} />
                        )}
                        <p className="mt-4 text-[11px] leading-relaxed text-[#5b6478]">{L.rights}</p>
                    </div>
                </>
            )}
        </SidePanel>
    );
}

/** Grid of album cards; clicking one opens the track list. */
export function AlbumShelf({ albums, empty = "Discografia em breve." }: { albums: AlbumRef[]; empty?: string }) {
    const [sel, setSel] = useState<AlbumRef | null>(null);
    if (!albums.length) return <p className="rounded-2xl bg-[#eef2f8] p-5 text-sm text-[#4b5568]">{empty}</p>;
    return (
        <>
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {albums.map((a) => (
                    <li key={`${a.artistName}-${a.album.slug}`}>
                        <button type="button" onClick={() => setSel(a)} aria-haspopup="dialog" className="group block w-full cursor-pointer text-left">
                            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                                <Cover src={a.album.cover} title={a.album.title} color={a.color} />
                                <span className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#0b1220] opacity-0 shadow transition-opacity group-hover:opacity-100"><Play playing={false} /></span>
                            </div>
                            <p className="mt-2 truncate font-baloo text-[15px] font-medium text-[#0b1220]">{a.album.title}</p>
                            <p className="truncate text-xs text-[#5b6478]">{a.artistName}{a.album.year ? ` · ${a.album.year}` : ""}</p>
                        </button>
                    </li>
                ))}
            </ul>
            <AlbumPanel data={sel} onClose={() => setSel(null)} />
        </>
    );
}
