"use client";

import { useState } from "react";
import Lightbox from "./lightbox";

/** Photo album: click any photo to view it full screen. */
export default function GalleryGrid({ images, alt, cols = "sm:grid-cols-3" }: { images: { src: string; caption?: string }[]; alt: string; cols?: string }) {
    const [index, setIndex] = useState<number | null>(null);
    if (!images.length) return null;
    return (
        <>
            <ul className={`grid grid-cols-2 gap-3 ${cols}`}>
                {images.map((im, i) => (
                    <li key={im.src + i}>
                        <button type="button" onClick={() => setIndex(i)} aria-label={`${alt} ${i + 1}`} className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#eef2f8]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={im.src} alt={im.caption ?? alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </button>
                    </li>
                ))}
            </ul>
            <Lightbox images={images} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
        </>
    );
}
