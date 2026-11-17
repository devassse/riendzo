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
 * Bell with the latest records. Opening a notification marks it as read: it leaves the list and
 * the red number (remembered in this browser). "Marcar tudo como lido" clears them all.
 * `base` is prepended to the links of the notices (e.g. "/pt" for the member portal).
 */
export default function NotificationBell({ notices, storageKey, base = "", extras = [], emptyText }: {
    notices: Notice[]; storageKey: string; base?: string; extras?: BellExtra[]; emptyText: string;
}) {
    const [open, setOpen] = useState(false);
    const [read, setRead] = useState<Set<string> | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const key = `${storageKey}-read`;

    useEffect(() => {
        try { setRead(new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])); } catch { setRead(new Set()); }
    }, [key]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [open]);

    const persist = (next: Set<string>) => {
        setRead(next);
        // keep only ids that still exist as notices, so the list in the browser never grows
        const alive = [...next].filter((id) => notices.some((n) => n.id === id));
        try { localStorage.setItem(key, JSON.stringify(alive)); } catch { /* private mode */ }
    };
    const markRead = (id: string) => persist(new Set([...(read ?? []), id]));
    const markAll = () => persist(new Set(notices.map((n) => n.id)));

    // until the browser memory is loaded nothing is counted (avoids a flash of numbers)
    const unread = read === null ? [] : notices.filter((n) => !read.has(n.id));
    const extra = extras.reduce((n, x) => n + x.count, 0);
    const badge = unread.length + extra;

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open} aria-label={badge ? `Notificações: ${badge} por ver` : "Notificações"} className="relative cursor-pointer rounded-full p-2 text-[#0b1220] hover:bg-[#eef2f8]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={BELL} /></svg>
                {badge > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e5533d] px-1 text-[11px] font-medium text-white">{badge > 99 ? "99+" : badge}</span>}
            </button>

            {open && (
                <div role="menu" className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#0b1220]/10 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#0b1220]/8 px-4 py-3">
                        <p className="font-baloo text-base font-bold text-[#0b1220]">Notificações</p>
                        {unread.length > 0 && <button type="button" onClick={markAll} className="cursor-pointer text-xs font-medium text-[#0054b5] hover:underline">Marcar tudo como lido</button>}
                    </div>
                    {extras.filter((x) => x.count > 0).map((x) => (
                        <Link key={x.href} href={x.href} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 border-b border-[#0b1220]/8 bg-[#fff8e6] px-4 py-2.5 text-sm text-[#5a3b00] hover:bg-[#fff1cc]">
                            <span>{x.label}</span><span className="rounded-full bg-[#ffc14d] px-2 text-xs font-medium">{x.count}</span>
                        </Link>
                    ))}
                    {unread.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-[#5b6478]">{emptyText}</p>
                    ) : (
                        <ul className="max-h-96 overflow-y-auto">
                            {unread.map((n) => (
                                <li key={n.id}>
                                    <Link href={`${base}${n.href}`} onClick={() => { markRead(n.id); setOpen(false); }} className="flex gap-3 px-4 py-3 text-left hover:bg-[#f3f6fb]">
                                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#eef2f8] text-lg" aria-hidden="true">{n.emoji}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#0054b5]">{n.label}</span>
                                            <span className="block truncate text-sm font-medium text-[#0b1220]">{n.title}</span>
                                            <span className="block text-[11px] text-[#5b6478]">{ago(n.at)}{n.by ? ` · por ${n.by}` : ""}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
