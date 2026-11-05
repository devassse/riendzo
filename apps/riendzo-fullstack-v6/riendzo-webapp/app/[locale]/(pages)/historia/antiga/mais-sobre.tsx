'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icon set — one glyph per realm, medallion-weight strokes         */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconTower = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M7 21V9l5-5 5 5v12" />
        <path d="M7 13h10M7 17h10" />
        <path d="M9 21v-4M15 21v-4" />
    </Base>
);

const IconCrown = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 18h16l-1-8-4 3-3-6-3 6-4-3-1 8z" />
        <path d="M4 18v2h16v-2" />
    </Base>
);

const IconDhow = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 4v13" />
        <path d="M12 5l6 8c-2 1.3-4.4 1.7-6 1V5z" />
        <path d="M3 17h18l-2 3H5l-2-3z" />
    </Base>
);

const IconCrescent = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M15 4a8 8 0 100 16 6.5 6.5 0 010-16z" />
        <path d="M17.5 8.5l.9-.9M18.4 7.6l-1.4.3.3-1.4z" fill="currentColor" stroke="none" />
    </Base>
);

const IconLakeNet = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <ellipse cx="9" cy="15" rx="5" ry="3" />
        <path d="M13 13c2-1 5-1 7 1" />
        <path d="M6 12c0-4 2-7 5-8" />
        <circle cx="18" cy="7" r="1.4" fill="currentColor" stroke="none" />
    </Base>
);

const IconRiverPath = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M3 6c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
        <path d="M3 12c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
        <path d="M3 18c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

export type RealmData = {
    number: string;
    title: string;
    href: string;
    region: string;
    description: string;
    domain: string;
};

type Realm = RealmData & { icon: ReactNode };

const ICONS: ReactNode[] = [<IconTower key="0" />, <IconCrown key="1" />, <IconDhow key="2" />, <IconCrescent key="3" />, <IconLakeNet key="4" />, <IconRiverPath key="5" />];


const SEQUENCE = [
    'Grande Zimbábue',
    'Mutapa',
    'Cidades suaílis',
    'Sultanatos do norte',
    'Maravi',
    'Vale do Zambeze',
    'Chegada portuguesa',
];

/* ---------------------------------------------------------------- */
/*  Chevron rule — the Great Zimbabwe dry-stone motif, reused as a   */
/*  divider everywhere a card or panel might otherwise get a border  */
/* ---------------------------------------------------------------- */

function ChevronRule({ color = '#c99a3d', className = '' }: { color?: string; className?: string }) {
    return (
        <svg
            viewBox="0 0 120 10"
            preserveAspectRatio="none"
            className={`h-2.5 w-full ${className}`}
            aria-hidden="true"
        >
            <polyline
                points="0,10 10,0 20,10 30,0 40,10 50,0 60,10 70,0 80,10 90,0 100,10 110,0 120,10"
                fill="none"
                stroke={color}
                strokeWidth="1.4"
            />
        </svg>
    );
}

/* ---------------------------------------------------------------- */
/*  Reveal — a single quiet fade, applied once per plate             */
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
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* ---------------------------------------------------------------- */
/*  Realm plate                                                      */
/* ---------------------------------------------------------------- */

function RealmPlate({ realm }: { realm: Realm }) {
    const { ref, visible } = useReveal<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={[
                'rounded-4xl bg-[#241d16] px-6 pb-7 pt-5 sm:px-7',
                'transition-opacity duration-700 ease-out motion-reduce:transition-none',
                visible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
        >
            <ChevronRule className="mt-4 mb-10" />

            <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[#c99a3d]/50 text-[#c99a3d]">
                    <span className="h-5 w-5">{realm.icon}</span>
                </span>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c99a3d]">
                        {realm.number} · {realm.region}
                    </p>
                    <h3 className="mt-1 font-baloo text-2xl font-bold leading-snug text-[#ecdfc4]">
                        {realm.title}
                    </h3>
                </div>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-[#c7b89a]">
                {realm.description}
            </p>

            <p className="mt-4 border-l-2 border-[#b8592f] pl-3 text-sm italic leading-relaxed text-[#a89478]">
                {realm.domain}
            </p>
            <p className="mt-6 text-sm text-[#a89478]">
                <Link href={realm.href} className="font-semibold text-[#c99a3d] underline">
                    Ler mais ...
                </Link>
            </p>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Page             bae0fc                                                 */
/* ---------------------------------------------------------------- */

export default function ReinosEImperios({ realms, bg, title, subtitle }: { realms: RealmData[]; bg?: string; title: string; subtitle: string }) {
    return (
        <div className="min-h-screen bg-[#ecdfc4]" id="ancient" style={bg ? { backgroundColor: bg } : undefined}>

            {/* header */}
            <div className="px-6 pb-14 pt-16 text-center sm:pb-16">
                <h1 className="mt-2 text-3xl font-bold text-[#1c1712] sm:text-6xl">{title}</h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#1c1712]">{subtitle}</p>
            </div>

            {/* atlas grid */}
            <div className="mx-auto max-w-6xl px-6 pb-8 sm:px-10">
                <div className="grid gap-6 overflow-hidden sm:grid-cols-2">
                    {realms.map((realm, i) => (
                        <RealmPlate key={realm.href} realm={{ ...realm, icon: ICONS[i % ICONS.length] }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
