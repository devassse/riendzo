"use client";

import { useActionState, useState } from "react";
import { approveSuggestionAction, rejectSuggestionAction, type ReviewState } from "../place-review-actions";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";
const card = "rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm";
const hint = "mt-1 text-[11px] text-[#5b6478]";
const Err = ({ s }: { s: ReviewState }) => (s.error ? <p role="alert" className="rounded-xl bg-[#e5533d]/10 px-3 py-2 text-sm text-[#b5311d]">{s.error}</p> : null);

type Place = { id: string; name: string; kind: string; province: string; address: string; coords: string; description: string; phone: string; website: string; photos: string[] };
type Col = { id: string; label: string; categories: { value: string; label: string }[] };

/** First sentence(s) of the description, as the starting point for the short summary. */
const summaryFrom = (t: string) => {
    const s = t.replace(/\s+/g, " ").trim();
    if (s.length <= 180) return s;
    const cut = s.slice(0, 180);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
    return end > 60 ? cut.slice(0, end + 1) : `${cut.replace(/\s+\S*$/, "")}…`;
};

export default function SuggestionReview({ place, defaultCollection, collections, provinces }: { place: Place; defaultCollection: string; collections: Col[]; provinces: string[] }) {
    const [ok, approve, approving] = useActionState<ReviewState, FormData>(approveSuggestionAction, {});
    const [ko, reject, rejecting] = useActionState<ReviewState, FormData>(rejectSuggestionAction, {});
    const [collection, setCollection] = useState(defaultCollection);
    const cats = collections.find((c) => c.id === collection)?.categories ?? [];

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <form action={approve} className={`${card} space-y-5`}>
                <input type="hidden" name="id" value={place.id} />
                <div>
                    <h2 className="font-baloo text-xl font-bold">Ajustar e publicar</h2>
                    <p className="mt-1 text-sm text-[#4b5568]">Corrija o que for preciso. O que está aqui é o que vai ser publicado; o texto original do membro não se altera.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Publicar em *
                        <select name="collection" value={collection} onChange={(e) => setCollection(e.target.value)} className={input}>
                            {collections.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </label>
                    <label className="block text-xs font-medium">Província *
                        <select name="province" defaultValue={place.province} required className={input}>
                            <option value="" disabled>Escolha…</option>
                            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Título *<input name="title" defaultValue={place.name} required maxLength={160} className={input} /></label>
                    <label className="block text-xs font-medium">Endereço na web (slug)<input name="slug" placeholder="gerado a partir do título" maxLength={120} className={input} /></label>
                </div>

                <fieldset>
                    <legend className="text-xs font-medium">Categorias * <span className="font-normal text-[#5b6478]">(pelo menos uma)</span></legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {cats.map((c) => (
                            <label key={`${collection}-${c.value}`} className="cursor-pointer">
                                <input type="checkbox" name="categories" value={c.value} className="peer sr-only" />
                                <span className="inline-block rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs transition-colors peer-checked:border-[#0054b5] peer-checked:bg-[#0054b5] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2">{c.label}</span>
                            </label>
                        ))}
                        {cats.length === 0 && <span className="text-xs text-[#5b6478]">Este menu ainda não tem categorias: escreva uma abaixo.</span>}
                    </div>
                    <input name="newCategories" placeholder="Outras categorias, separadas por vírgula" className={input} />
                </fieldset>

                <label className="block text-xs font-medium">Resumo curto * <span className="font-normal text-[#5b6478]">(aparece nos cartões)</span>
                    <textarea name="summary" rows={2} maxLength={600} defaultValue={summaryFrom(place.description)} required className={input} />
                </label>
                <label className="block text-xs font-medium">Descrição completa
                    <textarea name="description" rows={7} maxLength={4000} defaultValue={place.description} className={input} />
                    <span className={hint}>Separe os parágrafos com uma linha em branco.</span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Endereço<input name="address" defaultValue={place.address} maxLength={200} className={input} /></label>
                    <label className="block text-xs font-medium">Coordenadas ou link do mapa<input name="coords" defaultValue={place.coords} className={input} /></label>
                    <label className="block text-xs font-medium">Telefone<input name="phone" defaultValue={place.phone} maxLength={30} className={input} /></label>
                    <label className="block text-xs font-medium">Site<input name="website" defaultValue={place.website} maxLength={300} className={input} /></label>
                </div>

                {place.photos.length > 0 && (
                    <fieldset>
                        <legend className="text-xs font-medium">Fotografias a publicar</legend>
                        <div className="mt-2 flex flex-wrap gap-3">
                            {place.photos.map((p) => (
                                <label key={p} className="cursor-pointer">
                                    <input type="checkbox" name="photos" value={p} defaultChecked className="peer sr-only" />
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p} alt="" className="h-24 w-24 rounded-xl object-cover opacity-40 outline-2 outline-offset-2 outline-transparent transition peer-checked:opacity-100 peer-checked:outline-[#0054b5] peer-focus-visible:outline-[#0054b5]" />
                                </label>
                            ))}
                        </div>
                        <p className={hint}>As fotografias com contorno azul vão ser publicadas. Toque numa para a excluir.</p>
                    </fieldset>
                )}

                <label className="block text-xs font-medium">Nota para o membro <span className="font-normal text-[#5b6478]">(opcional, vai no e-mail)</span>
                    <input name="note" maxLength={500} placeholder="Ex.: Ajustámos a descrição e acrescentámos a categoria." className={input} />
                </label>

                <Err s={ok} />
                <button type="submit" disabled={approving} className="w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 sm:w-auto">{approving ? "A publicar…" : "✔ Aprovar e publicar"}</button>
                <p className={hint}>Depois de publicar pode acrescentar horários, galeria e mais no editor completo do conteúdo.</p>
            </form>

            <form action={reject} className={`${card} space-y-3 xl:self-start`}>
                <input type="hidden" name="id" value={place.id} />
                <h2 className="font-baloo text-lg font-bold">Não aprovar</h2>
                <p className="text-sm text-[#4b5568]">O membro recebe o motivo e pode ajustar o local e sugeri-lo outra vez.</p>
                <label className="block text-xs font-medium">Motivo *
                    <textarea name="reason" rows={4} maxLength={500} required placeholder="Ex.: Faltam fotografias e a localização exata." className={input} />
                </label>
                <Err s={ko} />
                <button type="submit" disabled={rejecting} className="w-full cursor-pointer rounded-full border border-[#d23b25] px-5 py-2.5 text-sm font-medium text-[#d23b25] hover:bg-[#fff5f3] disabled:opacity-60">{rejecting ? "A enviar…" : "Não aprovar"}</button>
            </form>
        </div>
    );
}
