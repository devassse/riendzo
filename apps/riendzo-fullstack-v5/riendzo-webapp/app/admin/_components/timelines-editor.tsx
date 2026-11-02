"use client";

import { useState, useTransition } from "react";
import { saveTimelineAction } from "../actions";

type Ev = { year: string; text: string };
type Era = { id: string; label: string; events: Ev[] };
const input = "w-full rounded-xl border border-[#0b1220]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#0370d6]";
const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs hover:bg-[#0b1220]/5 disabled:opacity-40";

export default function TimelinesEditor({ eras }: { eras: Era[] }) {
    return <div className="space-y-6">{eras.map((e) => <One key={e.id} era={e} />)}</div>;
}

function One({ era }: { era: Era }) {
    const [list, setList] = useState<Ev[]>(era.events);
    const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
    const [pending, start] = useTransition();
    const patch = (i: number, p: Partial<Ev>) => setList((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)));
    const move = (i: number, d: -1 | 1) => setList((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j], n[i]]; return n; });
    return (
        <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
            <h2 className="font-baloo text-xl font-bold">{era.label}</h2>
            <p className="mb-4 text-xs text-[#5b6478]">Aparece como “fita do tempo” no topo da página. A ordem é a que definir aqui (de cima para baixo = da esquerda para a direita).</p>
            <ol className="space-y-2">
                {list.map((ev, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-2 rounded-2xl bg-[#f8fafd] p-3">
                        <input aria-label="Ano" className={`${input} !w-32`} value={ev.year} maxLength={20} placeholder="Ano" onChange={(e) => patch(i, { year: e.target.value })} />
                        <textarea aria-label="Acontecimento" rows={2} className={`${input} min-w-[14rem] flex-1`} value={ev.text} maxLength={300} placeholder="O que aconteceu" onChange={(e) => patch(i, { text: e.target.value })} />
                        <span className="flex gap-1.5">
                            <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">↑</button>
                            <button type="button" className={small} disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Descer">↓</button>
                            <button type="button" className={`${small} text-[#b5311d]`} onClick={() => setList((l) => l.filter((_, j) => j !== i))} aria-label="Remover">✕</button>
                        </span>
                    </li>
                ))}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" disabled={list.length >= 40} className={small} onClick={() => setList((l) => [...l, { year: "", text: "" }])}>+ Adicionar acontecimento</button>
                <button type="button" disabled={pending} onClick={() => start(async () => setMsg(await saveTimelineAction(era.id, list)))} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar"}</button>
                {msg.ok && <span role="status" className="text-sm text-[#237a35]">{msg.ok}</span>}
                {msg.error && <span role="alert" className="text-sm text-[#b5311d]">{msg.error}</span>}
            </div>
        </section>
    );
}
