import pageStyles from '@/app/css/page.module.css';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import RiendzoHero from '@/app/components/navbar-hero-footer/riendzo-hero';
import Pleasure from '@/app/[locale]/(pages)/home/pleasure';
import BriefHistory from './(pages)/home/breaf-history';
import Entretainment from './(pages)/home/entretainment';
import PublicServices from './(pages)/home/public-services';
import RiendzoFooter from '../components/navbar-hero-footer/riendzo-footer';

export default function Page() {
  return (
    <div className={pageStyles.page}>
      <RiendzoNavbar />
      <RiendzoHero />
      <main>
        <Pleasure />
        <BriefHistory />
        <PublicServices />
        <Entretainment />
      </main>
      <RiendzoFooter />
    </div>
  );
}