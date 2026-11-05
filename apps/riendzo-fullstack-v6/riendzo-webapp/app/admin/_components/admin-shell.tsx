"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IconBook, IconFilm, IconHeart, IconNews, IconNote, IconPalm, IconPot, IconScroll,
} from "@/app/components/utils/riendzo-icons";
import { logoutAction } from "../actions";
import NotificationBell from "@/app/components/notifications/notification-bell";
import ThemeToggle from "@/app/components/utils/theme-toggle";
import type { Notice } from "@/lib/cms/notifications";

export type NavGroup = {
    id: string; label: string; color: string;
    items: { id: string; label: string; count: number; drafts: number; /** custom page (default: /admin/c/<id>) */ href?: string }[];
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    history: IconScroll,
    music: IconNote,
    gastronomy: IconPot,
    tourism: IconPalm,
    services: IconBook,
    entertainment: IconFilm,
    blog: IconNews,
};

const I = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
    </svg>
);
const HOME = "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10";
const IMAGES = "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9h.01";
const HELP = "M9.5 9a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4M12 17h.01M12 3a9 9 0 100 18 9 9 0 000-18z";
const SEARCH = "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3";

export default function AdminShell({
    groups, user, role, avatar, drafts, unread, notices, children,
}: { groups: NavGroup[]; user: string; role: string; avatar?: string; drafts: number; unread: number; notices: Notice[]; children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobile, setMobile] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Section that owns the current page opens by itself
    useEffect(() => {
        const g = groups.find((x) => x.items.some((i) => pathname.startsWith(i.href ?? `/admin/c/${i.id}`)));
        if (g) setOpenId(g.id);
    }, [pathname, groups]);

    // Ctrl/Cmd + K focuses the search
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const row = (active: boolean) =>
        `flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-left text-[14px] transition-colors ${
            active ? "bg-white/18 font-medium text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
        }`;
    const close = () => setMobile(false);

    const sidebar = (
        <nav aria-label="Menu do BackOffice" className="relative flex h-full flex-col overflow-y-auto px-3 pb-6 pt-6">
            <Link href="/admin" onClick={close} className="mb-7 block px-3" aria-label="Riendzo BackOffice">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-logo-white.png" alt="Riendzo, assistente de viagens" className="h-auto w-44" />
            </Link>

            <Link href="/admin" onClick={close} className={row(pathname === "/admin")}>
                <I d={HOME} /> Dashboard
            </Link>
            <Link href="/admin/home" onClick={close} className={`${row(pathname === "/admin/home")} mt-1`}>
                <I d={HOME} /> Home (página inicial)
            </Link>
            <Link href="/admin/territorios" onClick={close} className={`${row(pathname === "/admin/territorios")} mt-1`}>
                <I d={HOME} /> Divisão administrativa
            </Link>
            <Link href="/admin/textos" onClick={close} className={`${row(pathname === "/admin/textos")} mt-1`}>
                <I d={HELP} /> Textos das páginas
            </Link>
            <Link href="/admin/linhas-do-tempo" onClick={close} className={`${row(pathname === "/admin/linhas-do-tempo")} mt-1`}>
                <I d={HELP} /> Linhas do tempo
            </Link>
            <Link href="/admin/historia" onClick={close} className={`${row(pathname === "/admin/historia")} mt-1`}>
                <I d={IMAGES} /> Aspeto da Cronologia
            </Link>
            <Link href="/admin/media" onClick={close} className={`${row(pathname === "/admin/media")} mt-1`}>
                <I d={IMAGES} /> Biblioteca de media
            </Link>

            <div className="mt-1 space-y-1">
                {groups.map((g) => {
                    const Icon = ICONS[g.id];
                    const isOpen = openId === g.id;
                    const active = g.items.some((i) => pathname.startsWith(i.href ?? `/admin/c/${i.id}`));

                    return (
                        <div key={g.id}>
                            <button type="button" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : g.id)} className={`${row(active && !isOpen)} cursor-pointer`}>
                                <Icon className="h-5 w-5" />
                                <span className="flex-1">{g.label}</span>
                                <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                            </button>
                            {isOpen && (
                                <div className="ml-[2.1rem] mt-1 space-y-0.5 border-l border-white/20 pl-3">
                                    {g.items.map((it) => {
                                        const href = it.href ?? `/admin/c/${it.id}`;
                                        const on = pathname.startsWith(href);
                                        return (
                                            <Link key={it.id} href={href} onClick={close} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${on ? "bg-white/18 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
                                                <span>{it.label}</span>
                                                <span className="flex items-center gap-1.5 text-[11px] text-white/70">
                                                    {it.drafts > 0 && <span title="Rascunhos" className="rounded-full bg-[#ffc14d] px-1.5 text-[10px] font-medium text-[#5a3b00]">{it.drafts}</span>}
                                                    {it.count}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {role === "admin" && (
                <div className="mt-1">
                    <button type="button" aria-expanded={openId === "admin-module"} onClick={() => setOpenId(openId === "admin-module" ? null : "admin-module")} className={`${row(pathname.startsWith("/admin/administrador") && openId !== "admin-module")} cursor-pointer`}>
                        <I d="M12 3l8 4v5c0 5-3.500 8-8 9-4.500-1-8-4-8-9V7zM9 12l2 2 4-4" />
                        <span className="flex-1">Administrador</span>
                        {unread > 0 && <span className="rounded-full bg-[#e5533d] px-1.5 text-[10px] font-medium text-white">{unread}</span>}
                        <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${openId === "admin-module" ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                    {(openId === "admin-module" || pathname.startsWith("/admin/administrador")) && (
                        <div className="ml-[2.1rem] mt-1 space-y-0.5 border-l border-white/20 pl-3">
                            {[["listas", "Dados genéricos"], ["menus", "Menus e “Em breve”"], ["utilizadores", "Utilizadores"], ["membros", "Membros Riendzo AI"], ["mensagens", "Mensagens"], ["configuracoes", "Configurações"]].map(([k, l]) => {
                                const href = `/admin/administrador/${k}`;
                                return <Link key={k} href={href} onClick={close} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px] ${pathname.startsWith(href) ? "bg-white/18 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{l}{k === "mensagens" && unread > 0 && <span className="rounded-full bg-[#ffc14d] px-1.5 text-[10px] font-medium text-[#5a3b00]">{unread}</span>}</Link>;
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="my-5 border-t border-white/20" />
            <Link href="/admin/ajuda" onClick={close} className={row(pathname === "/admin/ajuda")}>
                <I d={HELP} /> Ajuda &amp; Suporte
            </Link>

            {/* Brand watermark + slogan */}
            <div className="relative mt-auto pt-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-emblem-white.png" alt="" aria-hidden="true" className="pointer-events-none mx-auto h-40 w-auto opacity-[0.16]" />
                <p className="mt-3 px-3 text-sm leading-snug text-white/90">
                    Descubra
                    <br />
                    Moçambique,
                    <br />
                    <b className="font-medium">viaje melhor.</b>
                </p>
            </div>
        </nav>
    );

    const initials = user.slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen lg:grid lg:grid-cols-[17.5rem_1fr]">
            <aside className="sticky top-0 hidden h-screen bg-gradient-to-b from-[#0058bd] to-[#003c8a] lg:block">{sidebar}</aside>

            {mobile && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={close} />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#0058bd] to-[#003c8a]">{sidebar}</aside>
                </div>
            )}

            <div className="min-w-0">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#0b1220]/8 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
                    <button type="button" aria-label="Abrir menu" onClick={() => setMobile(true)} className="cursor-pointer rounded-lg border border-[#0b1220]/15 px-3 py-2 text-sm lg:hidden">☰</button>

                    <div className="hidden min-w-0 md:block">
                        <p className="truncate font-baloo text-xl font-bold leading-tight text-[#0b1220]">Riendzo BackOffice</p>
                        <p className="truncate text-xs text-[#4b5568]">Conteúdo. Pessoas. Moçambique.</p>
                    </div>

                    <form action="/admin/pesquisa" role="search" className="ml-auto flex max-w-xl flex-1 items-center gap-3 rounded-2xl bg-[#eef2f8] px-4 py-2.5">
                        <I d={SEARCH} className="h-5 w-5 text-[#4b5568]" />
                        <input ref={searchRef} name="q" type="search" placeholder="Pesquisar conteúdos em todos os menus…" aria-label="Pesquisar conteúdos" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#6b7588]" />
                        <kbd className="hidden rounded-md border border-[#0b1220]/10 bg-white px-2 py-0.5 text-[11px] text-[#4b5568] sm:block">Ctrl + K</kbd>
                    </form>

                    <ThemeToggle />
                    <NotificationBell
                        notices={notices} storageKey="riendzo-admin-notices" emptyText="Sem notificações novas."
                        extras={[
                            { href: "/admin?status=draft", label: "Rascunhos por publicar", count: drafts },
                            ...(role === "admin" ? [{ href: "/admin/administrador/mensagens", label: "Mensagens por ler", count: unread }] : []),
                        ]}
                    />

                    <details className="relative">
                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-[#eef2f8] [&::-webkit-details-marker]:hidden">
                            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0054b5] font-baloo text-sm font-bold text-white">
                                {avatar /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials}
                            </span>
                            <span className="hidden text-left leading-tight sm:block">
                                <span className="block text-sm font-medium">{user}</span>
                                <span className="block text-xs text-[#4b5568]">{role === "admin" ? "Administrador" : "Editor"}</span>
                            </span>
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                        </summary>
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#0b1220]/10 bg-white p-2 shadow-lg">
                            <Link href="/admin/perfil" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#eef2f8]">O meu perfil</Link>
                            <a href="/pt" target="_blank" rel="noopener noreferrer" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#eef2f8]">Ver site ↗</a>
                            <form action={logoutAction}>
                                <button type="submit" className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-[#d23b25] hover:bg-[#eef2f8]">Sair</button>
                            </form>
                        </div>
                    </details>
                </header>

                <main className="px-4 py-6 sm:px-8">{children}</main>
            </div>
        </div>
    );
}
