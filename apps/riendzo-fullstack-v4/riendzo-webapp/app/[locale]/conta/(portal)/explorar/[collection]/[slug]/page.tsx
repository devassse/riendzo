import { notFound } from "next/navigation";
import { requireMember } from "@/app/actions/member-actions";
import ArtistProfile from "@/app/components/music/artist-profile";
import EstablishmentPage from "@/app/components/sections/establishment-page";
import { getCollection } from "@/lib/cms/collections";

export const dynamic = "force-dynamic";

/**
 * Full details of one establishment or artist, inside the member portal
 * (the portal menu stays on the left and "← voltar" returns to the list).
 */
export default async function PortalDetail({ params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection, slug } = await params;
    await requireMember(`/conta/explorar/${collection}/${slug}`);

    const def = getCollection(collection);
    if (!def) notFound();
    const back = `/conta/explorar/${def.id}`;

    return (
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
            {def.kind === "artist" ? (
                <ArtistProfile slug={slug} embedded base={back} />
            ) : def.kind === "catalog" ? (
                <EstablishmentPage collection={def.id} slug={slug} embedded backHref={back} backLabel={def.label} />
            ) : (
                notFound()
            )}
        </div>
    );
}
