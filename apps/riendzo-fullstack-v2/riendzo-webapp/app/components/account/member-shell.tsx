"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutMemberAction } from "@/app/actions/member-actions";
import NotificationBell from "@/app/components/notifications/notification-bell";
import type { Notice } from "@/lib/cms/notifications";

export type MemberGroup = { id: string; label: string; emoji: string; items: { id: string; label: string }[] };

const I = ({ d, c = "h-5 w-5" }: { d: string; c?: string }) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/**
 * Riendzo AI member portal: same layout as the BackOffice, view-only options.
 * Links use plain <a>/Link with the locale taken from the current path.
 */
export default function MemberShell({ groups, name, avatar, locale, notices, children }: { groups: MemberGroup[]; name: string; avatar?: string; locale: string; notices: Notice[]; children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobile, setMobile] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const base = `/${locale}/conta`;
    const row = (on: boolean) => `flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-left text-[14px] transition-colors ${on ? "bg-white/18 font-medium text-white" : "text-white/85 hover:bg-white/10 hover:text-white"}`;
    const close = () => setMobile(false);

    const nav = (
        <nav aria-label="Menu da conta" className="relative flex h-full flex-col overflow-y-auto px-3 pb-6 pt-6">
            <Link href={`/${locale}`} className="mb-7 block px-3" aria-label="Riendzo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-logo-white.png" alt="Riendzo, assistente de viagens" className="h-auto w-44" />
            </Link>
            <Link href={base} onClick={close} className={row(pathname === base)}><I d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" /> Início</Link>
            <Link href={`${base}/favoritos`} onClick={close} className={`${row(pathname.startsWith(`${base}/favoritos`))} mt-1`}><I d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /> Favoritos</Link>
            <Link href={`${base}/perfil`} onClick={close} className={`${row(pathname.startsWith(`${base}/perfil`))} mt-1`}><I d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" /> O meu perfil</Link>

            <p className="mb-1 mt-6 px-4 text-[10px] font-montserrat-italic uppercase tracking-[0.18em] text-white/60">Explorar</p>
            {groups.map((g) => {
                const open = openId === g.id || g.items.some((i) => pathname.startsWith(`${base}/explorar/${i.id}`));
                return (
                    <div key={g.id}>
                        <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : g.id)} className={`${row(false)} cursor-pointer`}>
                            <span aria-hidden="true" className="w-5 text-center">{g.emoji}</span><span className="flex-1">{g.label}</span>
                            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                        </button>
                        {open && (
                            <div className="ml-[2.1rem] mt-1 space-y-0.5 border-l border-white/20 pl-3">
                                {g.items.map((it) => {
                                    const href = `${base}/explorar/${it.id}`;
                                    return <Link key={it.id} href={href} onClick={close} className={`block rounded-lg px-3 py-1.5 text-[13px] ${pathname.startsWith(href) ? "bg-white/18 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{it.label}</Link>;
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="relative mt-auto pt-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-emblem-white.png" alt="" aria-hidden="true" className="pointer-events-none mx-auto h-36 w-auto opacity-[0.16]" />
                <p className="mt-3 px-3 text-sm leading-snug text-white/90">Descubra<br />Moçambique,<br /><b className="font-medium">viaje melhor.</b></p>
            </div>
        </nav>
    );

    const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div className="min-h-screen bg-[#f3f6fb] text-[#0b1220] lg:grid lg:grid-cols-[17.5rem_1fr]">
            <aside className="sticky top-0 hidden h-screen bg-gradient-to-b from-[#0058bd] to-[#003c8a] lg:block">{nav}</aside>
            {mobile && (
                <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={close} /><aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#0058bd] to-[#003c8a]">{nav}</aside></div>
            )}
            <div className="min-w-0">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#0b1220]/8 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
                    <button type="button" aria-label="Abrir menu" onClick={() => setMobile(true)} className="cursor-pointer rounded-lg border border-[#0b1220]/15 px-3 py-2 text-sm lg:hidden">☰</button>
                    <div className="hidden md:block"><p className="font-baloo text-xl font-bold leading-tight">Riendzo AI</p><p className="text-xs text-[#4b5568]">A sua conta pessoal</p></div>
                    <form action={`/${locale}/pesquisa`} role="search" className="ml-auto flex max-w-xl flex-1 items-center gap-3 rounded-2xl bg-[#eef2f8] px-4 py-2.5">
                        <I d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3" c="h-5 w-5 text-[#4b5568]" />
                        <input name="q" type="search" placeholder="Pesquisar em toda a plataforma…" aria-label="Pesquisar" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#6b7588]" />
                    </form>
                    <NotificationBell notices={notices} storageKey="riendzo-member-notices" base={`/${locale}`} emptyText="Ainda não há novidades." />

                    <details className="relative">
                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-[#eef2f8] [&::-webkit-details-marker]:hidden">
                            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0054b5] font-baloo text-sm font-bold text-white">
                                {avatar /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials}
                            </span>
                            <span className="hidden text-left leading-tight sm:block"><span className="block text-sm font-medium">{name}</span><span className="block text-xs text-[#4b5568]">Membro</span></span>
                        </summary>
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#0b1220]/10 bg-white p-2 shadow-lg">
                            <Link href={`${base}/perfil`} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#eef2f8]">O meu perfil</Link>
                            <Link href={`/${locale}`} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#eef2f8]">Voltar ao site</Link>
                            <form action={logoutMemberAction}><button type="submit" className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-[#d23b25] hover:bg-[#eef2f8]">Sair</button></form>
                        </div>
                    </details>
                </header>
                <main className="px-4 py-6 sm:px-8">{children}</main>
            </div>
        </div>
    );
}
