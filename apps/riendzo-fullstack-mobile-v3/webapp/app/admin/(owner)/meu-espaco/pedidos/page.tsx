import Link from "next/link";
import { getSession } from "@/lib/cms/auth";
import { getItem, titleOf } from "@/lib/cms/store";
import { todayMaputo } from "@/lib/cms/highlights";
import { listOrdersFor } from "@/lib/orders";
import { premiumPlacesOf } from "@/lib/place-premium";
import { ACTIVE, type Order } from "@/lib/order-types";
import { setOrderStatusAction } from "../../../order-actions";
import AutoRefresh from "@/app/components/orders/auto-refresh";
import OrderCard from "../../../_components/order-card";
import { Pager, SearchBox, matches, one, paginate } from "../../../_components/list-tools";

export const dynamic = "force-dynamic";

type Params = { q?: string; page?: string; estado?: string | string[]; local?: string | string[]; periodo?: string | string[]; erro?: string };

const TABS = [
    ["", "Todos"],
    ["novos", "Novos"],
    ["curso", "Em curso"],
    ["concluidos", "Concluídos"],
    ["recusados", "Recusados"],
    ["cancelados", "Cancelados"],
] as const;
const PERIODS = [["", "Qualquer data"], ["hoje", "Hoje"], ["7d", "Últimos 7 dias"], ["30d", "Últimos 30 dias"]] as const;

const inTab = (o: Order, tab: string) =>
    tab === "novos" ? o.status === "sent"
    : tab === "curso" ? o.status === "processing" || o.status === "ready"
    : tab === "concluidos" ? o.status === "done"
    : tab === "recusados" ? o.status === "declined"
    : tab === "cancelados" ? o.status === "cancelled"
    : true;

const maputoDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Africa/Maputo" });

/** Orders of the owner's establishments, with filters (status, place, period, search) and pagination. */
export default async function OwnerOrders({ searchParams }: { searchParams: Promise<Params> }) {
    const s = (await getSession())!;
    const sp = await searchParams;
    const q = sp.q ?? "";
    const estado = one(sp.estado);
    const local = one(sp.local);
    const periodo = one(sp.periodo);

    const premiumRefs = await premiumPlacesOf(s.ownerOf);
    const everything = await listOrdersFor(s.ownerOf);
    const places = (await Promise.all(s.ownerOf.map(async (r) => {
        const item = await getItem(r.collection, r.slug);
        return item ? { key: `${r.collection}/${r.slug}`, label: titleOf(item) } : null;
    }))).filter((x): x is { key: string; label: string } => Boolean(x));

    const today = todayMaputo();
    const since = (days: number) => Date.now() - days * 86_400_000;
    const scoped = everything
        .filter((o) => (local ? `${o.collection}/${o.slug}` === local : true))
        .filter((o) => (periodo === "hoje" ? maputoDay(o.createdAt) === today : periodo === "7d" ? Date.parse(o.createdAt) >= since(7) : periodo === "30d" ? Date.parse(o.createdAt) >= since(30) : true))
        .filter((o) => matches(q, o.code, o.customerName, o.phone, o.place, ...o.lines.map((l) => l.name)));
    const count = (tab: string) => scoped.filter((o) => inTab(o, tab)).length;

    const rank = (o: Order) => (o.status === "sent" ? 0 : ACTIVE.includes(o.status) ? 1 : 2);
    const all = scoped.filter((o) => inTab(o, estado)).sort((a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt));
    const pg = paginate(all, sp.page, 10);

    const link = (over: Record<string, string | undefined>, page?: number) => {
        const u = new URLSearchParams();
        const cur: Record<string, string | undefined> = { q, estado, local, periodo, ...over };
        for (const [k, v] of Object.entries(cur)) if (v) u.set(k, v);
        if (page && page > 1) u.set("page", String(page));
        return `/admin/meu-espaco/pedidos${u.toString() ? `?${u.toString()}` : ""}`;
    };
    const back = link({}, pg.cur);
    const selectCls = "rounded-full border border-[#0b1220]/15 bg-white px-3 py-2.5 text-sm";

    return (
        <div>
            <AutoRefresh seconds={10} />
            <h1 className="font-baloo text-3xl font-bold">Pedidos</h1>
            <p className="mt-1 text-sm text-[#4b5568]">Os pedidos e reservas dos clientes chegam aqui e o cliente acompanha cada passo. Esta página atualiza-se sozinha.</p>

            {premiumRefs.length === 0 && (
                <p className="mt-4 rounded-2xl border border-[#0370d6]/30 bg-[#f3f8ff] px-4 py-3 text-sm text-[#0b4a99]">
                    Nenhum dos seus estabelecimentos é Premium: os novos pedidos <b>não chegam a este portal</b>, vão para o telefone e e-mail do estabelecimento. <Link href="/admin/meu-espaco/premium" className="font-medium underline">Subscrever o Premium</Link> para os receber e acompanhar aqui.
                </p>
            )}
            {s.ownerOf.length > premiumRefs.length && premiumRefs.length > 0 && (
                <p className="mt-4 rounded-2xl bg-[#fff8e6] px-4 py-3 text-xs text-[#6b4700]">Alguns dos seus estabelecimentos ainda não são Premium e não recebem pedidos aqui. <Link href="/admin/meu-espaco/premium" className="font-medium underline">Ver Premium</Link></p>
            )}
            {sp.erro && <p role="alert" className="mt-4 rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm text-[#b5311d]">{sp.erro}</p>}

            <div className="mb-4 mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Estado do pedido">
                {TABS.map(([k, l]) => (
                    <a key={k} role="tab" aria-selected={estado === k} href={link({ estado: k })} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ${estado === k ? "bg-[#0054b5] font-medium text-white" : "border border-[#0b1220]/15 bg-white hover:bg-[#eef2f8]"}`}>
                        {l}<span className={`rounded-full px-1.5 text-[11px] ${estado === k ? "bg-white/25" : "bg-[#eef2f8] text-[#4b5568]"}`}>{count(k)}</span>
                    </a>
                ))}
            </div>

            <SearchBox q={q} placeholder="Pesquisar por código, cliente, telefone ou item" keep={{ estado }}>
                {places.length > 1 && (
                    <select name="local" defaultValue={local} aria-label="Estabelecimento" className={selectCls}>
                        <option value="">Todos os estabelecimentos</option>
                        {places.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                )}
                <select name="periodo" defaultValue={periodo} aria-label="Período" className={selectCls}>
                    {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
            </SearchBox>

            {pg.total === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">{everything.length ? "Nenhum pedido encontrado com estes filtros." : "Ainda não recebeu pedidos."}</p>
            ) : (
                <ul className="space-y-4">
                    {pg.items.map((o) => <OrderCard key={o.id} o={o} action={setOrderStatusAction} back={back} showPlace={s.ownerOf.length > 1} />)}
                </ul>
            )}
            <Pager {...pg} params={{ q, estado, local, periodo }} />
        </div>
    );
}
