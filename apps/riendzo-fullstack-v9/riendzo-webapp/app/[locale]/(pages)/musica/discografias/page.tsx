import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import MusicaHero from "../musica-hero";
import AlbumsExplorer from "@/app/components/music/albums-explorer";
import type { Artist } from "@/lib/cms/artist-types";
import { getList } from "@/lib/cms/lists";
import { getPublishedItems } from "@/lib/cms/store";

export default async function DiscographiesPage() {
    const [artists, genres] = await Promise.all([getPublishedItems<Artist>("music-artists"), getList("music-genres")]);
    const rows = artists.flatMap((a) => {
        const g = genres.find((x) => x.value === a.genre);
        return a.albums.map((album) => ({ album, artistName: a.name, artistSlug: a.slug, color: g?.color ?? "#35be12", genre: a.genre, genreLabel: g?.label ?? a.genre }));
    }).sort((x, y) => (y.album.year ?? 0) - (x.album.year ?? 0));

    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <MusicaHero />
            <main className="bg-white">
                <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                    <header className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-[#0b1220] sm:text-5xl">Discografias</h2>
                        <p className="mt-4 text-[#5b6478]">Todos os álbuns dos artistas moçambicanos. Clique numa capa para ver as faixas.</p>
                    </header>
                    <AlbumsExplorer rows={rows} />
                </div>
            </main>
            <RiendzoFooter />
        </div>
    );
}
