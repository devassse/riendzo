import { Link } from "@/i18n/navigation";
import type { SVGProps } from "react";
import { getTranslations } from "next-intl/server";

type MusicSection = {
    label: string;
    title: string;
    href: string;
    color: string;
};

function WaveLine(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" {...props}>
            <path
                d="M0,60 C240,120 480,0 720,50 C960,100 1200,20 1440,70 L1440,120 L0,120 Z"
                fill="currentColor"
            />
        </svg>
    );
}

/**
 * Decorative sound waves.
 */
function SoundWaves() {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
            fill="none"
        >
            <path
                d="M-100 410
                   C80 300 180 520 330 410
                   S580 300 720 410
                   S980 520 1120 410
                   S1360 300 1540 410"
                stroke="#35be12"
                strokeWidth="2"
                strokeDasharray="3 9"
            />

            <path
                d="M-100 430
                   C80 320 180 540 330 430
                   S580 320 720 430
                   S980 540 1120 430
                   S1360 320 1540 430"
                stroke="#00aefb"
                strokeWidth="1"
                strokeDasharray="2 12"
            />

            <path
                d="M-100 450
                   C80 340 180 560 330 450
                   S580 340 720 450
                   S980 560 1120 450
                   S1360 340 1540 450"
                stroke="#f4ecd8"
                strokeWidth="0.7"
                strokeDasharray="1 14"
            />
        </svg>
    );
}

/**
 * Large decorative vinyl record.
 */
function VinylRecord() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-[-5rem] hidden h-[34rem] w-[34rem] opacity-[0.055] sm:block"
        >
            <svg viewBox="0 0 500 500" className="h-full w-full text-[#f4ecd8]">
                <circle cx="250" cy="250" r="235" fill="currentColor" />

                <circle cx="250" cy="250" r="190" fill="#0b1220" />

                <circle cx="250" cy="250" r="145" fill="currentColor" opacity="0.25" />

                <circle cx="250" cy="250" r="100" fill="#0b1220" />

                <circle cx="250" cy="250" r="48" fill="currentColor" opacity="0.45" />

                <circle cx="250" cy="250" r="9" fill="#0b1220" />

                {/* Grooves */}
                <circle
                    cx="250"
                    cy="250"
                    r="215"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                />

                <circle
                    cx="250"
                    cy="250"
                    r="200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.25"
                />

                <circle
                    cx="250"
                    cy="250"
                    r="175"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.3"
                />

                <circle
                    cx="250"
                    cy="250"
                    r="155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.25"
                />

                {/* Label */}
                <circle cx="250" cy="250" r="70" fill="#35be12" opacity="0.18" />
            </svg>
        </div>
    );
}

/**
 * Musical equalizer / rhythm visualization.
 */
