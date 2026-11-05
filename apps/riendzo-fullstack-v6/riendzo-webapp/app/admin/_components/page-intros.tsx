"use client";

import { useState, useTransition } from "react";
import { savePageIntroAction } from "../actions";

type Row = { id: string; label: string; hint: string; title: string; story: string };
const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";

export default function PageIntros({ rows }: { rows: Row[] }) {
    return <div className="space-y-6">{rows.map((r) => <One key={r.id} row={r} />)}</div>;
}

function One({ row }: { row: Row }) {
    const [title, setTitle] = useState(row.title);
    const [story, setStory] = useState(row.story);
    const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
    const [pending, start] = useTransition();
    return (
        <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
            <h2 className="font-baloo text-xl font-bold">{row.label}</h2>
            <p className="mb-4 text-xs text-[#5b6478]">{row.hint}</p>
            <label className="block text-xs font-medium">Título<input className={input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></label>
            <label className="mt-4 block text-xs font-medium">Pequena história<textarea rows={8} className={input} value={story} onChange={(e) => setStory(e.target.value)} maxLength={4000} /></label>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" disabled={pending} onClick={() => start(async () => setMsg(await savePageIntroAction(row.id, title, story)))} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar"}</button>
                {msg.ok && <span role="status" className="text-sm text-[#237a35]">{msg.ok}</span>}
                {msg.error && <span role="alert" className="text-sm text-[#b5311d]">{msg.error}</span>}
            </div>
        </section>
    );
}
