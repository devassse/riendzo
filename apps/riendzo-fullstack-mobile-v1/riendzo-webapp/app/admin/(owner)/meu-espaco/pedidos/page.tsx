import { getSession } from "@/lib/cms/auth";
import { listOrdersFor } from "@/lib/orders";
import { setOrderStatusAction } from "../../../order-actions";
import AutoRefresh from "@/app/components/orders/auto-refresh";
import type { Order } from "@/lib/order-types";
import OrderCard from "../../../_components/order-card";

export const dynamic = "force-dynamic";

export default async function OwnerOrders({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
    const s = (await getSession())!;
    const { erro } = await searchParams;
    const all = await listOrdersFor(s.ownerOf);
    const fresh = all.filter((o) => o.status === "sent");
    const running = all.filter((o) => o.status === "processing" || o.status === "ready");
    const past = all.filter((o) => ["done", "declined", "cancelled"].includes(o.status)).slice(0, 20);
    const Section = ({ title, list }: { title: string; list: Order[] }) => list.length ? <section className="mt-6"><h2 className="font-baloo text-xl font-bold">{title} <span className="text-sm font-normal text-[#5b6478]">{list.length}</span></h2><ul className="mt-3 space-y-4">{list.map((o) => <OrderCard key={o.id} o={o} action={setOrderStatusAction} />)}</ul></section> : null;

    return (
        <div>
            <AutoRefresh seconds={10} />
            <h1 className="font-baloo text-3xl font-bold">Pedidos</h1>
            <p className="mt-1 text-sm text-[#4b5568]">Os pedidos e reservas dos clientes chegam aqui. Esta página atualiza-se sozinha.</p>
            {erro && <p role="alert" className="mt-4 rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{erro}</p>}
            {all.length === 0 && <p className="mt-8 rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Ainda não recebeu pedidos.</p>}
            <Section title="Novos" list={fresh} />
            <Section title="Em curso" list={running} />
            <Section title="Anteriores" list={past} />
        </div>
    );
}
