import Link from 'next/link';
import type { SVGProps } from 'react';

/* ---------------------------------------------------------------- */
/*  Icons                                                             */
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

const IconTool = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M14 3l7 7-2.5 2.5L11 5.5 14 3z" />
        <path d="M11 5.5L4 12.5c-1 1-1 3 0 4s3 1 4 0l7-7" />
        <path d="M4 20l3-3" />
    </Base>
);

const IconClock = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
    </Base>
);

const IconPin = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.4" />
    </Base>
);

const IconLegacy = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.8 7.1 18.2 8 12.7 4 8.8l5.5-.8L12 3z" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data — gallery + quick facts, kept local since this is a one-off */
/* ---------------------------------------------------------------- */

const GALLERY = [
    { src: '/ancient-history/san/rock-art-1.jpg', caption: 'Painel de antílopes, serra de Manica' },
    { src: '/ancient-history/san/rock-art-2.jpg', caption: 'Cena de caça, abrigo rochoso no Niassa' },
    { src: '/ancient-history/san/rock-art-3.jpg', caption: 'Figuras rituais, pigmento ocre e carvão' },
    { src: '/ancient-history/san/tools.jpg', caption: 'Utensílios de pedra lascada, achados locais' },
];

const QUICK_FACTS = [
    { icon: <IconClock />, label: 'Período', value: 'c. 100 000 A.E.C. — presente' },
    { icon: <IconPin />, label: 'Região', value: 'Planalto central, vale do Save, serras de Manica e Niassa' },
    { icon: <IconLegacy />, label: 'Legado', value: 'Milhares de painéis de arte rupestre, muitos por catalogar' },
];

/* ---------------------------------------------------------------- */
/*  Page                                                              */
/* ---------------------------------------------------------------- */

