"use client";

import { useState, useTransition } from "react";
import { saveListAction } from "../actions";
import type { ListDef, ListItem } from "@/lib/cms/lists-defaults";
import { slugify } from "@/lib/cms/validate";
import { inputClass } from "./fields";

const DISTINCT = new Set(["music-genres", "recipe-categories"]); // value and name are different things
const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs font-medium hover:bg-[#0b1220]/5 disabled:opacity-30";

export default function ListsManager({ lists }: { lists: ListDef[] }) {
    const [sel, setSel] = useState(lists[0]?.id ?? "");
    const [data, setData] = useState<Record<string, ListItem[]>>(() => Object.fromEntries(lists.map((l) => [l.id, l.items])));
    const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
    const [pending, start] = useTransition();
    const [q, setQ] = useState("");

    const cur = lists.find((l) => l.id === sel)!;
    const items = data[sel] ?? [];
    const distinct = DISTINCT.has(sel);
    const groups = [...new Set(lists.map((l) => l.group))];
    const set = (next: ListItem[]) => setData((d) => ({ ...d, [sel]: next }));
    const swap = (i: number, j: number) => { const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; set(n); };

    return (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <aside className="space-y-4">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar listas…" aria-label="Filtrar listas" className={inputClass} />
                {groups.map((g) => {
                    const ls = lists.filter((l) => l.group === g && l.label.toLowerCase().includes(q.toLowerCase()));
                    if (!ls.length) return null;
                    return (
                        <div key={g}>
                            <p className="mb-1 px-2 text-[10px] font-montserrat-italic uppercase tracking-[0.18em] text-[#5b6478]">{g}</p>
                            {ls.map((l) => (
                                <button key={l.id} type="button" onClick={() => { setSel(l.id); setMsg({}); }} className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${l.id === sel ? "bg-[#0054b5] text-white" : "hover:bg-[#eef2f8]"}`}>
                                    <span className="truncate">{l.label}</span><span className="text-xs opacity-70">{(data[l.id] ?? []).length}</span>
                                </button>
                            ))}
                        </div>
                    );
                })}
            </aside>

            <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
                <h2 className="font-baloo text-2xl font-bold">{cur.label}</h2>
                <p className="mt-1 text-sm text-[#4b5568]">{cur.description}</p>
                {!distinct && <p className="mt-3 rounded-xl bg-[#ffc14d]/20 p-3 text-xs text-[#6b4700]">Estes valores são escolhidos nos formulários. Renomear ou remover um valor não altera os conteúdos que já o usam.</p>}

                <ul className="mt-5 space-y-2">
                    {items.map((it, i) => (
                        <li key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_auto]">
                            <div className={`grid gap-2 ${distinct ? "sm:grid-cols-[1fr_10rem_3rem]" : ""}`}>
                                <input className={inputClass} value={it.label} aria-label="Nome" onChange={(e) => set(items.map((x, n) => (n === i ? { ...x, label: e.target.value, value: distinct ? x.value : e.target.value } : x)))} />
                                {distinct && <input className={`${inputClass} font-mono text-xs`} value={it.value} aria-label="Valor interno" readOnly={Boolean(lists.find((l) => l.id === sel)?.items.some((o) => o.value === it.value))} onChange={(e) => set(items.map((x, n) => (n === i ? { ...x, value: slugify(e.target.value) } : x)))} />}
                                {distinct && sel === "music-genres" && <input type="color" aria-label="Cor" value={it.color ?? "#0054b5"} onChange={(e) => set(items.map((x, n) => (n === i ? { ...x, color: e.target.value } : x)))} className="h-10 w-12 cursor-pointer rounded-lg border border-[#0b1220]/15" />}
                            </div>
                            <span className="flex gap-1.5">
                                <button type="button" className={small} disabled={i === 0} onClick={() => swap(i, i - 1)} aria-label="Subir">↑</button>
                                <button type="button" className={small} disabled={i === items.length - 1} onClick={() => swap(i, i + 1)} aria-label="Descer">↓</button>
                                <button type="button" className={small} onClick={() => set(items.filter((_, n) => n !== i))} aria-label="Remover">✕</button>
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button type="button" className={small} onClick={() => set([...items, { value: "", label: "" }])}>+ Adicionar</button>
                    <button type="button" disabled={pending} onClick={() => start(async () => {
                        const prepared = items.map((i) => ({ ...i, value: (i.value || (distinct ? slugify(i.label) : i.label)).trim() })).filter((i) => i.label.trim());
                        setMsg(await saveListAction(sel, prepared));
                    })} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar lista"}</button>
                    {msg.ok && <span role="status" className="text-sm text-[#237a35]">{msg.ok}</span>}
                    {msg.error && <span role="alert" className="text-sm text-[#b5311d]">{msg.error}</span>}
                </div>
            </section>
        </div>
    );
}
