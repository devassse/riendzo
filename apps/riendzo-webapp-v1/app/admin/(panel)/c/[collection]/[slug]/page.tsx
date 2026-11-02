import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/cms/collections";
import { getItems, titleOf } from "@/lib/cms/store";
import ItemEditor from "../../../../_components/item-editor";

export default async function EditItemPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
    const { collection: id, slug } = await params;
    const collection = getCollection(id);
    if (!collection) notFound();

    const items = await getItems(id);
    const item = items.find((i) => i.slug === slug);
    if (!item) notFound();
    const suggestions = [...new Set(items.flatMap((i) => (i as { categories: string[] }).categories))];

    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]">
                <Link href={`/admin/c/${id}`} className="hover:underline">{collection.label}</Link> / Editar
            </nav>
            <h1 className="mb-6 font-baloo text-3xl font-bold">{titleOf(item)}</h1>
            <ItemEditor
                key={item.slug + (item.updatedAt ?? "")}
                collectionId={id} collectionLabel={collection.label} kind={collection.kind}
                originalSlug={item.slug} initial={item} suggestions={suggestions}
                defaultColor={collection.color} singular={collection.singular}
            />
        </div>
    );
}
