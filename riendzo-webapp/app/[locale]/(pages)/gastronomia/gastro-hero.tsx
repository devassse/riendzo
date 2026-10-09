import { Link } from "@/i18n/navigation";
import type { SVGProps } from "react";
import { getTranslations } from "next-intl/server";

type GastroSection = {
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
 * Decorative rising steam lines.
 */
function Steam() {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
            fill="none"
        >
            <path
                d="M300 820
                   C220 700 380 620 300 500
                   S220 300 300 180
                   S380 40 300 -40"
                stroke="#f0a83a"
                strokeWidth="2"
                strokeDasharray="3 9"
            />

            <path
                d="M360 820
                   C280 700 440 620 360 500
                   S280 300 360 180
                   S440 40 360 -40"
                stroke="#e5533d"
                strokeWidth="1"
                strokeDasharray="2 12"
            />

            <path
                d="M1080 820
                   C1000 700 1160 620 1080 500
                   S1000 300 1080 180
                   S1160 40 1080 -40"
                stroke="#35be12"
                strokeWidth="1.5"
                strokeDasharray="3 10"
            />

            <path
                d="M1140 820
                   C1060 700 1220 620 1140 500
                   S1060 300 1140 180
                   S1220 40 1140 -40"
                stroke="#f4ecd8"
                strokeWidth="0.7"
                strokeDasharray="1 14"
            />
        </svg>
    );
}

/**
 * Large decorative plate.
 */
function Plate() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-[-5rem] hidden h-[34rem] w-[34rem] opacity-[0.055] sm:block"
        >
            <svg viewBox="0 0 500 500" className="h-full w-full text-[#f4ecd8]">
                {/* Rim */}
                <circle cx="250" cy="250" r="235" fill="currentColor" />
                <circle cx="250" cy="250" r="205" fill="#0b1220" />

                {/* Well */}
                <circle cx="250" cy="250" r="170" fill="currentColor" opacity="0.2" />
                <circle cx="250" cy="250" r="125" fill="#0b1220" />

                {/* Food */}
                <circle cx="250" cy="250" r="85" fill="#f0a83a" opacity="0.2" />
                <circle cx="250" cy="250" r="45" fill="#e5533d" opacity="0.25" />

                {/* Rim details */}
                <circle
                    cx="250"
                    cy="250"
                    r="220"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                />
                <circle
                    cx="250"
                    cy="250"
                    r="185"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.25"
                />
                <circle
                    cx="250"
                    cy="250"
                    r="145"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.3"
                />
            </svg>
        </div>
    );
}

/**
 * Fork and knife line icons.
 */
function Cutlery() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[17%] left-[7%] hidden opacity-[0.15] sm:block"
        >
            <svg
                viewBox="0 0 120 100"
                className="h-24 w-28 text-[#35be12]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Fork */}
                <path d="M20 6 V32 M30 6 V32 M40 6 V32" />
                <path d="M20 32 C20 44 40 44 40 32" />
                <path d="M30 42 V94" />

                {/* Knife */}
                <path d="M84 6 C70 20 70 48 84 60 Z" />
                <path d="M84 60 V94" />
            </svg>
        </div>
    );
}

/**
 * Decorative leaves / herbs.
 */
function Herbs() {
    const leaves = [
        { left: "10%", top: "22%", size: 36, rotate: -25, opacity: 0.07, color: "#35be12" },
        { left: "22%", top: "65%", size: 52, rotate: 40, opacity: 0.06, color: "#35be12" },
        { right: "25%", top: "18%", size: 44, rotate: 160, opacity: 0.06, color: "#f0a83a" },
        { right: "12%", bottom: "25%", size: 60, rotate: 110, opacity: 0.055, color: "#e5533d" },
    ];

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {leaves.map((leaf, i) => {
                const { size, rotate, opacity, color, ...position } = leaf;
                return (
                    <svg
                        key={i}
                        viewBox="0 0 40 40"
                        width={size}
                        height={size}
                        className="absolute"
                        style={{ ...position, opacity, transform: `rotate(${rotate}deg)` }}
                    >
                        <path
                            d="M2 38 C2 14 14 2 38 2 C38 26 26 38 2 38 Z"
                            fill={color}
                        />
                        <path
                            d="M2 38 L28 12"
                            stroke="#0b1220"
                            strokeWidth="1.5"
                            opacity="0.6"
                        />
                    </svg>
                );
            })}
        </div>
    );
}