function Equalizer() {
    const bars = [
        { x: 0, height: 28 },
        { x: 12, height: 45 },
        { x: 24, height: 72 },
        { x: 36, height: 38 },
        { x: 48, height: 90 },
        { x: 60, height: 55 },
        { x: 72, height: 32 },
        { x: 84, height: 65 },
        { x: 96, height: 42 },
        { x: 108, height: 80 },
        { x: 120, height: 35 },
    ];

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[17%] left-[7%] hidden opacity-[0.15] sm:block"
        >
            <div className="flex h-24 items-end gap-1">
                {bars.map((bar) => (
                    <span
                        key={bar.x}
                        className="w-[3px] rounded-full bg-[#35be12]"
                        style={{
                            height: `${bar.height}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Decorative music notes.
 */
function MusicNotes() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden text-[#f4ecd8]"
        >
            <span className="absolute left-[10%] top-[22%] text-3xl opacity-[0.06]">
                ♪
            </span>

            <span className="absolute left-[22%] top-[65%] text-5xl opacity-[0.05]">
                ♫
            </span>

            <span className="absolute right-[25%] top-[18%] text-4xl opacity-[0.05]">
                ♪
            </span>

            <span className="absolute right-[12%] bottom-[25%] text-6xl opacity-[0.045]">
                ♫
            </span>
        </div>
    );
}

/**
 * Decorative dots / rhythm points.
 */
function RhythmPoints() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute left-[15%] top-[35%] h-1 w-1 rounded-full bg-[#35be12]/30" />

            <span className="absolute left-[25%] top-[78%] h-1.5 w-1.5 rounded-full bg-[#00aefb]/30" />

            <span className="absolute left-[72%] top-[32%] h-1 w-1 rounded-full bg-[#f0a83a]/40" />

            <span className="absolute right-[17%] top-[58%] h-1.5 w-1.5 rounded-full bg-[#c86b8c]/30" />

            <span className="absolute left-[58%] top-[75%] h-1 w-1 rounded-full bg-[#f4ecd8]/25" />

            <span className="absolute left-[38%] top-[18%] h-1 w-1 rounded-full bg-[#35be12]/20" />
        </div>
    );
}

export default async function MusicaHero() {
    const t = await getTranslations("Music");

    /**
     * Music sections
     *
     * Text comes entirely from next-intl.
     * Only navigation and visual properties remain here.
     */
    const MUSIC_SECTIONS: MusicSection[] = [
        {
            label: t("artists.label"),
            title: t("artists.title"),
            href: "#artistas",
            color: "#35be12",
        },
        {
            label: t("discographies.label"),
            title: t("discographies.title"),
            href: "#discografias",
            color: "#00aefb",
        },
        {
            label: t("genres.label"),
            title: t("genres.title"),
            href: "#generos",
            color: "#f0a83a",
        },
        {
            label: t("history.label"),
            title: t("history.title"),
            href: "#historia",
            color: "#c86b8c",
        },
    ];

    return (
        <section className="relative overflow-hidden bg-[#0b1220]">
            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {/* Green central glow */}
                <div
                    className="absolute left-1/2 top-[-12rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(53,190,18,0.5) 0%, rgba(53,190,18,0.12) 38%, transparent 70%)",
                    }}
                />

                {/* Blue sound glow */}
                <div
                    className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full opacity-10 blur-3xl"
                    style={{
                        background: "radial-gradient(circle, #00aefb 0%, transparent 70%)",
                    }}
                />

                {/* Warm music glow */}
                <div
                    className="absolute -left-40 bottom-0 h-[25rem] w-[25rem] rounded-full opacity-[0.07] blur-3xl"
                    style={{
                        background: "radial-gradient(circle, #f0a83a 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* =========================================================
                DECORATIVE ELEMENTS
            ========================================================== */}

            <SoundWaves />
            <VinylRecord />
            <Equalizer />
            <MusicNotes />
            <RhythmPoints />

            {/* =========================================================
                CONTENT
            ========================================================== */}
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-32 pt-26 text-center sm:pt-24">
                {/* Title */}
                <h1 className="mt-2 text-5xl font-bold leading-[1.05] text-[#f4ecd8] sm:text-7xl">
                    {t("title")}
                </h1>
                {/* Description */}
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a7b0c4]">
                    {t("description")}
                </p>
                {/* =====================================================
                    MUSIC TIMELINE
                ====================================================== */}

                <div className="mt-10 hidden items-center gap-3 text-[10px] tracking-[0.18em] text-[#f4ecd8]/30 sm:flex">
                    <span>TRADIÇÃO</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>MARRABENTA</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>PANDZA</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>AFRO-HOUSE</span>

                    <span className="h-px w-8 bg-[#f4ecd8]/20" />

                    <span>HOJE</span>
                </div>

                {/* =====================================================
                    MUSIC SECTIONS
                ====================================================== */}

                <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {MUSIC_SECTIONS.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group relative flex items-center gap-4 overflow-hidden border border-white/10 bg-white/[0.03] px-5 py-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
                        >
                            {/* Colored indicator */}

                            <span
                                className="relative z-10 h-2.5 w-2.5 flex-none rounded-full"
                                style={{
                                    backgroundColor: section.color,
                                    boxShadow: `0 0 12px 2px ${section.color}55`,
                                }}
                            />

                            {/* Text */}

                            <span className="relative z-10 flex flex-col">
                                <span
                                    className="text-[10px] font-montserrat-italic tracking-[0.18em]"
                                    style={{
                                        color: `${section.color}99`,
                                    }}
                                >
                                    {section.label}
                                </span>

                                <span className="mt-0.5 text-base font-baloo font-medium text-[#f4ecd8] transition-colors group-hover:text-white">
                                    {section.title}
                                </span>
                            </span>

                            {/* Arrow */}

                            <span className="absolute right-5 text-lg text-[#f4ecd8]/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#f4ecd8]/60">
                                →
                            </span>

                            {/* Bottom hover line */}

                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                                style={{
                                    backgroundColor: section.color,
                                }}
                            />
                        </Link>
                    ))}
                </div>
            </div>

            {/* =========================================================
                BOTTOM WAVE
            ========================================================== */}

            <WaveLine className="absolute inset-x-0 bottom-0 z-20 h-16 w-full text-[#0d1526] sm:h-24" />
        </section>
    );
}
