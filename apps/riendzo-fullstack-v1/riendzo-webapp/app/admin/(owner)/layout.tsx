import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/cms/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

/** Portal of an establishment owner: they only see and edit their own pages. */
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
    const s = await getSession();
    if (!s) redirect("/admin/login");
    if (s.role !== "owner") redirect("/admin");

    return (
        <div className="min-h-screen bg-[#f3f6fb]">
            <header className="bg-gradient-to-r from-[#00306e] via-[#0054b5] to-[#0370d6] text-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
                    <Link href="/admin/meu-espaco" aria-label="Riendzo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/riendzo-logo-white.png" alt="Riendzo" className="w-36" /></Link>
                    <span className="hidden text-sm text-white/80 sm:block">Portal do estabelecimento</span>
                    <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
                        <Link href="/admin/meu-espaco" className="rounded-full px-4 py-2 hover:bg-white/15">O meu espaço</Link>
                        <Link href="/admin/meu-espaco/conta" className="rounded-full px-4 py-2 hover:bg-white/15">Conta</Link>
                        <a href="/pt" target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 hover:bg-white/15">Ver site ↗</a>
                        <span className="hidden px-3 text-white/80 md:inline">{s.name}</span>
                        <form action={logoutAction}><button className="cursor-pointer rounded-full bg-white px-4 py-2 font-medium text-[#0054b5] hover:opacity-90">Sair</button></form>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
        </div>
    );
}
