import pageStyles from '@/app/css/page.module.css';
import { getTranslations } from 'next-intl/server';
import HistoriaHero from '../history-hero';
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';

export default async function HistoriaPage() {
  const t = await getTranslations('History');

  return (
    <div className={pageStyles.page}>
      <RiendzoNavbar />
      <HistoriaHero />
      <main>
        <section className='flex flex-col items-center justify-center gap-4 py-8 bg-[#057dde] w-full'>

          <h3 className='text-white text-2xl font-bold'> {t('ancient')} </h3>
          <h2 className="mt-2 text-3xl font-bold text-[#1c1712] sm:text-6xl">
            {t('ancient')}
          </h2>
          <ul>
            <li>{t('ancient')}</li>
          </ul>

        </section>
      </main>
      <RiendzoFooter />
    </div>

  );
}