import type { ReactNode } from "react";
import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import HistoriaHero from "@/app/[locale]/(pages)/historia/history-hero";
import CatalogSection from "@/app/components/sections/catalog-section";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { getPublishedItems } from "@/lib/cms/store";
import TimelineTrack from "./timeline-track";

export type TimelineEvent = { year: string; text: string };

/** Era page (Reinos e Impérios, Período Colonial, Moçambique Moderno): intro, extras, timeline and catalog. */
export default async function EraPage({
    collection, id, title, lead, extras, timeline, gridTitle, gridDescription,
}: {
    collection: string; id: string; title: string; lead: string; extras?: ReactNode;
    timeline?: TimelineEvent[]; gridTitle: string; gridDescription: string;
}) {
    const items = await getPublishedItems<CatalogItem>(collection);
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <HistoriaHero />
            <main>
                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                        <header className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-5xl">{title}</h2>
                            <p className="mt-4 text-base leading-relaxed text-[#5b6478]">{lead}</p>
                        </header>

                        {timeline && (
                            <div className="mt-12"><TimelineTrack events={timeline} /></div>
                        )}
                        {extras && <div className="mt-14">{extras}</div>}
                    </div>
                </section>
                <div className="border-t border-[#0b1220]/8">
                    <CatalogSection id={id} title={gridTitle} description={gridDescription} items={items} collectionId={collection} />
                </div>
            </main>
            <RiendzoFooter />
        </div>
    );
}
