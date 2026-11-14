"use client";

import { useEffect, useRef, useState } from "react";
import type { OfferGroup, OfferItem } from "./catalog-types";
import { ORDER_ADD_EVENT, ORDER_PANEL_ID } from "@/lib/order-events";
import { activeHighlights, highlightLabels, isActive, shortDate, todayMaputo, type Highlight } from "@/lib/cms/highlights";

const STYLE: Record<Highlight, { icon: string; bg: string; fg: string }> = {
    daily: { icon: "🍽️", bg: "#fff1cc", fg: "#7a4b00" },
    recommended: { icon: "⭐", bg: "#e3f0ff", fg: "#0b4a99" },
    popular: { icon: "🔥", bg: "#ffe6e0", fg: "#a3301a" },
};

const SYMBOL: Record<string, string> = { MZN: "MT", USD: "US$", ZAR: "R", EUR: "€" };

export const formatPrice = (n: number, currency = "MZN") => {
    const num = n.toLocaleString("pt-PT", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
    return currency === "MZN" ? `${num} MT` : `${SYMBOL[currency] ?? currency} ${num}`;
};

type Picked = { item: OfferItem; group: string };

/** Photos (big + thumbnails), full description, tags, price and the "request" button. Remounted for each item. */
function Detail({ picked, currency, color, unavailable, tagsLabel, requestLabel, labels, today, onRequest, onClose }: {
    picked: Picked; currency: string; color: string; unavailable: string; tagsLabel: string; requestLabel?: string;
    labels: Record<Highlight, string>; today: string; onRequest: () => void; onClose: () => void;
}) {
    const { item } = picked;
    const imgs = item.images ?? [];
    const [i, setI] = useState(0);
    const off = item.available === false;
    const hl = isActive(item, today) && item.highlight ? item.highlight : null;
    const go = (d: number) => setI((n) => (n + d + imgs.length) % imgs.length);

    return (
        <div>
            <div className="relative bg-[#eef2f8]">
                {imgs.length > 0 ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgs[i]} alt={`${item.name}, foto ${i + 1} de ${imgs.length}`} className="aspect-[4/3] max-h-[40dvh] w-full object-cover" />
                        {imgs.length > 1 && (
                            <>
                                <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/55 text-xl text-white hover:bg-black/70">‹</button>
                                <button type="button" onClick={() => go(1)} aria-label="Foto seguinte" className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/55 text-xl text-white hover:bg-black/70">›</button>
                                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white" aria-hidden="true">{i + 1}/{imgs.length}</span>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex aspect-[16/7] items-center justify-center text-5xl" aria-hidden="true">🍽️</div>
                )}
                <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-2 top-2 h-9 w-9 cursor-pointer rounded-full bg-white/90 text-lg text-[#0b1220] shadow hover:bg-white">✕</button>
            </div>

            {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-5 pt-3">
                    {imgs.map((src, k) => (
                        <button key={src} type="button" onClick={() => setI(k)} aria-label={`Ver foto ${k + 1}`} aria-current={k === i} className={`h-14 w-14 flex-none cursor-pointer overflow-hidden rounded-lg border-2 ${k === i ? "border-[#0054b5]" : "border-transparent opacity-70"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 id="offer-title" className="font-baloo text-2xl font-bold leading-tight">{item.name}</h3>
                        <p className="mt-0.5 text-xs text-[#5b6478]">{picked.group}</p>
                    </div>
                    {item.price !== undefined && (
                        <p className="flex-none text-right font-baloo text-xl font-bold" style={{ color }}>
                            {formatPrice(item.price, currency)}
                            {item.priceNote && <span className="block font-sans text-[11px] font-normal text-[#5b6478]">{item.priceNote}</span>}
                        </p>
                    )}
                </div>

                {(hl || off) && (
                    <p className="flex flex-wrap gap-2">
                        {hl && <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: STYLE[hl].bg, color: STYLE[hl].fg }}>{STYLE[hl].icon} {labels[hl]}{hl === "daily" && item.until ? ` · até ${shortDate(item.until)}` : ""}</span>}
                        {off && <span className="rounded-full bg-[#d23b25]/12 px-3 py-1 text-xs font-medium text-[#b5311d]">{unavailable}</span>}
                    </p>
                )}

                {item.description && <p className="whitespace-pre-line text-sm leading-relaxed text-[#3c4658]">{item.description}</p>}

                {item.tags?.length ? (
                    <div>
                        <p className="text-xs font-medium text-[#5b6478]">{tagsLabel}</p>
                        <p className="mt-1.5 flex flex-wrap gap-1.5">{item.tags.map((t) => <span key={t} className="rounded-full bg-[#eef2f8] px-3 py-1 text-xs text-[#3c4658]">{t}</span>)}</p>
                    </div>
                ) : null}

                {requestLabel && !off && (
                    // sticks to the bottom of the popup: the main action is always in view, even on short screens
                    <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-[#0b1220]/8 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
                        <button type="button" onClick={onRequest} className="w-full cursor-pointer rounded-full px-6 py-3.5 font-baloo text-base font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: color }}>
                            {requestLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Menu, rooms, vehicles, products… with photos and prices. Every item opens a details popup.
 * When `request` is given (the establishment receives orders) the popup has a button that adds the
 * item to the order panel of the page ("Adicionar ao pedido", "Solicitar reserva").
 */
export default function OffersView({
    offers, currency = "MZN", color = "#0054b5", unavailable = "Indisponível", collectionId, request, tagsLabel = "Detalhes",
}: {
    offers: OfferGroup[]; currency?: string; color?: string; unavailable?: string;
    /** to name the highlights ("Prato do dia"…) */ collectionId?: string;
    /** label of the popup button; missing = no button */ request?: string;
    /** title of the tags in the popup: "Ingredientes", "Comodidades"… */ tagsLabel?: string;
}) {
    const today = todayMaputo();
    const labels = highlightLabels(collectionId);
    const highlights = activeHighlights(offers, today);
    const ref = useRef<HTMLDialogElement>(null);
    const [picked, setPicked] = useState<Picked | null>(null);

    useEffect(() => { if (picked && ref.current && !ref.current.open) ref.current.showModal(); }, [picked]);
    const open = (item: OfferItem, group: string) => setPicked({ item, group });
    const close = () => ref.current?.close();

    const ask = () => {
        if (!picked) return;
        window.dispatchEvent(new CustomEvent(ORDER_ADD_EVENT, { detail: { group: picked.group, name: picked.item.name } }));
        close();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // after the popup is gone, bring the order panel into view
        setTimeout(() => document.getElementById(ORDER_PANEL_ID)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 60);
    };

    const card = "w-full cursor-pointer rounded-2xl border p-3 text-left transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0370d6]";

    return (
        <div className="space-y-8">
            {highlights.length > 0 && (
                <section aria-label={labels.section}>
                    <h4 className="font-baloo text-lg font-medium text-[#0b1220]">{labels.section}</h4>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {highlights.map(({ kind, item, group }) => (
                            <li key={`${kind}-${group}-${item.name}`}>
                                <button type="button" onClick={() => open(item, group)} aria-label={`Ver detalhes: ${item.name}`} className={`${card} flex gap-3`} style={{ backgroundColor: STYLE[kind].bg, borderColor: `${STYLE[kind].fg}33` }}>
                                    {item.images?.[0] /* eslint-disable-next-line @next/next/no-img-element */ && <img src={item.images[0]} alt="" loading="lazy" className="h-20 w-20 flex-none rounded-xl object-cover" />}
                                    <span className="block min-w-0 flex-1">
                                        <span className="block text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: STYLE[kind].fg }}>
                                            {STYLE[kind].icon} {labels[kind]}{kind === "daily" && item.until ? ` · até ${shortDate(item.until)}` : ""}
                                        </span>
                                        <span className="block font-baloo text-[15px] font-medium leading-tight text-[#0b1220]">{item.name}</span>
                                        {item.description && <span className="mt-0.5 line-clamp-2 block text-xs text-[#4b5568]">{item.description}</span>}
                                        <span className="mt-1 flex items-center justify-between gap-2">
                                            {item.price !== undefined ? <span className="text-sm font-bold" style={{ color: STYLE[kind].fg }}>{formatPrice(item.price, currency)}{item.priceNote && <span className="ml-1 text-[10px] font-normal text-[#5b6478]">{item.priceNote}</span>}</span> : <span />}
                                            <span className="text-[11px] font-medium" style={{ color: STYLE[kind].fg }}>Ver detalhes ›</span>
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            {offers.map((g) => (
                <section key={g.title}>
                    <h4 className="font-baloo text-lg font-medium text-[#0b1220]">{g.title}</h4>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {g.items.map((it) => {
                            const off = it.available === false;
                            return (
                                <li key={it.name}>
                                    <button type="button" onClick={() => open(it, g.title)} aria-label={`Ver detalhes: ${it.name}`} className={`${card} flex gap-3 border-[#0b1220]/10 bg-white ${off ? "opacity-60" : ""}`}>
                                        {it.images?.[0] && (
                                            <span className="relative block h-24 w-24 flex-none overflow-hidden rounded-xl">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={it.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
                                                {it.images.length > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white">+{it.images.length - 1}</span>}
                                            </span>
                                        )}
                                        <span className="block min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-2">
                                                <span className="font-baloo text-[15px] font-medium leading-tight text-[#0b1220]">
                                                    {it.name}
                                                    {isActive(it, today) && it.highlight && <span className="ml-2 inline-block rounded-full px-2 py-0.5 align-middle font-sans text-[10px] font-medium" style={{ backgroundColor: STYLE[it.highlight].bg, color: STYLE[it.highlight].fg }}>{STYLE[it.highlight].icon} {labels[it.highlight]}</span>}
                                                </span>
                                                {it.price !== undefined && (
                                                    <span className="flex-none text-right text-sm font-bold" style={{ color }}>
                                                        {formatPrice(it.price, currency)}
                                                        {it.priceNote && <span className="block text-[10px] font-normal text-[#5b6478]">{it.priceNote}</span>}
                                                    </span>
                                                )}
                                            </span>
                                            {it.description && <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-[#4b5568]">{it.description}</span>}
                                            {it.tags?.length ? (
                                                <span className="mt-1.5 flex flex-wrap gap-1">
                                                    {it.tags.slice(0, 4).map((t) => <span key={t} className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[10px] text-[#4b5568]">{t}</span>)}
                                                    {it.tags.length > 4 && <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[10px] text-[#4b5568]">+{it.tags.length - 4}</span>}
                                                </span>
                                            ) : null}
                                            <span className="mt-1.5 flex items-center justify-between gap-2">
                                                {off ? <span className="text-[11px] font-medium text-[#b5311d]">{unavailable}</span> : <span />}
                                                <span className="text-[11px] font-medium" style={{ color }}>Ver detalhes ›</span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}

            {/* Native <dialog>: focus trap, Esc to close and the backdrop come for free */}
            <dialog ref={ref} aria-labelledby="offer-title" onClose={() => setPicked(null)} onClick={(e) => { if (e.target === ref.current) close(); }}
                className="m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-white p-0 text-[#0b1220] shadow-2xl backdrop:bg-[#0b1220]/60 backdrop:backdrop-blur-sm">
                {picked && (
                    <Detail key={`${picked.group}-${picked.item.name}`} picked={picked} currency={currency} color={color} unavailable={unavailable} tagsLabel={tagsLabel}
                        requestLabel={request} labels={labels} today={today} onRequest={ask} onClose={close} />
                )}
            </dialog>
        </div>
    );
}
