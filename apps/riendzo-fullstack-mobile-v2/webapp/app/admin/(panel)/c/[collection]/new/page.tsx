import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/cms/collections";
import EditorFor from "../../../../_components/editor-loader";

export default async function NewItemPage({ params }: { params: Promise<{ collection: string }> }) {
    const { collection: id } = await params;
    const c = getCollection(id);
    if (!c) notFound();
    return (
        <div className="mx-auto max-w-6xl">
            <nav className="mb-2 text-xs text-[#5b6478]"><Link href={`/admin/c/${id}`} className="hover:underline">{c.label}</Link> / Novo</nav>
            <h1 className="mb-6 font-baloo text-3xl font-bold">Novo {c.singular}</h1>
            <EditorFor collectionId={id} slug={null} mode="admin" backHref={`/admin/c/${id}`} />
        </div>
    );
}
