"use client";

import { useState } from "react";

/** Share the public address of the place: straight to WhatsApp, or copy the link. */
export default function QrShare({ url, name }: { url: string; name: string }) {
    const [copied, setCopied] = useState(false);
    const wa = `https://wa.me/?text=${encodeURIComponent(`${name}: ${url}`)}`;

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // old browsers / insecure origin: select and copy through a temporary field
            const t = document.createElement("textarea");
            t.value = url; t.style.position = "fixed"; t.style.opacity = "0";
            document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1faa59] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 00-7.700 13.600L3 21l4.500-1.200A9 9 0 1012 3zm0 1.800a7.200 7.200 0 11-3.800 13.300l-.3-.2-2.600.7.700-2.500-.2-.3A7.200 7.200 0 0112 4.800zm-3 3.300c-.2 0-.5.100-.7.400-.3.300-.9.900-.9 2.100s.9 2.400 1 2.600c.1.200 1.800 2.800 4.400 3.800 2.100.8 2.500.6 3 .6s1.500-.6 1.700-1.200c.2-.6.2-1.100.2-1.200-.1-.1-.2-.2-.5-.3l-1.600-.8c-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100-.2-.1-1-.4-1.900-1.200-.7-.6-1.200-1.400-1.300-1.700-.1-.2 0-.4.100-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.700c-.2-.5-.4-.4-.6-.4H9z" /></svg>
                Partilhar no WhatsApp
            </a>
            <button type="button" onClick={copy} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-5 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5" aria-live="polite">
                {copied ? "✓ Link copiado" : "Copiar link"}
            </button>
        </>
    );
}
