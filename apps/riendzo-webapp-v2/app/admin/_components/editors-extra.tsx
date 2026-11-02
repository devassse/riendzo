"use client";

import { useState } from "react";
import { DAYS, type CatalogContact, type CatalogVideo, type DayKey, type GeoPoint, type OfferGroup, type OfferItem, type OpeningHours } from "@/app/components/sections/catalog-types";
import { DAY_LABELS } from "@/lib/cms/hours";
import { inMozambique, osmEmbedUrl, parseCoordinates, validPoint, mapUrl } from "@/lib/cms/geo";
import { Field, ImagesEditor, inputClass } from "./fields";

const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs font-medium hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30";

/* ------------------------------ Opening hours ------------------------------ */

export function HoursEditor({ value, onChange }: { value: OpeningHours; onChange: (v: OpeningHours) => void }) {
    const setDay = (d: DayKey, ranges: { open: string; close: string }[]) => onChange({ ...value, [d]: ranges.length ? ranges : undefined });
    const copyMonToAll = () => {
        const base = value.mon ?? [];
        const next: OpeningHours = { ...value };
        DAYS.forEach((d) => { next[d] = base.map((r) => ({ ...r })); });
        onChange(next);
    };

    return (
        <div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value.open24h)} onChange={(e) => onChange({ ...value, open24h: e.target.checked || undefined })} /> Aberto 24 horas</label>
            {!value.open24h && (
                <div className="mt-3 space-y-2">
                    {DAYS.map((d) => {
                        const ranges = value[d] ?? [];
                        return (
                            <div key={d} className="grid grid-cols-[6rem_1fr] items-start gap-3">
                                <span className="pt-2 text-sm font-medium">{DAY_LABELS[d]}</span>
                                <div className="space-y-1.5">
                                    {ranges.length === 0 && <p className="pt-2 text-sm text-[#5b6478]">Fechado</p>}
                                    {ranges.map((r, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input type="time" aria-label={`${DAY_LABELS[d]}: abre`} value={r.open} onChange={(e) => setDay(d, ranges.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))} className={`${inputClass} !w-32`} />
                                            <span className="text-[#5b6478]">às</span>
                                            <input type="time" aria-label={`${DAY_LABELS[d]}: fecha`} value={r.close} onChange={(e) => setDay(d, ranges.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))} className={`${inputClass} !w-32`} />
                                            <button type="button" className={small} aria-label="Remover" onClick={() => setDay(d, ranges.filter((_, j) => j !== i))}>✕</button>
                                        </div>
                                    ))}
                                    <button type="button" className={small} disabled={ranges.length >= 3} onClick={() => setDay(d, [...ranges, { open: ranges.length ? "14:00" : "08:00", close: ranges.length ? "18:00" : "17:00" }])}>+ Horário</button>
                                </div>
                            </div>
                        );
                    })}
                    <button type="button" className={small} onClick={copyMonToAll}>Copiar o horário de segunda a todos os dias</button>
                </div>
            )}
            <Field label="Nota (opcional)" className="mt-4"><input className={inputClass} value={value.note ?? ""} onChange={(e) => onChange({ ...value, note: e.target.value || undefined })} placeholder="Ex.: Feriados: fechado" /></Field>
            <p className="mt-2 text-[11px] text-[#5b6478]">Hora de Moçambique. No site, “aberto” aparece a verde, “a fechar” (menos de 1 hora) a laranja e “fechado” a vermelho.</p>
        </div>
    );
}

/* --------------------------------- Location --------------------------------- */

