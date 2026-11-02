'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Small icon set, one per era — used inside the content block      */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconTool = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M14 3l7 7-2.5 2.5L11 5.5 14 3z" />
        <path d="M11 5.5L4 12.5c-1 1-1 3 0 4s3 1 4 0l7-7" />
        <path d="M4 20l3-3" />
    </Base>
);

const IconPath = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 18c3 0 3-6 6-6s3 6 6 6 3-8 6-8" />
        <circle cx="4" cy="18" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="22" cy="10" r="1.4" fill="currentColor" stroke="none" />
    </Base>
);

const IconBoat = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M3 15h18l-2 4H5l-2-4z" />
        <path d="M6 15V7h5l4 4" />
        <path d="M6 7V4" />
    </Base>
);

const IconDhow = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 4v14" />
        <path d="M12 5l7 9c-2 1.5-5 2-7 1V5z" />
        <path d="M3 18h18l-2 3H5l-2-3z" />
    </Base>
);

const IconGem = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M6 3h12l3 5-9 13L3 8l3-5z" />
        <path d="M3 8h18M9 3l3 5 3-5M12 8l-3 13M12 8l3 13" />
    </Base>
);

const IconCoins = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <ellipse cx="9" cy="7" rx="6" ry="3" />
        <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
        <path d="M3 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
        <ellipse cx="17" cy="13" rx="4" ry="2.2" />
    </Base>
);

const IconCaravel = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 17h16l-2.5 4h-11L4 17z" />
        <path d="M8 17V5l6 3-6 3" />
        <path d="M16 17V9l4 3-4 2" />
        <path d="M8 5V3" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

export type TimelineData = {
    era: string;
    title: string;
    href: string;
    description: string;
    detailTitle?: string;
    detail?: string;
    tags: string[];
    image?: string;
};

type TimelineEntry = TimelineData & { icon: ReactNode };

const ICONS: ReactNode[] = [<IconTool key="0" />, <IconPath key="1" />, <IconBoat key="2" />, <IconDhow key="3" />, <IconGem key="4" />, <IconCoins key="5" />, <IconCaravel key="6" />];


/* ---------------------------------------------------------------- */
/*  Scroll reveal hook                                                */
/* ---------------------------------------------------------------- */

function useReveal<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* ---------------------------------------------------------------- */
/*  Card                                                              */
/* ---------------------------------------------------------------- */

type Side = 'left' | 'right';

