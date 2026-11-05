import type { Metadata } from "next";
import "@/app/css/globals.css";
import { THEME_INIT } from "@/app/components/utils/theme-init";

export const metadata: Metadata = {
    title: "Riendzo · BackOffice",
    description: "Portal do Administrador da plataforma Riendzo",
    robots: { index: false, follow: false },
};

/** Root layout of the BackOffice (separate from the public, translated site). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt" suppressHydrationWarning>
            <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT }} /></head>
            <body className="bg-[#f3f6fb] text-[#0b1220] antialiased">{children}</body>
        </html>
    );
}
