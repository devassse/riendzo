import EstablishmentPage from "@/app/components/sections/establishment-page";
import { establishmentMetadata } from "@/lib/cms/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    return establishmentMetadata("blog-creators", (await params).slug);
}

// Public page of each creator: /blog/criadores/<slug> (profile, publications, galleries and videos).
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <EstablishmentPage collection="blog-creators" slug={(await params).slug} />;
}
