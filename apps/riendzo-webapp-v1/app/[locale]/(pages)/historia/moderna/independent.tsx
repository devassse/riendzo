'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icon set — flat, poster-weight marks, one per era                */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconStar = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 2l2.6 6.6L21 9.5l-5 4.4 1.6 6.9L12 17.2 6.4 20.8 8 13.9 3 9.5l6.4-.9L12 2z" />
    </Base>
);

const IconHoeRifle = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 20L18 6" />
        <path d="M15 3l4 4-2 2-4-4z" />
        <path d="M20 4L4 20" />
        <path d="M4 20l-1 3 3-1" />
    </Base>
);

const IconDove = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M3 13c3-1 5-3 6-6 1 3 1 6-1 9" />
        <path d="M9 7c3 0 8 1 11 5-3 1-5 0-7-1" />
        <circle cx="9.5" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
        <path d="M5 18c3 1 7 1 9-2" />
    </Base>
);

const IconBallot = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <rect x="4" y="9" width="16" height="11" rx="0" />
        <path d="M4 9l8-5 8 5" />
        <path d="M9 14l2 2 4-4" />
    </Base>
);

const IconFlame = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 2c1 3-1 4-1 7 0 2 2 3 2 3s3-2 2-6c3 2 4 6 4 9a7 7 0 11-14 0c0-4 3-6 4-9 0 2 1 3 2 2 1-1 1-3 1-6z" />
    </Base>
);

const IconCyclone = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 8c2-3 6-4 9-2" />
        <path d="M4 13c3-2 8-2 11 1" />
        <path d="M6 18c2-1.5 6-2 9 0" />
        <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
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

const IconBook = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0V5z" />
        <path d="M20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0V5z" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

type Panel = {
    year: string;
    title: string;
    description: string;
    tags: string[];
    image: string;
    icon: ReactNode;
    bg: 'black' | 'green' | 'red' | 'yellow';
};

const PANELS: Panel[] = [
    {
        year: '1975',
        title: 'O Estado Popular',
        description:
            'Samora Machel proclama a República Popular de Moçambique sob um único partido, a FRELIMO. Bancos, terra e grandes empresas são nacionalizados, lançam-se campanhas de alfabetização em massa e o país declara-se marxista-leninista, alinhado com Cuba e o bloco soviético.',
        tags: ['FRELIMO', 'Partido único', 'Nacionalizações'],
        image: '/independent-history/estado-popular.webp',
        icon: <IconStar />,
        bg: 'green',
    },
    {
        year: '1977',
        title: 'A Guerra Civil',
        description:
            'A Rodésia e depois a África do Sul do apartheid armam a RENAMO, um movimento rebelde que ataca aldeias, escolas e linhas ferroviárias em resposta ao apoio moçambicano aos movimentos de libertação vizinhos. Segue-se uma das guerras mais devastadoras do continente, com mais de um milhão de mortos.',
        tags: ['RENAMO', 'Guerra Fria em África', 'Deslocamento'],
        image: '/independent-history/civil-war.webp',
        icon: <IconHoeRifle />,
        bg: 'red',
    },
    {
        year: '1986',
        title: 'Mbuzini',
        description:
            'O avião de Samora Machel cai em Mbuzini, perto da fronteira sul-africana, matando o presidente e vinte e quatro outras pessoas. As circunstâncias continuam disputadas até hoje. Joaquim Chissano assume a presidência e começa, ainda em plena guerra, a afastar o país do socialismo de Estado.',
        tags: ['Samora Machel', 'Joaquim Chissano', 'Mbuzini'],
        image: '/independent-history/mbuzine.webp',
        icon: <IconFlame />,
        bg: 'black',
    },
    {
        year: '1992',
        title: 'A Paz de Roma',
        description:
            'Depois de dois anos de negociações mediadas pela Comunidade de Santo Egídio, o Governo e a RENAMO assinam o Acordo Geral de Paz em Roma. Dezasseis anos de guerra terminam; uma força das Nações Unidas supervisiona a desmobilização de mais de noventa mil combatentes.',
        tags: ['Acordo de Roma', 'ONUMOZ', 'Desmobilização'],
        image: '/independent-history/acordo-de-roma.jpeg',
        icon: <IconDove />,
        bg: 'yellow',
    },
    {
        year: '1994',
        title: 'Primeiras Eleições',
        description:
            'Moçambique realiza as suas primeiras eleições multipartidárias, com Chissano e a FRELIMO a vencer face a Afonso Dhlakama e a RENAMO, agora transformada em partido político. A nova Constituição de 1990 já havia aberto caminho à economia de mercado e ao pluralismo.',
        tags: ['Multipartidarismo', 'Chissano', 'Dhlakama'],
        image: '/independent-history/elections.jpeg',
        icon: <IconBallot />,
        bg: 'green',
    },
    {
        year: '2010s',
        title: 'Gás e Reconstrução',
        description:
            'A descoberta de enormes reservas de gás natural na Bacia do Rovuma, em Cabo Delgado, promete transformar a economia moçambicana. O país reconstrói estradas, pontes e cidades destruídas pela guerra, mesmo enquanto enfrenta escândalos de dívida oculta que abalam a confiança internacional.',
        tags: ['Bacia do Rovuma', 'Investimento', 'Dívidas ocultas'],
        image: '/independent-history/gas-moz.jpg',
        icon: <IconFlame />,
        bg: 'red',
    },
    {
        year: 'Hoje',
        title: 'Um País em Curso',
        description:
            'Desde 2017, uma insurgência armada em Cabo Delgado desloca centenas de milhares de pessoas, mesmo junto às maiores reservas de gás do país. Ao mesmo tempo, uma geração nascida depois da guerra cresce numa Maputo cada vez mais jovem, urbana e ligada ao resto do mundo.',
        tags: ['Cabo Delgado', 'Nova geração', 'Presente'],
        image: '/independent-history/em-curso.jpg',
        icon: <IconSunrise />,
        bg: 'yellow',
    },
];

