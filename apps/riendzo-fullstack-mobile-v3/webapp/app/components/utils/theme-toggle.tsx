import { THEME_KEY } from "./theme-init";

void THEME_KEY;

/**
 * Light / dark switch. The click is handled by the small script in <head> (see theme-init.ts), so it works
 * on every device even before the page's JavaScript is ready; the icon (and label) follow <html data-theme> through CSS.
 * `tone="light"` is for dark bars (white icon), `tone="dark"` for white bars. `label` adds a text next to the icon.
 */
export default function ThemeToggle({ tone = "dark", className = "", label = false }: { tone?: "light" | "dark"; className?: string; label?: boolean }) {
    const color = tone === "light" ? "text-white/80 hover:text-[#00aefb]" : "text-[#0b1220] hover:bg-[#eef2f8]";
    return (
        <button
            type="button"
            data-theme-toggle=""
            aria-label="Alternar entre modo claro e modo escuro"
            title="Modo claro / escuro"
            className={`inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full transition-colors ${label ? "px-3 text-sm font-medium" : "w-8"} ${color} ${className}`}
        >
            {/* shown in light mode: "go dark" */}
            <svg viewBox="0 0 24 24" className="tt-moon h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.800A9 9 0 1111.200 3a7 7 0 009.800 9.800z" /></svg>
            {/* shown in dark mode: "go light" */}
            <svg viewBox="0 0 24 24" className="tt-sun h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" /></svg>
            {label && <><span className="tt-moon">Modo escuro</span><span className="tt-sun">Modo claro</span></>}
        </button>
    );
}
