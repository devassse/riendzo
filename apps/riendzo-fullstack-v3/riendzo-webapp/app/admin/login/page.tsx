import { redirect } from "next/navigation";
import { authConfig, getSession } from "@/lib/cms/auth";
import LoginForm from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
    const { reset } = await searchParams;
    if (await getSession()) redirect("/admin");
    const cfg = authConfig();

    return (
        <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
            {/* Brand side */}
            <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0058bd] to-[#003c8a] p-12 text-white lg:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-logo-white.png" alt="Riendzo, assistente de viagens" className="w-64" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/riendzo-emblem-white.png" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 w-[30rem] opacity-[0.12]" />
                <div className="relative">
                    <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/80">Bem-vindo ao</p>
                    <h1 className="mt-2 font-baloo text-5xl font-bold leading-tight">Portal do Administrador</h1>
                    <span className="mt-5 block h-1 w-14 rounded-full bg-[#01adfb]" />
                    <p className="mt-4 max-w-md text-lg text-white/85">Descubra Moçambique, juntos. Gira todo o conteúdo da plataforma num só lugar.</p>
                </div>
            </section>

            {/* Form side */}
            <section className="flex items-center justify-center bg-white px-6 py-12">
                <div className="w-full max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/riendzo-logo.png" alt="Riendzo" className="mb-8 w-48 lg:hidden" />
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#0054b5]">BackOffice</p>
                    <h2 className="mt-1 font-baloo text-3xl font-bold text-[#0b1220]">Iniciar sessão</h2>
                    <p className="mt-1 text-sm text-[#4b5568]">Acesso reservado a administradores da plataforma.</p>

                    {!cfg.configured && (
                        <p className="mt-5 rounded-xl bg-[#e5533d]/10 p-3 text-xs leading-relaxed text-[#b5311d]">
                            Defina <code>ADMIN_PASSWORD</code> e <code>ADMIN_SESSION_SECRET</code> (32+ caracteres) no ambiente do servidor.
                        </p>
                    )}
                    {cfg.usingDevDefaults && (
                        <p className="mt-5 rounded-xl bg-[#ffc14d]/25 p-3 text-xs leading-relaxed text-[#6b4700]">
                            Modo de desenvolvimento: utilizador <b>admin</b>, palavra-passe <b>riendzo-admin</b>. Em produção use as variáveis de ambiente.
                        </p>
                    )}
                    {reset === "1" && <p role="status" className="mt-5 rounded-xl bg-[#2f9e44]/12 p-3 text-xs text-[#237a35]">Palavra-passe alterada. Já pode iniciar sessão.</p>}
                    <LoginForm />
                    <p className="mt-6 text-center text-xs text-[#5b6478]">Problemas de acesso? Contacte o administrador da plataforma.</p>
                </div>
            </section>
        </main>
    );
}
