import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { getSuggestion } from "@/lib/places";
import { listMembers } from "@/lib/members";
import { getCollection } from "@/lib/cms/collections";
import { getList } from "@/lib/cms/lists";
import { mapUrl } from "@/lib/cms/geo";
import { kindOf, PLACE_COLLECTIONS, STATUS_LABEL, STATUS_STYLE } from "@/lib/place-types";
import SuggestionReview from "@/app/admin/_components/suggestion-review";

export const dynamic = "force-dynamic";

export default async function ReviewSuggestion({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    const { id } = await params;
    const place = await getSuggestion(id);
    if (!place) notFound();

    const member = (await listMembers()).find((m) => m.id === place.memberId);
    const k = kindOf(place.kind);
    const provinces = (await getList("provinces")).map((p) => p.label).filter((p) => p !== "Nacional" && p !== "Várias províncias");
    const collections = await Promise.all(PLACE_COLLECTIONS.map(async (cid) => {
        const c = getCollection(cid)!;
        const cats = await getList(c.categoryList ?? `cats:${c.id}`);
        return { id: c.id, label: c.label, categories: cats.map((x) => ({ value: x.value, label: x.label })) };
    }));

    return (
        <div className="mx-auto max-w-6xl">
            <p className="text-sm"><Link href="/admin/locais-sugeridos" className="text-[#0054b5] hover:underline">← Locais sugeridos</Link></p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-baloo text-3xl font-bold">{place.name}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[place.status]}`}>{STATUS_LABEL[place.status]}</span>
            </div>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">
                {k.emoji} {k.label} · sugerido por <b>{member ? `${member.firstName} ${member.lastName}` : "membro removido"}</b>
                {session.role === "admin" && member && <> ({member.email ?? (member.phone ? `+${member.phone}` : "")})</>}
                {place.submittedAt && <> em {new Date(place.submittedAt).toLocaleString("pt-PT")}</>}
            </p>

            {place.status !== "pending" ? (
                <div className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
                    <p className="text-sm">Esta sugestão já foi {place.status === "approved" ? "aprovada" : "analisada"}{place.reviewedAt ? ` em ${new Date(place.reviewedAt).toLocaleDateString("pt-PT")}` : ""}.</p>
                    {place.reviewNote && <p className="mt-2 text-sm text-[#4b5568]">Nota: {place.reviewNote}</p>}
                    {place.published && <Link href={`/admin/c/${place.published.collection}/${place.published.slug}`} className="mt-3 inline-block text-sm font-medium text-[#0054b5] hover:underline">Abrir o conteúdo publicado →</Link>}
                </div>
            ) : (
                <>
                    {place.photos.length > 0 && (
                        <div className="mb-5 flex flex-wrap gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {place.photos.map((p) => <a key={p} href={p} target="_blank" rel="noopener noreferrer"><img src={p} alt="" className="h-28 w-28 rounded-xl object-cover" /></a>)}
                        </div>
                    )}
                    {place.location && <p className="mb-5 text-sm"><a href={mapUrl(place.location)} target="_blank" rel="noopener noreferrer" className="text-[#0054b5] hover:underline">📍 Ver no mapa ({place.location.lat}, {place.location.lng}) ↗</a></p>}
                    <SuggestionReview
                        place={{ id: place.id, name: place.name, kind: place.kind, province: place.province ?? "", address: place.address ?? "", coords: place.location ? `${place.location.lat}, ${place.location.lng}` : "", description: place.description ?? "", phone: place.phone ?? "", website: place.website ?? "", photos: place.photos }}
                        defaultCollection={k.collection} collections={collections} provinces={provinces}
                    />
                </>
            )}
        </div>
    );
}
