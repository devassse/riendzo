import Link from 'next/link';
import type { SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icons — one per activity type                                    */
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

const IconWhaleShark = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M2 13c3-4 8-6 13-5 4 .8 7 3.5 7 5s-3 4.2-7 5c-5 1-10-1-13-5z" />
        <path d="M22 13l-3-3v6l3-3z" />
        <circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </Base>
);

const IconReef = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M3 20c2-6 4-9 4-13a3 3 0 016 0c0 4 2 7 4 13" />
        <path d="M11 20c1-4 2-6 2-9a2.5 2.5 0 015 0c0 3 1 5 2 9" />
        <path d="M2 20h20" />
    </Base>
);

const IconPawprint = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <ellipse cx="12" cy="16" rx="5" ry="4" />
        <circle cx="6" cy="9" r="1.6" />
        <circle cx="10.5" cy="6" r="1.6" />
        <circle cx="15.5" cy="6" r="1.6" />
        <circle cx="19" cy="9" r="1.6" />
    </Base>
);

const IconLandmark = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 21h16" />
        <path d="M6 21V10M10 21V10M14 21V10M18 21V10" />
        <path d="M3 10l9-6 9 6" />
    </Base>
);

const IconSail = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 3v14" />
        <path d="M12 4l7 9c-2.3 1.6-5 2-7 1V4z" />
        <path d="M12 5L5 15c1.8 1.3 4 1.7 5.5 1V5z" opacity="0.5" />
        <path d="M4 20h16l-2 2H6l-2-2z" />
    </Base>
);

const IconCity = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M4 21V9l5-3 5 3v12" />
        <path d="M14 21V6l6-2v17" />
        <path d="M4 21h16" />
        <path d="M7 12h1M7 16h1M11 12h1M11 16h1" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                              */
/* ---------------------------------------------------------------- */

type Activity = {
    title: string;
    location: string;
    bestTime: string;
    description: string;
    tag: string;
    image: string;
    icon: React.ReactNode;
    href: string;
};

const ACTIVITIES: Activity[] = [
    {
        title: 'Nadar com Tubarões-Baleia em Tofo',
        location: 'Tofo, Inhambane',
        bestTime: 'Outubro a Março',
        description:
            'A costa de Tofo é um dos poucos lugares no mundo onde tubarões-baleia aparecem com regularidade durante quase todo o ano. Operadores locais levam grupos pequenos em snorkel para nadar ao lado destes gigantes gentis, que podem chegar aos doze metros.',
        tag: 'Vida marinha',
        image: '/home/dolphins.jpg',
        icon: <IconWhaleShark />,
        href: '#',
    },
    {
        title: 'Mergulhar no Arquipélago de Bazaruto',
        location: 'Bazaruto, Inhambane',
        bestTime: 'Maio a Novembro',
        description:
            'Águas cristalinas, dunas de areia branca e recifes de coral intactos fazem de Bazaruto um dos melhores destinos de mergulho da África Austral. É também um dos últimos refúgios do peixe-boi marinho no Índico ocidental.',
        tag: 'Mergulho',
        image: '/home/bazaruto.jpeg',
        icon: <IconReef />,
        href: '#',
    },
    {
        title: 'Safári no Parque Nacional da Gorongosa',
        location: 'Sofala',
        bestTime: 'Maio a Outubro',
        description:
            'Devastado pela guerra civil, o ecossistema de Gorongosa foi reconstruído numa das maiores histórias de recuperação da conservação em África. Hoje é possível ver leões, elefantes e centenas de espécies de aves num só dia de safári.',
        tag: 'Safári',
        image: '/home/gorongosa.png',
        icon: <IconPawprint />,
        href: '#',
    },
    {
        title: 'Explorar a Ilha de Moçambique',
        location: 'Nampula',
        bestTime: 'Todo o ano',
        description:
            'Classificada Património Mundial da UNESCO, esta pequena ilha guarda quinhentos anos de arquitectura suaíli e portuguesa lado a lado — fortalezas de coral, mesquitas, igrejas e ruas estreitas que resumem toda a história costeira do país.',
        tag: 'Património',
        image: '/home/ilha_de_mocambique.jpg',
        icon: <IconLandmark />,
        href: '#',
    },
    {
        title: 'Velejar pelo Arquipélago das Quirimbas',
        location: 'Cabo Delgado',
        bestTime: 'Abril a Dezembro',
        description:
            'Trinta e duas ilhas quase desertas, ligadas por séculos de comércio suaíli, oferecem um dos litorais mais intocados de África — perfeito para velejar de ilha em ilha, mergulhar e visitar vestígios islâmicos antigos em Ibo.',
        tag: 'Ilhas',
        image: '/home/quirimbas.jpg',
        icon: <IconSail />,
        href: '#',
    },
    {
        title: 'Passear pela Baixa de Maputo',
        location: 'Maputo',
        bestTime: 'Todo o ano',
        description:
            'Arquitectura art déco, o mercado central, a Estação Ferroviária desenhada com a colaboração de Gustave Eiffel e uma cena gastronómica e artística vibrante fazem de Maputo uma das capitais mais subestimadas do continente.',
        tag: 'Cidade',
        image: '/home/maputo_baixa.jpg',
        icon: <IconCity />,
        href: '#',
    },
];

/* ---------------------------------------------------------------- */
/*  Section                                                           */
/* ---------------------------------------------------------------- */

export default function ThingsToDoSection() {
    return (
        <section className="bg-[#f1f7fe] px-6 py-20 sm:px-10">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-montserrat-italic text-xs font-semibold tracking-[0.16em] text-[#00aefb]">
                        Explorar Moçambique
                    </span>
                    <h2 className="mt-3 font-baloo text-4xl font-bold leading-tight text-[#050f22] sm:text-5xl">
                        6 experiências imperdíveis
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-[#050f22]">
                        De tubarões-baleia em Tofo a ilhas históricas no norte, algumas das melhores razões para
                        visitar Moçambique — reunidas num só lugar.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {ACTIVITIES.map((activity) => (
                        <Link
                            key={activity.title}
                            href={activity.href}
                            className="group overflow-hidden rounded-4xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#050f22] backdrop-blur-sm">
                                    <span className="h-4.5 w-4.5">{activity.icon}</span>
                                </span>
                                <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 font-body text-[11px] font-medium text-white backdrop-blur-sm">
                                    {activity.tag}
                                </span>
                            </div>

                            <div className="p-5">
                                <p className="font-body text-xs font-medium uppercase tracking-wide text-[#8a938c]">
                                    {activity.location} · {activity.bestTime}
                                </p>
                                <h3 className="mt-2 font-body text-lg font-bold leading-snug text-[#050f22] hover:text-[#00aefb]">
                                    {activity.title}
                                </h3>
                                <p className="mt-2 font-body text-sm leading-relaxed text-[#050f22]">
                                    {activity.description}
                                </p>
                                <p className='mt-4 font-body text-sm font-semibold text-[#00aefb] hover:text-[#050f22]'>
                                    Ler mais &rarr;
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}