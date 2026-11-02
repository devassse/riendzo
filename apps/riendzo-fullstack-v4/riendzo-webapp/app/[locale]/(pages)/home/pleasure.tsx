import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getExperienceCards, getHomeConfig, type ExperienceIcon } from '@/lib/cms/home';
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

const ICONS: Record<ExperienceIcon, React.ReactNode> = {
    whale: <IconWhaleShark />,
    reef: <IconReef />,
    paw: <IconPawprint />,
    landmark: <IconLandmark />,
    sail: <IconSail />,
    city: <IconCity />,
};

/* ---------------------------------------------------------------- */
/*  Section: everything comes from the BackOffice (Home)             */
/* ---------------------------------------------------------------- */

export default async function ThingsToDoSection() {
    const [t, cards, cfg] = await Promise.all([getTranslations('Home.explore'), getExperienceCards(), getHomeConfig()]);
    if (cards.length === 0) return <section id="explore" className="scroll-mt-32" aria-hidden="true" />;

    const h = cfg.heading;
    return (
        <section id="explore" className="scroll-mt-32 bg-[#f1f7fe] px-6 py-20 sm:px-10">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-montserrat-italic text-xs font-semibold tracking-[0.16em] text-[#00aefb]">
                        {h?.eyebrow ?? t('eyebrow')}
                    </span>
                    <h2 className="mt-3 font-baloo text-4xl font-bold leading-tight text-[#050f22] sm:text-5xl">
                        {h?.title ?? t('title', { count: cards.length })}
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-[#050f22]">
                        {h?.subtitle ?? t('subtitle')}
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c) => (
                        <Link
                            key={c.key}
                            href={c.href}
                            className="group overflow-hidden rounded-4xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: `${c.color}22` }}>
                                {c.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={c.image} alt={c.headline} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-6xl" aria-hidden="true">{c.emoji}</span>
                                )}
                                <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#050f22] backdrop-blur-sm">
                                    <span className="h-4.5 w-4.5">{ICONS[c.icon]}</span>
                                </span>
                                {c.tag && (
                                    <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 font-body text-[11px] font-medium text-white backdrop-blur-sm">
                                        {c.tag}
                                    </span>
                                )}
                            </div>

                            <div className="p-5">
                                <p className="font-body text-xs font-medium uppercase tracking-wide text-[#8a938c]">
                                    {[c.location, c.bestTime].filter(Boolean).join(' · ')}
                                </p>
                                <h3 className="mt-2 font-body text-lg font-bold leading-snug text-[#050f22] hover:text-[#00aefb]">{c.headline}</h3>
                                <p className="mt-2 font-body text-sm leading-relaxed text-[#050f22]">{c.description}</p>
                                <p className="mt-4 font-body text-sm font-semibold text-[#00aefb] hover:text-[#050f22]">{t('readMore')} &rarr;</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