function TimelineCard({
    entry,
    index,
    side,
    withMobileMarker = false,
}: {
    entry: TimelineEntry;
    index: number;
    side: Side;
    withMobileMarker?: boolean;
}) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const number = String(index + 1).padStart(2, '0');
    const isLeft = side === 'left';

    return (
        <div className="relative">
            {/* mobile marker dot (single-column layout only) */}
            {withMobileMarker && (
                <span
                    className="absolute -left-10 top-10 h-4 w-4 -translate-x-1/2 rounded-full bg-[#00aefb] ring-4 ring-[#050f22] md:hidden"
                    style={{ boxShadow: '0 0 16px 3px rgba(0,174,251,0.55)' }}
                    aria-hidden="true"
                />
            )}

            {/* desktop marker dot, sits on the outer edge of the card facing the spine */}
            <span
                className={[
                    'hidden md:block absolute top-10 h-4 w-4 rounded-full bg-[#00aefb] ring-4 ring-[#050f22]',
                    isLeft ? '-right-[3.35rem]' : '-left-[3.35rem]',
                ].join(' ')}
                style={{ boxShadow: '0 0 16px 3px rgba(0,174,251,0.55)' }}
                aria-hidden="true"
            />
            {/* connector from card edge to the spine */}
            <span
                className={[
                    'hidden md:block absolute top-12 h-px w-10 bg-[#00aefb]/30',
                    isLeft ? '-right-10' : '-left-10',
                ].join(' ')}
                aria-hidden="true"
            />

            <div
                ref={ref}
                className={[
                    'overflow-hidden rounded-2xl border border-white/10 bg-[#0d2148]/70 shadow-xl backdrop-blur-sm',
                    'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none',
                    visible
                        ? 'translate-x-0 translate-y-0 opacity-100'
                        : `translate-y-6 opacity-0 md:translate-y-0 ${isLeft ? 'md:-translate-x-10' : 'md:translate-x-10'}`,
                ].join(' ')}
            >
                {/* banner illustration */}
                {entry.image && (
                    <div className="relative aspect-[16/9] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={entry.image} alt={entry.title} className="h-full w-full object-cover" />
                    </div>
                )}

                <div className="p-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#00aefb]/30 bg-[#00aefb]/10 px-3 py-1 text-xs font-semibold text-[#00aefb]">
                        {number} · {entry.era}
                    </span>
                    <h3 className="mt-3 font-['Baloo_2'] text-xl font-bold text-[#eaf2ff]">{entry.title}</h3>
                    <p className="mt-2 font-['Manrope'] text-[15px] leading-relaxed text-[#9fb3d1]">
                        {entry.description}
                    </p>

                    {/* secondary in-content detail: icon + extra fact */}
                    {entry.detail && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#00aefb]/10 text-[#00aefb]">
                                <div className="h-5 w-5">{entry.icon}</div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#00aefb]">
                                    {entry.detailTitle}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-[#9fb3d1]">{entry.detail}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-[#9fb3d1]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={entry.href} className="text-[#00aefb] hover:text-[#00aefb]/80 italic text-sm">
                            Ler mais ...
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Page                                                              */
/* ---------------------------------------------------------------- */

export default function Ancient({ data, bg, title, subtitle }: { data: TimelineData[]; bg?: string; title: string; subtitle: string }) {
    const TIMELINE: TimelineEntry[] = data.map((d, i) => ({ ...d, icon: ICONS[i % ICONS.length] }));
    const leftEntries = TIMELINE.filter((_, i) => i % 2 === 0);
    const rightEntries = TIMELINE.filter((_, i) => i % 2 !== 0);

    return (
        <div className={`min-h-screen py-2 ${bg ? '' : 'bg-gradient-to-b from-[#5e8ed8] via-[#6d84a8] to-[#3674d3]'}`} style={bg ? { background: bg } : undefined}>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
    `}</style>

            <div className="flex flex-col items-center justify-center px-6 pt-20 text-center">
                {/* <span className="inline-flex items-center gap-2 rounded-full border border-[#02557a]/25 bg-[#00aefb]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#8cdcff]">
                    Linha do tempo
                </span> */}
                <h1 className="mt-4 font-['Baloo_2'] text-6xl font-bold text-[#eaf2ff]">{title}</h1>
                <p className="mt-1 max-w-xl font-['Manrope'] text-lg text-[#ffffff]">
                    {subtitle}
                </p>
            </div>

            <div id="explore" className="relative mx-auto mt-20 max-w-6xl px-6 pb-24">
                {/* the timeline spine */}
                <div
                    className="absolute left-6 top-0 h-full w-[2px] bg-gradient-to-b from-[#00aefb] via-[#0a56c7] to-transparent md:left-1/2"
                    aria-hidden="true"
                />

                {/* MOBILE: single stacked column */}
                <div className="flex flex-col gap-16 pl-16 md:hidden">
                    {TIMELINE.map((entry, index) => (
                        <TimelineCard
                            key={entry.title}
                            entry={entry}
                            index={index}
                            side="left"
                            withMobileMarker
                        />
                    ))}
                </div>

                {/* DESKTOP: two independent columns, right column offset down to cascade */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-x-16">
                    <div className="flex flex-col gap-16">
                        {leftEntries.map((entry, i) => (
                            <TimelineCard key={entry.title} entry={entry} index={i * 2} side="left" />
                        ))}
                    </div>
                    <div className="flex flex-col gap-16 md:mt-40">
                        {rightEntries.map((entry, i) => (
                            <TimelineCard key={entry.title} entry={entry} index={i * 2 + 1} side="right" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}