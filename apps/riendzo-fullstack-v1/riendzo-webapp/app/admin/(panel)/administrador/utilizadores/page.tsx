import { requireAdmin } from "@/lib/cms/auth";
import { DIRECTORY_COLLECTIONS } from "@/lib/cms/collections";
import { getItems, titleOf } from "@/lib/cms/store";
import { listUsers } from "@/lib/cms/users";
import UsersManager from "../../../_components/users-manager";

export default async function UsersPage() {
    await requireAdmin(["admin"]);
    const options = (await Promise.all(DIRECTORY_COLLECTIONS.map(async (c) => (await getItems(c.id)).map((i) => ({ collection: c.id, slug: i.slug, label: `${c.label} · ${titleOf(i)}` }))))).flat();
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Utilizadores</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Crie contas para a equipa e para os proprietários: cada restaurante, hotel, rent-a-car… entra com o seu utilizador e só vê e edita o seu estabelecimento.</p>
            <UsersManager users={await listUsers()} options={options} />
        </div>
    );
}
