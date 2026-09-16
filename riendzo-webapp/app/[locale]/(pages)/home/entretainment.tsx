import Link from 'next/link';
import type { SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icons — one per category                                         */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconFilm = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </Base>
);

const IconCalendar = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <path d="M8 14h2M14 14h2M8 17h2" />
    </Base>
);

const IconTrophy = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
        <path d="M7 5H4a3 3 0 003 5M17 5h3a3 3 0 01-3 5" />
        <path d="M12 14v4M9 21h6M10 18h4v3h-4z" />
    </Base>
);

const IconGamepad = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <rect x="2" y="8" width="20" height="10" rx="5" />
        <path d="M7 11v4M5 13h4" />
        <circle cx="16" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="18.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

type Category = {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
};

const CATEGORIES: Category[] = [
    {
        title: 'Cinema & Séries',
        description: 'Estreias e produções nacionais.',
        href: '#',
        icon: <IconFilm />,
    },
    {
        title: 'Eventos',
        description: 'Festivais e concertos por província.',
        href: '#',
        icon: <IconCalendar />,
    },
    {
        title: 'Desporto',
        description: 'Futebol, basquetebol e mais.',
        href: '#',
        icon: <IconTrophy />,
    },
    {
        title: 'Jogos & Cultura Pop',
        description: 'Conteúdo para todas as idades.',
        href: '#',
        icon: <IconGamepad />,
    },
];

/* ---------------------------------------------------------------- */
/*  Section                                                           */
/* ---------------------------------------------------------------- */

export default function CategoryNav() {
    return (
        <section aria-labelledby="categories-title" className="bg-[#050f22]">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
                <h2
                    id="categories-title"
                    className="font-body text-4xl font-bold text-[#eaf2ff] sm:text-5xl"
                >
                    Entretenimento
                </h2>
                <p className="mt-3 max-w-2xl font-body text-lg text-[#9fb3d1]">
                    Descubra o que fazer em Moçambique, de concertos a festivais, de jogos a filmes.
                </p>
            </div>

            <nav aria-label="Categorias" className="bg-[#050f22] px-6 pb-20 sm:px-10">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.title}
                            href={category.href}
                            className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0d2148]/70 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#00aefb]/40 hover:bg-[#0d2148] sm:p-10"
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#00aefb]/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                            />

                            <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-[#00aefb]/30 bg-[#00aefb]/10 text-[#00aefb]">
                                <span className="h-8 w-8">{category.icon}</span>
                            </span>

                            <div>
                                <h3 className="font-body text-2xl font-bold leading-snug text-[#eaf2ff] group-hover:text-white">
                                    {category.title}
                                </h3>
                                <p className="mt-2 font-body text-[15px] leading-relaxed text-[#9fb3d1]">
                                    {category.description}
                                </p>
                            </div>

                            <span className="mt-auto flex items-center gap-2 font-body text-sm font-semibold text-[#00aefb] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                Explorar
                                <span aria-hidden="true">→</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </section>
    );
}