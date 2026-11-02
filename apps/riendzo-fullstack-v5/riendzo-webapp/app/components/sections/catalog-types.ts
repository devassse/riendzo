/**
 * Shared types for the content catalogs (Turismo, Serviços Públicos,
 * Entretenimento and Blog). Plain module (no "use client") so server
 * components can import the types and the client grid can use them too.
 */

export type CatalogBlock =
    | { kind: "list"; heading: string; items: string[] }
    | { kind: "steps"; heading: string; items: string[] }
    | { kind: "text"; heading?: string; items: string[] }
    | { kind: "tags"; heading: string; items: string[] };

/** One post ("aventura", publication) of a guide or content creator: text + photo gallery + YouTube videos. */
export type CatalogPost = {
    id: string;
    title: string;
    /** YYYY-MM-DD */
    date: string;
    text?: string;
    images?: string[];
    videos?: CatalogVideo[];
};

export type CatalogVideo = {
    title: string;
    /** YouTube link (watch, youtu.be, shorts or embed) */
    url: string;
    /** Name of the (national) content creator */
    creator?: string;
};

export type CatalogContact = {
    phone?: string;
    /** International format, digits only, e.g. 258841234567 */
    whatsapp?: string;
    email?: string;
    website?: string;
    address?: string;
    /** Link to a map (Google Maps, OpenStreetMap…) */
    mapUrl?: string;
    facebook?: string;
    instagram?: string;
    /** Any other social network (the BackOffice lets you add as many as needed) */
    socials?: { network: string; url: string }[];
};

/** One thing an establishment sells: a dish, a room, a car, a product… */
export type OfferItem = {
    name: string;
    description?: string;
    /** Basic ingredients, amenities, features… */
    tags?: string[];
    price?: number;
    /** e.g. "por noite", "por dia", "por pessoa" */
    priceNote?: string;
    images?: string[];
    /** false = temporarily unavailable */
    available?: boolean;
    /** Highlight chosen by the establishment: "Prato do dia", house recommendation or most requested */
    highlight?: "daily" | "recommended" | "popular";
    /** Last day (YYYY-MM-DD) a "daily" highlight is shown; after that it disappears by itself */
    until?: string;
};
/** A section of the menu / room types / vehicle categories… */
export type OfferGroup = { title: string; items: OfferItem[] };

export type TimeRange = { open: string; close: string };
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAYS)[number];
export type OpeningHours = {
    open24h?: boolean;
    note?: string;
} & Partial<Record<DayKey, TimeRange[]>>;

export type GeoPoint = { lat: number; lng: number };

export type CatalogItem = {
    slug: string;
    title: string;
    /** Small tag over the cover, e.g. "Inhambane", "Nacional", "Opinião" */
    tag: string;
    /** Establishments that operate in several provinces (e.g. Maputo and Gaza). `tag` shows them joined. */
    provinces?: string[];
    /** Posts of guides and creators (newest first on the page) */
    posts?: CatalogPost[];
    /** Shown on the Home page (Breve História, Serviços Públicos, Emergências, Entretenimento). Managed in the BackOffice. */
    showOnHome?: boolean;
    /** History (ancient): also listed in "Reinos e Impérios" */
    realm?: boolean;
    /** History (modern): background colour of the poster panel on the Cronologia page */
    bgTone?: "black" | "green" | "red" | "yellow";
    /** Filter chips. The labels are used as they are. */
    categories: string[];
    /** Accent colour (hex) */
    color: string;
    /** Emoji shown on the placeholder cover when there is no photo */
    emoji: string;
    summary: string;
    /** Up to three short facts shown on the card, e.g. "Melhor época: Maio–Out" */
    meta?: string[];
    /** Label/value pairs shown as a grid in the side panel */
    facts?: { label: string; value: string }[];
    blocks?: CatalogBlock[];
    tip?: string;
    /** Optional label for the tip box (default comes from the translations) */
    tipLabel?: string;
    /** Optional link, e.g. official portal */
    link?: { label: string; href: string };
    /** Extra words that should match the search box */
    keywords?: string[];
    /** Photos, e.g. ["/home/bazaruto.jpeg"] */
    images?: string[];
    /** Full description written in the rich-text editor (sanitised HTML) */
    body?: string;
    /** Videos from national content creators */
    videos?: CatalogVideo[];
    /** Contacts (lodging, guides, transport…) */
    contact?: CatalogContact;
    /** Coordinates: used for "Como chegar" (directions) and maps */
    location?: GeoPoint;
    /** Weekly opening hours (Africa/Maputo time) */
    hours?: OpeningHours;
    /** Menu, rooms, vehicles, products… with prices and photos */
    offers?: OfferGroup[];
    /** Currency of the prices (default MZN) */
    currency?: "MZN" | "USD" | "ZAR" | "EUR";
    /** Paid / highlighted listing: shown first with a "Patrocinado" badge */
    featured?: boolean;
    /** Managed in the BackOffice. Missing = published. */
    status?: "published" | "draft";
    /** ISO date, set by the BackOffice */
    updatedAt?: string;
};

export type CatalogLabels = {
    all: string;
    searchPlaceholder: string;
    noResults: string;
    /** e.g. "{count} resultados" */
    results: string;
    /** e.g. "Página {count}" */
    page: string;
    prev: string;
    next: string;
    close: string;
    open: string;
    photoSoon: string;
    tip: string;
    categoriesAria: string;
    paginationAria: string;
    /** Extra labels for the richer side panel */
    contact: string;
    whatsapp: string;
    call: string;
    sendEmail: string;
    website: string;
    openMap: string;
    videos: string;
    featured: string;
    gallery: string;
    addFavorite: string;
    removeFavorite: string;
    directions: string;
    openPage: string;
    offersTitle: string;
    unavailable: string;
    openNow: string;
    closingSoon: string;
    closed: string;
    opensAt: string;
    open24h: string;
};
