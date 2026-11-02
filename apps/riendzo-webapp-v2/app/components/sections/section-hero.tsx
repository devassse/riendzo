import type { ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { SECTIONS, type Motif, type SectionId } from "./section-config";

/* =========================================================
   DECORATIVE MOTIFS — one per section
========================================================= */

/** Tourism: sun, horizon and waves */
function WavesMotif() {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[3rem] h-56 w-56 -translate-x-1/2 rounded-full opacity-[0.14] sm:h-72 sm:w-72"
                style={{
                    background:
                        "radial-gradient(circle, #f2a93b 0%, #f2a93b 38%, transparent 40%)",
                }}
            />
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full opacity-[0.12]"
                viewBox="0 0 1440 200"
                preserveAspectRatio="none"
                fill="none"
            >
                <path d="M0 80 C180 40 360 120 540 80 S900 40 1080 80 S1320 120 1440 80" stroke="#00aefb" strokeWidth="2" />
                <path d="M0 120 C180 80 360 160 540 120 S900 80 1080 120 S1320 160 1440 120" stroke="#f4ecd8" strokeWidth="1.5" strokeDasharray="4 10" />
                <path d="M0 160 C180 120 360 200 540 160 S900 120 1080 160 S1320 200 1440 160" stroke="#00aefb" strokeWidth="1" />
            </svg>
            <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className="pointer-events-none absolute bottom-[14%] right-[7%] hidden h-28 w-28 text-[#35be12] opacity-[0.16] sm:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            >
                {/* Palm */}
                <path d="M62 112 C60 84 64 62 70 40" />
                <path d="M70 40 C54 32 40 34 28 44" />
                <path d="M70 40 C84 28 98 28 110 38" />
                <path d="M70 40 C62 24 50 16 38 14" />
                <path d="M70 40 C78 22 90 14 102 14" />
            </svg>
        </>
    );
}

