import Link from "next/link";
import { requireAccessTo, getSession } from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { getItem, titleOf } from "@/lib/cms/store";
import { qrPage } from "@/lib/cms/paths";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import { OpenPill } from "@/app/components/sections/open-status";

export default async function MySpace() {
    const s = (await getSession())!;
    const mine = (await Promise.all(s.ownerOf.map(async (r) => ({ r, item: (await getItem(r.collection, r.slug)) as CatalogItem | undefined, def: getCollection(r.collection) })))).filter((x) => x.item && x.def);
    if (mine[0]) await requireAccessTo(mine[0].r.collection, mine[0].r.slug);

    return (
        <div>
            <h1 className="font-baloo text-3xl font-bold">Olá, {s.name}!</h1>
            <p className="mt-1 text-sm text-[#4b5568]">Aqui gere a página do seu estabelecimento: informação, horário, localização, fotografias e {mine.some((m) => m.def?.offers) ? "o menu, quartos ou viaturas com preços" : "contactos"}.</p>

            {mine.length === 0 ? (
                <p className="mt-8 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Ainda não há nenhum estabelecimento associado à sua conta. Contacte a equipa Riendzo.</p>
            ) : (
                <ul className="mt-6 grid gap-5 md:grid-cols-2">
                    {mine.map(({ r, item, def }) => (
                        <li key={`${r.collection}-${r.slug}`} className="overflow-hidden rounded-3xl border border-[#0b1220]/8 bg-white shadow-sm">
                            <div className="flex h-36 items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${item!.color}40, ${item!.color}12)` }}>
                                {item!.images?.[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={item!.images[0]} alt="" className="h-full w-full object-cover" /> : item!.emoji}
                            </div>
                            <div className="p-5">
                                <p className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]" style={{ color: item!.color }}>{def!.label}</p>
                                <h2 className="font-baloo text-2xl font-bold">{titleOf(item!)}</h2>
                                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#4b5568]">
                                    <span className={`rounded-full px-2.5 py-0.5 font-medium ${item!.status === "draft" ? "bg-[#f0a83a]/25 text-[#8a5a00]" : "bg-[#35be12]/15 text-[#238a0c]"}`}>{item!.status === "draft" ? "Oculto (rascunho)" : "Publicado"}</span>
                                    <OpenPill hours={item!.hours} />
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Link href={`/admin/meu-espaco/${r.collection}/${r.slug}`} className="rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">Editar a minha página</Link>
                                    <a href={`/pt${def!.publicPath}/${r.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#0b1220]/15 px-4 py-2.5 text-sm hover:bg-[#eef2f8]">Ver página ↗</a>
                                    <Link href={qrPage(r.collection, r.slug)} className="rounded-full border border-[#0b1220]/15 px-4 py-2.5 text-sm hover:bg-[#eef2f8]">Código QR</Link>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
