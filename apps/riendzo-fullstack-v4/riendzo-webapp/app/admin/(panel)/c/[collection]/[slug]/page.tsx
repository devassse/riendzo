import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/cms/collections";
import { getItem, titleOf } from "@/lib/cms/store";
import EditorFor from "../../../../_components/editor-loader";

export default async function EditItemPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection: id, slug } = await params;
    const c = getCollection(id);
    const item = c && (await getItem(id, slug));
    if (!c || !item) notFound();
    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]"><Link href={`/admin/c/${id}`} className="hover:underline">{c.label}</Link> / Editar</nav>
            <h1 className="mb-6 font-baloo text-3xl font-bold">{titleOf(item)}</h1>
            <EditorFor key={item.slug + (item.updatedAt ?? "")} collectionId={id} slug={item.slug} mode="admin" backHref={`/admin/c/${id}`} />
        </div>
    );
}
