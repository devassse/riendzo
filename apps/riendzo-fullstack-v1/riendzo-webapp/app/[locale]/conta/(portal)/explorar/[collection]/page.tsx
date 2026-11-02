import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/app/actions/member-actions";
import CatalogSection from "@/app/components/sections/catalog-section";
import ArtistsDirectory from "@/app/components/music/artists-directory";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Artist } from "@/lib/cms/artist-types";
import { getCollection, publicUrlOf } from "@/lib/cms/collections";
import { getList } from "@/lib/cms/lists";
import { getPublishedItems, summaryOf, titleOf } from "@/lib/cms/store";

/** View-only browsing of any menu, inside the member portal. */
export default async function Explore({ params }: { params: Promise<{ collection: string }> }) {
    const { collection } = await params;
    await requireMember(`/conta/explorar/${collection}`);
    const def = getCollection(collection);
    if (!def) notFound();

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-baloo text-3xl font-bold">{def.label}</h1>
                <Link href={def.publicPath} className="rounded-full border border-[#0b1220]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#eef2f8]">Abrir no site ↗</Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                {def.kind === "catalog" && <CatalogSection id={def.id} title={def.label} description={def.description} items={await getPublishedItems<CatalogItem>(collection)} collectionId={collection} />}
                {def.kind === "artist" && (
                    <div className="px-6 py-10"><ArtistsDirectory artists={await getPublishedItems<Artist>(collection)} genres={await getList("music-genres")} /></div>
                )}
                {def.kind === "recipe" && (
                    <ul className="grid gap-3 p-6 sm:grid-cols-2">
                        {(await getPublishedItems(collection)).map((r) => (
                            <li key={r.slug}><Link href={publicUrlOf(collection, r.slug)} className="block rounded-2xl border border-[#0b1220]/10 p-4 hover:shadow-md"><span className="block font-baloo font-medium">{titleOf(r)}</span><span className="line-clamp-2 text-xs text-[#4b5568]">{summaryOf(r)}</span></Link></li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
