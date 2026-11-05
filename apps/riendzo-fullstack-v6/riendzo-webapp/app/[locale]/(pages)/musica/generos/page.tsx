import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import CatalogSection from "@/app/components/sections/catalog-section";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Artist } from "@/lib/cms/artist-types";
import { getPublishedItems } from "@/lib/cms/store";
import MusicaHero from "../musica-hero";

export default async function Page() {
    const items = await getPublishedItems<CatalogItem>("music-genres");
    // genres: show how many artists play each style
    const artists = "music-genres" === "music-genres" ? await getPublishedItems<Artist>("music-artists") : [];
    const withCounts = items.map((i) => {
        const n = artists.filter((a) => a.genre === i.slug).length;
        return n ? { ...i, meta: [`${n} ${n === 1 ? "artista" : "artistas"}`, ...(i.meta ?? [])].slice(0, 3) } : i;
    });
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <MusicaHero />
            <main>
                <CatalogSection id="generos" title="Géneros Musicais" description="Marrabenta, Pandza, Timbila e outros estilos que contam a história do país." items={withCounts} collectionId="music-genres" />
            </main>
            <RiendzoFooter />
        </div>
    );
}
