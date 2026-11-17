import type { MetadataRoute } from "next";

/** Makes the site installable ("Add to Home Screen") and is the base look of the Android / iOS apps. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "Riendzo · Assistente de Viagens",
        short_name: "Riendzo",
        description: "Descubra Moçambique: turismo, gastronomia, serviços e muito mais.",
        lang: "pt",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#0054b5",
        categories: ["travel", "lifestyle"],
        icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
            { name: "Os meus pedidos", url: "/conta/pedidos", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
            { name: "Os meus locais", url: "/conta/locais", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
        ],
    };
}
