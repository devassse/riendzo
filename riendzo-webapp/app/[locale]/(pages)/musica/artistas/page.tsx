import pageStyles from '@/app/css/page.module.css';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import ArtistsHero from "./artists-hero"
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';

export default async function ArtistsPage() {
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <main>
                <ArtistsHero />
            </main>
            <RiendzoFooter />
        </div>
    )
}