import { requireAdmin } from "@/lib/cms/auth";
import { getAllLists } from "@/lib/cms/lists";
import ListsManager from "../../../_components/lists-manager";

export default async function ListsPage() {
    await requireAdmin(["admin"]);
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Dados genéricos</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">As listas que alimentam os campos de escolha dos formulários: estilos musicais, tipos de bebida e de prato, províncias, tipos de alojamento e muito mais.</p>
            <ListsManager lists={await getAllLists()} />
        </div>
    );
}
