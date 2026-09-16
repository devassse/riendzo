'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icon set — one per stop, spanning all four eras                  */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconTool = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M14 3l7 7-2.5 2.5L11 5.5 14 3z" />
        <path d="M11 5.5L4 12.5c-1 1-1 3 0 4s3 1 4 0l7-7" />
        <path d="M4 20l3-3" />
    </Base>
);

const IconCrown = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 18h16l-1-8-4 3-3-6-3 6-4-3-1 8z" />
        <path d="M4 18v2h16v-2" />
    </Base>
);

const IconFort = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 20V10l3-2 3 2 2-2 2 2 3-2 3 2v10z" />
        <path d="M4 20h16" />
        <path d="M8 20v-5h3v5" />
        <path d="M12 6V3" />
    </Base>
);

const IconSeal = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <circle cx="12" cy="10" r="6" />
        <path d="M9.5 8.5l1.7 1.7 3.3-3.4" />
        <path d="M9 15.5L7.5 21 12 18.5 16.5 21 15 15.5" />
    </Base>
);

const IconRifleFlag = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M5 21L17 9" />
        <path d="M13 5l6 0 0 0-2 2 2 2-6 0z" />
        <path d="M13 5v-2" />
        <path d="M9 17l-4-4" />
    </Base>
);

const IconSunrise = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 3v4" />
        <path d="M4.5 11L7 9M19.5 11L17 9" />
        <path d="M2 17h20" />
        <path d="M6 17a6 6 0 0112 0" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data — six stops, ancient to modern                              */
/* ---------------------------------------------------------------- */

type Entry = {
    year: string;
    title: string;
    description: string;
    noteTitle: string;
    note: string;
    tags: string[];
    image: string;
    icon: ReactNode;
};

const REGISTO: Entry[] = [
    {
        year: 'c. 100 000 A.E.C.',
        title: 'Os Primeiros Habitantes',
        description:
            'Comunidades de caçadores-recoletores San percorrem o planalto e o vale do Save muito antes de qualquer aldeia agrícola se fixar na região, deixando pinturas rupestres e utensílios de pedra lascada que ainda hoje se encontram em abrigos rochosos por todo o país.',
        noteTitle: 'Nota marginal',
        note: 'Milhares de painéis de arte rupestre nas serras de Manica e Niassa continuam por catalogar.',
        tags: ['Povo San', 'Arte rupestre', 'Idade da Pedra'],
        image: '/ancient-history/first.jpeg',
        icon: <IconTool />,
    },
    {
        year: 'c. 1000-1500',
        title: 'Reinos e Impérios',
        description:
            'Do Grande Zimbábue ao Estado de Mutapa, passando pelas cidades suaílis da costa, a região faz parte de uma complexa rede de reinos, rotas de ouro e comércio com o Índico muito antes da chegada de qualquer europeu.',
        noteTitle: 'Nota marginal',
        note: 'O título "Mwene Mutapa" deu origem ao nome que os cronistas portugueses registaram como Monomotapa.',
        tags: ['Grande Zimbábue', 'Mutapa', 'Cidades suaílis'],
        image: '/ancient-history/migrations.jpg',
        icon: <IconCrown />,
    },
    {
        year: '1498-1505',
        title: 'A Chegada Portuguesa',
        description:
            'As caravelas de Vasco da Gama ancoram ao largo da Ilha de Moçambique em 1498. Poucos anos depois, a Coroa portuguesa ergue ali uma fortaleza para proteger a rota marítima até à Índia — o primeiro elo permanente entre Lisboa e o território.',
        noteTitle: 'Nota marginal',
        note: 'A fortaleza de São Sebastião é hoje a construção militar europeia mais antiga ainda de pé no hemisfério sul.',
        tags: ['Vasco da Gama', 'Ilha de Moçambique', 'Fortificação'],
        image: '/ancient-history/chegada-dos-portugueses.jpg',
        icon: <IconFort />,
    },
    {
        year: '1505-1930',
        title: 'A Administração Colonial',
        description:
            'Do sistema de prazos no vale do Zambeze às companhias majestáticas, Lisboa administra o território sobretudo por procuração — através de senhores de terra, concessionárias privadas e, mais tarde, um Estado cada vez mais presente e extractivo.',
        noteTitle: 'Nota marginal',
        note: 'A Companhia de Moçambique emitiu a sua própria moeda e manteve poderes quase soberanos até 1942.',
        tags: ['Prazeiros', 'Companhias majestáticas', 'Estado Novo'],
        image: '/colonial-history/trabalho-forcado.png',
        icon: <IconSeal />,
    },
    {
        year: '1964-1975',
        title: 'A Luta pela Independência',
        description:
            'A FRELIMO, liderada por Eduardo Mondlane, dispara os primeiros tiros da guerra de libertação em 1964. Dez anos depois, a Revolução dos Cravos em Lisboa abre caminho aos Acordos de Lusaka, e Samora Machel proclama a independência em Junho de 1975.',
        noteTitle: 'Nota marginal',
        note: 'Mais de 90% da população colona portuguesa deixaria o país nos meses seguintes à independência.',
        tags: ['FRELIMO', 'Samora Machel', '25 de Junho'],
        image: '/colonial-history/luta-armada.jpg',
        icon: <IconRifleFlag />,
    },
    {
        year: '1975-hoje',
        title: 'Moçambique Independente',
        description:
            'Do socialismo de Estado à guerra civil, da Paz de Roma em 1992 às primeiras eleições multipartidárias, o jovem país reconstrói-se em meio a desastres naturais, descobertas de gás e uma nova geração maioritariamente nascida depois da guerra.',
        noteTitle: 'Nota marginal',
        note: 'Mais de 60% da população moçambicana tem hoje menos de 25 anos.',
        tags: ['Paz de Roma', 'Reconstrução', 'Nova geração'],
        image: '/colonial-history/moz-independent.jpg',
        icon: <IconSunrise />,
    },
];

