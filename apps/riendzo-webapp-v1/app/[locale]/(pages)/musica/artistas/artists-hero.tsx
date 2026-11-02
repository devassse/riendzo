import { getTranslations } from "next-intl/server";
import ArtistasGrid, {
    type Artist,
    type ArtistsGridLabels,
    type Genre,
} from "./artists-grid";

/**
 * EXAMPLE DATA — replace with your real artists
 * (or load them from your CMS / database).
 * Add `photo: "/artistas/slug.jpg"` to show a real photo.
 */
const ARTISTS: Artist[] = [
    { slug: "wazimbo", name: "Wazimbo", genre: "marrabenta", songs: 42, realName: "Nome Oficial" },
    { slug: "stewart-sukuma", name: "Stewart Sukuma", genre: "marrabenta", songs: 36, realName: "Nome Oficial" },
    { slug: "azagaia", name: "Azagaia", genre: "hipHop", songs: 28, realName: "Nome Oficial" },
    { slug: "dama-do-bling", name: "Dama do Bling", genre: "pandza", songs: 19, realName: "Nome Oficial" },
    { slug: "mingas", name: "Mingas", genre: "marrabenta", songs: 31, realName: "Nome Oficial" },
    { slug: "artista-6", name: "Artista 6", genre: "afroHouse", songs: 17, realName: "Nome Oficial" },
    { slug: "artista-7", name: "Artista 7", genre: "hipHop", songs: 24, realName: "Nome Oficial" },
    { slug: "artista-8", name: "Artista 8", genre: "marrabenta", songs: 31, realName: "Nome Oficial" },
    { slug: "artista-9", name: "Artista 9", genre: "pandza", songs: 38, realName: "Nome Oficial" },
    { slug: "artista-10", name: "Artista 10", genre: "afroHouse", songs: 10, realName: "Nome Oficial" },
    { slug: "artista-11", name: "Artista 11", genre: "hipHop", songs: 17, realName: "Nome Oficial" },
    { slug: "artista-12", name: "Artista 12", genre: "marrabenta", songs: 24, realName: "Nome Oficial" },
    { slug: "artista-13", name: "Artista 13", genre: "pandza", songs: 31, realName: "Nome Oficial" },
    { slug: "artista-14", name: "Artista 14", genre: "afroHouse", songs: 38, realName: "Nome Oficial" },
    { slug: "artista-15", name: "Artista 15", genre: "hipHop", songs: 10, realName: "Nome Oficial" },
    { slug: "artista-16", name: "Artista 16", genre: "marrabenta", songs: 17, realName: "Nome Oficial" },
    { slug: "artista-17", name: "Artista 17", genre: "pandza", songs: 24, realName: "Nome Oficial" },
    { slug: "artista-18", name: "Artista 18", genre: "afroHouse", songs: 31, realName: "Nome Oficial" },
    { slug: "artista-19", name: "Artista 19", genre: "hipHop", songs: 38, realName: "Nome Oficial" },
    { slug: "artista-20", name: "Artista 20", genre: "marrabenta", songs: 10, realName: "Nome Oficial" },
    { slug: "artista-21", name: "Artista 21", genre: "pandza", songs: 17, realName: "Nome Oficial" },
    { slug: "artista-22", name: "Artista 22", genre: "afroHouse", songs: 24, realName: "Nome Oficial" },
    { slug: "artista-23", name: "Artista 23", genre: "hipHop", songs: 31, realName: "Nome Oficial" },
    { slug: "artista-24", name: "Artista 24", genre: "marrabenta", songs: 38, realName: "Nome Oficial" },
];

const GENRES: Genre[] = ["marrabenta", "pandza", "afroHouse", "hipHop"];

/**
 * Small equalizer, same visual language as the main Music hero.
 */
