import type { ReactNode } from "react";
import pageStyles from "@/app/css/page.module.css";
import RiendzoNavbar from "@/app/components/navbar-hero-footer/riendzo-navbar";
import RiendzoFooter from "@/app/components/navbar-hero-footer/riendzo-footer";

/** Navbar + title band + content + footer, for simple pages (about, contacts, search…). */
export default function PageShell({ title, lead, children, wide = false }: { title: string; lead?: string; children: ReactNode; wide?: boolean }) {
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <header className="relative overflow-hidden bg-[#0b1220] text-[#f4ecd8]">
                <div aria-hidden="true" className="absolute -left-32 top-[-8rem] h-[30rem] w-[30rem] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, #01adfb 0%, transparent 70%)" }} />
                <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-6 text-center">
                    <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{title}</h1>
                    {lead && <p className="mx-auto mt-4 max-w-2xl text-lg text-[#a7b0c4]">{lead}</p>}
                </div>
            </header>
            <main className="bg-white">
                <div className={`mx-auto px-6 py-14 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>{children}</div>
            </main>
            <RiendzoFooter />
        </div>
    );
}
