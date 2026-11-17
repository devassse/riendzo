import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { deletePlaceAction, withdrawPlaceAction } from "@/app/actions/place-actions";
import { requireMember } from "@/app/actions/member-actions";
import PlaceForm from "@/app/components/account/place-form";
import { getList } from "@/lib/cms/lists";
import { mapUrl } from "@/lib/cms/geo";
import { getCollection, portalUrlOf } from "@/lib/cms/collections";
import { getPlaceOf } from "@/lib/places";
import { kindOf, STATUS_LABEL, STATUS_STYLE } from "@/lib/place-types";

export const dynamic = "force-dynamic";

const OK: Record<string, string> = {
    guardado: "Local guardado no seu perfil.",
    sugerido: "Sugestão enviada! A equipa Riendzo vai rever o local e avisamos quando houver novidades.",
    retirado: "Sugestão retirada. O local voltou a ser só seu.",
};

export default async function PlaceDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
    const { id } = await params;
    const { ok, erro } = await searchParams;
    const m = await requireMember(`/conta/locais/${id}`);
    const place = await getPlaceOf(m.id, id);
    if (!place) notFound();

    const editable = place.status === "private" || place.status === "rejected";
    const k = kindOf(place.kind);
    const provinces = (await getList("provinces")).map((p) => p.label).filter((p) => p !== "Nacional" && p !== "Várias províncias");

    return (
        <div className="mx-auto max-w-6xl">
            <p className="text-sm"><Link href="/conta/locais" className="text-[#0054b5] hover:underline">← Os meus locais</Link></p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-baloo text-3xl font-bold">{place.name}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[place.status]}`}>{STATUS_LABEL[place.status]}</span>
            </div>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">{k.emoji} {k.label}{place.province ? ` · ${place.province}` : ""}</p>

            {ok && OK[ok] && <p role="status" className="mb-4 rounded-2xl bg-[#2f9e44]/12 px-4 py-3 text-sm text-[#237a35]">{OK[ok]}</p>}
            {erro && <p role="alert" className="mb-4 rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{erro}</p>}

            {place.status === "rejected" && (
                <div role="note" className="mb-5 rounded-2xl border border-[#d23b25]/30 bg-[#fff5f3] px-4 py-3 text-sm text-[#7a2515]">
                    <p className="font-medium">A equipa não publicou este local.</p>
                    {place.reviewNote && <p className="mt-1">Motivo: {place.reviewNote}</p>}
                    <p className="mt-1 text-xs">Pode ajustar as informações abaixo e sugeri-lo outra vez.</p>
                </div>
            )}

            {editable ? (
                <>
                    <PlaceForm place={place} provinces={provinces} />
                    <form action={deletePlaceAction} className="mt-6 text-right">
                        <input type="hidden" name="id" value={place.id} />
                        <button className="cursor-pointer text-sm text-[#d23b25] hover:underline">Eliminar este local</button>
                    </form>
                </>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-4 rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
                        {place.photos.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {place.photos.map((p) => <img key={p} src={p} alt="" className="h-28 w-28 rounded-xl object-cover" />)}
                            </div>
                        )}
                        {place.description && <p className="whitespace-pre-line text-sm leading-relaxed">{place.description}</p>}
                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            {place.address && <div><dt className="text-xs text-[#5b6478]">Endereço</dt><dd>{place.address}</dd></div>}
                            {place.location && <div><dt className="text-xs text-[#5b6478]">Coordenadas</dt><dd><a href={mapUrl(place.location)} target="_blank" rel="noopener noreferrer" className="text-[#0054b5] hover:underline">{place.location.lat}, {place.location.lng} ↗</a></dd></div>}
                            {place.phone && <div><dt className="text-xs text-[#5b6478]">Telefone</dt><dd>{place.phone}</dd></div>}
                            {place.website && <div><dt className="text-xs text-[#5b6478]">Site</dt><dd className="truncate">{place.website}</dd></div>}
                        </dl>
                        {place.notes && <div className="rounded-2xl bg-[#f3f6fb] p-4 text-sm"><p className="text-xs font-medium text-[#5b6478]">🔒 Notas privadas</p><p className="mt-1 whitespace-pre-line">{place.notes}</p></div>}
                    </div>

                    <aside className="space-y-4 xl:self-start">
                        {place.status === "pending" && (
                            <div className="rounded-3xl border border-[#ffc14d]/60 bg-[#fff9ea] p-6">
                                <h2 className="font-baloo text-lg font-bold">A aguardar revisão</h2>
                                <p className="mt-1 text-sm text-[#4b5568]">A equipa Riendzo está a ver o seu local. Enquanto isso não o pode editar.</p>
                                <form action={withdrawPlaceAction} className="mt-3"><input type="hidden" name="id" value={place.id} />
                                    <button className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2 text-sm font-medium hover:bg-white">Retirar a sugestão</button></form>
                            </div>
                        )}
                        {place.status === "approved" && place.published && (
                            <div className="rounded-3xl border border-[#35be12]/40 bg-[#f1fbee] p-6">
                                <h2 className="font-baloo text-lg font-bold">🎉 Publicado na Riendzo</h2>
                                <p className="mt-1 text-sm text-[#4b5568]">O seu local está disponível para todos em {getCollection(place.published.collection)?.label ?? "a plataforma"}. Obrigado por partilhar!</p>
                                {place.reviewNote && <p className="mt-2 text-xs text-[#4b5568]">Nota da equipa: {place.reviewNote}</p>}
                                <Link href={portalUrlOf(place.published.collection, place.published.slug)} className="mt-3 inline-block rounded-full bg-[#0054b5] px-4 py-2 text-sm font-medium text-white hover:opacity-90">Ver a página publicada</Link>
                            </div>
                        )}
                        <form action={deletePlaceAction}><input type="hidden" name="id" value={place.id} />
                            <button disabled={place.status === "pending"} className="cursor-pointer text-sm text-[#d23b25] hover:underline disabled:cursor-not-allowed disabled:opacity-40">Eliminar a minha cópia</button></form>
                    </aside>
                </div>
            )}
        </div>
    );
}