/**
 * Decorative dots / peppercorns / spices.
 */
function Spices() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute left-[15%] top-[35%] h-1 w-1 rounded-full bg-[#e5533d]/40" />

            <span className="absolute left-[25%] top-[78%] h-1.5 w-1.5 rounded-full bg-[#f0a83a]/30" />

            <span className="absolute left-[72%] top-[32%] h-1 w-1 rounded-full bg-[#35be12]/40" />

            <span className="absolute right-[17%] top-[58%] h-1.5 w-1.5 rounded-full bg-[#e5533d]/30" />

            <span className="absolute left-[58%] top-[75%] h-1 w-1 rounded-full bg-[#f4ecd8]/25" />

            <span className="absolute left-[38%] top-[18%] h-1 w-1 rounded-full bg-[#f0a83a]/25" />
        </div>
    );
}

export default async function GastroHero() {
    const t = await getTranslations("gastronomy");

    /**
     * Gastronomy sections
     *
     * Text comes entirely from next-intl.
     * Only navigation and visual properties remain here.
     */
    const GASTRO_SECTIONS: GastroSection[] = [
        {
            label: t("dishes.label"),
            title: t("dishes.title"),
            href: "#pratos",
            color: "#f0a83a",
        },
        {
            label: t("ingredients.label"),
            title: t("ingredients.title"),
            href: "#ingredientes",
            color: "#35be12",
        },
        {
            label: t("drinks.label"),
            title: t("drinks.title"),
            href: "#bebidas",
            color: "#00aefb",
        },
        {
            label: t("recipes.label"),
            title: t("recipes.title"),
            href: "#receitas",
            color: "#e5533d",
        },
    ];

    const TIMELINE = ["roots", "coast", "spices", "fusion", "today"] as const;

    return (
        <section className="relative overflow-hidden bg-[#0b1220]">
            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {/* Warm golden central glow */}
                <div
                    className="absolute left-1/2 top-[-12rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(240,168,58,0.5) 0%, rgba(240,168,58,0.12) 38%, transparent 70%)",
                    }}
                />

                {/* Chili red glow */}
                <div
                    className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full opacity-10 blur-3xl"
                    style={{
                        background: "radial-gradient(circle, #e5533d 0%, transparent 70%)",
                    }}
                />

                {/* Herb green glow */}
                <div
                    className="absolute -left-40 bottom-0 h-[25rem] w-[25rem] rounded-full opacity-[0.07] blur-3xl"
                    style={{
                        background: "radial-gradient(circle, #35be12 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* =========================================================
                DECORATIVE ELEMENTS
            ========================================================== */}

            <Steam />
            <Plate />
            <Cutlery />
            <Herbs />
            <Spices />

            {/* =========================================================
                CONTENT
            ========================================================== */}
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-32 pt-24 text-center">
                {/* Title */}
                <h1 className="mt-2 text-5xl font-bold leading-[1.05] text-[#f4ecd8] sm:text-7xl">
                    {t("title")}
                </h1>

                {/* Description */}
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a7b0c4]">
                    {t("description")}
                </p>

                {/* =====================================================
                    FLAVOUR TIMELINE
                ====================================================== */}

                <div className="mt-10 hidden flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#f4ecd8]/30 sm:flex">
                    {TIMELINE.map((key, i) => (
                        <div key={key} className="flex items-center gap-3">
                            {i > 0 && <span className="h-px w-8 bg-[#f4ecd8]/20" />}
                            <span>{t(`timeline.${key}`)}</span>
                        </div>
                    ))}
                </div>

                {/* =====================================================
                    GASTRONOMY SECTIONS
                ====================================================== */}

                <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {GASTRO_SECTIONS.map((section) => (
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
        </section>
    );
}