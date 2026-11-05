/**
 * Riendzo social networks (footer and top bar).
 * Override any address in .env.local, e.g. NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/riendzomz
 * Leave a network empty ("") to hide it.
 */
export type SocialId = "facebook" | "instagram" | "youtube" | "tiktok" | "whatsapp" | "x" | "linkedin";

const env = (v: string | undefined, fallback: string) => (v === undefined ? fallback : v.trim());

export const SOCIALS: { id: SocialId; label: string; href: string }[] = (
    [
        { id: "facebook", label: "Facebook", href: env(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK, "https://facebook.com/riendzo") },
        { id: "instagram", label: "Instagram", href: env(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM, "https://instagram.com/riendzo") },
        { id: "youtube", label: "YouTube", href: env(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE, "https://youtube.com/@riendzo") },
        { id: "tiktok", label: "TikTok", href: env(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK, "https://tiktok.com/@riendzo") },
        { id: "whatsapp", label: "WhatsApp", href: env(process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP, "") },
        { id: "x", label: "X", href: env(process.env.NEXT_PUBLIC_SOCIAL_X, "") },
        { id: "linkedin", label: "LinkedIn", href: env(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN, "") },
    ] as { id: SocialId; label: string; href: string }[]
).filter((s) => /^https:\/\//.test(s.href));
