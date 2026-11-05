/** Colour helpers (client-safe) used to brand the pages of the establishments. */

const clean = (hex: string) => {
    const h = hex.replace("#", "");
    return h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
};

export function hexToRgb(hex: string) {
    const h = clean(hex);
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16) || 0;
    return { r: n(0), g: n(2), b: n(4) };
}

const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");

/** Relative luminance (0 = black, 1 = white). */
export function luminance(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const f = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Text colour that stays readable on top of `hex` (white on dark colours, near-black on light ones such as yellow). */
export const readableOn = (hex: string) => (luminance(hex) > 0.45 ? "#111827" : "#ffffff");

/** Mixes `hex` with `with` by `amount` (0 = hex, 1 = with). */
export function mix(hex: string, withHex: string, amount: number) {
    const a = hexToRgb(hex), b = hexToRgb(withHex);
    return `#${toHex(a.r + (b.r - a.r) * amount)}${toHex(a.g + (b.g - a.g) * amount)}${toHex(a.b + (b.b - a.b) * amount)}`;
}

/** The two colours of the branded header: always dark enough for light text, whatever the brand colour is. */
export function brandGradient(hex: string) {
    return { from: mix(hex, "#0b1220", 0.32), to: mix(hex, "#0b1220", 0.8) };
}
