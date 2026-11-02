"use client";

import { useState } from "react";
import type { OfferGroup } from "./catalog-types";
import Lightbox from "./lightbox";

const SYMBOL: Record<string, string> = { MZN: "MT", USD: "US$", ZAR: "R", EUR: "€" };

export const formatPrice = (n: number, currency = "MZN") => {
    const num = n.toLocaleString("pt-PT", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
    return currency === "MZN" ? `${num} MT` : `${SYMBOL[currency] ?? currency} ${num}`;
};

/** Menu, rooms, vehicles, products… with photos and prices. */
export default function OffersView({
    offers, currency = "MZN", color = "#0054b5", unavailable = "Indisponível",
}: { offers: OfferGroup[]; currency?: string; color?: string; unavailable?: string }) {
    const [box, setBox] = useState<{ images: { src: string; caption?: string }[]; index: number } | null>(null);

    return (
        <div className="space-y-8">
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
                                            <p className="font-baloo text-[15px] font-medium leading-tight text-[#0b1220]">{it.name}</p>
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
