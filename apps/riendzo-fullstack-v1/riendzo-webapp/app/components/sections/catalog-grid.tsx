"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import type { CatalogItem, CatalogLabels } from "./catalog-types";
import RichText from "./rich-text";
import VideoEmbed from "./video-embed";
import OffersView from "./offers-view";
import ContactButtons from "./contact-buttons";
import Lightbox from "./lightbox";
import { HoursTable, OpenPill } from "./open-status";
import { hasSchedule } from "@/lib/cms/hours";
import { toggleFavoriteAction } from "@/app/actions/member-actions";

const INK = "#0b1220";
const PAGE_SIZE = 6;

function Portal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted ? createPortal(children, document.body) : null;
}

const fill = (tpl: string, count: number) => tpl.replace("{count}", String(count));
const normalize = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function pageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    sorted.forEach((n, i) => {
        if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
        out.push(n);
    });
    return out;
}

function CoverPlaceholder({ color, emoji, label }: { color: string; emoji: string; label?: string }) {
    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}45 0%, ${color}14 70%, transparent 100%)` }}>
            <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-10 -top-10 h-56 w-56 opacity-60">
                <circle cx="100" cy="100" r="92" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
                <circle cx="100" cy="100" r="66" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
                <circle cx="100" cy="100" r="40" fill={color} opacity="0.12" />
            </svg>
            <span aria-hidden="true" className="relative text-5xl drop-shadow-sm">{emoji}</span>
            {label && <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-[0.18em] text-[#5b6478]">{label}</span>}
        </div>
    );
}

function Meta({ item, size = "sm" }: { item: CatalogItem; size?: "sm" | "md" }) {
    if (!item.meta?.length) return null;
    return (
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[#5b6478] ${size === "md" ? "text-sm" : "text-xs"}`}>
            {item.meta.slice(0, 3).map((m) => (
                <span key={m} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: item.color }} />
                    {m}
                </span>
            ))}
        </div>
    );
}

const Heart = ({ on }: { on: boolean }) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.500-7 10-7 10z" />
    </svg>
);

function CatalogCard({
    item, labels, onOpen, favorite, onFavorite,
}: {
    item: CatalogItem; labels: CatalogLabels;
    onOpen: (item: CatalogItem, trigger: HTMLElement) => void;
    favorite?: boolean; onFavorite?: () => void;
}) {
    const cover = item.images?.[0];
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#0b1220]/10 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0b1220]/25 hover:shadow-lg">
            <button
                type="button" onClick={(e) => onOpen(item, e.currentTarget)} aria-haspopup="dialog"
                className="flex flex-1 cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: item.color }}
            >
                <div className="relative h-44 w-full overflow-hidden">
                    {cover ? (
                        <Image src={cover} alt={item.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <CoverPlaceholder color={item.color} emoji={item.emoji} />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-montserrat-italic uppercase tracking-[0.18em] backdrop-blur-sm" style={{ color: item.color }}>
                        {item.tag}
                    </span>
                    {item.featured && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#f0a83a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3a2500]">★ {labels.featured}</span>
                    )}
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                    <h3 className="font-baloo text-lg font-medium text-[#0b1220]">{item.title}</h3>
                    {hasSchedule(item.hours) && <div className="mt-1.5"><OpenPill hours={item.hours} /></div>}
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#5b6478]">{item.summary}</p>
                    <p className="mt-3 text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: item.color }}>{item.categories.join(" · ")}</p>
                    {item.meta?.length ? <div className="mt-4"><Meta item={item} /></div> : null}
                    <span className="mt-5 flex items-center gap-1 text-sm font-baloo font-medium" style={{ color: item.color }}>
                        {labels.open}
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                </div>
            </button>
            {onFavorite && (
                <button
                    type="button" onClick={onFavorite} aria-pressed={favorite}
                    aria-label={favorite ? labels.removeFavorite : labels.addFavorite}
                    className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform hover:scale-110"
                    style={{ color: favorite ? "#e5533d" : "#4b5568" }}
                >
                    <Heart on={Boolean(favorite)} />
                </button>
            )}
            <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: item.color }} />
        </div>
    );
}

