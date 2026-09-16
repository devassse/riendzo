import { Link } from '@/i18n/navigation';
import type { SVGProps } from 'react';
import { getTranslations } from 'next-intl/server';

type Era = {
    label: string;
    title: string;
    href: string;
    color: string;
};

const ERAS: Era[] = [
    { label: 'c. 100 000 A.E.C. - 1498', title: 'Reinos e Impérios', href: '#ancient', color: '#00aefb' },
    { label: '1498 - 1964', title: 'História Colonial', href: '#', color: '#dee5e8' },
    { label: '1964 - 1975', title: 'Luta pela Independência', href: '#', color: '#7a2e2e' },
    { label: '1975 - hoje', title: 'História Moderna', href: '#', color: '#35be12' },
];

function WaveLine(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" {...props}>
            <path
                d="M0,60 C240,120 480,0 720,50 C960,100 1200,20 1440,70 L1440,120 L0,120 Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default async function HistoriaHero() {
    const t = await getTranslations('History');
    return (
        <div className="relative overflow-hidden bg-[#0b1220]">

            {/* soft glow behind the title */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, #23f518 0%, transparent 70%)' }}
            />

            <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-28 pt-28 text-center sm:pt-36">
                <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-[#f4ecd8] sm:text-7xl">
                    <h1>{t('title')}</h1>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a7b0c4]">
                    Explore a rica história de Moçambique, desde os tempos antigos até à era moderna — impérios,
                    rotas comerciais, colonização e independência, contados era por era.
                </p>

                {/* the four eras, previewed as entry points */}
                <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {ERAS.map((era) => (
                        <Link
                            key={era.href}
                            href={era.href}
                            className="group flex items-center gap-3 border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                        >
                            <span
                                className="h-2.5 w-2.5 flex-none rounded-full"
                                style={{ backgroundColor: era.color, boxShadow: `0 0 10px 2px ${era.color}55` }}
                            />
                            <span className="flex flex-col">
                                <span className="text-[11px] font-montserrat-italic tracking-[0.14em] text-[#7d879c]">
                                    {era.label}
                                </span>
                                <span className="text-base font-baloo font-medium text-[#f4ecd8] group-hover:text-white">
                                    {era.title}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <WaveLine className="absolute inset-x-0 bottom-0 h-16 w-full text-[#0d1526] sm:h-24" />
        </div>
    );
}