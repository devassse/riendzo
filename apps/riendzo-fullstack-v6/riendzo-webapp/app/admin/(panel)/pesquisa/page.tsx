import Link from "next/link";
import { getCollection } from "@/lib/cms/collections";
import { colorOf, emojiOf, searchAll, titleOf } from "@/lib/cms/store";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q = "" } = await searchParams;
    const results = await searchAll(q);

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="font-baloo text-3xl font-bold">Pesquisa</h1>
            <p className="mt-1 text-sm text-[#4b5568]">
                {q.trim() ? `${results.length} resultado(s) para “${q}” em todos os menus.` : "Escreva na barra de pesquisa (Ctrl + K) para procurar em todos os menus."}
            </p>
            <ul className="mt-6 space-y-3">
                {results.map(({ collection, item }) => (
                    <li key={`${collection}-${item.slug}`}>
                        <Link href={`/admin/c/${collection}/${item.slug}`} className="flex items-center gap-4 rounded-2xl border border-[#0b1220]/8 bg-white p-4 shadow-sm hover:shadow-md">
                            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-2xl" style={{ background: `${colorOf(item)}22` }}>{emojiOf(item)}</span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-baloo font-medium">{titleOf(item)}</span>
                                <span className="text-xs text-[#4b5568]">{getCollection(collection)?.label} · /{item.slug}</span>
                            </span>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${item.status === "draft" ? "bg-[#ffc14d]/30 text-[#8a5a00]" : "bg-[#2f9e44]/15 text-[#237a35]"}`}>{item.status === "draft" ? "Rascunho" : "Publicado"}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
