"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TrackEvent = { year: string; text: string; title?: string };

/**
 * "Fita do tempo": a horizontal ribbon you swipe (or move with the arrows / keyboard).
 * Events alternate above and below a glowing line; the bar underneath shows where you are.
 */
export default function TimelineTrack({ events, accent = "#0054b5", label = "Linha do tempo" }: { events: TrackEvent[]; accent?: string; label?: string }) {
    const ref = useRef<HTMLOListElement>(null);
    const [pos, setPos] = useState({ ratio: 0, atStart: true, atEnd: false });

    const update = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setPos({ ratio: max > 0 ? el.scrollLeft / max : 1, atStart: el.scrollLeft < 8, atEnd: el.scrollLeft > max - 8 });
    }, []);

    useEffect(() => {
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [update, events.length]);

    const go = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * Math.min(560, (ref.current?.clientWidth ?? 600) * 0.8), behavior: "smooth" });
    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };
    if (!events.length) return null;

    return (
        <section aria-label={label} className="relative">
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>{label}</p>
                <div className="flex gap-2">
                    {([-1, 1] as const).map((d) => (
                        <button key={d} type="button" onClick={() => go(d)} disabled={d === -1 ? pos.atStart : pos.atEnd} aria-label={d === -1 ? "Anterior" : "Seguinte"}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-lg transition-colors hover:text-white disabled:cursor-default disabled:opacity-30"
                            style={{ borderColor: `${accent}55`, color: accent, ["--hv" as string]: accent }}
                            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = accent; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}>
                            {d === -1 ? "←" : "→"}
                        </button>
                    ))}
                </div>
            </div>

            <ol
                ref={ref} onScroll={update} onKeyDown={onKey} tabIndex={0}
                className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-4 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-offset-4 [&::-webkit-scrollbar]:hidden"
                style={{ ["--tw-ring-color" as string]: accent }}
            >
                {events.map((e, i) => {
                    const up = i % 2 === 0; // card above the line, year below (and the opposite)
                    return (
                        <li key={`${e.year}-${i}`} className="relative h-[21rem] w-[17.5rem] flex-none snap-center sm:w-[19rem]">
                            {/* the line, continuous from one event to the next */}
                            <span aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}33, ${accent}, ${accent}33)` }} />
                            <span aria-hidden="true" className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white shadow-md" style={{ backgroundColor: accent, boxShadow: `0 0 0 5px ${accent}26` }} />
                            {/* stem */}
                            <span aria-hidden="true" className={`absolute left-[2.55rem] w-[2px] ${up ? "bottom-1/2 top-[8.2rem]" : "top-1/2 bottom-[8.2rem]"}`} style={{ backgroundColor: `${accent}66` }} />

                            <div className={`absolute inset-x-3 flex flex-col ${up ? "top-0 h-[8.2rem] justify-end" : "bottom-0 h-[8.2rem] justify-start"}`}>
                                <div className="rounded-2xl border bg-white p-4 shadow-[0_10px_30px_-18px_rgba(11,18,32,0.5)]" style={{ borderColor: `${accent}26` }}>
                                    {e.title && <p className="font-baloo text-[15px] font-bold leading-tight text-[#0b1220]">{e.title}</p>}
                                    <p className="line-clamp-4 text-[13px] leading-snug text-[#3c4658]">{e.text}</p>
                                </div>
                            </div>
                            <p className={`absolute left-6 font-baloo text-4xl font-extrabold leading-none tracking-tight ${up ? "top-[calc(50%+1.6rem)]" : "bottom-[calc(50%+1.6rem)]"}`} style={{ color: accent }}>{e.year}</p>
                        </li>
                    );
                })}
            </ol>

            <div aria-hidden="true" className="mt-1 h-1 overflow-hidden rounded-full" style={{ backgroundColor: `${accent}1f` }}>
                <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${Math.max(8, pos.ratio * 100)}%`, backgroundColor: accent }} />
            </div>
        </section>
    );
}
