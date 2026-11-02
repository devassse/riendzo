import { SOCIALS, type SocialId } from "@/lib/social";

const PATHS: Record<SocialId, string> = {
    facebook: "M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.200v3h2.500V21h2.800z",
    instagram: "M7.500 3h9A4.500 4.500 0 0121 7.500v9a4.500 4.500 0 01-4.500 4.500h-9A4.500 4.500 0 013 16.500v-9A4.500 4.500 0 017.500 3zm0 1.800A2.700 2.700 0 004.800 7.500v9a2.700 2.700 0 002.700 2.700h9a2.700 2.700 0 002.700-2.700v-9a2.700 2.700 0 00-2.700-2.700h-9zM12 7.800a4.200 4.200 0 110 8.400 4.200 4.200 0 010-8.400zm0 1.800a2.400 2.400 0 100 4.800 2.400 2.400 0 000-4.800zm4.800-3.300a1 1 0 110 2 1 1 0 010-2z",
    youtube: "M21.600 7.200a2.500 2.500 0 00-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 002.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 001.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 001.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3L10 15z",
    tiktok: "M16.600 3c.3 2.300 1.600 3.700 3.900 3.900v2.900c-1.300.1-2.500-.3-3.800-1.100v5.500c0 3.500-2.500 5.600-5.300 5.600a5.400 5.400 0 01-.9-10.700v3a2.500 2.500 0 102.200 2.500V3h3.900z",
    whatsapp: "M12 3a9 9 0 00-7.700 13.600L3 21l4.500-1.200A9 9 0 1012 3zm0 1.800a7.200 7.200 0 11-3.800 13.300l-.3-.2-2.600.7.700-2.500-.2-.3A7.200 7.200 0 0112 4.800zm-3 3.300c-.2 0-.5.100-.7.400-.3.300-.9.900-.9 2.100s.9 2.400 1 2.600c.1.200 1.800 2.800 4.400 3.800 2.100.8 2.500.6 3 .6s1.500-.6 1.700-1.200c.2-.6.2-1.100.2-1.200-.1-.1-.2-.2-.5-.3l-1.600-.8c-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100-.2-.1-1-.4-1.900-1.200-.7-.6-1.200-1.400-1.300-1.700-.1-.2 0-.4.100-.5l.4-.5c.1-.1.2-.3.200-.4.100-.2 0-.3 0-.4l-.7-1.700c-.2-.5-.4-.4-.6-.4H9z",
    x: "M17.800 3h2.900l-6.300 7.200L21.800 21H16l-4.500-5.900L6.300 21H3.400l6.700-7.700L2.600 3h5.900l4.100 5.400L17.800 3zm-1 16.300h1.600L7.600 4.600H5.900l10.900 14.700z",
    linkedin: "M5.200 8.800H2.200V21h3V8.800zM3.700 3a1.800 1.800 0 100 3.600 1.800 1.800 0 000-3.600zM21.800 21v-6.700c0-3.300-1.800-4.800-4.100-4.800-1.900 0-2.700 1-3.200 1.800V8.800h-3V21h3v-6.800c0-.4 0-.7.100-.9.300-.7.900-1.400 2-1.400 1.400 0 1.900 1.100 1.900 2.700V21h3.300z",
};

/** Round social icons (server component). `tone`: "light" for dark backgrounds, "brand" for the white footer. */
export default function SocialLinks({ size = 18, tone = "brand", className = "" }: { size?: number; tone?: "light" | "brand"; className?: string }) {
    if (!SOCIALS.length) return null;
    const color = tone === "light" ? "text-white/75 hover:text-[#00aefb]" : "text-[#0058b7] hover:bg-[#0058b7] hover:text-white";
    const pad = tone === "light" ? "" : "rounded-full border border-[#0058b7]/25 p-2 transition-colors";
    return (
        <ul className={`flex items-center gap-3 mt-1 ${className}`} aria-label="Redes sociais">
            {SOCIALS.map((s) => (
                <li key={s.id}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} className={`inline-flex transition-colors ${color} ${pad}`}>
                        <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d={PATHS[s.id]}/></svg>
                    </a>
                </li>
            ))}
        </ul>
    );
}
