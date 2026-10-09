import pageStyles from '@/app/css/page.module.css';
import RiendzoNavbar from '@/app/components/navbar-hero-footer/riendzo-navbar';
import RiendzoFooter from '@/app/components/navbar-hero-footer/riendzo-footer';
import GastroHero from '../gastro-hero';
import Especiarias from './especiarias'


export default async function Page() {
    return (
        <div className={pageStyles.page}>
            <RiendzoNavbar />
            <GastroHero/>
            <main>
                <Especiarias/>
            </main>
            <RiendzoFooter />
        </div>
    )
}