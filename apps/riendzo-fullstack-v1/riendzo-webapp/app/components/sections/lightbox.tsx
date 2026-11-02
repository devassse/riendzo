"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/** Full-screen photo viewer: arrows, keyboard (←, →, Esc), captions. */
export default function Lightbox({
    images, index, onIndex, onClose,
}: { images: { src: string; caption?: string }[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const open = index !== null && images.length > 0;

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onIndex(((index as number) + 1) % images.length);
            if (e.key === "ArrowLeft") onIndex(((index as number) - 1 + images.length) % images.length);
        };
        document.addEventListener("keydown", onKey);
        closeRef.current?.focus();
        return () => document.removeEventListener("keydown", onKey);
    }, [open, index, images.length, onIndex, onClose]);

    if (!open || typeof document === "undefined") return null;
    const cur = images[index as number];

    return createPortal(
        <div role="dialog" aria-modal="true" aria-label="Fotografias" className="fixed inset-0 z-[10000] flex flex-col bg-black/90" onClick={onClose}>
            <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
                <span>{(index as number) + 1} / {images.length}</span>
                <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar" className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">✕</button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-12" onClick={(e) => e.stopPropagation()}>
                {images.length > 1 && (
                    <button type="button" aria-label="Anterior" onClick={() => onIndex(((index as number) - 1 + images.length) % images.length)} className="absolute left-2 cursor-pointer rounded-full bg-white/10 px-3.5 py-2.5 text-xl text-white hover:bg-white/25">‹</button>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cur.src} alt={cur.caption ?? ""} className="max-h-full max-w-full rounded-lg object-contain" />
                {images.length > 1 && (
                    <button type="button" aria-label="Seguinte" onClick={() => onIndex(((index as number) + 1) % images.length)} className="absolute right-2 cursor-pointer rounded-full bg-white/10 px-3.5 py-2.5 text-xl text-white hover:bg-white/25">›</button>
                )}
            </div>
            <p className="min-h-12 px-4 py-3 text-center text-sm text-white/85" onClick={(e) => e.stopPropagation()}>{cur.caption}</p>
        </div>,
        document.body
    );
}