export function LocationEditor({ value, onChange }: { value: { lat: string; lng: string }; onChange: (v: { lat: string; lng: string }) => void }) {
    const [paste, setPaste] = useState("");
    const [msg, setMsg] = useState("");
    const point: GeoPoint = { lat: Number(value.lat.replace(",", ".")), lng: Number(value.lng.replace(",", ".")) };
    const ok = value.lat !== "" && value.lng !== "" && validPoint(point);

    function fromPaste(v: string) {
        setPaste(v);
        const p = parseCoordinates(v);
        if (p) { onChange({ lat: String(p.lat), lng: String(p.lng) }); setMsg("Coordenadas encontradas."); } else if (v.trim()) setMsg("Não encontrei coordenadas nesse texto.");
    }
    function here() {
        if (!navigator.geolocation) { setMsg("O seu navegador não permite obter a localização."); return; }
        navigator.geolocation.getCurrentPosition(
            (p) => { onChange({ lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) }); setMsg("Localização atual aplicada."); },
            () => setMsg("Não foi possível obter a localização (permissão negada?).")
        );
    }

    return (
        <div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Latitude"><input inputMode="decimal" className={inputClass} value={value.lat} onChange={(e) => onChange({ ...value, lat: e.target.value })} placeholder="-25.969200" /></Field>
                <Field label="Longitude"><input inputMode="decimal" className={inputClass} value={value.lng} onChange={(e) => onChange({ ...value, lng: e.target.value })} placeholder="32.573200" /></Field>
            </div>
            <Field label="Colar um link do Google Maps (ou “lat, long”)" className="mt-4" hint="No Google Maps: clique com o botão direito no local e copie as coordenadas, ou cole o link da página.">
                <input className={inputClass} value={paste} onChange={(e) => fromPaste(e.target.value)} placeholder="https://www.google.com/maps/@-25.96,32.57,17z" />
            </Field>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" className={small} onClick={here}>📍 Usar a minha localização</button>
                {ok && <a href={mapUrl(point)} target="_blank" rel="noopener noreferrer" className={small}>Abrir no Google Maps ↗</a>}
                {value.lat && value.lng && <button type="button" className={small} onClick={() => onChange({ lat: "", lng: "" })}>Limpar</button>}
            </div>
            {msg && <p className="mt-2 text-xs text-[#0054b5]">{msg}</p>}
            {ok && !inMozambique(point) && <p className="mt-2 text-xs font-medium text-[#b5311d]">Atenção: estas coordenadas ficam fora de Moçambique. Confirme a latitude (sul é negativa) e a longitude.</p>}
            {ok && <iframe title="Pré-visualização do mapa" src={osmEmbedUrl(point)} loading="lazy" className="mt-4 h-48 w-full rounded-2xl border border-[#0b1220]/10" />}
            <p className="mt-2 text-[11px] text-[#5b6478]">As coordenadas permitem o botão “Como chegar” (direções no Google Maps) e o mapa na página.</p>
        </div>
    );
}

/* ----------------------------------- Offers ----------------------------------- */

const emptyItem = (): OfferItem => ({ name: "", available: true });

