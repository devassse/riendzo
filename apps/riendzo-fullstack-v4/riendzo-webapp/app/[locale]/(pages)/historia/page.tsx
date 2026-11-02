import pageStyles from '@/app/css/page.module.css';
import RiendzoHistoryHero from '@/app/[locale]/(pages)/historia/history-hero';
import { AncientSection, ColonialSection, IndependentSection, RealmsSection } from './history-sections';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';

export default async function Page() {
  return (
    <div className={pageStyles.page}>
      <RiendzoNavbar />
      <RiendzoHistoryHero />
      <main>
        <RealmsSection />
        <AncientSection />
        <ColonialSection />
        <IndependentSection />
      </main>
      <RiendzoFooter/>
    </div>
  );
}