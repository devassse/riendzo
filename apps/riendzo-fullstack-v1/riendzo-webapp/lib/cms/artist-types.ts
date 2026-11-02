/** Artist model (Música > Artistas). Plain module: safe for server and client. */

/** A line of lyrics. `time` is in seconds; `words` (optional) gives per-word timing. */
export type LyricLine = {
    time?: number;
    text: string;
    words?: { time: number; text: string }[];
};

export type Track = {
    title: string;
    /** "3:45" */
    duration?: string;
    /** Direct link to an audio file you have the rights to play (mp3, m4a, ogg) */
    audioUrl?: string;
    /** Official YouTube video of the track */
    youtubeUrl?: string;
    /**
     * Lyrics (only with permission from the rights holders). With timings the
     * player highlights the words as they are sung (karaoke).
     */
    lyrics?: LyricLine[];
};

export type Album = {
    slug: string;
    title: string;
    year?: number;
    cover?: string;
    label?: string;
    description?: string;
    tracks: Track[];
};

export type PhotoAlbum = {
    title: string;
    images: { src: string; caption?: string }[];
};

export type Artist = {
    slug: string;
    name: string;
    realName?: string;
    /** Value from the "music-genres" list */
    genre: string;
    photo?: string;
    /** Wide banner used on the profile page */
    cover?: string;
    birthYear?: number;
    deathYear?: number;
    /** Province / place of origin (value from the "provinces" list) */
    origin?: string;
    activeSince?: string;
    /** One or two sentences, shown on the cards */
    summary: string;
    /** Short quote shown in the "Artist of the week" hero */
    quote?: string;
    /** Full biography (sanitised HTML from the rich-text editor) */
    body?: string;
    albums: Album[];
    photoAlbums: PhotoAlbum[];
    links?: { youtube?: string; spotify?: string; instagram?: string; facebook?: string; website?: string };
    /** "Artist of the week": only one artist can have it */
    featuredWeek?: boolean;
    status?: "published" | "draft";
    updatedAt?: string;
};

export const songCount = (a: Artist) => a.albums.reduce((n, al) => n + al.tracks.length, 0);
