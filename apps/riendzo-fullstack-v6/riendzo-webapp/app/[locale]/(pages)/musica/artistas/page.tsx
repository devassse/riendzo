import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";
import ArtistsHero from "@/app/components/music/artists-hero";
import ArtistsDirectory from "@/app/components/music/artists-directory";
import type { Artist } from "@/lib/cms/artist-types";
import { getList } from "@/lib/cms/lists";
import { getPublishedItems } from "@/lib/cms/store";

export default async function ArtistsPage() {
    const [artists, genres] = await Promise.all([getPublishedItems<Artist>("music-artists"), getList("music-genres")]);
    const weekly = artists.find((a) => a.featuredWeek);
    const g = genres.find((x) => x.value === weekly?.genre);

    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <ArtistsHero
                weekly={weekly} genreLabel={g?.label} genreColor={g?.color}
                totals={{ artists: artists.length, albums: artists.reduce((n, a) => n + a.albums.length, 0), genres: new Set(artists.map((a) => a.genre)).size }}
            />
            <main className="bg-white">
                <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                    <header className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-[#0b1220] sm:text-5xl">Todos os artistas</h2>
                        <p className="mt-4 text-[#5b6478]">Clique num artista para ver a biografia, a discografia e os álbuns de fotografias.</p>
                    </header>
                    <ArtistsDirectory artists={artists} genres={genres} />
                </div>
            </main>
            <RiendzoFooter />
        </div>
    );
}
