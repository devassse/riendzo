import { Link } from '@/i18n/navigation';
import type { SVGProps } from 'react';
import { getTranslations } from 'next-intl/server';

type Era = {
    label: string;
    title: string;
    href: string;
    color: string;
};

const ERAS: Era[] = [
    {
        label: 'c. 100 000 A.E.C. - 1498',
        title: 'Reinos e Impérios',
        href: '#ancient',
        color: '#00aefb',
    },
    {
        label: '1498 - 1964',
        title: 'História Colonial',
        href: '#colonial',
        color: '#dee5e8',
    },
    {
        label: '1964 - 1975',
        title: 'Luta pela Independência',
        href: '#independence',
        color: '#7a2e2e',
    },
    {
        label: '1975 - hoje',
        title: 'História Moderna',
        href: '#modern',
        color: '#35be12',
    },
];

function WaveLine(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            {...props}
        >
            <path
                d="M0,60 C240,120 480,0 720,50 C960,100 1200,20 1440,70 L1440,120 L0,120 Z"
                fill="currentColor"
            />
        </svg>
    );
}

function TradeRoutes() {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
        >
            {/* Indian Ocean route */}
            <path
                d="M1280 180 C1120 210 1080 330 920 350 C760 370 700 260 560 300"
                fill="none"
                stroke="#f4ecd8"
                strokeWidth="1"
                strokeDasharray="5 8"
            />

            {/* Southern route */}
            <path
                d="M1200 620 C1080 550 1030 470 900 490 C770 510 700 590 570 550"
                fill="none"
                stroke="#f4ecd8"
                strokeWidth="1"
                strokeDasharray="4 10"
            />

            {/* Africa → Indian Ocean */}
            <path
                d="M870 300 C980 270 1050 220 1160 160"
                fill="none"
                stroke="#35be12"
                strokeWidth="1.2"
                strokeDasharray="3 7"
            />

            {/* Route points */}
            <circle cx="870" cy="300" r="3" fill="#35be12" />
            <circle cx="1160" cy="160" r="3" fill="#f4ecd8" />
            <circle cx="900" cy="490" r="2.5" fill="#f4ecd8" />
            <circle cx="570" cy="550" r="2.5" fill="#f4ecd8" />
        </svg>
    );
}

function Compass() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[4%] top-[8%] hidden h-44 w-44 opacity-[0.08] sm:block"
        >
            <svg
                viewBox="0 0 200 200"
                className="h-full w-full text-[#f4ecd8]"
                fill="none"
            >
                <circle
                    cx="100"
                    cy="100"
                    r="82"
                    stroke="currentColor"
                    strokeWidth="1"
                />

                <circle
                    cx="100"
                    cy="100"
                    r="67"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="3 6"
                />

                <path
                    d="M100 12V188M12 100H188"
                    stroke="currentColor"
                    strokeWidth="0.5"
                />

                <path
                    d="M100 20 L108 92 L100 100 L92 92 Z"
                    fill="currentColor"
                />

                <path
                    d="M100 180 L92 108 L100 100 L108 108 Z"
                    fill="currentColor"
                    opacity="0.35"
                />

                <path
                    d="M20 100 L92 92 L100 100 L92 108 Z"
                    fill="currentColor"
                    opacity="0.35"
                />

                <path
                    d="M180 100 L108 108 L100 100 L108 92 Z"
                    fill="currentColor"
                />

                <text
                    x="100"
                    y="8"
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                >
                    N
                </text>

                <text
                    x="100"
                    y="198"
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                >
                    S
                </text>

                <text
                    x="8"
                    y="103"
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                >
                    W
                </text>

                <text
                    x="192"
                    y="103"
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                >
                    E
                </text>
            </svg>
        </div>
    );
}

