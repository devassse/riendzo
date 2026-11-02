"use client";

import { useState } from "react";
import type { CatalogPost } from "./catalog-types";
import GalleryGrid from "./gallery-grid";
import VideoEmbed from "./video-embed";

const fmt = (iso: string) => new Intl.DateTimeFormat("pt-MZ", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/**
 * Posts of a guide or content creator ("aventuras"): date, text, photo gallery (full-screen viewer)
 * and YouTube videos that only load when someone presses play.
 */
export default function PostsFeed({ posts, color = "#0054b5", initial = 4 }: { posts: CatalogPost[]; color?: string; initial?: number }) {
    const [shown, setShown] = useState(initial);
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    return (
        <div>
            <ol className="space-y-8">
                {sorted.slice(0, shown).map((p) => (
                    <li key={p.id}>
                        <article className="rounded-3xl border border-[#0b1220]/10 bg-white p-5 shadow-sm sm:p-6">
                            <time dateTime={p.date} className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color }}>{fmt(p.date)}</time>
                            <h3 className="mt-1 font-baloo text-xl font-bold leading-tight text-[#0b1220]">{p.title}</h3>
                            {p.text && <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#3c4658]">{p.text.split(/\n\s*\n/).map((t, i) => <p key={i} className="whitespace-pre-line">{t}</p>)}</div>}
                            {p.images?.length ? <div className="mt-4"><GalleryGrid images={p.images.map((src) => ({ src, caption: p.title }))} alt={p.title} cols="sm:grid-cols-3" /></div> : null}
                            {p.videos?.length ? <VideoEmbed videos={p.videos} color={color} /> : null}
                        </article>
                    </li>
                ))}
            </ol>
            {sorted.length > shown && (
                <div className="mt-6 text-center">
                    <button type="button" onClick={() => setShown((n) => n + 4)} className="cursor-pointer rounded-full border px-6 py-2.5 text-sm font-medium transition-colors hover:text-white" style={{ borderColor: color, color }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                        Ver mais ({sorted.length - shown})
                    </button>
                </div>
            )}
        </div>
    );
}
