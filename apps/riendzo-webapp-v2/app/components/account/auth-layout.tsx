import { Link } from "@/i18n/navigation";

/** Split screen used by the sign-in and sign-up pages. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
    return (
        <main className="grid min-h-screen bg-white lg:grid-cols-[1.1fr_1fr]">
            <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0058bd] to-[#003c8a] p-12 text-white lg:flex">
                <Link href="/" aria-label="Riendzo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/riendzo-logo-white.png" alt="Riendzo, assistente de viagens" className="w-64" />
                </Link>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-emblem-white.png" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 w-[30rem] opacity-[0.12]" />
                <div className="relative">
                    <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/80">Riendzo AI</p>
                    <h1 className="mt-2 font-baloo text-5xl font-bold leading-tight">A sua conta de viagem</h1>
                    <span className="mt-5 block h-1 w-14 rounded-full bg-[#01adfb]" />
                    <p className="mt-4 max-w-md text-lg text-white/85">Guarde os seus favoritos, complete o seu perfil e receba sugestões de Moçambique feitas à sua medida.</p>
                </div>
            </section>
            <section className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/riendzo-logo.png" alt="Riendzo" className="mb-8 w-48 lg:hidden" />
                    <h2 className="font-baloo text-3xl font-bold text-[#0b1220]">{title}</h2>
                    <p className="mt-1 text-sm text-[#4b5568]">{subtitle}</p>
                    {children}
                    <p className="mt-6 text-center text-sm text-[#4b5568]">{footer}</p>
                    <p className="mt-6 text-center text-xs"><Link href="/" className="text-[#5b6478] hover:underline">← Voltar ao site</Link></p>
                </div>
            </section>
        </main>
    );
}
