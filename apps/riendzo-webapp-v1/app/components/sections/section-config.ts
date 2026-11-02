/**
 * Configuration for the sections that share the same hero / hub / catalog
 * layout: Turismo, Serviços Públicos, Entretenimento and Blog.
 *
 * Texts (titles, descriptions, keywords) live in messages/<locale>.json
 * under the namespace in `ns`:
 *
 *   <ns>.title, <ns>.description
 *   <ns>.keywords.k1 … k4
 *   <ns>.hub.title, <ns>.hub.description
 *   <ns>.pages.<key>.label | title | description
 *
 * To add a submenu: add it here, add its texts to the messages, and create
 * the page (see e.g. app/[locale]/(pages)/turismo/praias/page.tsx).
 */

export type SectionId = "tourism" | "services" | "entertainment" | "blog";

export type Motif = "waves" | "grid" | "spotlight" | "paper";

export type SectionPageConfig = {
    /** Key used in the messages: <ns>.pages.<key> */
    key: string;
    /** URL segment after the base path */
    slug: string;
    /** Accent colour (hex) */
    color: string;
};

export type SectionConfig = {
    ns: string;
    /** `id` of the matching entry in NAV_SECTIONS (used for the icons) */
    navId: string;
    basePath: string;
    motif: Motif;
    /** Three glow colours for the hero background */
    glow: [string, string, string];
    pages: SectionPageConfig[];
};

export const SECTIONS: Record<SectionId, SectionConfig> = {
    tourism: {
        ns: "tourism",
        navId: "turismo",
        basePath: "/turismo",
        motif: "waves",
        glow: ["#00aefb", "#f2a93b", "#35be12"],
        pages: [
            { key: "beaches", slug: "praias", color: "#00aefb" },
            { key: "parks", slug: "parques", color: "#35be12" },
            { key: "island", slug: "ilha-de-mocambique", color: "#f0a83a" },
            { key: "routes", slug: "roteiros", color: "#e5533d" },
        ],
    },
    services: {
        ns: "services",
        navId: "servicos",
        basePath: "/servicos",
        motif: "grid",
        glow: ["#1f6fe0", "#00aefb", "#f2a93b"],
        pages: [
            { key: "documents", slug: "documentos", color: "#00aefb" },
            { key: "health", slug: "saude", color: "#e5533d" },
            { key: "education", slug: "educacao", color: "#f0a83a" },
            { key: "taxes", slug: "impostos", color: "#35be12" },
        ],
    },
    entertainment: {
        ns: "entertainment",
        navId: "entretenimento",
        basePath: "/entretenimento",
        motif: "spotlight",
        glow: ["#c86b8c", "#f2a93b", "#00aefb"],
        pages: [
            { key: "cinema", slug: "cinema", color: "#c86b8c" },
            { key: "events", slug: "eventos", color: "#f0a83a" },
            { key: "sports", slug: "desporto", color: "#35be12" },
            { key: "games", slug: "jogos", color: "#00aefb" },
        ],
    },
    blog: {
        ns: "blog",
        navId: "blog",
        basePath: "/blog",
        motif: "paper",
        glow: ["#f0a83a", "#e5533d", "#00aefb"],
        pages: [
            { key: "news", slug: "noticias", color: "#e5533d" },
            { key: "culture", slug: "cultura", color: "#f0a83a" },
            { key: "travel", slug: "viagens", color: "#00aefb" },
            { key: "opinion", slug: "opiniao", color: "#c86b8c" },
        ],
    },
};
