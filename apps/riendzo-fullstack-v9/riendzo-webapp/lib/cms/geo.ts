import type { GeoPoint } from "@/app/components/sections/catalog-types";

export const validPoint = (p: unknown): p is GeoPoint =>
    !!p && typeof p === "object" &&
    Number.isFinite((p as GeoPoint).lat) && Number.isFinite((p as GeoPoint).lng) &&
    Math.abs((p as GeoPoint).lat) <= 90 && Math.abs((p as GeoPoint).lng) <= 180;

/** Rough bounding box of Mozambique (used only to warn about typos). */
export const inMozambique = (p: GeoPoint) => p.lat >= -27.2 && p.lat <= -10.2 && p.lng >= 30.1 && p.lng <= 41;

/**
 * Accepts "-25.9692, 32.5732" or a pasted Google Maps / OpenStreetMap link
 * (…/@-25.96,32.57,17z · …!3d-25.96!4d32.57 · …?q=-25.96,32.57 · ?ll= · ?mlat=&mlon=).
 */
export function parseCoordinates(input: string): GeoPoint | null {
    const s = decodeURIComponent(input.trim());
    const num = "(-?\\d{1,3}(?:\\.\\d+)?)";
    const patterns = [
        new RegExp(`!3d${num}!4d${num}`),
        new RegExp(`@${num},\\s*${num}`),
        new RegExp(`[?&](?:q|ll|query|destination)=${num},\\s*${num}`),
        new RegExp(`mlat=${num}.*?mlon=${num}`),
        new RegExp(`^${num}\\s*[,; ]\\s*${num}$`),
    ];
    for (const re of patterns) {
        const m = re.exec(s);
        if (m) {
            const p = { lat: Number(m[1]), lng: Number(m[2]) };
            if (validPoint(p)) return p;
        }
    }
    return null;
}

const fmt = (p: GeoPoint) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

/** Opens Google Maps with directions from the visitor's current location. */
export const directionsUrl = (p: GeoPoint) =>
    `https://www.google.com/maps/dir/?api=1&destination=${fmt(p)}&travelmode=driving`;

export const mapUrl = (p: GeoPoint) => `https://www.google.com/maps/search/?api=1&query=${fmt(p)}`;

/** Keyless embeddable map (OpenStreetMap). */
export function osmEmbedUrl(p: GeoPoint) {
    const d = 0.006;
    const bbox = [p.lng - d, p.lat - d, p.lng + d, p.lat + d].map((n) => n.toFixed(6)).join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat.toFixed(6)}%2C${p.lng.toFixed(6)}`;
}
