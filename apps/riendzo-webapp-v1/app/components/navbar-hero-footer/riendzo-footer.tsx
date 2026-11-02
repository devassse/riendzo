import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export default function RiendzoFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#f9f9f9] text-[#0058b7] border-t border-[#00aefb]/50 ">
            <div className="mx-auto max-w-6xl px-6 sm:px-10">

                {/* Main footer */}
                <div className="grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">

                    {/* Brand */}
                    <div className="max-w-sm">
                        <Link
                            href="/"
                            className="inline-flex items-center"
                            aria-label="Riendzo — Assistente de Viagens"
                        >
                            <Image
                                src="/logo/logo-slogan-horizontal.webp"
                                alt="Riendzo — Assistente de Viagens"
                                width={150}
                                height={64}
                                className="h-auto w-[150px]"
                            />
                        </Link>

                        <p className="mt-5 text-sm leading-relaxed text-[#0058b7]">
                            Uma plataforma digital para descobrir Moçambique —
                            a sua história, cultura, lugares, serviços,
                            experiências e muito mais.
                        </p>

                        <p className="mt-4 text-sm leading-relaxed text-[#0058b7]">
                            Feito com amor em Moçambique. 🇲🇿
                        </p>
                    </div>

                    {/* Explorar */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#0058b7]">
                            Explorar
                        </h3>

                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Início
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/historia"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    História
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/musica"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Música
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/turismo"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Turismo
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/gastronomia"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Gastronomia
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Serviços */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#0058b7]">
                            Serviços
                        </h3>

                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link
                                    href="/servicos"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Serviços Públicos
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/servicos/documentos"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Documentos & BI
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/servicos/saude"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Saúde
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/servicos/educacao"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Educação
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/servicos/impostos"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Impostos & Taxas
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Riendzo */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#0058b7]">
                            Riendzo
                        </h3>

                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link
                                    href="/portal"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Portal
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/blog"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Blog
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/sobre"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Sobre o Riendzo
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/contactos"
                                    className="text-sm text-[#0058b7] transition-colors hover:text-[#0058b7]"
                                >
                                    Contactos
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />
            </div>

            {/* Copy right and legal information */}
            <div className="flex flex-col gap-5 py-4 px-4 md:flex-row md:items-center md:justify-between bg-[#f2f7ff] border-t border-[#00aefb]/50">

                    <div className="text-xs text-[#0058b7]">
                        Riendzo - Todos os direitos reservados &copy; {currentYear}.
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#0058b7]">
                        <Link
                            href="/privacidade"
                            className="transition-colors hover:text-[#0058b7]"
                        >
                            Privacidade
                        </Link>

                        <Link
                            href="/termos"
                            className="transition-colors hover:text-[#0058b7]"
                        >
                            Termos de Uso
                        </Link>

                        <span className="hidden h-3 w-px bg-white/10 sm:block" />

                        <span>
                            Desenvolvido com <span className="text-red-400">♥</span> por{' '}
                            <a href='https://joaodevsonmucavel.vercel.app/' target="_blank" className="font-medium text-[#0058b7]/65 hover:text-[#0058b7]" style={{textDecoration:"underline"}}>
                                Keoma Software, Inc.
                            </a>
                        </span>
                    </div>
                </div>
        </footer>
    );
}