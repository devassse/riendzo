"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addManyTerritoriesAction, deleteTerritoryAction, saveTerritoryAction } from "../actions";
import { TERRITORY_KINDS, childrenOf, descendantsOf, isProvinceParent, kindOf, provinceParent, type Territory, type TerritoryKind } from "@/lib/cms/territory-types";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#0370d6]";
const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs hover:bg-[#0b1220]/5 disabled:opacity-40";
const empty = { id: "", kind: "distrito" as TerritoryKind, name: "", parent: "", population: "", area: "", seat: "", notes: "" };

export default function TerritoriesManager({ all, provinces }: { all: Territory[]; provinces: { id: string; name: string }[] }) {
    const router = useRouter();
    const [prov, setProv] = useState(provinces[0].id);
    const [f, setF] = useState({ ...empty, parent: provinceParent(provinces[0].id) });
    const [bulk, setBulk] = useState("");
    const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
    const [pending, start] = useTransition();

    const root = provinceParent(prov);
    const inProv = useMemo(() => descendantsOf(all, root), [all, root]);
    const k = kindOf(f.kind)!;

    // possible parents for the chosen kind: the province itself (if allowed) and the territories of this province of an allowed kind
    const parents = useMemo(() => {
        const list: { value: string; label: string }[] = [];
        if (k.parents.includes("province")) list.push({ value: root, label: `Província: ${provinces.find((p) => p.id === prov)?.name}` });
        const walk = (p: string, depth: number) => childrenOf(all, p).forEach((t) => {
            if (k.parents.includes(t.kind) && t.id !== f.id) list.push({ value: t.id, label: `${"— ".repeat(depth)}${kindOf(t.kind)!.label}: ${t.name}` });
            if (t.id !== f.id) walk(t.id, depth + 1);
        });
        walk(root, 0);
        return list;
    }, [all, root, k, f.id, prov, provinces]);

    const run = (fn: () => Promise<{ ok?: string; error?: string }>, after?: () => void) =>
        start(async () => { const r = await fn(); setMsg(r); if (r.ok) { after?.(); router.refresh(); } });

    const reset = (p = prov) => setF({ ...empty, kind: f.kind, parent: provinceParent(p) });
    const pickProvince = (id: string) => { setProv(id); setMsg({}); setF({ ...empty, kind: "distrito", parent: provinceParent(id) }); };
    const edit = (t: Territory) => setF({ id: t.id, kind: t.kind, name: t.name, parent: t.parent, population: t.population?.toString() ?? "", area: t.area?.toString() ?? "", seat: t.seat ?? "", notes: t.notes ?? "" });
    const validParent = parents.some((p) => p.value === f.parent);

    return (
        <div className="space-y-6">
            <nav aria-label="Províncias" className="flex flex-wrap gap-2">
                {provinces.map((p) => {
                    const n = descendantsOf(all, provinceParent(p.id)).length;
                    return <button key={p.id} type="button" onClick={() => pickProvince(p.id)} aria-pressed={p.id === prov} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${p.id === prov ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0b1220]/15 bg-white hover:bg-[#0b1220]/5"}`}>{p.name}{n > 0 && <span className="ml-1.5 text-xs opacity-80">({n})</span>}</button>;
                })}
            </nav>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
                <div className="space-y-4">
                    <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                        <h2 className="font-baloo text-lg font-bold">{f.id ? "Editar" : "Registar"}</h2>
                        <div className="mt-3 grid gap-3">
                            <label className="block text-xs font-medium">Tipo<select className={input} value={f.kind} onChange={(e) => { const kind = e.target.value as TerritoryKind; const ok = kindOf(kind)!.parents.includes("province"); setF({ ...f, kind, parent: ok ? root : "" }); }}>{TERRITORY_KINDS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
                            <label className="block text-xs font-medium">Pertence a <span className="text-[#d23b25]">*</span>
                                <select className={`${input} ${!validParent ? "!border-[#d23b25]" : ""}`} value={validParent ? f.parent : ""} onChange={(e) => setF({ ...f, parent: e.target.value })}>
                                    <option value="">Escolha…</option>
                                    {parents.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                                {parents.length === 0 && <span className="mt-1 block text-[11px] text-[#b5311d]">Registe primeiro: {k.parents.filter((x) => x !== "province").map((x) => kindOf(x as TerritoryKind)!.plural.toLowerCase()).join(" ou ")}.</span>}
                            </label>
                            <label className="block text-xs font-medium">Nome <span className="text-[#d23b25]">*</span><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={80} /></label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block text-xs font-medium">População<input className={input} inputMode="numeric" value={f.population} onChange={(e) => setF({ ...f, population: e.target.value })} placeholder="opcional" /></label>
                                <label className="block text-xs font-medium">Área (km²)<input className={input} inputMode="numeric" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} placeholder="opcional" /></label>
                            </div>
                            <label className="block text-xs font-medium">Sede<input className={input} value={f.seat} onChange={(e) => setF({ ...f, seat: e.target.value })} placeholder="opcional" maxLength={80} /></label>
                            <label className="block text-xs font-medium">Notas<textarea rows={2} className={input} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="opcional" maxLength={600} /></label>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" disabled={pending || !validParent} onClick={() => run(() => saveTerritoryAction({ ...f, id: f.id || undefined }), () => reset())} className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">{pending ? "A guardar…" : f.id ? "Guardar alterações" : "Registar"}</button>
                            {f.id && <button type="button" className={small} onClick={() => reset()}>Cancelar</button>}
                        </div>
                        {msg.ok && <p role="status" className="mt-3 text-sm text-[#237a35]">{msg.ok}</p>}
                        {msg.error && <p role="alert" className="mt-3 text-sm text-[#b5311d]">{msg.error}</p>}
                    </section>

                    <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                        <h2 className="font-baloo text-lg font-bold">Adicionar vários de uma vez</h2>
                        <p className="text-xs text-[#5b6478]">Usa o <b>tipo</b> e o <b>“Pertence a”</b> escolhidos acima. Um nome por linha (opcional: <code>Nome; população</code>).</p>
                        <textarea rows={5} className={input} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Boane\nMarracuene; 125000\nMatola"} />
                        <button type="button" disabled={pending || !bulk.trim() || !validParent} className={`${small} mt-2`} onClick={() => run(() => addManyTerritoriesAction(f.kind, f.parent, bulk), () => setBulk(""))}>Adicionar lista</button>
                    </section>
                </div>

                <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                    <h2 className="font-baloo text-lg font-bold">{provinces.find((p) => p.id === prov)?.name} <span className="text-sm font-normal text-[#5b6478]">({inProv.length})</span></h2>
                    {inProv.length === 0 ? <p className="mt-3 text-sm text-[#5b6478]">Ainda nada registado. Comece por registar os distritos.</p> : <Tree all={all} parent={root} depth={0} onEdit={edit} onDelete={(t) => { if (confirm(`Eliminar “${t.name}”?`)) run(() => deleteTerritoryAction(t.id)); }} pending={pending} />}
                </section>
            </div>
        </div>
    );
}

function Tree({ all, parent, depth, onEdit, onDelete, pending }: { all: Territory[]; parent: string; depth: number; onEdit: (t: Territory) => void; onDelete: (t: Territory) => void; pending: boolean }) {
    const kids = childrenOf(all, parent);
    if (!kids.length) return null;
    return (
        <ul className={depth ? "ml-4 border-l border-[#0054b5]/20 pl-3" : "mt-3"}>
            {kids.map((t) => (
                <li key={t.id} className="py-1">
                    <div className="flex flex-wrap items-center gap-2 rounded-xl px-2 py-1 hover:bg-[#f3f6fb]">
                        <span aria-hidden="true">{kindOf(t.kind)!.emoji}</span>
                        <span className="text-sm font-medium">{t.name}</span>
                        <span className="text-[11px] text-[#5b6478]">{kindOf(t.kind)!.label}{t.population ? ` · ${t.population.toLocaleString("pt-PT")} hab.` : ""}</span>
                        <span className="ml-auto flex gap-1.5"><button type="button" className={small} onClick={() => onEdit(t)}>Editar</button><button type="button" disabled={pending} className={`${small} text-[#b5311d]`} onClick={() => onDelete(t)}>Eliminar</button></span>
                    </div>
                    <Tree all={all} parent={t.id} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} pending={pending} />
                </li>
            ))}
        </ul>
    );
}
void isProvinceParent;