/** Services: blueprint grid and a civic building */
function GridMotif() {
    return (
        <>
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
            >
                <defs>
                    <pattern id="svc-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M48 0H0V48" fill="none" stroke="#9fb3d1" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#svc-grid)" />
            </svg>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 top-[-3rem] hidden h-[30rem] w-[30rem] text-[#f4ecd8] opacity-[0.06] sm:block"
            >
                <svg viewBox="0 0 500 500" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
                    <path d="M40 200 L250 60 L460 200 Z" />
                    <path d="M70 440 H430 M90 200 V420 M180 200 V420 M270 200 V420 M360 200 V420 M430 200 V420" />
                    <path d="M60 440 H440 V470 H60 Z" />
                </svg>
            </div>
            <svg
                aria-hidden="true"
                viewBox="0 0 100 120"
                className="pointer-events-none absolute bottom-[16%] left-[7%] hidden h-24 w-20 text-[#00aefb] opacity-[0.2] sm:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Document with a check */}
                <path d="M20 8 H64 L84 28 V112 H20 Z" />
                <path d="M64 8 V28 H84" />
                <path d="M34 56 H70 M34 72 H70" />
                <path d="M38 94 L48 104 L68 84" />
            </svg>
        </>
    );
}

/** Entertainment: stage beams, stars and a film strip */
function SpotlightMotif() {
    return (
        <>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute left-[18%] top-[-6rem] h-[34rem] w-40 origin-top rotate-[18deg] opacity-[0.1]"
                    style={{ background: "linear-gradient(180deg, #c86b8c, transparent 85%)" }}
                />
                <div
                    className="absolute left-[48%] top-[-8rem] h-[38rem] w-52 origin-top -rotate-[4deg] opacity-[0.09]"
                    style={{ background: "linear-gradient(180deg, #f2a93b, transparent 85%)" }}
                />
                <div
                    className="absolute right-[16%] top-[-6rem] h-[34rem] w-40 origin-top -rotate-[18deg] opacity-[0.1]"
                    style={{ background: "linear-gradient(180deg, #00aefb, transparent 85%)" }}
                />
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute left-[12%] top-[30%] h-1 w-1 rounded-full bg-[#f2a93b]/50" />
                <span className="absolute left-[82%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#c86b8c]/40" />
                <span className="absolute left-[30%] top-[78%] h-1 w-1 rounded-full bg-[#00aefb]/40" />
                <span className="absolute left-[70%] top-[72%] h-1 w-1 rounded-full bg-[#f4ecd8]/30" />
                <span className="absolute left-[55%] top-[14%] h-1 w-1 rounded-full bg-[#f4ecd8]/30" />
            </div>
            <svg
                aria-hidden="true"
                viewBox="0 0 40 200"
                className="pointer-events-none absolute bottom-[8%] left-[4%] hidden h-48 w-10 text-[#f4ecd8] opacity-[0.1] sm:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                {/* Film strip */}
                <rect x="4" y="2" width="32" height="196" rx="3" />
                <path d="M12 2 V198 M28 2 V198" />
                {Array.from({ length: 9 }).map((_, i) => (
                    <g key={i}>
                        <rect x="6" y={12 + i * 21} width="4" height="8" />
                        <rect x="30" y={12 + i * 21} width="4" height="8" />
                    </g>
                ))}
            </svg>
        </>
    );
}

/** Blog: ruled paper and a quote mark */
function PaperMotif() {
    return (
        <>
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
            >
                <defs>
                    <pattern id="blog-lines" width="2000" height="40" patternUnits="userSpaceOnUse">
                        <path d="M0 39.5 H4000" stroke="#f4ecd8" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#blog-lines)" />
            </svg>
            <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[6%] top-[-1rem] hidden font-baloo text-[16rem] leading-none text-[#f2a93b] opacity-[0.1] sm:block"
            >
                “
            </span>
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-4rem] right-[7%] hidden font-baloo text-[14rem] leading-none text-[#e5533d] opacity-[0.08] sm:block"
            >
                ”
            </span>
            <svg
                aria-hidden="true"
                viewBox="0 0 80 80"
                className="pointer-events-none absolute bottom-[16%] left-[10%] hidden h-16 w-16 text-[#00aefb] opacity-[0.2] sm:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Pen */}
                <path d="M14 66 L18 50 L52 16 L64 28 L30 62 Z" />
                <path d="M46 22 L58 34" />
            </svg>
        </>
    );
}

const MOTIFS: Record<Motif, () => ReactElement> = {
    waves: WavesMotif,
    grid: GridMotif,
    spotlight: SpotlightMotif,
    paper: PaperMotif,
};

/* =========================================================
   HERO
========================================================= */

const KEYWORDS = ["k1", "k2", "k3", "k4"] as const;

/**
 * Hero shared by Turismo, Serviços Públicos, Entretenimento and Blog.
 * Same structure as the Gastronomia hero: title, description, keyword line
 * and one link card per submenu (the current one is highlighted).
 */
export default async function SectionHero({
    section,
    currentHref,
}: {
    section: SectionId;
    /** href of the submenu being viewed (omit on the hub page) */
    currentHref?: string;
}) {
    const config = SECTIONS[section];
    const t = await getTranslations(config.ns);
    const Motif = MOTIFS[config.motif];
    const [glowA, glowB, glowC] = config.glow;

    return (
        <section className="relative overflow-hidden bg-[#0b1220]">
            {/* Background glows */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div
                    className="absolute left-1/2 top-[-12rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                    style={{
                        background: `radial-gradient(circle, ${glowA}80 0%, ${glowA}1f 38%, transparent 70%)`,
                    }}
                />
                <div
                    className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full opacity-10 blur-3xl"
                    style={{ background: `radial-gradient(circle, ${glowB} 0%, transparent 70%)` }}
                />
                <div
                    className="absolute -left-40 bottom-0 h-[25rem] w-[25rem] rounded-full opacity-[0.07] blur-3xl"
                    style={{ background: `radial-gradient(circle, ${glowC} 0%, transparent 70%)` }}
                />
            </div>

            <Motif />

            {/* Content */}
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-12 pt-4 text-center">
                <h1 className="mt-2 text-5xl font-bold leading-[1.05] text-[#f4ecd8] sm:text-7xl">
                    {t("title")}
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a7b0c4]">
                    {t("description")}
                </p>

                {/* Keyword line */}
                <div className="mt-10 hidden flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#f4ecd8]/30 sm:flex">
                    {KEYWORDS.map((key, i) => (
                        <div key={key} className="flex items-center gap-3">
                            {i > 0 && <span className="h-px w-8 bg-[#f4ecd8]/20" />}
                            <span>{t(`keywords.${key}`)}</span>
                        </div>
                    ))}
                </div>

                {/* Submenu cards */}
                <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {config.pages.map((page, idx) => {
                        const href = `${config.basePath}/${page.slug}`;
                        const active = currentHref === href;

                        return (
                            <Link
                                key={page.key}
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={`group relative flex items-center gap-4 overflow-hidden border px-5 py-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] ${
                                    config.pages.length % 2 === 1 && idx === config.pages.length - 1 ? "sm:col-span-2" : ""
                                } ${
                                    active
                                        ? "border-white/30 bg-white/[0.07]"
                                        : "border-white/10 bg-white/[0.03]"
                                }`}
                            >
                                <span
                                    className="relative z-10 h-2.5 w-2.5 flex-none rounded-full"
                                    style={{
                                        backgroundColor: page.color,
                                        boxShadow: `0 0 12px 2px ${page.color}55`,
                                    }}
                                />

                                <span className="relative z-10 flex flex-col">
                                    <span
                                        className="text-[10px] font-montserrat-italic tracking-[0.18em]"
                                        style={{ color: `${page.color}99` }}
                                    >
                                        {t(`pages.${page.key}.label`)}
                                    </span>
                                    <span className="mt-0.5 text-base font-baloo font-medium text-[#f4ecd8] transition-colors group-hover:text-white">
                                        {t(`pages.${page.key}.title`)}
                                    </span>
                                </span>

                                <span className="absolute right-5 text-lg text-[#f4ecd8]/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#f4ecd8]/60">
                                    →
                                </span>

                                <span
                                    aria-hidden="true"
                                    className={`absolute bottom-0 left-0 h-px transition-all duration-500 group-hover:w-full ${
                                        active ? "w-full" : "w-0"
                                    }`}
                                    style={{ backgroundColor: page.color }}
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
