import EstablishmentPage from "@/app/components/sections/establishment-page";
import { establishmentMetadata } from "@/lib/cms/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    return establishmentMetadata("gastronomy-restaurants", (await params).slug);
}

// Public link of each establishment: /gastronomia/restaurantes/<slug> (the QR code points here).
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <EstablishmentPage collection="gastronomy-restaurants" slug={(await params).slug} />;
}
