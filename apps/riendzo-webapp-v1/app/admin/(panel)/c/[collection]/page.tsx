import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getGroup, RECIPE_CATEGORY_LABELS } from "@/lib/cms/collections";
import { getItems, titleOf } from "@/lib/cms/store";
import ConfirmButton from "../../../_components/confirm-button";
import {
    deleteItemAction, duplicateItemAction, moveItemAction, toggleStatusAction,
} from "../../../actions";

const iconBtn =
    "cursor-pointer rounded-full border border-[#0b1220]/15 px-2.5 py-1 text-xs transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30";

export default async function CollectionPage({
    params, searchParams,
}: {
    params: Promise<{ collection: string }>;
    searchParams: Promise<{ q?: string; status?: string }>;
}) {
    const { collection: id } = await params;
    const { q = "", status = "all" } = await searchParams;
    const collection = getCollection(id);
    if (!collection) notFound();

    const all = await getItems(id);
    const needle = q.trim().toLowerCase();
    const filtered = all.filter((i) => {
        const label = (i as { categories: string[] }).categories
            .map((c) => RECIPE_CATEGORY_LABELS[c as keyof typeof RECIPE_CATEGORY_LABELS] ?? c).join(" ");
        const matches = !needle || `${titleOf(i)} ${i.slug} ${label}`.toLowerCase().includes(needle);
        const state = status === "all" || (status === "draft") === (i.status === "draft");
        return matches && state;
    });
    const reorderable = !needle && status === "all";
    const group = getGroup(collection.group);

    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]">
                <Link href="/admin" className="hover:underline">Dashboard</Link> / {group.label}
            </nav>
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-baloo text-3xl font-bold">{collection.label}</h1>
                    <p className="mt-1 text-sm text-[#5b6478]">{collection.description}</p>
                </div>
                <div className="flex gap-2">
                    <a href={`/pt${collection.publicPath}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#0b1220]/15 px-4 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">
                        Ver no site ↗
                    </a>
                    <Link href={`/admin/c/${id}/new`} className="rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">
                        + Novo {collection.singular}
                    </Link>
                </div>
            </header>

            <form className="mb-4 flex flex-wrap gap-2" role="search">
                <input name="q" defaultValue={q} placeholder="Pesquisar por título, endereço ou categoria" className="min-w-[14rem] flex-1 rounded-full border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]" />
                <select name="status" defaultValue={status} className="rounded-full border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm">
                    <option value="all">Todos</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                </select>
                <button className="cursor-pointer rounded-full border border-[#0b1220]/15 bg-white px-5 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">Filtrar</button>
            </form>

            <p className="mb-3 text-xs text-[#5b6478]">
                {filtered.length} de {all.length}. {reorderable ? "A ordem aqui é a ordem no site (use ↑ ↓)." : "Limpe os filtros para reordenar."}
            </p>

            {filtered.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#5b6478]">
                    Nada encontrado.
                </p>
            ) : (
                <ul className="space-y-3">
                    {filtered.map((item, idx) => {
                        const cats = (item as { categories: string[] }).categories
                            .map((c) => RECIPE_CATEGORY_LABELS[c as keyof typeof RECIPE_CATEGORY_LABELS] ?? c).join(" · ");
                        const draft = item.status === "draft";
                        const emoji = "emoji" in item ? item.emoji : "🍽️";
                        const sub = "tag" in item ? item.tag : item.region;
                        const hidden = (n: string, v: string) => <input type="hidden" name={n} value={v} />;

                        return (
                            <li key={item.slug} className="flex flex-wrap items-center gap-4 rounded-3xl border border-[#0b1220]/10 bg-white p-4">
                                <div className="flex h-16 w-20 flex-none items-center justify-center overflow-hidden rounded-2xl text-2xl" style={{ background: `${item.color}22` }}>
                                    {item.images?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                                    ) : emoji}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <Link href={`/admin/c/${id}/${item.slug}`} className="block truncate font-baloo text-base font-medium hover:underline">
                                        {titleOf(item)}
                                    </Link>
                                    <p className="truncate text-xs text-[#5b6478]">{sub} · {cats}</p>
                                    <p className="mt-0.5 text-[11px] text-[#5b6478]">
                                        /{item.slug}{item.updatedAt && ` · editado ${new Date(item.updatedAt).toLocaleDateString("pt-PT")}`}
                                    </p>
                                </div>

                                <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${draft ? "bg-[#f0a83a]/20 text-[#9a6410]" : "bg-[#35be12]/15 text-[#238a0c]"}`}>
                                    {draft ? "Rascunho" : "Publicado"}
                                </span>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {reorderable && (
                                        <>
                                            <form action={moveItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("dir", "up")}
                                                <button className={iconBtn} disabled={idx === 0} aria-label="Subir">↑</button></form>
                                            <form action={moveItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("dir", "down")}
                                                <button className={iconBtn} disabled={idx === filtered.length - 1} aria-label="Descer">↓</button></form>
                                        </>
                                    )}
                                    <Link href={`/admin/c/${id}/${item.slug}`} className={iconBtn}>Editar</Link>
                                    <form action={toggleStatusAction}>{hidden("collection", id)}{hidden("slug", item.slug)}{hidden("to", draft ? "published" : "draft")}
                                        <button className={iconBtn}>{draft ? "Publicar" : "Ocultar"}</button></form>
                                    <form action={duplicateItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}
                                        <button className={iconBtn}>Duplicar</button></form>
                                    <form action={deleteItemAction}>{hidden("collection", id)}{hidden("slug", item.slug)}
                                        <ConfirmButton message={`Eliminar “${titleOf(item)}”? Esta ação não pode ser anulada.`} className={`${iconBtn} text-[#d23b25]`}>Eliminar</ConfirmButton></form>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
