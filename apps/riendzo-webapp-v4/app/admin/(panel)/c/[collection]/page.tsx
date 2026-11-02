import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getGroup } from "@/lib/cms/collections";
import { getList } from "@/lib/cms/lists";
import { categoriesOf, colorOf, emojiOf, getItems, imagesOf, tagOf, titleOf } from "@/lib/cms/store";
import { listUsers } from "@/lib/cms/users";
import { qrPage } from "@/lib/cms/paths";
import type { Artist } from "@/lib/cms/artist-types";
import ConfirmButton from "../../../_components/confirm-button";
import { deleteItemAction, duplicateItemAction, moveItemAction, setFeaturedWeekAction, toggleStatusAction } from "../../../actions";

const iconBtn = "cursor-pointer rounded-full border border-[#0b1220]/15 px-2.5 py-1 text-xs transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30";
const PAGE = 15;

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
    const { collection: id } = await params;
    const { q = "", status = "all", page = "1" } = await searchParams;
    const collection = getCollection(id);
    if (!collection) notFound();

    const [all, users, recipeCats, genres] = await Promise.all([
        getItems(id), collection.directory ? listUsers() : Promise.resolve([]),
        collection.kind === "recipe" ? getList("recipe-categories") : Promise.resolve([]),
        collection.kind === "artist" ? getList("music-genres") : Promise.resolve([]),
    ]);
    const label = (c: string) => recipeCats.find((x) => x.value === c)?.label ?? genres.find((x) => x.value === c)?.label ?? c;
    const needle = q.trim().toLowerCase();
    const filtered = all.filter((i) => {
        const hay = `${titleOf(i)} ${i.slug} ${categoriesOf(i).map(label).join(" ")}`.toLowerCase();
        return (!needle || hay.includes(needle)) && (status === "all" || (status === "draft") === (i.status === "draft"));
    });
    const reorderable = !needle && status === "all";
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
    const cur = Math.min(Math.max(1, Number(page) || 1), pages);
    const rows = filtered.slice((cur - 1) * PAGE, cur * PAGE);
    const group = getGroup(collection.group);
    const href = (n: number) => `/admin/c/${id}?q=${encodeURIComponent(q)}&status=${status}&page=${n}`;

    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]"><Link href="/admin" className="hover:underline">Dashboard</Link> / {group.label}</nav>
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div><h1 className="font-baloo text-3xl font-bold">{collection.label}</h1><p className="mt-1 text-sm text-[#5b6478]">{collection.description}</p></div>
                <div className="flex gap-2">
                    <a href={`/pt${collection.publicPath}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#0b1220]/15 px-4 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">Ver no site ↗</a>
                    <Link href={`/admin/c/${id}/new`} className="rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">+ Novo {collection.singular}</Link>
                </div>
            </header>

            <form className="mb-4 flex flex-wrap gap-2" role="search">
                <input name="q" defaultValue={q} placeholder="Pesquisar por título, endereço ou categoria" className="min-w-[14rem] flex-1 rounded-full border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]" />
                <select name="status" defaultValue={status} className="rounded-full border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm"><option value="all">Todos</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select>
                <button className="cursor-pointer rounded-full border border-[#0b1220]/15 bg-white px-5 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">Filtrar</button>
            </form>
            <p className="mb-3 text-xs text-[#5b6478]">{filtered.length} de {all.length}. {reorderable ? "A ordem aqui é a ordem no site (use ↑ ↓)." : "Limpe os filtros para reordenar."}</p>

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#5b6478]">Nada encontrado.</p>
            ) : (
                <ul className="space-y-3">
                    {rows.map((item) => {
                        const idx = all.indexOf(item);
                        const draft = item.status === "draft";
                        const owners = users.filter((u) => u.ownerOf.some((r) => r.collection === id && r.slug === item.slug));
                        const weekly = collection.kind === "artist" && (item as Artist).featuredWeek;
                        const hidden = (n: string, v: string) => <input type="hidden" name={n} value={v} />;
                        return (
                            <li key={item.slug} className="flex flex-wrap items-center gap-4 rounded-3xl border border-[#0b1220]/10 bg-white p-4">
                                <div className={`flex h-16 w-20 flex-none items-center justify-center overflow-hidden text-2xl ${collection.kind === "artist" ? "rounded-full" : "rounded-2xl"}`} style={{ background: `${colorOf(item)}22` }}>
                                    {imagesOf(item)[0] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={imagesOf(item)[0]} alt="" className="h-full w-full object-cover" loading="lazy" /> : emojiOf(item)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/admin/c/${id}/${item.slug}`} className="block truncate font-baloo text-base font-medium hover:underline">{titleOf(item)}</Link>
                                    <p className="truncate text-xs text-[#5b6478]">{tagOf(item) && `${tagOf(item)} · `}{categoriesOf(item).map(label).join(" · ")}</p>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[#5b6478]">
                                        <span>/{item.slug}</span>{item.updatedAt && <span>· editado {new Date(item.updatedAt).toLocaleDateString("pt-PT")}</span>}
                                        {(item as { featured?: boolean }).featured && <span className="rounded-full bg-[#f0a83a]/30 px-2 text-[#7a4e00]">★ Patrocinado</span>}
                                        {weekly && <span className="rounded-full bg-[#f0a83a]/30 px-2 text-[#7a4e00]">★ Artista da semana</span>}
                                        {collection.directory && <span className={owners.length ? "text-[#237a35]" : ""}>· {owners.length ? `Proprietário: ${owners.map((o) => o.name).join(", ")}` : "sem acesso de proprietário"}</span>}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${draft ? "bg-[#f0a83a]/20 text-[#9a6410]" : "bg-[#35be12]/15 text-[#238a0c]"}`}>{draft ? "Rascunho" : "Publicado"}</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {reorderable && (<>
                                        <form action={moveItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("dir", "up")}<button className={iconBtn} disabled={idx === 0} aria-label="Subir">↑</button></form>
                                        <form action={moveItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("dir", "down")}<button className={iconBtn} disabled={idx === all.length - 1} aria-label="Descer">↓</button></form>
                                    </>)}
                                    <Link href={`/admin/c/${id}/${item.slug}`} className={iconBtn}>Editar</Link>
                                    {collection.kind === "artist" && <form action={setFeaturedWeekAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("on", weekly ? "0" : "1")}<button className={iconBtn}>{weekly ? "Retirar ★" : "★ Da semana"}</button></form>}
                                    {collection.directory && <Link href={qrPage(id, item.slug)} className={iconBtn}>QR</Link>}
                                    <form action={toggleStatusAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("to", draft ? "published" : "draft")}<button className={iconBtn}>{draft ? "Publicar" : "Ocultar"}</button></form>
                                    <form action={duplicateItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}<button className={iconBtn}>Duplicar</button></form>
                                    <form action={deleteItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}<ConfirmButton message={`Eliminar “${titleOf(item)}”? Esta ação não pode ser anulada.`} className={`${iconBtn} text-[#d23b25]`}>Eliminar</ConfirmButton></form>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {pages > 1 && (
                <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    {cur > 1 && <Link href={href(cur - 1)} className={iconBtn}>← Anterior</Link>}
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={href(n)} aria-current={n === cur ? "page" : undefined} className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${n === cur ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0b1220]/15"}`}>{n}</Link>)}
                    {cur < pages && <Link href={href(cur + 1)} className={iconBtn}>Seguinte →</Link>}
                </nav>
            )}
        </div>
    );
}
