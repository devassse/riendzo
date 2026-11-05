import EstablishmentPage from "@/app/components/sections/establishment-page";
import { establishmentMetadata } from "@/lib/cms/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    return establishmentMetadata("services-comms", (await params).slug);
}

// Public link of each establishment: /servicos/comunicacoes/<slug> (the QR code points here).
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <EstablishmentPage collection="services-comms" slug={(await params).slug} />;
}
