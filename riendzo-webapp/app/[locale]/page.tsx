// import RiendzoNavbar from '@/app/components/landingPage/navbar-hero/riendzo-navbar';

// export default function Page() {
//   return <RiendzoNavbar />;
// }
import pageStyles from '@/app/css/page.module.css';
import Ancient from '@/app/[locale]/(pages)/historia/antiga/ancient';
import Colonial from '@/app/[locale]/(pages)/historia/colonial/colonial';
import Independent from '@/app/[locale]/(pages)/historia/moderna/independent';
import RiendzoNavbar from '@/app/components/navbar-hero/riendzo-navbar';
import RiendzoHero from '@/app/components/navbar-hero/riendzo-hero';

export default function Page() {
  return (
    <div className={pageStyles.page}>
      <RiendzoNavbar />
      <main>
        <RiendzoHero />
        <Ancient />
        <Colonial />
        <Independent />
      </main>
    </div>
  );
}