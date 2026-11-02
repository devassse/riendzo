import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/cms/collections";
import { getItems } from "@/lib/cms/store";
import ItemEditor from "../../../../_components/item-editor";

export default async function NewItemPage({ params }: { params: Promise<{ collection: string }> }) {
    const { collection: id } = await params;
    const collection = getCollection(id);
    if (!collection) notFound();

    const items = await getItems(id);
    const suggestions = [...new Set(items.flatMap((i) => (i as { categories: string[] }).categories))];

    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]">
                <Link href={`/admin/c/${id}`} className="hover:underline">{collection.label}</Link> / Novo
            </nav>
            <h1 className="mb-6 font-baloo text-3xl font-bold">Novo {collection.singular}</h1>
            <ItemEditor
                collectionId={id} collectionLabel={collection.label} kind={collection.kind}
                originalSlug={null} initial={null} suggestions={suggestions}
                defaultColor={collection.color} singular={collection.singular}
            />
        </div>
    );
}
