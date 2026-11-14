"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { placeOrderAction, type OrderState } from "@/app/actions/order-actions";
import { MODES, type OrderKind } from "@/lib/order-types";
import { ORDER_ADD_EVENT } from "@/lib/order-events";

export type PanelOffer = { group: string; name: string; description?: string; price?: number; priceNote?: string };
export type PanelProps = {
    kind: OrderKind; collection: string; slug: string; offers: PanelOffer[]; currency: string; color: string;
    who: "guest" | "free" | "premium"; freeLeft: number; freeLimit: number; phone: string; next: string;
};

const input = "mt-1 w-full rounded-xl border border-[#0b1220]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#0370d6]";
const money = (n: number, c: string) => `${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} ${c === "MZN" ? "MT" : c}`;

const Upsell = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-[#0370d6]/30 bg-[#f3f8ff] p-4 text-sm">
        {children}
        <Link href="/conta/premium" className="mt-3 inline-block rounded-full bg-[#0054b5] px-4 py-2 font-medium text-white hover:opacity-90">Conhecer o Premium</Link>
    </div>
);

export default function OrderPanel(p: PanelProps) {
    const [state, action, pending] = useActionState<OrderState, FormData>(placeOrderAction, {});
    const [qty, setQty] = useState<Record<string, number>>({});
    const [pick, setPick] = useState("");
    const [mode, setMode] = useState("pickup");
    const [flash, setFlash] = useState("");
    const key = (o: PanelOffer) => `${o.group}||${o.name}`;
    const food = p.kind === "food";

    const lines = useMemo(() => {
        if (food) return p.offers.filter((o) => qty[key(o)] > 0).map((o) => ({ group: o.group, name: o.name, qty: qty[key(o)] }));
        const o = p.offers.find((x) => key(x) === pick);
        return o ? [{ group: o.group, name: o.name, qty: 1 }] : [];
    }, [qty, pick, p.offers, food]);
    const total = food && p.offers.every((o) => !(qty[key(o)] > 0) || typeof o.price === "number")
        ? p.offers.reduce((n, o) => n + (qty[key(o)] > 0 ? o.price! * qty[key(o)] : 0), 0) : null;
    const groups = [...new Set(p.offers.map((o) => o.group))];

    // The details popup of an item asks to add it here ("Adicionar ao pedido" / "Solicitar reserva")
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const on = (e: Event) => {
            const d = (e as CustomEvent<{ group: string; name: string }>).detail;
            const k = `${d.group}||${d.name}`;
            if (!p.offers.some((o) => key(o) === k)) return;
            if (food) setQty((q) => ({ ...q, [k]: Math.min(20, (q[k] ?? 0) + 1) }));
            else setPick(k);
            setFlash(food ? `✓ ${d.name} adicionado ao pedido` : `✓ ${d.name} selecionado`);
            clearTimeout(timer);
            timer = setTimeout(() => setFlash(""), 4000);
        };
        window.addEventListener(ORDER_ADD_EVENT, on);
        return () => { window.removeEventListener(ORDER_ADD_EVENT, on); clearTimeout(timer); };
    }, [p.offers, food]);

    if (p.who === "guest") {
        return (
            <div className="rounded-2xl border border-[#0b1220]/10 bg-[#f6f8fc] p-4 text-sm">
                <p>{food ? "Entre na sua conta Riendzo para fazer um pedido a este restaurante." : "Entre na sua conta Riendzo para pedir uma reserva."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/conta/entrar?next=${encodeURIComponent(p.next)}`} className="rounded-full bg-[#0054b5] px-4 py-2 font-medium text-white hover:opacity-90">Entrar</Link>
                    <Link href={`/conta/registar?next=${encodeURIComponent(p.next)}`} className="rounded-full border border-[#0b1220]/20 px-4 py-2 hover:bg-white">Criar conta grátis</Link>
                </div>
            </div>
        );
    }
    if (p.who === "free" && !food) return <Upsell><p>As <b>reservas de alojamento e viaturas</b> são para membros Premium, com acompanhamento do pedido em tempo real.</p></Upsell>;
    if (p.who === "free" && p.freeLeft <= 0) return <Upsell><p>Já usou os seus <b>{p.freeLimit} pedidos gratuitos</b>. Subscreva o Premium para continuar a pedir e acompanhar cada pedido em tempo real.</p></Upsell>;

    return (
        <form action={action} className="space-y-5">
            <input type="hidden" name="collection" value={p.collection} />
            <input type="hidden" name="slug" value={p.slug} />
            <input type="hidden" name="lines" value={JSON.stringify(lines)} />

            {p.who === "free" && (
                <p className="rounded-2xl bg-[#ffc14d]/25 px-4 py-3 text-xs text-[#6b4700]">
                    Conta gratuita: ainda pode fazer <b>{p.freeLeft} de {p.freeLimit}</b> pedidos. O restaurante vai <b>contactá-lo por telefone</b>. Com o <Link href="/conta/premium" className="font-medium underline">Premium</Link> acompanha o pedido em tempo real.
                </p>
            )}

            {flash && <p role="status" aria-live="polite" className="rounded-xl bg-[#2f9e44]/12 px-3 py-2 text-sm text-[#237a35]">{flash}</p>}

            {food ? (
                <div className="space-y-4">
                    {groups.map((g) => (
                        <div key={g}>
                            <h4 className="text-sm font-medium" style={{ color: p.color }}>{g}</h4>
                            <ul className="mt-2 divide-y divide-[#0b1220]/8 rounded-2xl border border-[#0b1220]/10">
                                {p.offers.filter((o) => o.group === g).map((o) => {
                                    const n = qty[key(o)] ?? 0;
                                    const set = (v: number) => setQty({ ...qty, [key(o)]: Math.max(0, Math.min(20, v)) });
                                    return (
                                        <li key={key(o)} className="flex items-center gap-3 px-3 py-2.5">
                                            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{o.name}</span>{typeof o.price === "number" && <span className="text-xs text-[#4b5568]">{money(o.price, p.currency)}</span>}</span>
                                            <span className="flex items-center gap-2">
                                                <button type="button" aria-label={`Menos ${o.name}`} disabled={n === 0} onClick={() => set(n - 1)} className="h-8 w-8 cursor-pointer rounded-full border border-[#0b1220]/20 disabled:opacity-30">−</button>
                                                <span className="w-5 text-center text-sm" aria-live="polite">{n}</span>
                                                <button type="button" aria-label={`Mais ${o.name}`} onClick={() => set(n + 1)} className="h-8 w-8 cursor-pointer rounded-full text-white" style={{ backgroundColor: p.color }}>+</button>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                    <fieldset className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium">Como quer receber?
                            <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)} className={input}>
                                {Object.entries(MODES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                            </select>
                        </label>
                        {mode === "delivery" && <label className="block text-xs font-medium">Endereço de entrega *<input name="address" maxLength={200} required className={input} /></label>}
                    </fieldset>
                </div>
            ) : (
                <div className="space-y-4">
                    <fieldset>
                        <legend className="text-sm font-medium">{p.kind === "lodging" ? "Escolha o quarto" : "Escolha a viatura"} *</legend>
                        <div className="mt-2 space-y-2">
                            {p.offers.map((o) => (
                                <label key={key(o)} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#0b1220]/10 px-3 py-2.5 has-[:checked]:border-[#0054b5] has-[:checked]:bg-[#f3f8ff]">
                                    <input type="radio" name="pick" value={key(o)} checked={pick === key(o)} onChange={() => setPick(key(o))} />
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{o.name}</span><span className="text-xs text-[#4b5568]">{o.group}</span></span>
                                    {typeof o.price === "number" && <span className="text-sm">{money(o.price, p.currency)}{o.priceNote ? <span className="text-xs text-[#4b5568]"> {o.priceNote}</span> : null}</span>}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <label className="block text-xs font-medium">{p.kind === "lodging" ? "Entrada" : "Levantar"} *<input type="date" name="from" required className={input} /></label>
                        <label className="block text-xs font-medium">{p.kind === "lodging" ? "Saída" : "Devolver"} *<input type="date" name="to" required className={input} /></label>
                        {p.kind === "lodging" && <label className="block text-xs font-medium">Hóspedes<input type="number" name="guests" min={1} max={30} defaultValue={2} className={input} /></label>}
                    </div>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">Telefone de contacto{p.who === "free" ? " *" : ""}
                    <input name="phone" type="tel" inputMode="tel" required={p.who === "free"} defaultValue={p.who === "free" ? p.phone : ""} placeholder={p.who === "free" ? "84 123 4567" : "Vazio = o do seu perfil"} maxLength={30} className={input} />
                </label>
                <label className="block text-xs font-medium">Nota (opcional)<input name="note" maxLength={500} placeholder={food ? "Ex.: sem picante" : "Ex.: chegada tardia"} className={input} /></label>
            </div>

            {total !== null && total > 0 && <p className="text-right text-sm">Total estimado: <b>{money(total, p.currency)}</b> <span className="text-xs text-[#4b5568]">(pago diretamente ao estabelecimento)</span></p>}
            {state.error && <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{state.error}</p>}
            <button type="submit" disabled={pending || lines.length === 0} className="w-full cursor-pointer rounded-full px-5 py-3 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:w-auto" style={{ backgroundColor: p.color }}>
                {pending ? "A enviar…" : food ? `Enviar pedido${lines.length ? ` (${lines.reduce((n, l) => n + l.qty, 0)})` : ""}` : "Pedir reserva"}
            </button>
        </form>
    );
}
