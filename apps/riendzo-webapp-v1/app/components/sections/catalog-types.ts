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

export type CatalogItem = {
    slug: string;
    title: string;
    /** Small tag over the cover, e.g. "Inhambane", "Nacional", "Opinião" */
    tag: string;
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
};
