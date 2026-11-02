"use client";

import { useState, useTransition } from "react";
import { saveHistoryThemeAction } from "../actions";

type Row = { id: string; label: string; fallback: string; value: string };

export default function HistoryTheme({ sections }: { sections: Row[] }) {
    const [vals, setVals] = useState<Record<string, string>>(Object.fromEntries(sections.map((s) => [s.id, s.value])));
    const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
    const [pending, start] = useTransition();
    return (
        <div className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
            <ul className="space-y-4">
                {sections.map((s) => {
                    const v = vals[s.id];
                    return (
                        <li key={s.id} className="flex flex-wrap items-center gap-3">
                            <span className="h-12 w-20 flex-none rounded-xl border border-[#0b1220]/15" style={{ backgroundColor: v || s.fallback }} aria-hidden="true" />
                            <div className="min-w-[12rem] flex-1">
                                <p className="font-baloo text-base font-medium">{s.label}</p>
                                <p className="text-[11px] text-[#5b6478]">{v ? v : `Cor original (${s.fallback})`}</p>
                            </div>
                            <input type="color" aria-label={`Cor de ${s.label}`} value={v || s.fallback} onChange={(e) => setVals({ ...vals, [s.id]: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-[#0b1220]/15 bg-white p-1" />
                            <button type="button" disabled={!v} onClick={() => setVals({ ...vals, [s.id]: "" })} className="cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1.5 text-xs hover:bg-[#0b1220]/5 disabled:opacity-40">Repor original</button>
                        </li>
                    );
                })}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" disabled={pending} onClick={() => start(async () => setMsg(await saveHistoryThemeAction(vals)))} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar cores"}</button>
                {msg.ok && <span role="status" className="text-sm text-[#237a35]">{msg.ok}</span>}
                {msg.error && <span role="alert" className="text-sm text-[#b5311d]">{msg.error}</span>}
            </div>
        </div>
    );
}
