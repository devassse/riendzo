"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { saveHomeAction, toggleHomeFlagAction } from "../actions";
import { EXPERIENCE_ICONS, type ExperienceRef, type HomeConfig } from "@/lib/cms/home-types";

export type PickOption = { value: string; label: string; group: string; image?: string; tag?: string };
export type FlagGroup = { id: string; label: string; emoji: string; collections: { id: string; label: string; on: { slug: string; title: string }[]; off: { slug: string; title: string }[] }[] };

const input = "mt-1 w-full rounded-xl border border-[#0b1220]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#0370d6]";
const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs hover:bg-[#0b1220]/5 disabled:opacity-40";

export default function HomeManager({ initial, options, max, flags }: { initial: HomeConfig; options: PickOption[]; max: number; flags: FlagGroup[] }) {
    const [refs, setRefs] = useState<ExperienceRef[]>(initial.experiences);
    const [heading, setHeading] = useState(initial.heading ?? {});
    const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
    const [pending, start] = useTransition();
    const [uploading, setUploading] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const uploadFor = useRef(0);

    const byKey = new Map(options.map((o) => [o.value, o]));
    const groups = [...new Set(options.map((o) => o.group))];
    const patch = (i: number, p: Partial<ExperienceRef>) => setRefs((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
    const move = (i: number, d: -1 | 1) => setRefs((r) => { const n = [...r]; const j = i + d; if (j < 0 || j >= n.length) return r; [n[i], n[j]] = [n[j], n[i]]; return n; });

    async function upload(f: File | undefined) {
        if (!f) return;
        const i = uploadFor.current;
        setUploading(i);
        const body = new FormData(); body.append("file", f);
        try {
            const r = await fetch("/api/admin/upload", { method: "POST", body });
            const d = await r.json();
            const url = d.files?.[0]?.url as string | undefined;
            if (url) patch(i, { image: url }); else setMsg({ error: d.errors?.[0] ?? d.error ?? "Falha no envio." });
        } catch { setMsg({ error: "Falha de ligação." }); } finally { setUploading(null); }
    }

    return (
        <div className="space-y-10">
            <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
                <h2 className="font-baloo text-xl font-bold">Experiências imperdíveis</h2>
                <p className="mb-5 text-sm text-[#4b5568]">Até {max} destaques no início da Home. Escolha entre o conteúdo registado; pode mudar os textos e a fotografia só para este cartão. Também pode usar o botão “Definir como uma das 6 experiências” dentro de cada lugar.</p>

                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <label className="block text-xs font-medium">Etiqueta do título<input className={input} value={heading.eyebrow ?? ""} onChange={(e) => setHeading({ ...heading, eyebrow: e.target.value })} placeholder="Explorar Moçambique (padrão)" /></label>
                    <label className="block text-xs font-medium">Título<input className={input} value={heading.title ?? ""} onChange={(e) => setHeading({ ...heading, title: e.target.value })} placeholder="6 experiências imperdíveis (padrão)" /></label>
                    <label className="block text-xs font-medium sm:col-span-3">Texto de apoio<textarea rows={2} className={input} value={heading.subtitle ?? ""} onChange={(e) => setHeading({ ...heading, subtitle: e.target.value })} placeholder="Deixe vazio para usar o texto padrão (traduzido em cada idioma)." /></label>
                    <p className="text-[11px] text-[#5b6478] sm:col-span-3">Se preencher estes três campos, o texto passa a ser igual em todos os idiomas. Deixe-os vazios para manter as traduções.</p>
                </div>

                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                <ol className="space-y-4">
                    {refs.map((r, i) => {
                        const key = `${r.collection}:${r.slug}`;
                        const opt = byKey.get(key);
                        return (
                            <li key={key + i} className="rounded-2xl border border-[#0b1220]/10 bg-[#f8fafd] p-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0054b5] text-xs font-bold text-white">{i + 1}</span>
                                    <select className={`${input} !mt-0 min-w-[14rem] flex-1`} value={key} onChange={(e) => { const [collection, ...rest] = e.target.value.split(":"); patch(i, { collection, slug: rest.join(":") }); }}>
                                        {!opt && <option value={key}>{key} (não encontrado)</option>}
                                        {groups.map((g) => (<optgroup key={g} label={g}>{options.filter((o) => o.group === g).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>))}
                                    </select>
                                    <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">↑</button>
                                    <button type="button" className={small} disabled={i === refs.length - 1} onClick={() => move(i, 1)} aria-label="Descer">↓</button>
                                    <button type="button" className={`${small} text-[#b5311d]`} onClick={() => setRefs((x) => x.filter((_, j) => j !== i))}>Retirar</button>
                                </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <label className="block text-[11px] font-medium lg:col-span-2">Título do cartão<input className={input} value={r.headline ?? ""} onChange={(e) => patch(i, { headline: e.target.value })} placeholder={opt?.label} /></label>
                                    <label className="block text-[11px] font-medium">Local<input className={input} value={r.location ?? ""} onChange={(e) => patch(i, { location: e.target.value })} placeholder={opt?.tag} /></label>
                                    <label className="block text-[11px] font-medium">Melhor época<input className={input} value={r.bestTime ?? ""} onChange={(e) => patch(i, { bestTime: e.target.value })} placeholder="Outubro a Março" /></label>
                                    <label className="block text-[11px] font-medium">Etiqueta<input className={input} value={r.tag ?? ""} onChange={(e) => patch(i, { tag: e.target.value })} placeholder="Mergulho" /></label>
                                    <label className="block text-[11px] font-medium">Ícone<select className={input} value={r.icon ?? ""} onChange={(e) => patch(i, { icon: (e.target.value || undefined) as ExperienceRef["icon"] })}><option value="">Automático</option>{EXPERIENCE_ICONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
                                    <div className="sm:col-span-2">
                                        <p className="text-[11px] font-medium">Fotografia</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            {(r.image ?? opt?.image) /* eslint-disable-next-line @next/next/no-img-element */ && <img src={r.image ?? opt?.image} alt="" className="h-10 w-14 rounded-lg object-cover" />}
                                            <button type="button" className={small} disabled={uploading === i} onClick={() => { uploadFor.current = i; fileRef.current?.click(); }}>{uploading === i ? "A enviar…" : "Carregar do dispositivo"}</button>
                                            {r.image && <button type="button" className={small} onClick={() => patch(i, { image: undefined })}>Usar a do conteúdo</button>}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" disabled={refs.length >= max || options.length === 0} className={small} onClick={() => { const o = options.find((x) => !refs.some((r) => `${r.collection}:${r.slug}` === x.value)); if (o) { const [collection, ...rest] = o.value.split(":"); setRefs([...refs, { collection, slug: rest.join(":") }]); } }}>+ Adicionar experiência ({refs.length}/{max})</button>
                    <button type="button" disabled={pending} onClick={() => start(async () => setMsg(await saveHomeAction(refs, heading)))} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar Home"}</button>
                    {msg.ok && <span role="status" className="text-sm text-[#237a35]">{msg.ok}</span>}
                    {msg.error && <span role="alert" className="text-sm text-[#b5311d]">{msg.error}</span>}
                </div>
            </section>

            {flags.map((g) => <FlagSection key={g.id} group={g} />)}
        </div>
    );
}

function FlagSection({ group }: { group: FlagGroup }) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState("");
    const act = (collection: string, slug: string, on: boolean) => start(async () => { const r = await toggleHomeFlagAction(collection, slug, on); setErr(r.error ?? ""); window.location.reload(); });
    return (
        <section className="rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm">
            <h2 className="font-baloo text-xl font-bold">{group.emoji} {group.label}: o que aparece na Home</h2>
            <p className="mb-4 text-sm text-[#4b5568]">Cada conteúdo com “Mostrar na Home” ligado aparece na secção correspondente. Também pode ligar dentro de cada conteúdo.</p>
            {err && <p role="alert" className="mb-3 text-sm text-[#b5311d]">{err}</p>}
            <div className="grid gap-4 lg:grid-cols-2">
                {group.collections.map((c) => (
                    <div key={c.id} className="rounded-2xl bg-[#f8fafd] p-4">
                        <div className="flex items-center justify-between"><h3 className="font-baloo text-base font-medium">{c.label}</h3><Link href={`/admin/c/${c.id}`} className="text-xs text-[#0054b5] hover:underline">Abrir menu</Link></div>
                        <ul className="mt-2 space-y-1">
                            {c.on.length === 0 && <li className="text-xs text-[#5b6478]">Nada na Home.</li>}
                            {c.on.map((i) => (
                                <li key={i.slug} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-1.5 text-sm"><span className="truncate">{i.title}</span><button type="button" disabled={pending} className="cursor-pointer text-xs text-[#b5311d] hover:underline" onClick={() => act(c.id, i.slug, false)}>Retirar</button></li>
                            ))}
                        </ul>
                        {c.off.length > 0 && (
                            <select className={input} value="" disabled={pending} onChange={(e) => e.target.value && act(c.id, e.target.value, true)} aria-label={`Adicionar a ${c.label}`}>
                                <option value="">+ Mostrar na Home…</option>
                                {c.off.map((i) => <option key={i.slug} value={i.slug}>{i.title}</option>)}
                            </select>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
