import pageStyles from '@/app/css/page.module.css';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';
import GastroHero from '../gastro-hero';
import Recips from './recips'


export default async function Page() {
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <GastroHero/>
            <main>
                <Recips/>
            </main>
            <RiendzoFooter />
        </div>
    )
}