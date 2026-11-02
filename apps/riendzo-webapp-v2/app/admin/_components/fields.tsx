"use client";

import { useRef, useState } from "react";
import { SWATCHES } from "@/lib/cms/collections";

export const inputClass =
    "w-full rounded-xl border border-[#0b1220]/15 bg-white px-3.5 py-2.5 text-sm text-[#0b1220] outline-none transition-colors placeholder:text-[#5b6478]/70 focus:border-[#0370d6]";

export function Field({
    label, error, hint, children, className = "",
}: {
    label: string; error?: string; hint?: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-xs font-medium text-[#0b1220]">
                {label}
                <div className="mt-1.5 font-normal">{children}</div>
            </label>
            {hint && !error && <p className="mt-1 text-[11px] text-[#5b6478]">{hint}</p>}
            {error && <p role="alert" className="mt-1 text-[11px] font-medium text-[#d23b25]">{error}</p>}
        </div>
    );
}

export function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-3xl border border-[#0b1220]/10 bg-white p-5 sm:p-6">
            <h2 className="font-baloo text-lg font-medium text-[#0b1220]">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-[#5b6478]">{description}</p>}
            <div className="mt-4 space-y-4">{children}</div>
        </section>
    );
}

const smallBtn =
    "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs font-medium text-[#0b1220] transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30";

/* -------------------------------- Colour -------------------------------- */

export function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((c) => (
                <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => onChange(c)}
                    className="h-7 w-7 cursor-pointer rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: value === c ? "#0b1220" : "transparent" }}
                />
            ))}
            <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#00aefb"}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Outra cor"
                className="h-7 w-9 cursor-pointer rounded border border-[#0b1220]/15 bg-white p-0.5"
            />
            <span className="font-mono text-[11px] text-[#5b6478]">{value}</span>
        </div>
    );
}

/* --------------------------------- Chips -------------------------------- */

