import pageStyles from '@/app/css/page.module.css';
import { getTranslations } from 'next-intl/server';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';
import { NAV_SECTIONS } from '@/app/components/utils/riendzo-nav-data';
import SectionHub from '@/app/components/sections/section-hub';
import GastroHero from './gastro-hero';

const COLORS = ['#e5533d', '#00aefb', '#f0a83a', '#35be12'];

/** Gastronomia landing page: hero + one card per submenu. */
export default async function Page() {
    const t = await getTranslations('gastronomy');
    const links = NAV_SECTIONS.find((s) => s.id === 'gastronomia')?.links ?? [];

    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <GastroHero />
            <main>
                <SectionHub
                    title={t('hub.title')}
                    description={t('hub.description')}
                    cta={t('hub.cta')}
                    cards={links.map((link, i) => ({
                        icon: link.icon,
                        title: link.title,
                        description: link.desc,
                        href: link.href,
                        color: COLORS[i % COLORS.length],
                    }))}
                />
            </main>
            <RiendzoFooter />
        </div>
    );
}
