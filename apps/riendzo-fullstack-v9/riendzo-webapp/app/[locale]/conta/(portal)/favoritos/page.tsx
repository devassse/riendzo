import { Link } from "@/i18n/navigation";
import { removeFavoriteAction, requireMember } from "@/app/actions/member-actions";
import { getCollection, portalUrlOf } from "@/lib/cms/collections";
import { emojiOf, getItem, imagesOf, summaryOf, titleOf } from "@/lib/cms/store";

export default async function Favorites() {
    const m = await requireMember("/conta/favoritos");
    const rows = (await Promise.all(m.favorites.map(async (f) => ({ f, item: await getItem(f.collection, f.slug) })))).filter((x) => x.item && x.item.status !== "draft");

    return (
        <div className="mx-auto max-w-5xl">
            <h1 className="font-baloo text-3xl font-bold">Favoritos</h1>
            <p className="mt-1 text-sm text-[#4b5568]">O que guardou em toda a plataforma.</p>
            {rows.length === 0 ? (
                <p className="mt-6 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Ainda não tem favoritos. Toque no ♥ de qualquer cartão para o guardar aqui.</p>
            ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {rows.map(({ f, item }) => (
                        <li key={`${f.collection}-${f.slug}`} className="flex items-center gap-3 rounded-2xl border border-[#0b1220]/8 bg-white p-3 shadow-sm">
                            <Link href={portalUrlOf(f.collection, f.slug)} className="flex min-w-0 flex-1 items-center gap-3">
                                <span className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-[#eef2f8] text-2xl">{imagesOf(item!)[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={imagesOf(item!)[0]} alt="" className="h-full w-full object-cover" /> : emojiOf(item!)}</span>
                                <span className="min-w-0"><span className="block truncate font-baloo font-medium">{titleOf(item!)}</span><span className="line-clamp-1 text-xs text-[#4b5568]">{summaryOf(item!)}</span><span className="text-[11px] text-[#6b7588]">{getCollection(f.collection)?.label}</span></span>
                            </Link>
                            <form action={removeFavoriteAction}><input type="hidden" name="collection" value={f.collection} /><input type="hidden" name="slug" value={f.slug} /><button aria-label="Remover dos favoritos" className="cursor-pointer rounded-full p-2 text-[#e5533d] hover:bg-[#eef2f8]">♥</button></form>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
