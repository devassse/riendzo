'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icons                                                             */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconMic = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M6 11a6 6 0 0012 0M12 17v4M9 21h6" />
    </Base>
);

const IconGuitar = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M14 10l6-6M17 4l3 3" />
        <path d="M12.5 11.5c-2-1.5-5-.5-6 1.5-.7 1.400-2.500 1.500-2.500 3.500a4.500 4.500 0 004.500 4.500c2 0 2.100-1.800 3.500-2.500 2-1 3-4 1.500-6" />
        <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
    </Base>
);

const IconNote = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
    </Base>
);

const IconDuo = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M2 20c0-3.500 2.700-6 6-6M22 20c0-3.500-2.700-6-6-6M9 20c0-2.500 1.300-4 3-4s3 1.500 3 4" />
    </Base>
);

const IconHeadphones = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 15v-3a8 8 0 0116 0v3" />
        <rect x="3" y="14" width="4" height="6" rx="1.500" />
        <rect x="17" y="14" width="4" height="6" rx="1.500" />
    </Base>
);

const IconDrum = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <ellipse cx="12" cy="8" rx="8" ry="3" />
        <path d="M4 8v8c0 1.700 3.600 3 8 3s8-1.300 8-3V8" />
        <path d="M8 4L5 1M16 4l3-3" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

type Artist = {
    name: string;
    tag: string;
    description: string;
    highlight?: string;
    href?: string;
    icon: ReactNode;
};

const VELHA_GUARDA: Artist[] = [
    {
        name: 'Dilon Djindji',
        tag: 'Marrabenta',
        description:
            'Considerado um dos "padrinhos" ou mestres da marrabenta, com uma carreira de décadas dedicada aos ritmos tradicionais e à consolidação deste género.',
        icon: <IconGuitar />,
    },
    {
        name: 'Xidiminguana (António Constantino Dos Santos)',
        tag: 'Marrabenta',
        description: 'Ícone histórico da marrabenta e da música moçambicana.',
        highlight: 'Autor de temas clássicos como Xikona e Titabem.',
        icon: <IconNote />,
    },
    {
        name: 'Wazimbo (Gildo Refógios)',
        tag: 'Marrabenta',
        description:
            'Voz inconfundível da música moçambicana e antiga figura central da Orquestra Marrabenta Star de Moçambique.',
        highlight: 'Famoso pela canção Nwahulwana.',
        icon: <IconMic />,
    },
    {
        name: 'António Marcos',
        tag: 'Canção',
        description: 'Compositor e cantor de referência.',
        highlight: 'Conhecido por temas marcantes como Uyo Pfumela.',
        icon: <IconMic />,
    },
    {
        name: 'Mingas (Lázara Tembe)',
        tag: 'Canção',
        description: 'Voz poderosa da música moçambicana.',
        highlight: 'Célebre pela interpretação de temas como A Va Saty Va Lomu.',
        icon: <IconMic />,
    },
    {
        name: 'Jeremias Nguenha',
        tag: 'Música ligeira e tradicional',
        description: 'Conhecido por clássicos da música ligeira e tradicional moçambicana.',
        highlight: 'Entre eles, A Bunu e La Famba Bicha.',
        icon: <IconNote />,
    },
    {
        name: 'Chico António',
        tag: 'Canção',
        description:
            'Músico e compositor de grande relevo, reconhecido pela sua contribuição à renovação e riqueza da canção moçambicana.',
        icon: <IconGuitar />,
    },
    {
        name: 'Madala',
        tag: 'Sons tradicionais',
        description: 'Violonista e cantor mestre dos sons tradicionais.',
        highlight: 'Autor de Ponéssa Musi Wango.',
        icon: <IconGuitar />,
    },
    {
        name: 'Eugénio Mucavel',
        tag: 'Música popular do sul',
        description:
            'Nome histórico associado a canções tradicionais e populares do sul de Moçambique.',
        icon: <IconNote />,
    },
    {
        name: 'Zaida Chongo e Carlos Chongo',
        tag: 'Música ligeira',
        description: 'Duo vocal emblemático da música ligeira moçambicana.',
        icon: <IconDuo />,
    },
    {
        name: 'Avelino Mondlane',
        tag: 'Canção clássica',
        description: 'Cantor clássico conhecido por temas como Nakombela Ungaranfzi e Mutxela Usiwana.',
        icon: <IconMic />,
    },
    {
        name: 'Hortêncio Langa',
        tag: 'Acústica e tradição',
        description:
            'Compositor e figura incontornável na valorização da acústica e da tradição musical do país.',
        icon: <IconGuitar />,
    },
];

const NOVA_GUARDA: Artist[] = [
    {
        name: 'Kapa Dêch',
        tag: 'Transição',
        description:
            'Grupo que marcou a transição e a modernização de sonoridades acústicas e populares.',
        icon: <IconDuo />,
    },
    {
        name: 'Neyma',
        tag: 'Pop e música dançante',
        description:
            'Embora com uma carreira consolidada, representa a continuidade moderna da música pop e de ritmos dançantes moçambicanos.',
        icon: <IconMic />,
    },
    {
        name: 'Mr. Bow',
        tag: 'R&B e marrabenta contemporânea',
        description:
            'Um dos maiores expoentes da música popular urbana moderna.',
        icon: <IconHeadphones />,
    },
    {
        name: 'Lourena Nhate',
        tag: 'Marrabenta moderna',
        description:
            'Voz proeminente que cruza a tradição da marrabenta com roupagens modernas.',
        icon: <IconMic />,
    },
    {
        name: 'Lay Lizzy (Assane Djalo)',
        tag: 'Hip-hop e trap',
        description:
            'Um dos principais nomes do hip-hop e trap moçambicano, com forte projeção internacional.',
        icon: <IconDrum />,
    },
    {
        name: 'Hernâni da Silva (Hernâni Mudjilo)',
        tag: 'Hip-hop',
        description:
            'Rapper, produtor e compositor influente da nova escola do hip-hop moçambicano.',
        icon: <IconDrum />,
    },
];