function HistoricalStars() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
        >
            <span className="absolute left-[12%] top-[25%] h-1 w-1 rounded-full bg-[#f4ecd8]/30" />
            <span className="absolute left-[20%] top-[70%] h-1.5 w-1.5 rounded-full bg-[#35be12]/30" />
            <span className="absolute left-[78%] top-[28%] h-1 w-1 rounded-full bg-[#f4ecd8]/40" />
            <span className="absolute left-[87%] top-[68%] h-1.5 w-1.5 rounded-full bg-[#00aefb]/30" />
            <span className="absolute left-[66%] top-[76%] h-1 w-1 rounded-full bg-[#f4ecd8]/30" />
            <span className="absolute left-[31%] top-[18%] h-1 w-1 rounded-full bg-[#f4ecd8]/20" />
        </div>
    );
}

export default async function HistoriaHero() {
    const t = await getTranslations('History');

    return (
        <section className="relative overflow-hidden bg-[#0b1220]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
            >
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            "url('/history/mozambique-map-old.webp')",
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        mixBlendMode: 'screen',
                    }}
                />

                {/* Dark gradient to keep the map subtle */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at center, transparent 0%, rgba(11,18,32,0.35) 45%, #0b1220 100%)',
                    }}
                />
            </div>

            {/* =========================================================
                GREEN HISTORICAL GLOW
            ========================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[-10rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                style={{
                    background:
                        'radial-gradient(circle, rgba(53,190,18,0.45) 0%, rgba(53,190,18,0.12) 35%, transparent 70%)',
                }}
            />

            {/* =========================================================
                BLUE SECONDARY GLOW
            ========================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full opacity-10 blur-3xl"
                style={{
                    background:
                        'radial-gradient(circle, #00aefb 0%, transparent 70%)',
                }}
            />

            {/* =========================================================
                DECORATIVE ELEMENTS
            ========================================================== */}

            <TradeRoutes />
            <Compass />
            <HistoricalStars />

            {/* =========================================================
                HERO CONTENT
            ========================================================== */}

            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-32 pt-28 text-center sm:pt-24">
                {/* Title */}

                <h1 className="mt-2 text-5xl font-bold leading-[1.05] text-[#f4ecd8] sm:text-7xl">
                    {t('title')}
                </h1>

                {/* Subtitle */}

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a7b0c4]">
                    Explore a rica história de Moçambique, desde os tempos
                    antigos até à era moderna — impérios, rotas comerciais,
                    colonização e independência, contados era por era.
                </p>

                {/* =====================================================
                    HISTORICAL TIMELINE
                ====================================================== */}

                <div className="mt-10 hidden items-center gap-3 text-[10px] tracking-[0.18em] text-[#f4ecd8]/30 sm:flex">
                    <span>100 000 A.E.C.</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>1498</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>1964</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>1975</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>HOJE</span>
                </div>

                {/* =====================================================
                    ERA CARDS
                ====================================================== */}

                <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {ERAS.map((era) => (
                        <Link
                            key={era.href}
                            href={era.href}
                            className="group relative flex items-center gap-3 overflow-hidden border border-white/10 bg-white/[0.03] px-5 py-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
                        >
                            {/* Era color indicator */}

                            <span
                                className="relative z-10 h-2.5 w-2.5 flex-none rounded-full"
                                style={{
                                    backgroundColor: era.color,
                                    boxShadow: `0 0 10px 2px ${era.color}55`,
                                }}
                            />

                            <span className="relative z-10 flex flex-col">
                                <span className="text-[11px] font-montserrat-italic tracking-[0.14em] text-[#7d879c]">
                                    {era.label}
                                </span>

                                <span className="text-base font-baloo font-medium text-[#f4ecd8] transition-colors group-hover:text-white">
                                    {era.title}
                                </span>
                            </span>

                            {/* Hover accent */}

                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                                style={{
                                    backgroundColor: era.color,
                                }}
                            />
                        </Link>
                    ))}
                </div>
            </div>

            {/* =========================================================
                BOTTOM WAVE
            ========================================================== */}

            <WaveLine
                className="absolute inset-x-0 bottom-0 z-20 h-16 w-full text-[#0d1526] sm:h-24"
            />
        </section>
    );
}