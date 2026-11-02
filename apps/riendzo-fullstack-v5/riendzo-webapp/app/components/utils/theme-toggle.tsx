"use client";

import { useEffect, useState } from "react";
import { THEME_KEY } from "./theme-init";

type Theme = "light" | "dark";

/**
 * Light / dark switch. The first visit follows the system; after pressing it the choice is remembered.
 * `tone="light"` is for dark bars (white icon), `tone="dark"` for white bars.
 */
export default function ThemeToggle({ tone = "dark", className = "" }: { tone?: "light" | "dark"; className?: string }) {
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
        // while the visitor never chose, follow the system when it changes
        const mq = matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (localStorage.getItem(THEME_KEY)) return;
            const t: Theme = mq.matches ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", t);
            setTheme(t);
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const toggle = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
        setTheme(next);
    };

    const label = theme === "dark" ? "Mudar para o modo claro" : "Mudar para o modo escuro";
    const color = tone === "light" ? "text-white/80 hover:text-[#00aefb]" : "text-[#0b1220] hover:bg-[#eef2f8]";
    return (
        <button type="button" onClick={toggle} aria-label={label} title={label} aria-pressed={theme === "dark"} className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${color} ${className}`}>
            {/* before the browser knows the theme nothing is drawn (avoids a flash of the wrong icon) */}
            {theme === "dark" ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" /></svg>
            ) : theme === "light" ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.800A9 9 0 1111.200 3a7 7 0 009.800 9.800z" /></svg>
            ) : null}
        </button>
    );
}
