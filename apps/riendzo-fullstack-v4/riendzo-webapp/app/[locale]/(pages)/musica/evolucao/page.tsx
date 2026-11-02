import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import CatalogSection from "@/app/components/sections/catalog-section";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import TimelineTrack from "@/app/components/history/timeline-track";
import { getGroup } from "@/lib/cms/collections";
import { getIntro } from "@/lib/cms/page-intros";
import { getPublishedItems } from "@/lib/cms/store";
import MusicaHero from "../musica-hero";

export default async function Page() {
    const [items, intro] = await Promise.all([getPublishedItems<CatalogItem>("music-evolution"), getIntro("music-evolution")]);
    // the timeline is built from what is registered in the BackOffice (era + title + summary)
    const events = items.map((i) => ({ year: i.tag, title: i.title, text: i.summary }));
    const paragraphs = intro.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <MusicaHero />
            <main>
                <section className="bg-white">
                    <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
                        <header className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-bold leading-[1.1] text-[#0b1220] sm:text-4xl">{intro.title}</h2>
                            {paragraphs.map((p, i) => <p key={i} className="mt-4 text-base leading-relaxed text-[#4b5568]">{p}</p>)}
                        </header>
                        {events.length > 0 && <div className="mt-10"><TimelineTrack events={events} accent={getGroup("music").color} label="Linha do tempo da música" /></div>}
                    </div>
                </section>
                <div className="border-t border-[#0b1220]/8">
                    <CatalogSection id="evolucao" title="Evolução Musical" description="Da música tradicional ao streaming: a linha do tempo dos sons de Moçambique." items={items} collectionId="music-evolution" />
                </div>
            </main>
            <RiendzoFooter />
        </div>
    );
}
