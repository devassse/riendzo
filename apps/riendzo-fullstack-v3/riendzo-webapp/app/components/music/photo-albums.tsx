"use client";

import { useState } from "react";
import type { PhotoAlbum } from "@/lib/cms/artist-types";
import GalleryGrid from "@/app/components/sections/gallery-grid";

/** Photo albums of an artist: tabs per album, click a photo to enlarge. */
export default function PhotoAlbums({ albums, artist, color }: { albums: PhotoAlbum[]; artist: string; color: string }) {
    const [i, setI] = useState(0);
    if (!albums.length) return <p className="rounded-2xl bg-[#eef2f8] p-5 text-sm text-[#4b5568]">Álbuns de fotografias em breve.</p>;
    const cur = albums[Math.min(i, albums.length - 1)];
    return (
        <div>
            {albums.length > 1 && (
                <div role="tablist" className="mb-4 flex flex-wrap gap-2">
                    {albums.map((a, n) => (
                        <button key={a.title} type="button" role="tab" aria-selected={n === i} onClick={() => setI(n)} className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium" style={{ borderColor: n === i ? color : `${color}44`, backgroundColor: n === i ? color : "transparent", color: n === i ? "#fff" : "#0b1220" }}>
                            {a.title} <span className="opacity-70">{a.images.length}</span>
                        </button>
                    ))}
                </div>
            )}
            <GalleryGrid images={cur.images} alt={`${artist} · ${cur.title}`} cols="sm:grid-cols-3 lg:grid-cols-4" />
        </div>
    );
}
