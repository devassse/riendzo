'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icon set — one glyph per realm, medallion-weight strokes         */
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

const IconTower = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M7 21V9l5-5 5 5v12" />
        <path d="M7 13h10M7 17h10" />
        <path d="M9 21v-4M15 21v-4" />
    </Base>
);

const IconCrown = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 18h16l-1-8-4 3-3-6-3 6-4-3-1 8z" />
        <path d="M4 18v2h16v-2" />
    </Base>
);

const IconDhow = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 4v13" />
        <path d="M12 5l6 8c-2 1.3-4.4 1.7-6 1V5z" />
        <path d="M3 17h18l-2 3H5l-2-3z" />
    </Base>
);

const IconCrescent = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M15 4a8 8 0 100 16 6.5 6.5 0 010-16z" />
        <path d="M17.5 8.5l.9-.9M18.4 7.6l-1.4.3.3-1.4z" fill="currentColor" stroke="none" />
    </Base>
);

const IconLakeNet = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <ellipse cx="9" cy="15" rx="5" ry="3" />
        <path d="M13 13c2-1 5-1 7 1" />
        <path d="M6 12c0-4 2-7 5-8" />
        <circle cx="18" cy="7" r="1.4" fill="currentColor" stroke="none" />
    </Base>
);

const IconRiverPath = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M3 6c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
        <path d="M3 12c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
        <path d="M3 18c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

type Realm = {
    number: string;
    title: string;
    region: string;
    description: string;
    domain: string;
    icon: ReactNode;
};

const REALMS: Realm[] = [
    {
        number: '01',
        title: 'Império do Grande Zimbábue',
        region: 'Planalto entre o Zimbabwe e o centro de Moçambique',
        description:
            'Entre os séculos XI e XV, o complexo do Grande Zimbábue esteve ligado a uma poderosa sociedade da região do planalto entre o atual Zimbabwe e Moçambique. O seu poder estava associado ao comércio de ouro, marfim e outros produtos com a costa do Índico.',
        domain: 'As suas muralhas de pedra seca, erguidas sem argamassa, permanecem entre as maiores estruturas pré-coloniais da África Austral.',
        icon: <IconTower />,
    },
    {
        number: '02',
        title: 'Estado de Mutapa (Monomotapa)',
        region: 'Vale do Zambeze, centro de Moçambique e Zimbabwe',
        description:
            'A partir do século XV, o Estado de Mutapa tornou-se uma das principais potências políticas da região do Zambeze. Controlava importantes territórios no atual Zimbabwe e em partes do centro de Moçambique, participando ativamente no comércio de ouro, marfim e outros produtos com as cidades costeiras.',
        domain: 'O título "Mwene Mutapa" — senhor das terras saqueadas — deu origem ao nome que os cronistas portugueses registaram como Monomotapa.',
        icon: <IconCrown />,
    },
    {
        number: '03',
        title: 'Estados e Cidades Suaílis da Costa',
        region: 'Sofala, Ilha de Moçambique, Quelimane',
        description:
            'Ao longo da costa moçambicana desenvolveram-se importantes centros comerciais integrados nas redes do Oceano Índico. Locais como Sofala, Ilha de Moçambique e Quelimane mantinham relações comerciais com a África Oriental, Arábia, Pérsia e Índia.',
        domain: 'Estas cidades-estado partilhavam a língua e a cultura suaílis com portos irmãos como Quíloa, Mombaça e Zanzibar.',
        icon: <IconDhow />,
    },
    {
        number: '04',
        title: 'Sultanatos e Xeicados da Costa Norte',
        region: 'Cabo Delgado e Nampula',
        description:
            'No norte de Moçambique, especialmente na região de Cabo Delgado e Nampula, existiam comunidades e estruturas políticas ligadas às redes comerciais suaílis e islâmicas do Oceano Índico. Essas relações contribuíram para a disseminação do Islão e para o crescimento do comércio marítimo.',
        domain: 'Ilhas como Ibo e o arquipélago das Quirimbas guardam ainda hoje vestígios de mesquitas e cemitérios islâmicos desse período.',
        icon: <IconCrescent />,
    },
    {
        number: '05',
        title: 'Reino de Maravi',
        region: 'Malawi actual, norte de Moçambique e Zâmbia',
        description:
            'O Reino de Maravi desenvolveu-se na região entre o atual Malawi, norte de Moçambique e partes da Zâmbia. Tornou-se uma importante potência regional, com redes políticas e comerciais que alcançavam diferentes zonas do território moçambicano.',
        domain: 'O nome "Malawi" deriva directamente de "Maravi" — um dos poucos Estados pré-coloniais da região a legar o seu nome a um país moderno.',
        icon: <IconLakeNet />,
    },
    {
        number: '06',
        title: 'Reinos e Estados do Vale do Zambeze',
        region: 'Corredor do rio Zambeze',
        description:
            'O vale do Zambeze era ocupado por diversas comunidades e entidades políticas que controlavam territórios, rotas comerciais, agricultura e recursos naturais. A região tornou-se um importante corredor entre o interior africano e a costa do Índico.',
        domain: 'Foi precisamente ao longo deste corredor que, séculos depois, se instalaria o sistema português dos prazos.',
        icon: <IconRiverPath />,
    },
];