const SOURCES = [
    { label: 'Spotify — playlist 1', href: 'https://open.spotify.com/playlist/4ghnX1OIlGfPkeuUAcaih3' },
    { label: 'Africultures', href: 'https://africultures.com/murmures/?no=19823' },
    { label: 'Bantumen', href: 'https://www.bantumen.com/artigo/estas-sao-cinco-musicas-que-marcaram-mocambique/' },
    { label: 'Spotify — playlist 2', href: 'https://open.spotify.com/playlist/6kAYPaX87o0YqqF8zvBAc5' },
];

/* ---------------------------------------------------------------- */
/*  Chevron rule                                                      */
/* ---------------------------------------------------------------- */

function ChevronRule({ color = '#c99a3d', className = '' }: { color?: string; className?: string }) {
    return (
        <svg
            viewBox="0 0 120 10"
            preserveAspectRatio="none"
            className={`h-2.5 w-full ${className}`}
            aria-hidden="true"
        >
            <polyline
                points="0,10 10,0 20,10 30,0 40,10 50,0 60,10 70,0 80,10 90,0 100,10 110,0 120,10"
                fill="none"
                stroke={color}
                strokeWidth="1.4"
            />
        </svg>
    );
}

/* ---------------------------------------------------------------- */
/*  Reveal                                                            */
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
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* ---------------------------------------------------------------- */
/*  Artist plate                                                      */
/* ---------------------------------------------------------------- */

const TONES = {
    velha: 'bg-[#201911] hover:bg-[#2f261c]',
    nova: 'bg-[#382d21] hover:bg-[#45372a]',
} as const;

function ArtistPlate({ artist, tone }: { artist: Artist; tone: keyof typeof TONES }) {
    const { ref, visible } = useReveal<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={[
                'group rounded-4xl px-6 pb-7 pt-5 sm:px-7 cursor-pointer',
                TONES[tone],
                'transition-[opacity,transform,background-color,box-shadow] duration-500 ease-out motion-reduce:transition-none',
                'hover:-translate-y-1 hover:shadow-xl hover:shadow-black/25 motion-reduce:hover:translate-y-0',
                visible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
        >
            <ChevronRule className="mt-4 mb-10" />

            <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[#c99a3d]/50 text-[#c99a3d] transition-colors duration-300 group-hover:border-[#c99a3d] group-hover:bg-[#c99a3d]/10">
                    <span className="h-5 w-5">{artist.icon}</span>
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#c99a3d]">
                        {artist.tag}
                    </p>
                    <h3 className="mt-1 font-baloo text-2xl font-bold leading-snug text-[#ecdfc4]">
                        {artist.name}
                    </h3>
                </div>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-[#c7b89a]">
                {artist.description}
            </p>

            {artist.highlight && (
                <p className="mt-4 border-l-2 border-[#b8592f] pl-3 text-sm italic leading-relaxed text-[#a89478]">
                    {artist.highlight}
                </p>
            )}

            <p className="mt-6 text-sm text-[#a89478]">
                <Link href={artist.href ?? '#'} className="font-semibold text-[#c99a3d] underline">
                    Ler mais ...
                </Link>
            </p>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Generation section                                                */
/* ---------------------------------------------------------------- */

function GenerationSection({
    id,
    title,
    intro,
    artists,
    tone,
}: {
    id: string;
    tone: keyof typeof TONES;
    title: string;
    intro: string;
    artists: Artist[];
}) {
    return (
        <section id={id} className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
            <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="font-baloo text-3xl font-bold text-[#1c1712] sm:text-4xl">{title}</h2>
                <ChevronRule color="#b8592f" className="mx-auto my-4 max-w-[160px]" />
                <p className="text-base leading-relaxed text-[#1c1712]">{intro}</p>
            </div>

            <div className="grid gap-6 overflow-hidden sm:grid-cols-2">
                {artists.map((artist) => (
                    <ArtistPlate key={artist.name} artist={artist} tone={tone} />
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------- */
/*  Page                                                              */
/* ---------------------------------------------------------------- */

export default function EvolucaoMusical() {
    return (
        <div className="min-h-screen bg-[#ecdfc4]" id="music">
            {/* header */}
            <div className="px-6 pb-14 pt-2 text-center sm:pb-16">
                {/* <h1 className="mt-2 text-3xl font-bold text-[#1c1712] sm:text-6xl">
                    Evolução Musical
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#1c1712]">
                    Como os sons moçambicanos mudaram ao longo dos tempos: da marrabenta dos mestres
                    ao hip-hop e ao trap de hoje.
                </p> */}
            </div>

            <GenerationSection
                id="velha-guarda"
                title="Velha Guarda"
                intro="Principais artistas da Velha Guarda moçambicana: os mestres da marrabenta e da canção que construíram a identidade sonora do país."
                artists={VELHA_GUARDA}
                tone="velha"
            />

            <GenerationSection
                id="nova-guarda"
                title="Nova Guarda"
                intro="Vozes que modernizam a tradição e abrem caminho a novos géneros, do pop e R&B ao hip-hop e trap."
                artists={NOVA_GUARDA}
                tone="nova"
            />
        </div>
    );
}