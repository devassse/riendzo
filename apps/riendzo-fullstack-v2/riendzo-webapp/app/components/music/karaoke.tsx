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
        const loop = () => { setT(a.currentTime); raf = requestAnimationFrame(loop); };
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
}: { lines: LyricLine[]; time: number; duration?: number; color?: string; onSeek?: (t: number) => void; size?: "md" | "xl"; dark?: boolean }) {
    const box = useRef<HTMLDivElement>(null);
    const rows = useRef<(HTMLElement | null)[]>([]);
    const synced = isSynced(lines);
    const cur = synced ? currentLine(lines, time) : -1;
    const end = duration && Number.isFinite(duration) ? duration : time + 30;

    // keep the current line in the middle of the box
    useEffect(() => {
        const c = box.current, el = rows.current[cur];
        if (!c || !el) return;
        c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
    }, [cur]);

    const base = size === "xl" ? "text-3xl sm:text-5xl leading-tight" : "text-lg leading-snug";
    const idle = dark ? "rgba(255,255,255,0.38)" : "rgba(11,18,32,0.35)";
    const past = dark ? "rgba(255,255,255,0.6)" : "rgba(11,18,32,0.6)";

    return (
        <div ref={box} className={`relative overflow-y-auto scroll-smooth ${size === "xl" ? "h-full px-4 py-[35vh] text-center" : "max-h-72 px-1 py-24"}`} aria-label="Letra">
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
                        {isCur
                            ? wordTimings(lines, i, end).map((w, wi) => {
                                  const p = clamp01((time - w.start) / Math.max(0.05, w.end - w.start)) * 100;
                                  return (
                                      <span key={wi} style={{ backgroundImage: `linear-gradient(90deg, ${color} ${p}%, ${idle} ${p}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
                                          {w.text}{" "}
                                      </span>
                                  );
                              })
                            : l.text}
                    </Tag>
                );
            })}
        </div>
    );
}

/** Full-screen karaoke. The audio element stays in the panel; this only displays and controls it. */
export function KaraokeOverlay({
    open, onClose, title, artist, lines, time, duration, color, playing, onToggle, onSeek,
}: {
    open: boolean; onClose: () => void; title: string; artist: string; lines: LyricLine[]; time: number; duration?: number;
    color: string; playing: boolean; onToggle: () => void; onSeek: (t: number) => void;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        if (!open) return;
        const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === " ") { e.preventDefault(); onToggle(); } };
        document.addEventListener("keydown", key);
        return () => document.removeEventListener("keydown", key);
    }, [open, onClose, onToggle]);
    if (!open || !mounted) return null;

    const pct = duration && Number.isFinite(duration) ? clamp01(time / duration) * 100 : 0;
    return createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Karaoke: ${title}`} className="fixed inset-0 z-[10001] flex flex-col bg-[#0b1220] text-white">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30" style={{ background: `radial-gradient(60% 50% at 50% 40%, ${color}55, transparent 70%)` }} />
            <header className="relative flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0"><p className="truncate font-baloo text-lg font-bold">{title}</p><p className="truncate text-sm text-white/65">{artist}</p></div>
                <button type="button" onClick={onClose} aria-label="Fechar karaoke" className="cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20">✕ Fechar</button>
            </header>
            <div className="relative min-h-0 flex-1" style={{ maskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)" }}>
                <KaraokeLines lines={lines} time={time} duration={duration} color={color} onSeek={onSeek} size="xl" dark />
            </div>
            <footer className="relative flex items-center gap-4 px-5 py-4">
                <button type="button" onClick={onToggle} aria-label={playing ? "Pausar" : "Reproduzir"} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-[#05210a]" style={{ backgroundColor: color }}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">{playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
                </button>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} /></div>
            </footer>
        </div>,
        document.body
    );
}
