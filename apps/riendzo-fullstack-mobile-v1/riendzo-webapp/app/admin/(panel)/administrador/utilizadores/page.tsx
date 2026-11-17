import { requireAdmin } from "@/lib/cms/auth";
import { DIRECTORY_COLLECTIONS } from "@/lib/cms/collections";
import { getItems, titleOf } from "@/lib/cms/store";
import { listUsers, type Role } from "@/lib/cms/users";
import UsersManager from "../../../_components/users-manager";
import { Pager, SearchBox, matches, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

const ROLES: Record<Role, string> = { admin: "Administradores", editor: "Editores", owner: "Proprietários" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; perfil?: string }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page, perfil = "" } = await searchParams;
    const options = (await Promise.all(DIRECTORY_COLLECTIONS.map(async (c) => (await getItems(c.id)).map((i) => ({ collection: c.id, slug: i.slug, label: `${c.label} · ${titleOf(i)}` }))))).flat();
    const label = new Map(options.map((o) => [`${o.collection}/${o.slug}`, o.label]));
    const everyone = await listUsers();
    const all = everyone
        .filter((u) => (perfil ? u.role === perfil : true))
        .filter((u) => matches(q, u.name, u.username, u.email, u.phone, ...u.ownerOf.map((r) => label.get(`${r.collection}/${r.slug}`) ?? r.slug)));
    const pg = paginate(all, page);
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Utilizadores</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Crie contas para a equipa e para os proprietários: cada restaurante, hotel, rent-a-car… entra com o seu utilizador e só vê e edita o seu estabelecimento.</p>
            <SearchBox q={q} placeholder="Pesquisar por nome, utilizador, e-mail ou estabelecimento" keep={{ perfil }}>
                <select name="perfil" defaultValue={perfil} aria-label="Perfil" className="rounded-full border border-[#0b1220]/15 bg-white px-3 py-2.5 text-sm">
                    <option value="">Todos os perfis</option>
                    {(Object.keys(ROLES) as Role[]).map((r) => <option key={r} value={r}>{ROLES[r]}</option>)}
                </select>
            </SearchBox>
            <UsersManager users={pg.items} options={options} empty={everyone.length ? "Nenhum utilizador encontrado." : undefined} footer={<Pager {...pg} params={{ q, perfil }} />} />
        </div>
    );
}
