import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccessTo } from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { getItem, titleOf } from "@/lib/cms/store";
import EditorFor from "../../../../_components/editor-loader";

export default async function OwnerEdit({ params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection, slug } = await params;
    await requireAccessTo(collection, slug); // only this establishment's owner (or staff)
    const def = getCollection(collection);
    const item = def?.directory ? await getItem(collection, slug) : undefined;
    if (!def || !item) notFound();
    return (
        <div>
            <nav className="mb-2 text-xs text-[#5b6478]"><Link href="/admin/meu-espaco" className="hover:underline">O meu espaço</Link> / Editar</nav>
            <h1 className="mb-6 font-baloo text-3xl font-bold">{titleOf(item)}</h1>
            <EditorFor key={item.updatedAt ?? "0"} collectionId={collection} slug={slug} mode="owner" backHref="/admin/meu-espaco" />
        </div>
    );
}
