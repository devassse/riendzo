"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Notice } from "@/lib/cms/notifications";

const BELL = "M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 004 0";

function ago(iso: string) {
    const s = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
    const f = new Intl.RelativeTimeFormat("pt", { numeric: "auto" });
    const abs = Math.abs(s);
    if (abs < 3600) return f.format(Math.round(s / 60), "minute");
    if (abs < 86400) return f.format(Math.round(s / 3600), "hour");
    return f.format(Math.round(s / 86400), "day");
}

export type BellExtra = { href: string; label: string; count: number };

/**
 * Bell with the latest records. The red number counts what is newer than the last time
 * the panel was opened (remembered in this browser).
 * `base` is prepended to the links of the notices (e.g. "/pt" for the member portal).
 */
export default function NotificationBell({ notices, storageKey, base = "", extras = [], emptyText }: {
    notices: Notice[]; storageKey: string; base?: string; extras?: BellExtra[]; emptyText: string;
}) {
    const [open, setOpen] = useState(false);
    const [seen, setSeen] = useState<number | null>(null);
    const [cleared, setCleared] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try { setSeen(Number(localStorage.getItem(storageKey)) || 0); } catch { setSeen(0); }
    }, [storageKey]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [open]);

    const fresh = seen === null ? 0 : notices.filter((n) => new Date(n.at).getTime() > seen).length;
    const extra = extras.reduce((n, x) => n + x.count, 0);
    const badge = (cleared ? 0 : fresh) + extra;

    const toggle = () => {
        const next = !open;
        setOpen(next);
        if (next) {
            setCleared(true); // the number goes away, the "novo" tags stay while the panel is open
            try { localStorage.setItem(storageKey, String(Date.now())); } catch { /* private mode */ }
        }
    };

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={toggle} aria-haspopup="true" aria-expanded={open} aria-label={badge ? `Notificações: ${badge} novas` : "Notificações"} className="relative cursor-pointer rounded-full p-2 text-[#0b1220] hover:bg-[#eef2f8]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={BELL} /></svg>
                {badge > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e5533d] px-1 text-[11px] font-medium text-white">{badge > 99 ? "99+" : badge}</span>}
            </button>

            {open && (
                <div role="menu" className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#0b1220]/10 bg-white shadow-xl">
                    <p className="border-b border-[#0b1220]/8 px-4 py-3 font-baloo text-base font-bold text-[#0b1220]">Notificações</p>
                    {extras.filter((x) => x.count > 0).map((x) => (
                        <Link key={x.href} href={x.href} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 border-b border-[#0b1220]/8 bg-[#fff8e6] px-4 py-2.5 text-sm text-[#5a3b00] hover:bg-[#fff1cc]">
                            <span>{x.label}</span><span className="rounded-full bg-[#ffc14d] px-2 text-xs font-medium">{x.count}</span>
                        </Link>
                    ))}
                    {notices.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-[#5b6478]">{emptyText}</p>
                    ) : (
                        <ul className="max-h-96 overflow-y-auto">
                            {notices.map((n) => {
                                const isNew = seen !== null && new Date(n.at).getTime() > seen;
                                return (
                                    <li key={n.id}>
                                        <Link href={`${base}${n.href}`} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 text-left hover:bg-[#f3f6fb]">
                                            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#eef2f8] text-lg" aria-hidden="true">{n.emoji}</span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#0054b5]">{n.label}{isNew && <span className="ml-2 rounded-full bg-[#e5533d] px-1.5 text-[9px] text-white">novo</span>}</span>
                                                <span className="block truncate text-sm font-medium text-[#0b1220]">{n.title}</span>
                                                <span className="block text-[11px] text-[#5b6478]">{ago(n.at)}{n.by ? ` · por ${n.by}` : ""}</span>
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