export function ChipsInput({
    value, onChange, suggestions = [], placeholder,
}: {
    value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string;
}) {
    const [draft, setDraft] = useState("");

    const add = (raw: string) => {
        const t = raw.trim();
        if (t && !value.includes(t)) onChange([...value, t]);
        setDraft("");
    };

    return (
        <div>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#0b1220]/15 bg-white p-2 focus-within:border-[#00aefb]">
                {value.map((chip) => (
                    <span key={chip} className="flex items-center gap-1 rounded-full bg-[#0b1220]/8 bg-[#eef1f6] px-2.5 py-1 text-xs">
                        {chip}
                        <button
                            type="button"
                            aria-label={`Remover ${chip}`}
                            onClick={() => onChange(value.filter((c) => c !== chip))}
                            className="cursor-pointer text-[#5b6478] hover:text-[#d23b25]"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            add(draft);
                        } else if (e.key === "Backspace" && !draft && value.length) {
                            onChange(value.slice(0, -1));
                        }
                    }}
                    onBlur={() => add(draft)}
                    placeholder={value.length ? "" : placeholder}
                    className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none"
                />
            </div>
            {suggestions.filter((s) => !value.includes(s)).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {suggestions.filter((s) => !value.includes(s)).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => add(s)}
                            className="cursor-pointer rounded-full border border-dashed border-[#0b1220]/20 px-2.5 py-0.5 text-[11px] text-[#5b6478] hover:border-[#0370d6] hover:text-[#0370d6]"
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------------------ Key / value ------------------------------ */

export type Fact = { label: string; value: string };

export function FactsEditor({ value, onChange }: { value: Fact[]; onChange: (v: Fact[]) => void }) {
    const set = (i: number, patch: Partial<Fact>) =>
        onChange(value.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

    return (
        <div className="space-y-2">
            {value.map((f, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <input className={inputClass} placeholder="Rótulo (ex.: Província)" value={f.label} onChange={(e) => set(i, { label: e.target.value })} />
                    <input className={inputClass} placeholder="Valor (ex.: Inhambane)" value={f.value} onChange={(e) => set(i, { value: e.target.value })} />
                    <button type="button" aria-label="Remover" className={smallBtn} onClick={() => onChange(value.filter((_, idx) => idx !== i))}>✕</button>
                </div>
            ))}
            <button type="button" className={smallBtn} disabled={value.length >= 10} onClick={() => onChange([...value, { label: "", value: "" }])}>
                + Adicionar facto
            </button>
        </div>
    );
}

/* -------------------------------- Blocks -------------------------------- */

export type BlockDraft = { kind: "list" | "steps" | "text" | "tags"; heading: string; text: string };

export function BlocksEditor({
    value, onChange, kinds,
}: {
    value: BlockDraft[]; onChange: (v: BlockDraft[]) => void; kinds: readonly { value: string; label: string }[];
}) {
    const set = (i: number, patch: Partial<BlockDraft>) =>
        onChange(value.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
    const move = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= value.length) return;
        const next = [...value];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {value.map((b, i) => (
                <div key={i} className="rounded-2xl border border-[#0b1220]/10 bg-[#f8f9fc] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={b.kind}
                            onChange={(e) => set(i, { kind: e.target.value as BlockDraft["kind"] })}
                            className={`${inputClass} !w-auto`}
                            aria-label="Tipo de bloco"
                        >
                            {kinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                        </select>
                        <input
                            className={`${inputClass} min-w-[10rem] flex-1`}
                            placeholder={b.kind === "text" ? "Título (opcional)" : "Título do bloco"}
                            value={b.heading}
                            onChange={(e) => set(i, { heading: e.target.value })}
                        />
                        <button type="button" className={smallBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">↑</button>
                        <button type="button" className={smallBtn} disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Descer">↓</button>
                        <button type="button" className={smallBtn} onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remover bloco">✕</button>
                    </div>
                    <textarea
                        rows={4}
                        className={`${inputClass} mt-2`}
                        placeholder={b.kind === "text" ? "Um parágrafo por linha" : "Um item por linha"}
                        value={b.text}
                        onChange={(e) => set(i, { text: e.target.value })}
                    />
                </div>
            ))}
            <button type="button" className={smallBtn} disabled={value.length >= 8} onClick={() => onChange([...value, { kind: "list", heading: "", text: "" }])}>
                + Adicionar bloco
            </button>
        </div>
    );
}

/* -------------------------------- Images -------------------------------- */

export function ImagesEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const [busy, setBusy] = useState(false);
    const [problems, setProblems] = useState<string[]>([]);
    const [url, setUrl] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    async function upload(files: FileList | null) {
        if (!files?.length) return;
        setBusy(true);
        setProblems([]);
        const body = new FormData();
        Array.from(files).forEach((f) => body.append("file", f));
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body });
            const data = await res.json();
            if (!res.ok) setProblems([data.error ?? "Falha no envio."]);
            else {
                onChange([...value, ...data.files.map((f: { url: string }) => f.url)]);
                setProblems(data.errors ?? []);
            }
        } catch {
            setProblems(["Falha de ligação durante o envio."]);
        } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    const move = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= value.length) return;
        const next = [...value];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };

    return (
        <div>
            {value.length > 0 && (
                <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {value.map((src, i) => (
                        <li key={src + i} className="overflow-hidden rounded-2xl border border-[#0b1220]/10 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-28 w-full object-cover" loading="lazy" />
                            <div className="flex items-center justify-between gap-1 p-2">
                                <span className="text-[10px] text-[#5b6478]">{i === 0 ? "Capa" : `#${i + 1}`}</span>
                                <span className="flex gap-1">
                                    <button type="button" className={smallBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para trás">←</button>
                                    <button type="button" className={smallBtn} disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Mover para a frente">→</button>
                                    <button type="button" className={smallBtn} onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remover imagem">✕</button>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
                <button type="button" className={smallBtn} disabled={busy || value.length >= 12} onClick={() => fileRef.current?.click()}>
                    {busy ? "A enviar…" : "⬆ Carregar imagens"}
                </button>
                <input className={`${inputClass} min-w-[12rem] flex-1`} placeholder="ou cole um endereço (https://… ou /home/foto.jpg)" value={url} onChange={(e) => setUrl(e.target.value)} />
                <button type="button" className={smallBtn} disabled={!url.trim()} onClick={() => { onChange([...value, url.trim()]); setUrl(""); }}>
                    Adicionar
                </button>
            </div>
            <p className="mt-1.5 text-[11px] text-[#5b6478]">JPG, PNG, WebP, GIF ou AVIF até 5 MB. A primeira imagem é a capa.</p>
            {problems.map((p) => <p key={p} className="mt-1 text-[11px] font-medium text-[#d23b25]">{p}</p>)}
        </div>
    );
}