const BG_STYLES: Record<Panel['bg'], { bg: string; text: string; sub: string; accent: string; ghost: string }> = {
    black: { bg: '#171412', text: '#f4ecd8', sub: '#cabfa8', accent: '#f5c518', ghost: 'rgba(244,236,216,0.06)' },
    green: { bg: '#00732f', text: '#f4ecd8', sub: '#d7ead9', accent: '#f5c518', ghost: 'rgba(244,236,216,0.10)' },
    red: { bg: '#c8102e', text: '#f4ecd8', sub: '#f3d3d3', accent: '#f5c518', ghost: 'rgba(244,236,216,0.10)' },
    yellow: { bg: '#f5c518', text: '#171412', sub: '#4a3f10', accent: '#c8102e', ghost: 'rgba(23,20,18,0.08)' },
};

/* ---------------------------------------------------------------- */
/*  Reveal — one quiet fade per panel, no directional gimmick        */
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
            { threshold: 0.12, rootMargin: '0px 0px -80px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* ---------------------------------------------------------------- */
/*  Panel                                                             */
/* ---------------------------------------------------------------- */

function PosterPanel({ panel, index }: { panel: Panel; index: number }) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const s = BG_STYLES[panel.bg];
    const seamUp = index % 2 === 0;

    return (
        <section
            ref={ref}
            style={{
                backgroundColor: s.bg,
                color: s.text,
                clipPath: seamUp
                    ? 'polygon(0 0, 100% 2.2%, 100% 100%, 0 calc(100% - 2.2%))'
                    : 'polygon(0 2.2%, 100% 0, 100% calc(100% - 2.2%), 0 100%)',
                marginTop: index === 0 ? 0 : '-3.5vw',
            }}
            className={[
                'relative overflow-hidden px-6 pb-20 pt-24 sm:px-10 sm:pb-28 sm:pt-32',
                'transition-opacity duration-700 ease-out motion-reduce:transition-none',
                visible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
        >
            {/* bleeding numeral, watermark-flat behind the content */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 top-2 select-none font-['Anton'] leading-none sm:top-4"
                style={{ fontSize: 'clamp(6rem, 19vw, 13rem)', color: s.ghost }}
            >
                {panel.year}
            </span>

            <div className="relative mx-auto grid max-w-5xl gap-10 sm:grid-cols-[1fr_15rem]">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <span
                            className="flex h-9 w-9 flex-none items-center justify-center"
                            style={{ backgroundColor: s.accent, color: '#171412' }}
                        >
                            <span className="h-5 w-5">{panel.icon}</span>
                        </span>
                        <span className="font-['Manrope'] text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: s.sub }}>
                            {panel.year}
                        </span>
                    </div>

                    <h2 className="font-['Baloo_2'] font-bold text-[2.6rem] leading-[0.95] sm:text-6xl" style={{ color: s.text }}>
                        {panel.title}
                    </h2>

                    <p className="mt-5 max-w-[58ch] font-['Manrope'] text-[16px] leading-relaxed" style={{ color: s.sub }}>
                        {panel.description}
                    </p>

                    <p className="mt-6 font-['Manrope'] text-[13px] font-medium tracking-[0.14em]" style={{ color: s.accent }}>
                        {/* {panel.tags.join('   ')} */}
                        {panel.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-[#fff]/80 bg-white/[0.04] px-2.5 py-1 text-xs text-[#fff]  cursor-pointer mr-2"
                            >
                                {tag}
                            </span>
                        ))}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                    <a href="#" className="text-[#ffffff] hover:text-[#f3f3f3]/80 italic text-sm">
                        Ler mais ...
                    </a>
                </div>
                </div>

                {/* fact card + misregistered photo, poster print effect */}
                <div className="flex flex-col gap-6 sm:pt-1">
                    <div className="relative w-full">
                        <div
                            aria-hidden="true"
                            className="absolute -bottom-2 -right-2 h-full w-full rounded-2xl"
                            style={{ backgroundColor: s.accent }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={panel.image}
                            alt={panel.title}
                            className="relative aspect-[4/5] w-full object-cover rounded-2xl"
                            style={{ filter: 'grayscale(35%) contrast(1.05)' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------- */
/*  Page                                                              */
/* ---------------------------------------------------------------- */

export default function Independent() {
    return (
        <div className="min-h-screen bg-[#f4ecd8]">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
      `}</style>

            {/* masthead */}
            <div className="relative overflow-hidden bg-[#171412] px-6 pb-16 pt-24 text-center sm:pb-20">
                <IconBook className="mx-auto h-8 w-8 text-[#f5c518]" />
                <h1 className="mt-5 font-['Baloo_2'] font-bold text-5xl leading-[0.95] text-[#f4ecd8] sm:text-7xl">
                    HISTÓRIA INDEPENDENTE
                </h1>
                <p className="mx-auto mt-4 max-w-md font-['Manrope'] text-lg text-[#cabfa8]">
                    Explore a rica história independente de Moçambique — de 1975 até hoje.
                </p>
            </div>

            <div>
                {PANELS.map((panel, i) => (
                    <PosterPanel key={panel.year} panel={panel} index={i} />
                ))}
            </div>

            <div className="bg-[#171412] px-6 py-10 text-center">
                <p className="font-['Manrope'] text-xs uppercase tracking-[0.2em] text-[#cabfa8]">
                    Moçambique — uma história em curso
                </p>
            </div>
        </div>
    );
}