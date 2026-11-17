import { getSession } from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { getItem, titleOf } from "@/lib/cms/store";
import { placePremiumUntil } from "@/lib/place-premium";
import { ORDER_KINDS } from "@/lib/order-types";
import { PREMIUM_PLANS } from "@/lib/premium-plans";
import SubscribeDialog from "@/app/components/premium/subscribe-dialog";

export const dynamic = "force-dynamic";

const mt = (n: number) => `${n.toLocaleString("pt-PT")} MT`;

/** The owner upgrades each establishment to Premium (same steps as the member's Premium: plan → M-Pesa → PIN). */
export default async function OwnerPremium() {
    const s = (await getSession())!;
    // M-Pesa numbers only prefill when they look like one
    let phone = (s.phone ?? "").replace(/\D/g, "");
    if (/^8\d{8}$/.test(phone)) phone = `258${phone}`;

    const places = (await Promise.all(s.ownerOf.filter((r) => ORDER_KINDS[r.collection]).map(async (r) => {
        const item = await getItem(r.collection, r.slug);
        if (!item) return null;
        const until = await placePremiumUntil(r.collection, r.slug);
        return { ...r, title: titleOf(item), label: getCollection(r.collection)?.label ?? r.collection, until, active: Boolean(until && new Date(until).getTime() > Date.now()) };
    }))).filter((x): x is NonNullable<typeof x> => Boolean(x));

    return (
        <div>
            <h1 className="font-baloo text-3xl font-bold">Premium do estabelecimento</h1>
            <p className="mb-6 mt-1 max-w-3xl text-sm text-[#4b5568]">
                Com o Premium recebe os pedidos e reservas dos clientes neste portal, no menu <b>Pedidos</b>, e o cliente acompanha cada passo em tempo real (recebido, em processamento, pronto/confirmado, concluído).
                Sem Premium, os pedidos vão para o telefone e o e-mail que indicou ao registar-se, sem acompanhamento, e o cliente é avisado de que o estabelecimento não é Premium.
            </p>

            {places.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#0b1220]/20 bg-white p-10 text-center text-sm text-[#4b5568]">Não há estabelecimentos da sua conta que recebam pedidos (restaurantes, alojamento, rent-a-car, guias e transportes).</p>
            ) : (
                <ul className="grid gap-5 md:grid-cols-2">
                    {places.map((p) => (
                        <li key={`${p.collection}/${p.slug}`} className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
                            <p className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em] text-[#5b6478]">{p.label}</p>
                            <h2 className="font-baloo text-2xl font-bold">{p.title}</h2>
                            <p className="mt-2 text-sm">
                                {p.active
                                    ? <span className="rounded-full bg-[#ffc14d]/40 px-3 py-1 text-xs text-[#6b4700]">⭐ Premium até {new Date(p.until!).toLocaleDateString("pt-PT")}</span>
                                    : <span className="rounded-full bg-[#eef2f8] px-3 py-1 text-xs text-[#4b5568]">{p.until ? `Premium expirou em ${new Date(p.until).toLocaleDateString("pt-PT")}` : "Sem Premium"}</span>}
                            </p>
                            <p className="mt-3 text-xs text-[#5b6478]">Planos: {PREMIUM_PLANS.map((x) => `${x.label} ${mt(x.price)}`).join(" · ")}</p>
                            <div className="mt-4">
                                <SubscribeDialog phone={phone} renew={p.active} place={{ collection: p.collection, slug: p.slug, title: p.title }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
