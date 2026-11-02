import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import CatalogSection from "@/app/components/sections/catalog-section";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Artist } from "@/lib/cms/artist-types";
import { getPublishedItems } from "@/lib/cms/store";
import MusicaHero from "../musica-hero";

export default async function Page() {
    const items = await getPublishedItems<CatalogItem>("music-evolution");
    // genres: show how many artists play each style
    const artists: Artist[] = [];
    const withCounts = items.map((i) => {
        const n = artists.filter((a) => a.genre === i.slug).length;
        return n ? { ...i, meta: [`${n} ${n === 1 ? "artista" : "artistas"}`, ...(i.meta ?? [])].slice(0, 3) } : i;
    });
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <MusicaHero />
            <main>
                <CatalogSection id="evolucao" title="Evolução Musical" description="Da música tradicional ao streaming: a linha do tempo dos sons de Moçambique." items={withCounts} collectionId="music-evolution" />
            </main>
            <RiendzoFooter />
        </div>
    );
}