function MiniEqualizer() {
    const heights = [30, 55, 80, 45, 95, 60, 35, 70, 40];

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 right-[8%] hidden opacity-[0.15] sm:block"
        >
            <div className="flex h-12 items-end gap-1">
                {heights.map((h, i) => (
                    <span
                        key={i}
                        className="w-[3px] rounded-full bg-[#35be12]"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Decorative person avatars (generic silhouettes) floating in the background.
 */
function AvatarsBackground() {
    const avatars = [
        { left: "5%", top: "14%", size: 56, color: "#35be12", opacity: 0.22, mobile: true },
        { left: "15%", top: "58%", size: 80, color: "#00aefb", opacity: 0.14, mobile: false },
        { left: "27%", top: "8%", size: 40, color: "#f0a83a", opacity: 0.16, mobile: false },
        { left: "70%", top: "10%", size: 44, color: "#c86b8c", opacity: 0.18, mobile: false },
        { left: "80%", top: "52%", size: 84, color: "#35be12", opacity: 0.14, mobile: false },
        { left: "91%", top: "16%", size: 60, color: "#00aefb", opacity: 0.22, mobile: true },
        { left: "88%", top: "78%", size: 40, color: "#f0a83a", opacity: 0.16, mobile: true },
        { left: "3%", top: "76%", size: 44, color: "#c86b8c", opacity: 0.18, mobile: true },
    ];

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {avatars.map((a, i) => (
                <svg
                    key={i}
                    viewBox="0 0 100 100"
                    width={a.size}
                    height={a.size}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                        a.mobile ? "" : "hidden sm:block"
                    }`}
                    style={{ left: a.left, top: a.top, opacity: a.opacity }}
                >
                    <defs>
                        <clipPath id={`avatar-clip-${i}`}>
                            <circle cx="50" cy="50" r="46" />
                        </clipPath>
                    </defs>

                    {/* Background disc */}
                    <circle cx="50" cy="50" r="46" fill={a.color} opacity="0.25" />

                    {/* Person silhouette */}
                    <g clipPath={`url(#avatar-clip-${i})`} fill="#f4ecd8">
                        <circle cx="50" cy="38" r="16" />
                        <path d="M14 100 C14 70 32 58 50 58 C68 58 86 70 86 100 Z" />
                    </g>

                    {/* Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke={a.color}
                        strokeWidth="2"
                    />
                </svg>
            ))}
        </div>
    );
}

export default async function ArtistasHero() {
    const t = await getTranslations("Music.artistsSection");

    const labels: ArtistsGridLabels = {
        all: t("filters.all"),
        searchPlaceholder: t("filters.search"),
        noResults: t("filters.noResults"),
        // raw templates, filled in on the client: "{count} ..."
        results: t.raw("filters.results") as string,
        songs: t.raw("songs") as string,
        viewProfile: t("viewProfile"),
        genres: Object.fromEntries(
            GENRES.map((g) => [g, t(`chips.${g}`)])
        ) as Record<Genre, string>,
    };

    return (
        <section id="artistas" className="relative scroll-mt-24">
            {/* =========================================================
                DARK HEADER
            ========================================================== */}
            <div className="relative overflow-hidden bg-[#0b1220]">
                {/* Background glows */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div
                        className="absolute left-1/2 top-[-9rem] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(53,190,18,0.5) 0%, rgba(53,190,18,0.12) 40%, transparent 70%)",
                        }}
                    />
                    <div
                        className="absolute -right-24 top-1/2 h-[16rem] w-[16rem] rounded-full opacity-10 blur-3xl"
                        style={{
                            background: "radial-gradient(circle, #00aefb 0%, transparent 70%)",
                        }}
                    />
                </div>

                {/* Decorative sound wave */}
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
                    viewBox="0 0 1440 300"
                    preserveAspectRatio="none"
                    fill="none"
                >
                    <path
                        d="M-100 150 C80 60 180 240 330 150 S580 60 720 150 S980 240 1120 150 S1360 60 1540 150"
                        stroke="#35be12"
                        strokeWidth="2"
                        strokeDasharray="3 9"
                    />
                    <path
                        d="M-100 170 C80 80 180 260 330 170 S580 80 720 170 S980 260 1120 170 S1360 80 1540 170"
                        stroke="#00aefb"
                        strokeWidth="1"
                        strokeDasharray="2 12"
                    />
                </svg>

                <AvatarsBackground />
                <MiniEqualizer />

                {/* Title + description */}
                <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-14 text-center sm:pb-20 sm:pt-16">
                    <h2 className="mt-3 text-3xl font-bold leading-[1.1] text-[#f4ecd8] sm:text-5xl">
                        {t("title")}
                    </h2>

                    <p className="mt-4 max-w-md text-base leading-relaxed text-[#a7b0c4]">
                        {t("description")}
                    </p>
                </div>
            </div>

            {/* =========================================================
                WHITE GRID (filters + artist cards)
            ========================================================== */}
            <div className="relative bg-white">
                <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
                    <ArtistasGrid artists={ARTISTS} labels={labels} />
                </div>

                {/* Bottom divider line */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#0b1220]/15 to-transparent"
                />
            </div>
        </section>
    );
}