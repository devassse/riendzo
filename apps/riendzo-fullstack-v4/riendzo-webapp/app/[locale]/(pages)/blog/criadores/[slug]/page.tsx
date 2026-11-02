import EstablishmentPage from "@/app/components/sections/establishment-page";
import { getItem, titleOf } from "@/lib/cms/store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const item = await getItem("blog-creators", (await params).slug);
    return { title: item ? `${titleOf(item)} · Criadores · Riendzo` : "Riendzo" };
}

// Public page of each creator: /blog/criadores/<slug> (profile, publications, galleries and videos).
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <EstablishmentPage collection="blog-creators" slug={(await params).slug} />;
}
