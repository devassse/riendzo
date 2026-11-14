"use client";

import { useState } from "react";
import type { OfferGroup } from "./catalog-types";
import Lightbox from "./lightbox";
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

/** Menu, rooms, vehicles, products… with photos and prices. */
export default function OffersView({
    offers, currency = "MZN", color = "#0054b5", unavailable = "Indisponível", collectionId,
}: { offers: OfferGroup[]; currency?: string; color?: string; unavailable?: string; /** to name the highlights ("Prato do dia"…) */ collectionId?: string }) {
    const today = todayMaputo();
    const labels = highlightLabels(collectionId);
    const highlights = activeHighlights(offers, today);
    const [box, setBox] = useState<{ images: { src: string; caption?: string }[]; index: number } | null>(null);

    return (
        <div className="space-y-8">
            {highlights.length > 0 && (
                <section aria-label={labels.section}>
                    <h4 className="font-baloo text-lg font-medium text-[#0b1220]">{labels.section}</h4>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {highlights.map(({ kind, item, group }) => (
                            <li key={`${kind}-${group}-${item.name}`} className="flex gap-3 rounded-2xl border p-3" style={{ backgroundColor: STYLE[kind].bg, borderColor: `${STYLE[kind].fg}33` }}>
                                {item.images?.[0] /* eslint-disable-next-line @next/next/no-img-element */ && <img src={item.images[0]} alt="" loading="lazy" className="h-20 w-20 flex-none rounded-xl object-cover" />}
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: STYLE[kind].fg }}>
                                        {STYLE[kind].icon} {labels[kind]}{kind === "daily" && item.until ? ` · até ${shortDate(item.until)}` : ""}
                                    </p>
                                    <p className="font-baloo text-[15px] font-medium leading-tight text-[#0b1220]">{item.name}</p>
                                    {item.description && <p className="mt-0.5 line-clamp-2 text-xs text-[#4b5568]">{item.description}</p>}
                                    {item.price !== undefined && <p className="mt-1 text-sm font-bold" style={{ color: STYLE[kind].fg }}>{formatPrice(item.price, currency)}{item.priceNote && <span className="ml-1 text-[10px] font-normal text-[#5b6478]">{item.priceNote}</span>}</p>}
                                </div>
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
                            const imgs = (it.images ?? []).map((src) => ({ src, caption: it.name }));
                            const off = it.available === false;
                            return (
                                <li key={it.name} className={`flex gap-3 rounded-2xl border border-[#0b1220]/10 bg-white p-3 ${off ? "opacity-60" : ""}`}>
                                    {imgs[0] && (
                                        <button type="button" onClick={() => setBox({ images: imgs, index: 0 })} aria-label={`Ver fotografias: ${it.name}`} className="relative h-24 w-24 flex-none cursor-pointer overflow-hidden rounded-xl">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={imgs[0].src} alt="" loading="lazy" className="h-full w-full object-cover" />
                                            {imgs.length > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white">+{imgs.length - 1}</span>}
                                        </button>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-baloo text-[15px] font-medium leading-tight text-[#0b1220]">
                                                {it.name}
                                                {isActive(it, today) && it.highlight && <span className="ml-2 inline-block rounded-full px-2 py-0.5 align-middle font-sans text-[10px] font-medium" style={{ backgroundColor: STYLE[it.highlight].bg, color: STYLE[it.highlight].fg }}>{STYLE[it.highlight].icon} {labels[it.highlight]}</span>}
                                            </p>
                                            {it.price !== undefined && (
                                                <p className="flex-none text-right text-sm font-bold" style={{ color }}>
                                                    {formatPrice(it.price, currency)}
                                                    {it.priceNote && <span className="block text-[10px] font-normal text-[#5b6478]">{it.priceNote}</span>}
                                                </p>
                                            )}
                                        </div>
                                        {it.description && <p className="mt-1 text-xs leading-relaxed text-[#4b5568]">{it.description}</p>}
                                        {it.tags?.length ? (
                                            <p className="mt-1.5 flex flex-wrap gap-1">
                                                {it.tags.map((t) => <span key={t} className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[10px] text-[#4b5568]">{t}</span>)}
                                            </p>
                                        ) : null}
                                        {off && <p className="mt-1 text-[11px] font-medium text-[#b5311d]">{unavailable}</p>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
            <Lightbox images={box?.images ?? []} index={box ? box.index : null} onIndex={(i) => setBox((b) => (b ? { ...b, index: i } : b))} onClose={() => setBox(null)} />
        </div>
    );
}
