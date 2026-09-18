import pageStyles from '@/app/css/page.module.css';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import MusicaHero from './musica-hero';
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';


export default async function Page() {
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <MusicaHero />
            <RiendzoFooter />
        </div>
    )
}