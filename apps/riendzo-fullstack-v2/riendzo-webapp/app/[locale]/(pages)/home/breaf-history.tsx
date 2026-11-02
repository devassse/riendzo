'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icon set — one per stop, spanning all four eras                  */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
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

const IconCrown = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 18h16l-1-8-4 3-3-6-3 6-4-3-1 8z" />
        <path d="M4 18v2h16v-2" />
    </Base>
);

const IconFort = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 20V10l3-2 3 2 2-2 2 2 3-2 3 2v10z" />
        <path d="M4 20h16" />
        <path d="M8 20v-5h3v5" />
        <path d="M12 6V3" />
    </Base>
);

const IconSeal = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <circle cx="12" cy="10" r="6" />
        <path d="M9.5 8.5l1.7 1.7 3.3-3.4" />
        <path d="M9 15.5L7.5 21 12 18.5 16.5 21 15 15.5" />
    </Base>
);

const IconRifleFlag = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M5 21L17 9" />
        <path d="M13 5l6 0 0 0-2 2 2 2-6 0z" />
        <path d="M13 5v-2" />
        <path d="M9 17l-4-4" />
    </Base>
);

const IconSunrise = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 3v4" />
        <path d="M4.5 11L7 9M19.5 11L17 9" />
        <path d="M2 17h20" />
        <path d="M6 17a6 6 0 0112 0" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data — six stops, ancient to modern                              */
/* ---------------------------------------------------------------- */

export type HistoryEntry = {
    year: string;
    title: string;
    href: string;
    description: string;
    noteTitle?: string;
    note?: string;
    tags: string[];
    image?: string;
};

type Entry = HistoryEntry & { icon: ReactNode };

const ICONS: ReactNode[] = [<IconTool key="a" />, <IconCrown key="b" />, <IconFort key="c" />, <IconSeal key="d" />, <IconRifleFlag key="e" />, <IconSunrise key="f" />];

/* ---------------------------------------------------------------- */
/*  Reveal hook                                                       */
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
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* ---------------------------------------------------------------- */
/*  Register row                                                     */
/* ---------------------------------------------------------------- */

function RegisterRow({ entry, index, readMore }: { entry: Entry; index: number; readMore: string }) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const number = String(index + 1).padStart(2, '0');

    return (
        <div
            ref={ref}
            className={[
                'relative grid grid-cols-[3.5rem_1fr] gap-5 py-10 sm:grid-cols-[8rem_1fr] sm:gap-4',
                'border-b border-[#1a3a6f]/20 last:border-b-0',
                'transition-opacity duration-700 ease-out motion-reduce:transition-none',
                visible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
        >
            {/* margin column — ledger reference */}
            <div className="flex flex-col items-center sm:items-start">
                <span className="font-['Manrope'] text-xs italic text-[#1a3a6f]/70">
                    Nº {number}
                </span>
                <span className="mt-1 font-['Baloo_2'] text-xl font-bold text-[#1a3a6f] sm:text-2xl">
                    {entry.year}
                </span>
                <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#1a3a6f]/50 text-[#1a3a6f]">
                    <span className="h-5 w-5">{entry.icon}</span>
                </span>
            </div>

            {/* content column */}
            <div>
                {entry.image && (
                    <div className="float-right ml-5 mb-2 w-28 overflow-hidden rounded-2xl border border-[#3a2a1c]/15 shadow-[3px_3px_0_0_rgba(58,42,28,0.12)] sm:w-36">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={entry.image}
                            alt={entry.title}
                            className="aspect-[3/5] w-full cursor-pointer rounded-2xl object-cover grayscale-[15%] sepia-[8%] transition-transform duration-500 ease-out hover:scale-110"
                        />
                    </div>
                )}

                <h3 className="font-['Baloo_2'] text-[1.6rem] font-bold leading-snug text-[#1a3a6f]">
                    {entry.title}
                </h3>
                <p className="mt-3 max-w-[62ch] font-['Baloo_2'] text-[15.5px] leading-[1.75] text-[#1a3a6f]">
                    {entry.description}
                </p>

                {entry.note && (
                    <div className="mt-5 max-w-[56ch] border-l-2 border-[#1a3a6f]/60 pl-4">
                        {entry.noteTitle && <p className="font-['Manrope'] text-xs italic text-[#1a3a6f]">{entry.noteTitle}</p>}
                        <p className="mt-1 font-['Manrope'] text-sm italic leading-relaxed text-[#5c4a38]">{entry.note}</p>
                    </div>
                )}

                <p className="clear-both mt-5 font-['Manrope'] text-[13px] text-[#7a2e2e]/80">
                    {entry.tags.map((tag) => (
                        <span
                            key={tag}
                            className="mr-2 cursor-pointer rounded-full border border-[#7a2e2e]/80 bg-white/[0.04] px-2.5 py-1 text-xs text-[#7a2e2e]"
                        >
                            {tag}
                        </span>
                    ))}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={entry.href} className="text-sm italic text-[#7a2e2e] hover:text-[#7a2e2e]/80">
                        {readMore} ...
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Page                                                              */
/* ---------------------------------------------------------------- */

export default function BriefHistoryView({ entries, title, subtitle, readMore }: { entries: HistoryEntry[]; title: string; subtitle: string; readMore: string }) {
    return (
        <div className="min-h-screen bg-[#dee5e8]">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
    `}</style>

            {/* masthead */}
            <div className="flex flex-col justify-center border-[#3a2a1c]/80 bg-[#dee5e8] px-6 pb-4 pt-8 text-center">
                <div className="mx-auto mb-5 h-px w-24 bg-[#1a3a6f]/60" />
                <h1 className="mt-4 font-['Baloo_2'] text-6xl font-bold text-[#1a3a6f]">{title}</h1>
                <p className="mx-auto mt-1 max-w-xl font-['Manrope'] text-lg text-[#1a3a6f]">{subtitle}</p>
                <div className="mx-auto mt-5 h-px w-24 bg-[#1a3a6f]/60" />
            </div>

            {/* the register */}
            <div className="mx-auto max-w-6xl px-6 py-4 sm:px-10">
                {entries.map((entry, i) => (
                    <RegisterRow key={entry.href} entry={{ ...entry, icon: ICONS[i % ICONS.length] }} index={i} readMore={readMore} />
                ))}
            </div>
        </div>
    );
}
