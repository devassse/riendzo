"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { LyricLine } from "@/lib/cms/artist-types";
import { currentLine, isSynced, wordTimings } from "@/lib/cms/lrc";

/** Current playback time of an <audio>, refreshed every animation frame while playing (smooth word fill). */
export function useAudioTime(ref: RefObject<HTMLAudioElement | null>, active: boolean) {
    const [t, setT] = useState(0);
    useEffect(() => {
        const a = ref.current;
        if (!a) return;
        const sync = () => setT(a.currentTime);
        a.addEventListener("seeked", sync);
        a.addEventListener("loadedmetadata", sync);
        a.addEventListener("emptied", sync);
        let raf = 0;
        let last = -1;
        // ~25 updates per second are plenty for the word fill; a render on every frame made the lyrics shake on phones
        const loop = () => { const n = a.currentTime; if (Math.abs(n - last) >= 0.04) { last = n; setT(n); } raf = requestAnimationFrame(loop); };
        if (active) raf = requestAnimationFrame(loop); else sync();
        return () => { cancelAnimationFrame(raf); a.removeEventListener("seeked", sync); a.removeEventListener("loadedmetadata", sync); a.removeEventListener("emptied", sync); };
    }, [ref, active]);
    return t;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Lyrics that follow the song: the line being sung is highlighted, its words fill in
 * as they are sung, and clicking a line jumps the audio to it.
 */
export function KaraokeLines({
    lines, time, duration, color = "#35be12", onSeek, size = "md", dark = false,
}: { lines: LyricLine[]; time: number; duration?: number; color?: string; onSeek?: (t: number) => void; size?: "md" | "lg" | "xl"; dark?: boolean }) {
    const box = useRef<HTMLDivElement>(null);
    const rows = useRef<(HTMLElement | null)[]>([]);
    const synced = isSynced(lines);
    const cur = synced ? currentLine(lines, time) : -1;
    const end = duration && Number.isFinite(duration) ? duration : time + 30;

    // when the person scrolls by hand, the automatic scroll waits a few seconds
    const handScroll = useRef(0);
    const touch = () => { handScroll.current = Date.now(); };

    // keep the current line in the middle of the box (only the box scrolls, never the page)
    useEffect(() => {
        const c = box.current, el = rows.current[cur];
        if (!c || !el || Date.now() - handScroll.current < 3500) return;
        const id = requestAnimationFrame(() => c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" }));
        return () => cancelAnimationFrame(id);
    }, [cur]);

    const base = size === "xl" ? "text-3xl sm:text-5xl leading-tight" : size === "lg" ? "text-xl sm:text-2xl leading-snug" : "text-lg leading-snug";
    const idle = dark ? "rgba(255,255,255,0.38)" : "rgba(11,18,32,0.35)";
    const past = dark ? "rgba(255,255,255,0.6)" : "rgba(11,18,32,0.6)";

    return (
        <div ref={box} onWheel={touch} onTouchMove={touch} onPointerDown={touch} className={`relative overflow-y-auto overflow-x-hidden overscroll-contain ${size === "xl" ? "h-full px-4 py-[35dvh] text-center" : size === "lg" ? "h-full px-5 py-[22dvh]" : "max-h-72 px-1 py-24"}`} aria-label="Letra">
            {lines.map((l, i) => {
                if (!l.text) return <div key={i} className="h-5" aria-hidden="true" />;
                const isCur = synced && i === cur;
                const isPast = synced && cur > i;
                const seekable = synced && l.time !== undefined && onSeek;
                const Tag = seekable ? "button" : "p";
                return (
                    <Tag
                        key={i}
                        ref={(el: HTMLElement | null) => { rows.current[i] = el; }}
                        {...(seekable ? { type: "button" as const, onClick: () => onSeek!(l.time as number) } : {})}
                        aria-current={isCur ? "true" : undefined}
                        className={`block w-full py-1.5 font-baloo font-semibold transition-transform duration-300 ${base} ${size === "xl" ? "text-center" : "text-left"} ${seekable ? "cursor-pointer" : ""}`}
                        style={{ transform: isCur ? "scale(1.03)" : "scale(1)", transformOrigin: size === "xl" ? "center" : "left center", color: !synced ? (dark ? "#fff" : "#0b1220") : isPast ? past : idle }}
                    >
                        {(isCur ? wordTimings(lines, i, end) : l.text.split(/\s+/).filter(Boolean).map((text) => ({ text, start: 0, end: 0 }))).map((w, wi) => {
                            const p = isCur ? clamp01((time - w.start) / Math.max(0.05, w.end - w.start)) * 100 : 0;
                            return (
                                <span key={wi} style={isCur ? { backgroundImage: `linear-gradient(90deg, ${color} ${p}%, ${idle} ${p}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" } : undefined}>
                                    {w.text}{" "}
                                </span>
                            );
                        })}
                    </Tag>
                );
            })}
        </div>
    );
}

const fmt = (n: number) => { if (!Number.isFinite(n) || n < 0) n = 0; const m = Math.floor(n / 60); const ss = Math.floor(n % 60); return `${m}:${String(ss).padStart(2, "0")}`; };

const PlayIcon = ({ playing, className = "h-5 w-5" }: { playing: boolean; className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">{playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
);

/**
 * Our own player controls (play/pause, time, seek bar). Replaces the browser's built-in
 * controls, which offer a "Download" option. It keeps its own clock, so the rest of the
 * page does not re-render while the song plays.
 */
export function AudioBar({ audioRef, playing, color, onToggle, dark = false }: {
    audioRef: RefObject<HTMLAudioElement | null>; playing: boolean; color: string; onToggle: () => void; dark?: boolean;
}) {
    const time = useAudioTime(audioRef, playing);
    const [dur, setDur] = useState(0);
    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;
        const upd = () => setDur(Number.isFinite(a.duration) ? a.duration : 0);
        upd();
        a.addEventListener("loadedmetadata", upd);
        a.addEventListener("durationchange", upd);
        a.addEventListener("emptied", upd);
        return () => { a.removeEventListener("loadedmetadata", upd); a.removeEventListener("durationchange", upd); a.removeEventListener("emptied", upd); };
    }, [audioRef]);
    const pct = dur ? clamp01(time / dur) * 100 : 0;
    const track = dark ? "rgba(255,255,255,0.2)" : "rgba(11,18,32,0.12)";
    return (
        <div className="flex items-center gap-3" onContextMenu={(e) => e.preventDefault()}>
            <button type="button" onClick={onToggle} aria-label={playing ? "Pausar" : "Reproduzir"} className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full text-white shadow" style={{ backgroundColor: color }}>
                <PlayIcon playing={playing} />
            </button>
            <span className={`w-10 text-right text-xs tabular-nums ${dark ? "text-white/70" : "text-[#5b6478]"}`}>{fmt(time)}</span>
            <input
                type="range" min={0} max={dur || 0} step={0.1} value={Math.min(time, dur || 0)} disabled={!dur}
                onChange={(e) => { const a = audioRef.current; if (a) a.currentTime = Number(e.target.value); }}
                aria-label="Posição na música"
                className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full disabled:cursor-default"
                style={{ background: `linear-gradient(90deg, ${color} ${pct}%, ${track} ${pct}%)`, accentColor: color }}
            />
            <span className={`w-10 text-xs tabular-nums ${dark ? "text-white/70" : "text-[#5b6478]"}`}>{fmt(dur)}</span>
        </div>
    );
}

/**
 * Lyrics in a popup above the album panel: the song keeps playing in the panel, the
 * lyrics follow it here without moving anything on the page behind.
 */
export function LyricsPopup({
    open, onClose, onFullScreen, title, artist, lines, audioRef, hasAudio, color, playing, onToggle, onSeek,
}: {
    open: boolean; onClose: () => void; onFullScreen?: () => void; title: string; artist: string; lines: LyricLine[];
    audioRef: RefObject<HTMLAudioElement | null>; hasAudio: boolean; color: string; playing: boolean; onToggle: () => void; onSeek: (t: number) => void;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const time = useAudioTime(audioRef, open && playing && hasAudio);
    const closeRef = useRef(onClose);
    useEffect(() => { closeRef.current = onClose; }, [onClose]);
    useEffect(() => {
        if (!open) return;
        const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); } };
        document.addEventListener("keydown", key);
        return () => document.removeEventListener("keydown", key);
    }, [open]);
    if (!open || !mounted) return null;
    const synced = isSynced(lines) && hasAudio;
    return createPortal(
        <div data-over-panel className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-6">
            <div onClick={onClose} className="absolute inset-0 bg-[#0b1220]/50" />
            <div role="dialog" aria-modal="true" aria-label={`Letra: ${title}`} className="relative flex h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:h-[min(80dvh,680px)] sm:rounded-[1.75rem]">
                <header className="flex items-center justify-between gap-3 border-b border-[#0b1220]/10 px-5 py-4">
                    <div className="min-w-0">
                        <p className="truncate font-baloo text-lg font-bold text-[#0b1220]">{title}</p>
                        <p className="truncate text-xs text-[#5b6478]">{artist}{synced ? " · Karaoke" : ""}</p>
                    </div>
                    <div className="flex flex-none items-center gap-2">
                        {synced && onFullScreen && <button type="button" onClick={onFullScreen} className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-[#0b1220]/5" style={{ borderColor: `${color}88`, color }}>🎤 Ecrã inteiro</button>}
                        <button type="button" onClick={onClose} aria-label="Fechar letra" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#eef2f8] text-[#0b1220] hover:bg-[#e2e8f2]">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                    </div>
                </header>
                <div className="relative min-h-0 flex-1 bg-[#f8f9fc]" style={{ maskImage: "linear-gradient(transparent, #000 15%, #000 85%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 15%, #000 85%, transparent)" }}>
                    <KaraokeLines lines={hasAudio ? lines : lines.map((l) => ({ text: l.text }))} time={time} duration={audioRef.current?.duration} color={color} onSeek={hasAudio ? onSeek : undefined} size="lg" />
                </div>
                {hasAudio && (
                    <footer className="border-t border-[#0b1220]/10 px-5 py-3">
                        <AudioBar audioRef={audioRef} playing={playing} color={color} onToggle={onToggle} />
                        {synced && <p className="mt-1.5 text-center text-[11px] text-[#5b6478]">Toque num verso para saltar para esse momento.</p>}
                    </footer>
                )}
            </div>
        </div>,
        document.body
    );
}

/** Full-screen karaoke. The audio element stays in the panel; this only displays and controls it. */
export function KaraokeOverlay({
    open, onClose, title, artist, lines, audioRef, color, playing, onToggle, onSeek,
}: {
    open: boolean; onClose: () => void; title: string; artist: string; lines: LyricLine[]; audioRef: RefObject<HTMLAudioElement | null>;
    color: string; playing: boolean; onToggle: () => void; onSeek: (t: number) => void;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const time = useAudioTime(audioRef, open && playing);
    const handlers = useRef({ onClose, onToggle });
    useEffect(() => { handlers.current = { onClose, onToggle }; }, [onClose, onToggle]);
    // the page behind must not move while the full-screen lyrics are open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const key = (e: KeyboardEvent) => {
            if (e.key === "Escape") { e.stopImmediatePropagation(); handlers.current.onClose(); }
            if (e.key === " ") { e.preventDefault(); handlers.current.onToggle(); }
        };
        document.addEventListener("keydown", key, true);
        return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", key, true); };
    }, [open]);
    if (!open || !mounted) return null;

    const duration = audioRef.current?.duration;
    return createPortal(
        <div data-over-panel role="dialog" aria-modal="true" aria-label={`Karaoke: ${title}`} className="fixed inset-0 z-[10001] flex flex-col bg-[#0b1220] text-white">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30" style={{ background: `radial-gradient(60% 50% at 50% 40%, ${color}55, transparent 70%)` }} />
            <header className="relative flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0"><p className="truncate font-baloo text-lg font-bold">{title}</p><p className="truncate text-sm text-white/65">{artist}</p></div>
                <button type="button" onClick={onClose} aria-label="Fechar karaoke" className="cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20">✕ Fechar</button>
            </header>
            <div className="relative min-h-0 flex-1" style={{ maskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)" }}>
                <KaraokeLines lines={lines} time={time} duration={duration} color={color} onSeek={onSeek} size="xl" dark />
            </div>
            <footer className="relative px-5 py-4">
                <AudioBar audioRef={audioRef} playing={playing} color={color} onToggle={onToggle} dark />
            </footer>
        </div>,
        document.body
    );
}
