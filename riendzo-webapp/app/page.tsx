import pageStyles from './css/page.module.css';
import Ancient from './components/landingPage/history-ancient/ancient';
import Colonial from './components/landingPage/history-colonial/colonial';
import Independent from './components/landingPage/history-independent/independent';
import RiendzoNavbar from './components/landingPage/navbar-hero/riendzo-navbar';
import RiendzoHero from './components/landingPage/navbar-hero/riendzo-hero';

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