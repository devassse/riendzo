"use client";

import { useState } from "react";
import { youtubeId } from "@/lib/cms/sanitize";

export type VideoItem = { title: string; url: string; creator?: string };

/**
 * Videos from national content creators. Nothing from YouTube loads until the
 * visitor presses play (privacy + speed); the player uses youtube-nocookie.
 */
export default function VideoEmbed({ videos, color = "#0054b5", title }: { videos: VideoItem[]; color?: string; title?: string }) {
    const [playing, setPlaying] = useState<string | null>(null);
    const valid = videos.map((v) => ({ ...v, id: youtubeId(v.url) })).filter((v): v is VideoItem & { id: string } => Boolean(v.id));
    if (!valid.length) return null;

    return (
        <div>
            {title && <h4 className="mt-8 font-baloo text-lg font-medium text-[#0b1220]">{title}</h4>}
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {valid.map((v) => (
                    <li key={v.id} className="overflow-hidden rounded-2xl border border-[#0b1220]/10 bg-white">
                        <div className="relative aspect-video bg-[#0b1220]">
                            {playing === v.id ? (
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                                    title={v.title}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className="absolute inset-0 h-full w-full border-0"
                                />
                            ) : (
                                <button type="button" onClick={() => setPlaying(v.id)} aria-label={`Reproduzir: ${v.title}`} className="group absolute inset-0 cursor-pointer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    </span>
                                </button>
                            )}
                        </div>
                        <div className="p-3">
                            <p className="line-clamp-2 text-sm font-medium text-[#0b1220]">{v.title}</p>
                            {v.creator && <p className="mt-0.5 text-xs text-[#5b6478]">por {v.creator}</p>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