export function OffersEditor({ value, onChange, groupLabel, itemLabel }: { value: OfferGroup[]; onChange: (v: OfferGroup[]) => void; groupLabel: string; itemLabel: string }) {
    const setGroup = (gi: number, patch: Partial<OfferGroup>) => onChange(value.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
    const setItem = (gi: number, ii: number, patch: Partial<OfferItem>) => setGroup(gi, { items: value[gi].items.map((it, i) => (i === ii ? { ...it, ...patch } : it)) });
    const swap = <T,>(arr: T[], i: number, j: number) => { const n = [...arr]; [n[i], n[j]] = [n[j], n[i]]; return n; };

    return (
        <div className="space-y-5">
            {value.map((g, gi) => (
                <div key={gi} className="rounded-2xl border border-[#0b1220]/12 bg-[#f8f9fc] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <input className={`${inputClass} min-w-[12rem] flex-1 font-medium`} value={g.title} placeholder={`${groupLabel} (ex.: ${groupLabel === "Tipo de quarto" ? "Quartos duplos" : groupLabel === "Categoria" ? "4x4 e pickups" : "Pratos principais"})`} onChange={(e) => setGroup(gi, { title: e.target.value })} aria-label={groupLabel} />
                        <button type="button" className={small} disabled={gi === 0} onClick={() => onChange(swap(value, gi, gi - 1))} aria-label="Subir">↑</button>
                        <button type="button" className={small} disabled={gi === value.length - 1} onClick={() => onChange(swap(value, gi, gi + 1))} aria-label="Descer">↓</button>
                        <button type="button" className={small} onClick={() => window.confirm(`Remover “${g.title || groupLabel}” e tudo o que contém?`) && onChange(value.filter((_, i) => i !== gi))}>Remover secção</button>
                    </div>

                    <div className="mt-3 space-y-3">
                        {g.items.map((it, ii) => (
                            <div key={ii} className="rounded-xl border border-[#0b1220]/10 bg-white p-3">
                                <div className="grid gap-3 sm:grid-cols-[1fr_8rem_9rem]">
                                    <input className={inputClass} value={it.name} placeholder={`Nome do(a) ${itemLabel.toLowerCase()}`} onChange={(e) => setItem(gi, ii, { name: e.target.value })} aria-label="Nome" />
                                    <input className={inputClass} inputMode="decimal" value={it.price ?? ""} placeholder="Preço" onChange={(e) => setItem(gi, ii, { price: e.target.value === "" ? undefined : (e.target.value as unknown as number) })} aria-label="Preço" />
                                    <input className={inputClass} value={it.priceNote ?? ""} placeholder="por noite, por dia…" onChange={(e) => setItem(gi, ii, { priceNote: e.target.value })} aria-label="Nota do preço" />
                                </div>
                                <textarea rows={2} className={`${inputClass} mt-3`} value={it.description ?? ""} placeholder="Descrição" onChange={(e) => setItem(gi, ii, { description: e.target.value })} aria-label="Descrição" />
                                <input className={`${inputClass} mt-3`} value={(it.tags ?? []).join(", ")} placeholder="Ingredientes, comodidades ou características (separados por vírgulas)" onChange={(e) => setItem(gi, ii, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} aria-label="Etiquetas" />
                                <details className="mt-3">
                                    <summary className="cursor-pointer text-xs font-medium text-[#0054b5]">Fotografias ({it.images?.length ?? 0})</summary>
                                    <div className="mt-3"><ImagesEditor value={it.images ?? []} onChange={(images) => setItem(gi, ii, { images })} /></div>
                                </details>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={it.available !== false} onChange={(e) => setItem(gi, ii, { available: e.target.checked })} /> Disponível</label>
                                    <span className="flex gap-1.5">
                                        <button type="button" className={small} disabled={ii === 0} onClick={() => setGroup(gi, { items: swap(g.items, ii, ii - 1) })} aria-label="Subir">↑</button>
                                        <button type="button" className={small} disabled={ii === g.items.length - 1} onClick={() => setGroup(gi, { items: swap(g.items, ii, ii + 1) })} aria-label="Descer">↓</button>
                                        <button type="button" className={small} onClick={() => setGroup(gi, { items: g.items.filter((_, i) => i !== ii) })}>Remover</button>
                                    </span>
                                </div>
                            </div>
                        ))}
                        <button type="button" className={small} onClick={() => setGroup(gi, { items: [...g.items, emptyItem()] })}>+ Adicionar {itemLabel.toLowerCase()}</button>
                    </div>
                </div>
            ))}
            <button type="button" className={small} onClick={() => onChange([...value, { title: "", items: [emptyItem()] }])}>+ Adicionar {groupLabel.toLowerCase()}</button>
        </div>
    );
}

/* ------------------------------------ Videos ------------------------------------ */

export function VideosEditor({ value, onChange, creators }: { value: CatalogVideo[]; onChange: (v: CatalogVideo[]) => void; creators: string[] }) {
    const set = (i: number, patch: Partial<CatalogVideo>) => onChange(value.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
    return (
        <div className="space-y-2">
            <datalist id="creators-list">{creators.map((c) => <option key={c} value={c} />)}</datalist>
            {value.map((v, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1.2fr_1.5fr_1fr_auto]">
                    <input className={inputClass} placeholder="Título do vídeo" value={v.title} onChange={(e) => set(i, { title: e.target.value })} aria-label="Título" />
                    <input className={inputClass} placeholder="https://www.youtube.com/watch?v=…" value={v.url} onChange={(e) => set(i, { url: e.target.value })} aria-label="Link do YouTube" />
                    <input className={inputClass} list="creators-list" placeholder="Criador de conteúdo" value={v.creator ?? ""} onChange={(e) => set(i, { creator: e.target.value })} aria-label="Criador" />
                    <button type="button" className={small} onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remover">✕</button>
                </div>
            ))}
            <button type="button" className={small} disabled={value.length >= 12} onClick={() => onChange([...value, { title: "", url: "", creator: "" }])}>+ Adicionar vídeo</button>
            <p className="text-[11px] text-[#5b6478]">Use links do YouTube de criadores nacionais (cozinheiros, guias, viajantes…). Escolha o criador da lista ou escreva o nome.</p>
        </div>
    );
}

/* ----------------------------------- Contacts ----------------------------------- */

export function ContactEditor({ value, onChange, errors }: { value: CatalogContact; onChange: (v: CatalogContact) => void; errors: Record<string, string> }) {
    const f = (k: keyof CatalogContact, label: string, ph: string, hint?: string) => (
        <Field label={label} error={errors[k]} hint={hint}><input className={inputClass} value={value[k] ?? ""} placeholder={ph} onChange={(e) => onChange({ ...value, [k]: e.target.value })} /></Field>
    );
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {f("phone", "Telefone", "+258 84 123 4567")}
            {f("whatsapp", "WhatsApp", "258 84 123 4567", "Mostra o botão “WhatsApp” com mensagem pré-escrita.")}
            {f("email", "E-mail", "reservas@exemplo.co.mz")}
            {f("website", "Website", "https://…")}
            <div className="sm:col-span-2">{f("address", "Morada", "Av. 24 de Julho, Maputo")}</div>
            {f("facebook", "Facebook", "https://facebook.com/…")}
            {f("instagram", "Instagram", "https://instagram.com/…")}
        </div>
    );
}
