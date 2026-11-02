import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { listMessages } from "@/lib/cms/inbox";
import { listMembers } from "@/lib/members";
import { listUsers } from "@/lib/cms/users";
import { getAllLists } from "@/lib/cms/lists";

export default async function AdminHub() {
    await requireAdmin(["admin"]);
    const [lists, users, members, messages] = await Promise.all([getAllLists(), listUsers(), listMembers(), listMessages()]);
    const cards = [
        ["listas", "📋", "Dados genéricos", `${lists.length} listas`, "Províncias, estilos musicais, categorias de receitas, tipos de alojamento…"],
        ["menus", "🧭", "Menus e “Em breve”", "marcas do site", "Marque menus e submenus como “Em breve” enquanto trabalha neles."],
        ["utilizadores", "👥", "Utilizadores", `${users.length} contas`, "Administradores, editores e proprietários de estabelecimentos."],
        ["membros", "🤖", "Membros Riendzo AI", `${members.length} membros`, "Pessoas registadas no site: ver e suspender contas."],
        ["mensagens", "✉️", "Mensagens", `${messages.filter((m) => !m.read).length} por ler`, "Mensagens enviadas pelo formulário de contactos."],
    ];
    return (
        <div className="mx-auto max-w-5xl">
            <h1 className="font-baloo text-3xl font-bold">Administrador</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Parametrização da plataforma, contas e comunidade.</p>
            <div className="grid gap-4 sm:grid-cols-2">
                {cards.map(([k, e, t, n, d]) => (
                    <Link key={k} href={`/admin/administrador/${k}`} className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <span className="text-3xl" aria-hidden="true">{e}</span>
                        <h2 className="mt-2 font-baloo text-xl font-bold">{t} <span className="ml-1 text-xs font-normal text-[#5b6478]">{n}</span></h2>
                        <p className="mt-1 text-sm text-[#4b5568]">{d}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