const SEQUENCE = [
    'Grande Zimbábue',
    'Mutapa',
    'Cidades suaílis',
    'Sultanatos do norte',
    'Maravi',
    'Vale do Zambeze',
    'Chegada portuguesa',
];

/* ---------------------------------------------------------------- */
/*  Chevron rule — the Great Zimbabwe dry-stone motif, reused as a   */
/*  divider everywhere a card or panel might otherwise get a border  */
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
/*  Reveal — a single quiet fade, applied once per plate             */
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
/*  Realm plate                                                      */
/* ---------------------------------------------------------------- */

function RealmPlate({ realm }: { realm: Realm }) {
    const { ref, visible } = useReveal<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={[
                'rounded-4xl bg-[#241d16] px-6 pb-7 pt-5 sm:px-7',
                'transition-opacity duration-700 ease-out motion-reduce:transition-none',
                visible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
        >
            <ChevronRule className="mt-4 mb-10" />

            <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[#c99a3d]/50 text-[#c99a3d]">
                    <span className="h-5 w-5">{realm.icon}</span>
                </span>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c99a3d]">
                        {realm.number} · {realm.region}
                    </p>
                    <h3 className="mt-1 font-baloo text-2xl font-bold leading-snug text-[#ecdfc4]">
                        {realm.title}
                    </h3>
                </div>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-[#c7b89a]">
                {realm.description}
            </p>

            <p className="mt-4 border-l-2 border-[#b8592f] pl-3 text-sm italic leading-relaxed text-[#a89478]">
                {realm.domain}
            </p>
            <p className="mt-6 text-sm text-[#a89478]">
                <Link href="#" className="font-semibold text-[#c99a3d] underline">
                    Ler mais ...
                </Link>
            </p>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Page             bae0fc                                                 */
/* ---------------------------------------------------------------- */

export default function ReinosEImperios() {
    return (
        <div className="min-h-screen bg-[#ecdfc4]" id="ancient">

            {/* header */}
            <div className="px-6 pb-14 pt-16 text-center sm:pb-16">
                <h1 className="mt-2 text-3xl font-bold text-[#1c1712] sm:text-6xl">
                    Reinos e Impérios
                </h1>
                
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#1c1712]">
                    Antes das caravelas, já existiam impérios, reinos e grandes centros comerciais.
                </p>
            </div>

            {/* atlas grid */}
            <div className="mx-auto max-w-6xl px-6 pb-8 sm:px-10">
                <div className="grid gap-6 overflow-hidden sm:grid-cols-2">
                    {REALMS.map((realm) => (
                        <RealmPlate key={realm.number} realm={realm} />
                    ))}
                </div>
            </div>
        </div>
    );
}