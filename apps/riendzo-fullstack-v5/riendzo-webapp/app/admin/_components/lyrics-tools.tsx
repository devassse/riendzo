"use client";

import { useEffect, useRef, useState } from "react";
import type { LyricLine } from "@/lib/cms/artist-types";
import { formatLrc, formatTime, parseLrc } from "@/lib/cms/lrc";
import { KaraokeLines, useAudioTime } from "@/app/components/music/karaoke";
import { inputClass } from "./fields";

const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs font-medium hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30";

/** Uploads one audio file (staff only) and returns its address. */
export function AudioUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
    const ref = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    async function go(f?: File) {
        if (!f) return;
        setBusy(true); setErr("");
        const body = new FormData(); body.append("file", f);
        try {
            const r = await fetch("/api/admin/upload", { method: "POST", body });
            const d = await r.json();
            if (d.files?.[0]?.url) onUploaded(d.files[0].url); else setErr(d.errors?.[0] ?? d.error ?? "Falha no envio.");
        } catch { setErr("Falha de ligação."); } finally { setBusy(false); if (ref.current) ref.current.value = ""; }
    }
    return (
        <span>
            <input ref={ref} type="file" hidden accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.wav" onChange={(e) => go(e.target.files?.[0])} />
            <button type="button" className={small} disabled={busy} onClick={() => ref.current?.click()}>{busy ? "A enviar…" : "⬆ Carregar áudio"}</button>
            {err && <span role="alert" className="ml-2 text-xs text-[#b5311d]">{err}</span>}
        </span>
    );
}

/**
 * Tap-to-sync: play the song and press “Marcar verso” (or Enter) exactly when each
 * line starts. Fine-tune any time afterwards. Produces LRC text.
 */
