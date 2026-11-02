"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export type Genre = "marrabenta" | "pandza" | "afroHouse" | "hipHop";

export type Artist = {
    slug: string;
    name: string;
    genre: Genre;
    /** Total number of songs */
    songs: number;
    /** Official / birth name, shown in parentheses under the stage name */
    realName?: string;
    /** Optional photo, e.g. "/artistas/wazimbo.jpg" */
    photo?: string;
};

export type ArtistsGridLabels = {
    all: string;
    searchPlaceholder: string;
    noResults: string;
    /** e.g. "{count} artistas" */
    results: string;
    /** e.g. "{count} músicas" */
    songs: string;
    viewProfile: string;
    genres: Record<Genre, string>;
};

const GENRE_COLORS: Record<Genre, string> = {
    marrabenta: "#35be12",
    pandza: "#c86b8c",
    afroHouse: "#00aefb",
    hipHop: "#f0a83a",
};

const GENRES = Object.keys(GENRE_COLORS) as Genre[];
const INK = "#0b1220";

type Filter = "all" | Genre;

const normalize = (s: string) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const fill = (tpl: string, count: number) =>
    tpl.replace("{count}", String(count));

/** Generic person silhouette, used when an artist has no photo. */
function Silhouette({ color }: { color: string }) {
    return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
            <rect width="100" height="100" fill={color} opacity="0.25" />
            <g fill={INK} opacity="0.7">
                <circle cx="50" cy="38" r="16" />
                <path d="M14 100 C14 70 32 58 50 58 C68 58 86 70 86 100 Z" />
            </g>
        </svg>
    );
}

function ArtistCard({
    artist,
    labels,
}: {
    artist: Artist;
    labels: ArtistsGridLabels;
}) {
    const color = GENRE_COLORS[artist.genre];

    return (
        <article
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#0b1220]/10 bg-white text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0b1220]/25 hover:shadow-lg cursor-pointer"
            style={{ "--accent": color } as React.CSSProperties}
        >
            {/* Banner */}
            <div
                aria-hidden="true"
                className="h-16 w-full"
                style={{
                    background: `linear-gradient(135deg, ${color}55 0%, ${color}11 70%, transparent 100%)`,
                }}
            />

            {/* Avatar (overlaps banner) */}
            <div
                className="relative -mt-10 mx-auto h-20 w-20 overflow-hidden rounded-full bg-white"
                style={{ boxShadow: `0 0 0 2px ${color}, 0 4px 14px ${color}44` }}
            >
                {artist.photo ? (
                    <Image
                        src={artist.photo}
                        alt={artist.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                ) : (
                    <Silhouette color={color} />
                )}
            </div>

            {/* Text */}
            <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-3">
                <h3 className="font-baloo text-base font-medium text-[#0b1220]">
                    {artist.name}
                </h3>

                {artist.realName && (
                    <p className="mt-0.5 text-xs text-[#5b6478]">
                        ({artist.realName})
                    </p>
                )}

                <p
                    className="mt-2 text-[10px] font-montserrat-italic uppercase tracking-[0.18em]"
                    style={{ color }}
                >
                    {labels.genres[artist.genre]}
                </p>

                {/* <p className="mt-3 flex items-center gap-1.5 text-xs text-[#5b6478]">
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    {fill(labels.songs, artist.songs)}
                </p> */}

                <Link
                    href={`/artistas/${artist.slug}`}
                    className="mt-5 w-full rounded-full border border-[var(--accent)] px-3 py-2 text-sm font-baloo font-medium text-[var(--accent)] transition-colors duration-300 hover:bg-[var(--accent)] hover:text-white"
                >
                    {labels.viewProfile}
                </Link>
            </div>

            {/* Bottom hover line */}
            <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: color }}
            />
        </article>
    );
}

export default function ArtistasGrid({
    artists,
    labels,
}: {
    artists: Artist[];
    labels: ArtistsGridLabels;
}) {
    const [filter, setFilter] = useState<Filter>("all");
    const [query, setQuery] = useState("");

    const counts = useMemo(() => {
        const c = { all: artists.length } as Record<Filter, number>;
        GENRES.forEach((g) => (c[g] = artists.filter((a) => a.genre === g).length));
        return c;
    }, [artists]);

    const visible = useMemo(() => {
        const q = normalize(query.trim());
        return artists.filter(
            (a) =>
                (filter === "all" || a.genre === filter) &&
                (!q || normalize(a.name).includes(q))
        );
    }, [artists, filter, query]);

    const chips: { key: Filter; label: string; color: string }[] = [
        { key: "all", label: labels.all, color: INK },
        ...GENRES.map((g) => ({
            key: g as Filter,
            label: labels.genres[g],
            color: GENRE_COLORS[g],
        })),
    ];

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div
                    role="tablist"
                    aria-label="Filter"
                    className="flex flex-wrap items-center gap-2"
                >
                    {chips.map((chip) => {
                        const active = filter === chip.key;
                        return (
                            <button
                                key={chip.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setFilter(chip.key)}
                                className="flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium transition-colors duration-200"
                                style={{
                                    borderColor: active ? chip.color : `${INK}1a`,
                                    backgroundColor: active ? chip.color : "transparent",
                                    color: active ? "#fff" : INK,
                                }}
                            >
                                {chip.key !== "all" && !active && (
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: chip.color }}
                                    />
                                )}
                                {chip.label}
                                <span className="opacity-60">{counts[chip.key]}</span>
                            </button>
                        );
                    })}
                </div>

                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={labels.searchPlaceholder}
                    aria-label={labels.searchPlaceholder}
                    className="w-full rounded-full border border-[#0b1220]/15 bg-white px-4 py-2 text-sm text-[#0b1220] outline-none transition-colors placeholder:text-[#5b6478] focus:border-[#0b1220]/50 sm:w-64"
                />
            </div>

            <p className="mt-4 text-xs text-[#5b6478]" aria-live="polite">
                {fill(labels.results, visible.length)}
            </p>

            {/* Cards */}
            {visible.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {visible.map((artist) => (
                        <ArtistCard key={artist.slug} artist={artist} labels={labels} />
                    ))}
                </div>
            ) : (
                <p className="mt-16 text-center text-sm text-[#5b6478]">
                    {labels.noResults}
                </p>
            )}
        </div>
    );
}