import { requireAdmin } from "@/lib/cms/auth";
import { getItem } from "@/lib/cms/store";
import { listAllOrders } from "@/lib/orders";
import { ACTIVE, type Order } from "@/lib/order-types";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import AutoRefresh from "@/app/components/orders/auto-refresh";
import { adminSetOrderStatusAction } from "../../../order-actions";
import OrderCard from "../../../_components/order-card";
import { Pager, SearchBox, matches, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

const TABS = [
    ["", "Para encaminhar"],
    ["todos", "Todos os pedidos"],
] as const;

/**
 * Orders and reservations seen by the Riendzo team. Establishments without an owner account
 * cannot receive orders themselves: those arrive here ("Para encaminhar") and the team
 * contacts the establishment, then moves the order forward so the customer sees the progress.
 */
export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; ver?: string; erro?: string }> }) {
    await requireAdmin(["admin"]);
    const { q = "", page, ver = "", erro } = await searchParams;
    const everything = await listAllOrders();
    const scoped = ver === "todos" ? everything : everything.filter((o) => o.viaRiendzo);
    const rank = (o: Order) => (o.status === "sent" ? 0 : ACTIVE.includes(o.status) ? 1 : 2);
    const all = scoped
        .filter((o) => matches(q, o.code, o.place, o.customerName, o.phone, ...o.lines.map((l) => l.name)))
        .sort((a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt));
    const pg = paginate(all, page, 15);
    const waiting = everything.filter((o) => o.viaRiendzo && o.status === "sent").length;

    // contacts of the establishments on this page (to forward the orders)
    const contacts = new Map<string, CatalogItem["contact"]>();
    for (const o of pg.items) {
        const k = `${o.collection}/${o.slug}`;
        if (!contacts.has(k)) contacts.set(k, ((await getItem(o.collection, o.slug)) as CatalogItem | undefined)?.contact);
    }
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (ver) sp.set("ver", ver);
    if (pg.cur > 1) sp.set("page", String(pg.cur));
    const back = `/admin/administrador/pedidos${sp.toString() ? `?${sp.toString()}` : ""}`;

    return (
        <div className="mx-auto max-w-5xl">
            <AutoRefresh seconds={20} />
            <h1 className="font-baloo text-3xl font-bold">Pedidos e reservas</h1>
            <p className="mb-5 mt-1 text-sm text-[#4b5568]">
                Os estabelecimentos que ainda não têm conta na Riendzo não recebem os pedidos diretamente: chegam aqui para a equipa encaminhar.
                {waiting > 0 && <> <b className="text-[#7a5200]">{waiting} à espera de resposta.</b></>}
            </p>
            <div className="mb-4 flex flex-wrap gap-2" role="tablist">
                {TABS.map(([k, l]) => (
                    <a key={k} role="tab" aria-selected={ver === k} href={k ? `?ver=${k}` : "?"} className={`rounded-full px-4 py-2 text-sm ${ver === k ? "bg-[#0054b5] font-medium text-white" : "border border-[#0b1220]/15 bg-white hover:bg-[#eef2f8]"}`}>{l}</a>
                ))}
            </div>
            <SearchBox q={q} placeholder="Pesquisar por código, estabelecimento, cliente ou telefone" keep={{ ver }} />
            {erro && <p role="alert" className="mb-4 rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{erro}</p>}
            {pg.total === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">{scoped.length ? "Nenhum pedido encontrado." : ver === "todos" ? "Ainda não há pedidos." : "Não há pedidos para encaminhar."}</p>
            ) : (
                <ul className="space-y-4">
                    {pg.items.map((o) => {
                        const c = contacts.get(`${o.collection}/${o.slug}`);
                        return <OrderCard key={o.id} o={o} action={adminSetOrderStatusAction} back={back} showPlace placeContact={{ phone: c?.phone, email: c?.email, whatsapp: c?.whatsapp }} />;
                    })}
                </ul>
            )}
            <Pager {...pg} params={{ q, ver }} />
        </div>
    );
}