export function LyricsSync({ audioUrl, value, onChange, color = "#35be12" }: { audioUrl: string; value: string; onChange: (lrc: string) => void; color?: string }) {
    const audio = useRef<HTMLAudioElement>(null);
    const [lines, setLines] = useState<LyricLine[]>(() => parseLrc(value).filter((l) => l.text));
    const [idx, setIdx] = useState(() => Math.max(0, parseLrc(value).filter((l) => l.text).findIndex((l) => l.time === undefined)));
    const [playing, setPlaying] = useState(false);
    const [rate, setRate] = useState(1);
    const time = useAudioTime(audio, playing);
    const box = useRef<HTMLDivElement>(null);

    const commit = (next: LyricLine[]) => { setLines(next); onChange(formatLrc(next)); };
    // human reaction delay: stamp slightly earlier than the click
    const REACTION = 0.15;

    const stamp = () => {
        const a = audio.current;
        if (!a || idx >= lines.length) return;
        const t = Math.max(0, Math.round((a.currentTime - REACTION) * 100) / 100);
        commit(lines.map((l, i) => (i === idx ? { text: l.text, time: t } : l)));
        setIdx(Math.min(lines.length, idx + 1));
    };
    const undo = () => {
        const i = Math.max(0, idx - 1);
        commit(lines.map((l, n) => (n === i ? { text: l.text } : l)));
        setIdx(i);
        if (audio.current) audio.current.currentTime = Math.max(0, (lines[i - 1]?.time ?? 0) - 0.5);
    };
    const nudge = (i: number, d: number) => commit(lines.map((l, n) => (n === i && l.time !== undefined ? { ...l, time: Math.max(0, Math.round((l.time + d) * 100) / 100), words: undefined } : l)));
    const setTime = (i: number, raw: string) => {
        const m = /^(\d{1,3}):(\d{2})(?:\.(\d{1,2}))?$/.exec(raw.trim());
        if (!m) return;
        commit(lines.map((l, n) => (n === i ? { text: l.text, time: Number(m[1]) * 60 + Number(m[2]) + (m[3] ? Number(m[3]) / 10 ** m[3].length : 0) } : l)));
    };

    useEffect(() => { if (audio.current) audio.current.playbackRate = rate; }, [rate]);
    useEffect(() => { // keep the pointer line visible
        const el = box.current?.querySelector<HTMLElement>(`[data-row="${idx}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [idx]);

    const done = lines.filter((l) => l.time !== undefined).length;

    return (
        <div
            className="mt-3 rounded-2xl border-2 border-dashed p-4 outline-none" style={{ borderColor: `${color}66` }} tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "BUTTON") { e.preventDefault(); stamp(); } }}
        >
            <p className="text-sm font-medium">Sincronizador</p>
            <p className="mt-0.5 text-xs text-[#4b5568]">1) Carregue em ▶ no leitor.  2) Quando começar cada verso, carregue em <b>Marcar verso</b> (ou na tecla <kbd className="rounded border px-1">Enter</kbd>).  3) Ajuste os tempos se for preciso.</p>

            <audio ref={audio} src={audioUrl} controls preload="metadata" className="mt-3 w-full" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={stamp} disabled={idx >= lines.length || lines.length === 0} className="cursor-pointer rounded-full px-5 py-2 font-baloo text-sm font-medium text-[#05210a] disabled:opacity-40" style={{ backgroundColor: color }}>⏱ Marcar verso {idx < lines.length ? `${idx + 1}/${lines.length}` : "✓"}</button>
                <button type="button" className={small} onClick={undo} disabled={idx === 0}>↶ Desfazer</button>
                <button type="button" className={small} onClick={() => { setIdx(0); if (audio.current) audio.current.currentTime = 0; }}>⟲ Recomeçar</button>
                <label className="ml-auto flex items-center gap-1.5 text-xs">Velocidade
                    <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="rounded-lg border border-[#0b1220]/15 px-2 py-1"><option value={0.75}>0,75×</option><option value={1}>1×</option><option value={1.25}>1,25×</option></select>
                </label>
            </div>
            <p className="mt-2 text-xs text-[#5b6478]">{done} de {lines.length} versos com tempo.</p>

            {lines.length === 0 ? (
                <p className="mt-3 rounded-xl bg-[#ffc14d]/20 p-3 text-xs text-[#6b4700]">Escreva ou cole a letra na caixa acima (um verso por linha) e volte a abrir o sincronizador.</p>
            ) : (
                <div ref={box} className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-xl bg-white p-2">
                    {lines.map((l, i) => (
                        <div key={i} data-row={i} className={`grid grid-cols-[6rem_1fr_auto] items-center gap-2 rounded-lg px-2 py-1 ${i === idx ? "bg-[#ffc14d]/25" : ""}`}>
                            <input aria-label={`Tempo do verso ${i + 1}`} defaultValue={l.time !== undefined ? formatTime(l.time) : ""} key={l.time ?? "x"} placeholder="mm:ss.xx" onBlur={(e) => e.target.value && setTime(i, e.target.value)} className={`${inputClass} !py-1 font-mono text-xs`} />
                            <button type="button" onClick={() => { setIdx(i); if (audio.current && l.time !== undefined) audio.current.currentTime = Math.max(0, l.time - 0.3); }} className="cursor-pointer truncate text-left text-sm hover:underline">{l.text}</button>
                            <span className="flex gap-1"><button type="button" className={small} onClick={() => nudge(i, -0.1)} aria-label="−0,1 s">−</button><button type="button" className={small} onClick={() => nudge(i, 0.1)} aria-label="+0,1 s">+</button></span>
                        </div>
                    ))}
                </div>
            )}

            {done >= 2 && (
                <div className="mt-4">
                    <p className="mb-1 text-xs font-medium">Pré-visualização (toque em ▶ para ver o karaoke)</p>
                    <div className="rounded-xl bg-[#f8f9fc] p-3"><KaraokeLines lines={lines} time={time} duration={audio.current?.duration} color={color} onSeek={(t) => { if (audio.current) audio.current.currentTime = t; }} /></div>
                </div>
            )}
        </div>
    );
}
