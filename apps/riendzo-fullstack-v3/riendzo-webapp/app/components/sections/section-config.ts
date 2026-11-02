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
    /** Collection (BackOffice) that feeds the page */
    collection: string;
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
        ns: "tourism", navId: "turismo", basePath: "/turismo", motif: "waves", glow: ["#00aefb", "#f2a93b", "#35be12"],
        pages: [
            { key: "beaches", slug: "praias", color: "#00aefb", collection: "tourism-beaches" },
            { key: "parks", slug: "parques", color: "#35be12", collection: "tourism-parks" },
            { key: "lodging", slug: "alojamentos", color: "#f0a83a", collection: "tourism-lodging" },
            { key: "guides", slug: "guias", color: "#c86b8c", collection: "tourism-guides" },
            { key: "transport", slug: "transportes", color: "#1f6fe0", collection: "tourism-transport" },
            { key: "rentacar", slug: "rent-a-car", color: "#e5533d", collection: "tourism-rentacar" },
            { key: "routes", slug: "roteiros", color: "#d98a00", collection: "tourism-routes" },
        ],
    },
    services: {
        ns: "services", navId: "servicos", basePath: "/servicos", motif: "grid", glow: ["#1f6fe0", "#00aefb", "#f2a93b"],
        pages: [
            { key: "documents", slug: "documentos", color: "#00aefb", collection: "services-documents" },
            { key: "health", slug: "saude", color: "#e5533d", collection: "services-health" },
            { key: "education", slug: "educacao", color: "#f0a83a", collection: "services-education" },
            { key: "taxes", slug: "impostos", color: "#35be12", collection: "services-taxes" },
            { key: "banks", slug: "bancos", color: "#1f6fe0", collection: "services-banks" },
            { key: "commerce", slug: "comercio", color: "#2f9e44", collection: "services-commerce" },
            { key: "fuel", slug: "combustivel", color: "#d98a00", collection: "services-fuel" },
            { key: "emergency", slug: "emergencias", color: "#e5533d", collection: "services-emergency" },
            { key: "schools", slug: "escolas", color: "#a85bd6", collection: "services-schools" },
            { key: "comms", slug: "comunicacoes", color: "#00aefb", collection: "services-comms" },
        ],
    },
    entertainment: {
        ns: "entertainment", navId: "entretenimento", basePath: "/entretenimento", motif: "spotlight", glow: ["#c86b8c", "#f2a93b", "#00aefb"],
        pages: [
            { key: "cinema", slug: "cinema", color: "#c86b8c", collection: "entertainment-cinema" },
            { key: "events", slug: "eventos", color: "#f0a83a", collection: "entertainment-events" },
            { key: "sports", slug: "desporto", color: "#35be12", collection: "entertainment-sports" },
            { key: "games", slug: "jogos", color: "#00aefb", collection: "entertainment-games" },
        ],
    },
    blog: {
        ns: "blog", navId: "blog", basePath: "/blog", motif: "paper", glow: ["#f0a83a", "#e5533d", "#00aefb"],
        pages: [
            { key: "news", slug: "noticias", color: "#e5533d", collection: "blog-news" },
            { key: "culture", slug: "cultura", color: "#f0a83a", collection: "blog-culture" },
            { key: "travel", slug: "viagens", color: "#00aefb", collection: "blog-travel" },
            { key: "opinion", slug: "opiniao", color: "#c86b8c", collection: "blog-opinion" },
            { key: "creators", slug: "criadores", color: "#a85bd6", collection: "blog-creators" },
        ],
    },
};