/* ---------------------------------------------------------------- */
/*  Reveal hook                                                       */
/* ---------------------------------------------------------------- */

function useReveal<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* ---------------------------------------------------------------- */
/*  Register row                                                     */
/* ---------------------------------------------------------------- */

function RegisterRow({ entry, index }: { entry: Entry; index: number }) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const number = String(index + 1).padStart(2, '0');

    return (
        <div
            ref={ref}
            className={[
                'relative grid grid-cols-[3.5rem_1fr] gap-5 py-10 sm:grid-cols-[8rem_1fr] sm:gap-4',
                'border-b border-[#1a3a6f]/20 last:border-b-0',
                'transition-opacity duration-700 ease-out motion-reduce:transition-none',
                visible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
        >
            {/* margin column — ledger reference */}
            <div className="flex flex-col items-center sm:items-start">
                <span className="font-['Manrope'] text-xs italic text-[#1a3a6f]/70">
                    Nº {number}
                </span>
                <span className="mt-1 font-['Baloo_2'] text-xl font-bold text-[#1a3a6f] sm:text-2xl">
                    {entry.year}
                </span>
                <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#1a3a6f]/50 text-[#1a3a6f]">
                    <span className="h-5 w-5">{entry.icon}</span>
                </span>
            </div>

            {/* content column */}
            <div>
                <div className="float-right ml-5 mb-2 w-28 overflow-hidden rounded-2xl border border-[#3a2a1c]/15 shadow-[3px_3px_0_0_rgba(58,42,28,0.12)] sm:w-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={entry.image}
                        alt={entry.title}
                        className="aspect-[3/5] w-full cursor-pointer rounded-2xl object-cover grayscale-[15%] sepia-[8%] transition-transform duration-500 ease-out hover:scale-110"
                    />
                </div>

                <h3 className="font-['Baloo_2'] text-[1.6rem] font-bold leading-snug text-[#1a3a6f]">
                    {entry.title}
                </h3>
                <p className="mt-3 max-w-[62ch] font-['Baloo_2'] text-[15.5px] leading-[1.75] text-[#1a3a6f]">
                    {entry.description}
                </p>

                <div className="mt-5 max-w-[56ch] border-l-2 border-[#1a3a6f]/60 pl-4">
                    <p className="font-['Manrope'] text-xs italic text-[#1a3a6f]">
                        {entry.noteTitle}
                    </p>
                    <p className="mt-1 font-['Manrope'] text-sm italic leading-relaxed text-[#5c4a38]">
                        {entry.note}
                    </p>
                </div>

                <p className="clear-both mt-5 font-['Manrope'] text-[13px] text-[#7a2e2e]/80">
                    {entry.tags.map((tag) => (
                        <span
                            key={tag}
                            className="mr-2 cursor-pointer rounded-full border border-[#7a2e2e]/80 bg-white/[0.04] px-2.5 py-1 text-xs text-[#7a2e2e]"
                        >
                            {tag}
                        </span>
                    ))}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    <a href="#" className="text-sm italic text-[#7a2e2e] hover:text-[#7a2e2e]/80">
                        Ler mais ...
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Page                                                              */
/* ---------------------------------------------------------------- */

export default function BriefHistory() {
    return (
        <div className="min-h-screen bg-[#dee5e8]">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
    `}</style>

            {/* masthead */}
            <div className="flex flex-col justify-center border-[#3a2a1c]/80 bg-[#dee5e8] px-6 pb-4 pt-8 text-center">
                <div className="mx-auto mb-5 h-px w-24 bg-[#1a3a6f]/60" />
                <h1 className="mt-4 font-['Baloo_2'] text-6xl font-bold text-[#1a3a6f]">Breve História</h1>
                <p className="mx-auto mt-1 max-w-xl font-['Manrope'] text-lg text-[#1a3a6f]">
                    Da Idade da Pedra à Moçambique de hoje, em seis capítulos — um resumo rápido antes de
                    explorar cada era em detalhe.
                </p>
                <div className="mx-auto mt-5 h-px w-24 bg-[#1a3a6f]/60" />
            </div>

            {/* the register */}
            <div className="mx-auto max-w-6xl px-6 py-4 sm:px-10">
                {REGISTO.map((entry, i) => (
                    <RegisterRow key={entry.year} entry={entry} index={i} />
                ))}
            </div>
        </div>
    );
}