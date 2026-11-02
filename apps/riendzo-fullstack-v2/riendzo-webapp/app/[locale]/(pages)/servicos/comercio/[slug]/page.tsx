import EstablishmentPage from "@/app/components/sections/establishment-page";
import { getItem, titleOf } from "@/lib/cms/store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const item = await getItem("services-commerce", (await params).slug);
    return { title: item ? `${titleOf(item)} · Riendzo` : "Riendzo" };
}

// Public link of each establishment: /servicos/comercio/<slug> (the QR code points here).
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <EstablishmentPage collection="services-commerce" slug={(await params).slug} />;
}
