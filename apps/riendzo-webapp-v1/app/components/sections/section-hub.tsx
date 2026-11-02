import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export type HubCard = {
    icon?: ReactNode;
    label?: string;
    title: string;
    description: string;
    href: string;
    color: string;
};

/**
 * Overview of a section's submenus, shown on the section's landing page
 * (e.g. /turismo). Same white background and typography as the Receitas page.
 */
export default function SectionHub({
    title,
    description,
    cards,
    cta,
    children,
}: {
    title: string;
    description: string;
    cards: HubCard[];
    /** Call to action shown on each card, e.g. "Explorar" */
    cta: string;
    /** Optional extra blocks rendered under the cards */
    children?: ReactNode;
}) {
    return (
        <section className="relative scroll-mt-24 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
                    <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">
                        {title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5b6478]">
                        {description}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {cards.map((card) => (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-[#0b1220]/10 bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0b1220]/25 hover:shadow-lg"
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                                style={{ backgroundColor: `${card.color}22` }}
                            />

                            <div className="flex items-center gap-4">
                                {card.icon && (
                                    <span
                                        className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl"
                                        style={{
                                            backgroundColor: `${card.color}1f`,
                                            color: card.color,
                                        }}
                                    >
                                        <span className="h-7 w-7">{card.icon}</span>
                                    </span>
                                )}
                                <div>
                                    {card.label && (
                                        <span
                                            className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]"
                                            style={{ color: card.color }}
                                        >
                                            {card.label}
                                        </span>
                                    )}
                                    <h3 className="font-baloo text-xl font-medium text-[#0b1220]">
                                        {card.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm leading-relaxed text-[#5b6478]">
                                {card.description}
                            </p>

                            <span
                                className="mt-auto flex items-center gap-1 text-sm font-baloo font-medium"
                                style={{ color: card.color }}
                            >
                                {cta}
                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </span>

                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                                style={{ backgroundColor: card.color }}
                            />
                        </Link>
                    ))}
                </div>

                {children}
            </div>
        </section>
    );
}