export default function CatalogGrid({
    items, labels, collectionId, detailBase, favorites, memberLoggedIn, loginHref = "/conta/entrar",
}: {
    items: CatalogItem[];
    labels: CatalogLabels;
    collectionId?: string;
    /** Public path of the collection when every entry has its own page, e.g. /gastronomia/restaurantes */
    detailBase?: string;
    /** "collection:slug" keys the logged-in member has favourited */
    favorites?: string[];
    memberLoggedIn?: boolean;
    loginHref?: string;
}) {
    const router = useRouter();
    const [, startFav] = useTransition();
    const [favs, setFavs] = useState<Set<string>>(() => new Set(favorites ?? []));

    const [selected, setSelected] = useState<CatalogItem | null>(null);
    const [open, setOpen] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [box, setBox] = useState<number | null>(null);

    const [category, setCategory] = useState<string>("all");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const gridTopRef = useRef<HTMLDivElement>(null);

    const categoryList = useMemo(() => {
        const seen: string[] = [];
        items.forEach((i) => i.categories.forEach((c) => { if (!seen.includes(c)) seen.push(c); }));
        return seen;
    }, [items]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: items.length };
        categoryList.forEach((cat) => (c[cat] = items.filter((i) => i.categories.includes(cat)).length));
        return c;
    }, [items, categoryList]);

    const filtered = useMemo(() => {
        const q = normalize(query.trim());
        return items.filter(
            (i) =>
                (category === "all" || i.categories.includes(category)) &&
                (!q || normalize(i.title).includes(q) || normalize(i.tag).includes(q) || normalize(i.summary).includes(q) ||
                    i.categories.some((c) => normalize(c).includes(q)) || (i.keywords ?? []).some((k) => normalize(k).includes(q)))
        );
    }, [items, category, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const goToPage = (n: number) => {
        setPage(n);
        gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const chips = [{ key: "all", label: labels.all }, ...categoryList.map((c) => ({ key: c, label: c }))];

    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    const openItem = useCallback((item: CatalogItem, trigger?: HTMLElement) => {
        triggerRef.current = trigger ?? null;
        setSelected(item);
        setActiveImg(0);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        setOpen(false);
        triggerRef.current?.focus();
    }, []);

    // Search results link here with ?item=<slug>
    useEffect(() => {
        const slug = new URLSearchParams(window.location.search).get("item");
        const it = slug ? items.find((i) => i.slug === slug) : null;
        if (it) {
            const idx = items.indexOf(it);
            setPage(Math.floor(idx / PAGE_SIZE) + 1);
            openItem(it);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && box === null) close(); };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        panelRef.current?.scrollTo({ top: 0 });
        closeRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, close, box]);

    const toggleFav = (item: CatalogItem) => {
        if (!collectionId) return;
        if (!memberLoggedIn) {
            router.push(`${loginHref}?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const key = `${collectionId}:${item.slug}`;
        setFavs((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });
        startFav(async () => { await toggleFavoriteAction(collectionId, item.slug); });
    };
    const isFav = (item: CatalogItem) => favs.has(`${collectionId}:${item.slug}`);

    const images = selected?.images ?? [];
    const lightboxImages = images.map((src) => ({ src, caption: selected?.title }));
    const cl = { whatsapp: labels.whatsapp, call: labels.call, sendEmail: labels.sendEmail, website: labels.website, openMap: labels.openMap, directions: labels.directions };

    return (
        <>
            <div ref={gridTopRef} className="scroll-mt-28">
                <input
                    type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder={labels.searchPlaceholder} aria-label={labels.searchPlaceholder}
                    className="w-full rounded-full border border-[#0b1220]/15 bg-white px-5 py-3 text-sm text-[#0b1220] outline-none transition-colors placeholder:text-[#5b6478] focus:border-[#0b1220]/50"
                />
                {chips.length > 2 && (
                    <div role="tablist" aria-label={labels.categoriesAria} className="mt-4 flex flex-wrap items-center gap-2">
                        {chips.map((chip) => {
                            const active = category === chip.key;
                            return (
                                <button
                                    key={chip.key} type="button" role="tab" aria-selected={active}
                                    onClick={() => { setCategory(chip.key); setPage(1); }}
                                    className="flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium transition-colors duration-200"
                                    style={{ borderColor: active ? INK : `${INK}1a`, backgroundColor: active ? INK : "transparent", color: active ? "#fff" : INK }}
                                >
                                    {chip.label}
                                    <span className="opacity-60">{counts[chip.key]}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <p className="mt-4 text-xs text-[#5b6478]" aria-live="polite">{fill(labels.results, filtered.length)}</p>
            </div>

            {visible.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((item) => (
                        <CatalogCard
                            key={item.slug} item={item} labels={labels} onOpen={openItem}
                            favorite={isFav(item)} onFavorite={collectionId ? () => toggleFav(item) : undefined}
                        />
                    ))}
                </div>
            ) : (
                <p className="mt-16 text-center text-sm text-[#5b6478]">{labels.noResults}</p>
            )}

            {totalPages > 1 && (
                <nav aria-label={labels.paginationAria} className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label={labels.prev} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#0b1220]/15 text-[#0b1220] transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30">←</button>
                    {pageNumbers(currentPage, totalPages).map((n, i) =>
                        n === "…" ? (
                            <span key={`gap-${i}`} className="px-1 text-[#5b6478]">…</span>
                        ) : (
                            <button
                                key={n} type="button" onClick={() => goToPage(n)} aria-label={fill(labels.page, n)} aria-current={n === currentPage ? "page" : undefined}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-sm font-baloo font-medium transition-colors"
                                style={{ borderColor: n === currentPage ? INK : `${INK}26`, backgroundColor: n === currentPage ? INK : "transparent", color: n === currentPage ? "#fff" : INK }}
                            >{n}</button>
                        )
                    )}
                    <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label={labels.next} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#0b1220]/15 text-[#0b1220] transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30">→</button>
                </nav>
            )}

            {/* ===================== RIGHT SIDE PANEL ===================== */}
            <Portal>
                <div className={`fixed inset-0 z-[9999] ${open ? "visible" : "pointer-events-none invisible transition-[visibility] delay-300"}`} aria-hidden={!open}>
                    <div onClick={close} className={`absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
                    <aside
                        ref={panelRef} role="dialog" aria-modal="true" aria-label={selected?.title}
                        className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out sm:rounded-l-[2rem] ${open ? "translate-x-0" : "translate-x-full"}`}
                    >
                        {selected && (
                            <>
                                <div className="relative h-64 w-full overflow-hidden sm:h-72">
                                    {images.length > 0 ? (
                                        <button type="button" onClick={() => setBox(activeImg)} aria-label={labels.gallery} className="absolute inset-0 cursor-zoom-in">
                                            <Image key={images[activeImg]} src={images[activeImg]} alt={`${selected.title} (${activeImg + 1}/${images.length})`} fill sizes="(min-width: 640px) 576px, 100vw" className="object-cover" priority />
                                        </button>
                                    ) : (
                                        <CoverPlaceholder color={selected.color} emoji={selected.emoji} label={labels.photoSoon} />
                                    )}
                                    <button ref={closeRef} type="button" onClick={close} aria-label={labels.close} className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#0b1220] shadow-md backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: selected.color }}>
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                                    </button>
                                </div>

                                {images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto px-6 pt-4">
                                        {images.map((src, i) => (
                                            <button key={src} type="button" onClick={() => setActiveImg(i)} aria-label={`${selected.title} ${i + 1}`} aria-current={i === activeImg}
                                                className="relative h-16 w-20 flex-none cursor-pointer overflow-hidden rounded-xl transition-opacity"
                                                style={{ opacity: i === activeImg ? 1 : 0.55, boxShadow: i === activeImg ? `0 0 0 2px ${selected.color}` : "none" }}>
                                                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="px-6 pb-12 pt-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: selected.color }}>{selected.tag}</span>
                                        {selected.featured && <span className="rounded-full bg-[#f0a83a] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#3a2500]">★ {labels.featured}</span>}
                                    </div>
                                    <h3 className="mt-1 font-baloo text-3xl font-bold leading-tight text-[#0b1220]">{selected.title}</h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selected.categories.map((c) => (
                                            <span key={c} className="rounded-full px-3 py-1 text-xs font-baloo font-medium" style={{ backgroundColor: `${selected.color}1f`, color: selected.color }}>{c}</span>
                                        ))}
                                    </div>

                                    <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">{selected.summary}</p>
                                    {selected.meta?.length ? <div className="mt-4"><Meta item={selected} size="md" /></div> : null}

                                    {(selected.contact || selected.location) && (
                                        <div className="mt-5"><ContactButtons contact={selected.contact} location={selected.location} name={selected.title} labels={cl} color={selected.color} /></div>
                                    )}

                                    {detailBase && (
                                        <Link href={`${detailBase}/${selected.slug}`} className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-baloo font-medium transition-colors hover:bg-[#0b1220]/5" style={{ borderColor: `${selected.color}88`, color: selected.color }}>
                                            {labels.openPage} <span aria-hidden="true">→</span>
                                        </Link>
                                    )}

                                    {hasSchedule(selected.hours) && (
                                        <div className="mt-6 rounded-2xl border border-[#0b1220]/10 p-4">
                                            <div className="mb-3"><OpenPill hours={selected.hours} size="md" /></div>
                                            <HoursTable hours={selected.hours} color={selected.color} />
                                        </div>
                                    )}

                                    {selected.body && <RichText html={selected.body} className="mt-6" />}

                                    {selected.facts?.length ? (
                                        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {selected.facts.map((f) => (
                                                <div key={f.label} className="rounded-2xl border border-[#0b1220]/10 px-4 py-3">
                                                    <dt className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: selected.color }}>{f.label}</dt>
                                                    <dd className="mt-1 text-sm leading-snug text-[#0b1220]">{f.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : null}

                                    {selected.blocks?.map((block, bi) => (
                                        <div key={bi}>
                                            {block.heading && <h4 className="mt-8 font-baloo text-lg font-medium text-[#0b1220]">{block.heading}</h4>}
                                            {block.kind === "list" && (
                                                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                                                    {block.items.map((it) => (
                                                        <li key={it} className="flex items-start gap-2.5 text-sm text-[#0b1220]">
                                                            <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: selected.color }} />{it}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {block.kind === "steps" && (
                                                <ol className="mt-3 space-y-4">
                                                    {block.items.map((step, i) => (
                                                        <li key={i} className="flex gap-3">
                                                            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: selected.color }}>{i + 1}</span>
                                                            <p className="pt-0.5 text-sm leading-relaxed text-[#0b1220]">{step}</p>
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                            {block.kind === "text" && (
                                                <div className={block.heading ? "mt-3 space-y-3" : "mt-8 space-y-3"}>
                                                    {block.items.map((p, i) => <p key={i} className="text-sm leading-relaxed text-[#0b1220]">{p}</p>)}
                                                </div>
                                            )}
                                            {block.kind === "tags" && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {block.items.map((tag) => <span key={tag} className="rounded-full border px-3 py-1 text-xs text-[#0b1220]" style={{ borderColor: `${selected.color}66` }}>{tag}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {selected.offers?.length ? (
                                        <div className="mt-8">
                                            <OffersView offers={selected.offers} currency={selected.currency} color={selected.color} unavailable={labels.unavailable} />
                                        </div>
                                    ) : null}

                                    {selected.videos?.length ? <VideoEmbed videos={selected.videos} color={selected.color} title={labels.videos} /> : null}

                                    {selected.tip && (
                                        <div className="mt-8 rounded-2xl p-4 text-sm leading-relaxed text-[#0b1220]" style={{ backgroundColor: `${selected.color}14` }}>
                                            <span className="mb-1 block text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: selected.color }}>{selected.tipLabel ?? labels.tip}</span>
                                            {selected.tip}
                                        </div>
                                    )}

                                    {selected.link && (
                                        <a href={selected.link.href} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-baloo font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: selected.color }}>
                                            {selected.link.label}<span aria-hidden="true">↗</span>
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            </Portal>
            <Lightbox images={lightboxImages} index={box} onIndex={setBox} onClose={() => setBox(null)} />
        </>
    );
}
