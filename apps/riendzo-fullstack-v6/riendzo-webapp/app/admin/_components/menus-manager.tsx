"use client";

import { useState, useTransition } from "react";
import { saveMenuFlagsAction } from "../actions";

export type MenuSection = { id: string; label: string; emoji: string; links: { title: string; href: string }[] };

/** "Em breve" switches for menus and submenus of the public site. */
export default function MenusManager({ sections, initial }: { sections: MenuSection[]; initial: Record<string, boolean> }) {
    const [flags, setFlags] = useState(initial);
    const [msg, setMsg] = useState<{ ok?: string }>({});
    const [pending, start] = useTransition();
    const toggle = (k: string) => setFlags((f) => ({ ...f, [k]: !f[k] }));
    const Sw = ({ k, label }: { k: string; label: string }) => (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-[#eef2f8]">
            <span className="text-sm">{label}</span>
            <span className="flex items-center gap-2 text-xs text-[#5b6478]">{flags[k] ? <b className="rounded-full bg-[#f0a83a] px-2 py-0.5 text-[#3a2500]">BREVE</b> : "Disponível"}
                <input type="checkbox" role="switch" checked={Boolean(flags[k])} onChange={() => toggle(k)} className="h-5 w-9 cursor-pointer accent-[#0054b5]" aria-label={`Em breve: ${label}`} /></span>
        </label>
    );
    return (
        <div>
            <p className="mb-5 max-w-2xl text-sm text-[#4b5568]">Marque um menu ou submenu como <b>“Em breve”</b> enquanto trabalha no conteúdo. No site público fica com a etiqueta BREVE e deixa de ser clicável. Se marcar um menu inteiro, todos os submenus ficam em breve.</p>
            <div className="grid gap-5 md:grid-cols-2">
                {sections.map((s) => (
                    <section key={s.id} className="rounded-3xl border border-[#0b1220]/8 bg-white p-4 shadow-sm">
                        <div className="rounded-xl bg-[#f3f6fb]"><Sw k={s.id} label={`${s.emoji} ${s.label} (menu todo)`} /></div>
                        <div className="mt-2">{s.links.map((l) => <Sw key={l.href} k={l.href} label={l.title} />)}</div>
                    </section>
                ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
                <button disabled={pending} onClick={() => start(async () => setMsg(await saveMenuFlagsAction(flags)))} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar"}</button>
                {msg.ok && <span role="status" className="text-sm text-[#237a35]">{msg.ok}</span>}
            </div>
        </div>
    );
}
