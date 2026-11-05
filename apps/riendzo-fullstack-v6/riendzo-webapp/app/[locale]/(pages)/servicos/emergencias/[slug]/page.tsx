import EstablishmentPage from "@/app/components/sections/establishment-page";
import { establishmentMetadata } from "@/lib/cms/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    return establishmentMetadata("services-emergency", (await params).slug);
}

// Public link of each establishment: /servicos/emergencias/<slug> (the QR code points here).
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <EstablishmentPage collection="services-emergency" slug={(await params).slug} />;
}
