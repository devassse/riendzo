"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Right-hand sliding panel (same behaviour as the catalog panel). */
export default function SidePanel({ open, onClose, label, closeLabel = "Fechar", children }: { open: boolean; onClose: () => void; label: string; closeLabel?: string; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        panelRef.current?.scrollTo({ top: 0 });
        closeRef.current?.focus();
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    }, [open, onClose]);

    if (!mounted) return null;
    return createPortal(
        <div className={`fixed inset-0 z-[9999] ${open ? "visible" : "pointer-events-none invisible transition-[visibility] delay-300"}`} aria-hidden={!open}>
            <div onClick={onClose} className={`absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
            <aside ref={panelRef} role="dialog" aria-modal="true" aria-label={label} className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out sm:rounded-l-[2rem] ${open ? "translate-x-0" : "translate-x-full"}`}>
                <button ref={closeRef} type="button" onClick={onClose} aria-label={closeLabel} className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#0b1220] shadow-md backdrop-blur-sm hover:bg-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
                {children}
            </aside>
        </div>,
        document.body
    );
}