export default function PrimeirosHabitantesPage() {
    return (
        <div className="section-ancient min-h-screen bg-gradient-to-b from-[#5e8ed8] via-[#6d84a8] to-[#3674d3]">
            {/* breadcrumb */}
            <div className="mx-auto max-w-5xl px-6 pt-8">
                <Link
                    href="/historia/ancient#explore"
                    className="inline-flex items-center gap-2 font-body text-sm text-[#e3edff]/80 transition-colors hover:text-white"
                >
                    ← Voltar à linha do tempo
                </Link>
            </div>

            {/* hero */}
            <div className="relative mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl px-0">
                <div className="relative aspect-[16/8] w-full sm:aspect-[16/6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/ancient-history/first.jpeg"
                        alt="Pinturas rupestres San"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050f22] via-[#050f22]/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#00aefb]/40 bg-[#00aefb]/15 px-3 py-1 font-body text-xs font-semibold text-[#8cdcff] backdrop-blur-sm">
                            <span className="h-3.5 w-3.5"><IconTool /></span>
                            c. 100 000 A.E.C. · Povo San
                        </span>
                        <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-[#eaf2ff] sm:text-6xl">
                            Os Primeiros Habitantes
                        </h1>
                    </div>
                </div>
            </div>

            {/* lead + quick facts */}
            <div className="mx-auto mt-10 grid max-w-5xl gap-10 px-6 sm:grid-cols-[1fr_18rem]">
                <p className="font-body text-lg leading-relaxed text-[#eaf2ff]">
                    Muito antes da chegada dos povos bantu, comunidades de caçadores-recoletores San percorriam o
                    planalto e o vale do Save, deixando pinturas rupestres, gravuras e utensílios de pedra lascada
                    que ainda hoje se encontram em abrigos rochosos por todo o país. O seu profundo conhecimento da
                    terra moldou os primeiros padrões de ocupação humana na região.
                </p>

                <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d2148]/70 p-5 backdrop-blur-sm">
                    <p className="font-body text-xs font-semibold uppercase tracking-wide text-[#00aefb]">
                        Resumo
                    </p>
                    <div className="mt-4 space-y-4">
                        {QUICK_FACTS.map((fact) => (
                            <div key={fact.label} className="flex items-start gap-3">
                                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#00aefb]/10 text-[#00aefb]">
                                    <span className="h-4 w-4">{fact.icon}</span>
                                </span>
                                <div>
                                    <p className="font-body text-[11px] uppercase tracking-wide text-[#7d93bd]">
                                        {fact.label}
                                    </p>
                                    <p className="font-body text-sm leading-snug text-[#eaf2ff]">{fact.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* article body */}
            <div className="mx-auto mt-4 max-w-3xl px-6 pb-24">
                <section className="mt-10">
                    <h2 className="font-display text-2xl font-bold text-[#eaf2ff]">
                        Um mundo antes da agricultura
                    </h2>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        Durante dezenas de milhares de anos, antes de qualquer aldeia agrícola se fixar no território
                        que hoje é Moçambique, pequenos grupos de caçadores-recoletores San viviam em movimento,
                        seguindo os ciclos das chuvas, da caça e da colheita de plantas silvestres. Não deixaram
                        cidades nem monumentos de pedra — o seu registo mais duradouro está nas paredes de abrigos
                        rochosos, onde geração após geração acrescentou figuras a painéis já antigos quando os seus
                        próprios avós ainda eram crianças.
                    </p>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        O planalto central e o vale do rio Save, com os seus afloramentos de granito e abrigos
                        naturais, ofereciam exactamente as condições de que estas comunidades precisavam: água
                        sazonal, caça abundante e superfícies de rocha lisa, protegidas da chuva, prontas para
                        receber pigmento.
                    </p>
                </section>

                <section className="mt-12">
                    <h2 className="font-display text-2xl font-bold text-[#eaf2ff]">
                        A arte rupestre como arquivo vivo
                    </h2>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        As pinturas San não são apenas decoração — são hoje lidas por arqueólogos como um arquivo
                        espiritual e social. Antílopes, sobretudo o elande, aparecem repetidamente, associados a
                        rituais de transe e cura. Figuras humanas surgem em posições de dança, muitas vezes
                        sobrepostas a camadas mais antigas, sugerindo que os mesmos locais foram revisitados e
                        reinterpretados ao longo de séculos.
                    </p>

                    <blockquote className="mt-6 rounded-2xl border-l-4 border-[#00aefb] bg-[#0d2148]/50 p-5">
                        <p className="font-body text-[15px] italic leading-relaxed text-[#dbe7ff]">
                            Cada painel é uma conversa entre gerações — uma mão pintando por cima do que outra mão
                            já tinha deixado, séculos antes.
                        </p>
                        <p className="mt-2 font-body text-xs text-[#8cdcff]">
                            — leitura comum entre arqueólogos da arte rupestre da África Austral
                        </p>
                    </blockquote>
                </section>

                <section className="mt-12">
                    <h2 className="font-display text-2xl font-bold text-[#eaf2ff]">
                        Vestígios em Manica e Niassa
                    </h2>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        Nas serras de Manica e Niassa, milhares de pinturas ainda por catalogar representam
                        antílopes, caçadores e cenas rituais, testemunhando uma tradição artística milenar. Muitos
                        destes locais só foram documentados de forma sistemática nas últimas décadas, e é provável
                        que abrigos inteiros continuem por descobrir em zonas remotas do planalto.
                    </p>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        Ao contrário de sítios mais conhecidos noutros países da região, grande parte deste
                        património em Moçambique carece ainda de protecção formal, tornando o trabalho de
                        catalogação uma corrida contra a erosão natural e a intervenção humana.
                    </p>
                </section>

                {/* gallery */}
                <section className="mt-12">
                    <h2 className="font-display text-2xl font-bold text-[#eaf2ff]">Galeria</h2>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                        {GALLERY.map((item) => (
                            <figure
                                key={item.src}
                                className="overflow-hidden rounded-xl border border-white/10 bg-[#0d2148]/50"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.src} alt={item.caption} className="aspect-square w-full object-cover" />
                                <figcaption className="p-3 font-body text-xs leading-snug text-[#9fb3d1]">
                                    {item.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                <section className="mt-12">
                    <h2 className="font-display text-2xl font-bold text-[#eaf2ff]">
                        Conhecimento da terra
                    </h2>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        Sobreviver como caçador-recoletor exige um mapa mental extraordinariamente detalhado do
                        território: onde a água persiste na estação seca, que plantas são comestíveis em cada mês,
                        que trilhos os antílopes seguem. Este conhecimento, transmitido oralmente de geração em
                        geração, foi o verdadeiro sistema de navegação da região — muito antes de qualquer mapa
                        desenhado.
                    </p>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        É esse mesmo conhecimento acumulado que, séculos mais tarde, os primeiros povos bantu
                        agricultores encontrariam já em prática — moldando, por sua vez, onde as primeiras aldeias
                        permanentes viriam a fixar-se.
                    </p>
                </section>

                <section className="mt-12">
                    <h2 className="font-display text-2xl font-bold text-[#eaf2ff]">O legado San hoje</h2>
                    <p className="mt-4 font-body text-[16px] leading-relaxed text-[#c3d3ef]">
                        Comunidades San remanescentes na África Austral são hoje uma pequena fracção da população da
                        região, deslocadas ao longo de séculos por migrações bantu e, mais tarde, pela colonização
                        europeia. Em Moçambique, o seu legado sobrevive sobretudo nestas galerias de pedra —
                        silenciosas, dispersas, e ainda a serem plenamente estudadas.
                    </p>
                </section>

                {/* further reading */}
                <section className="mt-12 rounded-2xl border border-white/10 bg-[#0d2148]/50 p-6">
                    <h2 className="font-display text-lg font-bold text-[#eaf2ff]">Leitura adicional</h2>
                    <ul className="mt-3 space-y-2 font-body text-sm text-[#9fb3d1]">
                        <li>Arqueologia da arte rupestre da África Austral — levantamentos regionais</li>
                        <li>Relatórios de catalogação de sítios em Manica e Niassa</li>
                        <li>Estudos etnográficos sobre comunidades San contemporâneas</li>
                    </ul>
                </section>
            </div>

            {/* section nav */}
            <div className="border-t border-white/10 bg-[#050f22]/40">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
                    <Link
                        href="/historia/ancient#explore"
                        className="font-body text-sm text-[#9fb3d1] transition-colors hover:text-white"
                    >
                        ← Linha do tempo
                    </Link>
                    <Link
                        href="/historia/ancient/migracao-bantu"
                        className="font-body text-sm text-[#8cdcff] transition-colors hover:text-white"
                    >
                        A Migração Bantu →
                    </Link>
                </div>
            </div>
        </div>
    );
}