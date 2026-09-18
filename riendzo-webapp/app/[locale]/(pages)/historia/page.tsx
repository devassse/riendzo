import pageStyles from '@/app/css/page.module.css';
import RiendzoHistoryHero from '@/app/[locale]/(pages)/historia/history-hero';
import Ancient from '@/app/[locale]/(pages)/historia/antiga/ancient';
import MaisSobre from '@/app/[locale]/(pages)/historia//antiga/mais-sobre';
import Colonial from '@/app/[locale]/(pages)/historia/colonial/colonial';
import Independent from '@/app/[locale]/(pages)/historia/moderna/independent';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';

export default async function Page() {
  return (
    <div className={pageStyles.page}>
      <RiendzoNavbar />
      <main>
        <RiendzoHistoryHero />
        <MaisSobre />
        <Ancient />
        <Colonial />
        <Independent />
      </main>
    </div>
  );
}