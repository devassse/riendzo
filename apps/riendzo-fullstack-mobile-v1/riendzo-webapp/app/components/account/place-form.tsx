"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { savePlaceAction, type PlaceState } from "@/app/actions/place-actions";
import { MAX_PHOTOS, PLACE_KINDS, type MemberPlace } from "@/lib/place-types";
import Req, { RequiredNote } from "@/app/components/utils/req";

const input = "mt-1.5 w-full rounded-xl border border-[#0b1220]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0370d6]";
const card = "rounded-3xl border border-[#0b1220]/8 bg-white p-6 shadow-sm";
const hint = "mt-1 text-[11px] text-[#5b6478]";

/** Big phone photos are shrunk in the browser (max 1600 px) before the upload. */
async function shrink(f: File): Promise<File> {
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size < 700_000) return f;
    try {
        const bmp = await createImageBitmap(f);
        const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.85));
        return blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : f;
    } catch {
        return f;
    }
}

export default function PlaceForm({ place, provinces }: { place?: MemberPlace; provinces: string[] }) {
    const [state, action, pending] = useActionState<PlaceState, FormData>(savePlaceAction, {});
    const [photos, setPhotos] = useState<string[]>(place?.photos ?? []);
    const [coords, setCoords] = useState(place?.location ? `${place.location.lat}, ${place.location.lng}` : "");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [gps, setGps] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    // React clears a form after a <form action> submit, even when saving fails. We submit by hand
    // instead, so everything the person typed stays in place and they only fix what is wrong.
    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const fd = new FormData(form);
        if (submitter?.name) fd.set(submitter.name, submitter.value);
        startTransition(() => action(fd));
    }
    // show the error where the buttons are (on phones the form is long)
    useEffect(() => { if (state.error) errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [state]);

    async function upload(files: FileList | null) {
        if (!files?.length) return;
        setBusy(true); setErr("");
        try {
            let next = [...photos];
            for (const original of Array.from(files)) {
                if (next.length >= MAX_PHOTOS) break;
                const body = new FormData(); body.append("file", await shrink(original));
                const r = await fetch("/api/conta/place-photo", { method: "POST", body });
                const d = await r.json().catch(() => ({}));
                if (r.ok) next = [...next, d.url]; else setErr(d.error ?? "Falha no envio.");
            }
            setPhotos(next);
        } catch { setErr("Falha de ligação."); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
    }

    function locateMe() {
        setGps("");
        if (!navigator.geolocation) { setGps("O seu navegador não permite obter a localização."); return; }
        setGps("A obter a localização…");
        navigator.geolocation.getCurrentPosition(
            (p) => { setCoords(`${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`); setGps("Localização preenchida. Confirme que está no local certo."); },
            () => setGps("Não foi possível obter a localização. Cole as coordenadas ou um link do Google Maps."),
            { enableHighAccuracy: true, timeout: 12_000 }
        );
    }

    return (
        <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            {(place?.id ?? state.id) && <input type="hidden" name="id" value={place?.id ?? state.id} />}
            {photos.map((p) => <input key={p} type="hidden" name="photos" value={p} />)}

            <div className={`${card} space-y-5`}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Nome do local<Req /><input name="name" required maxLength={100} defaultValue={place?.name} placeholder="Ex.: Praia do Tofo, Casa da avó…" className={input} /></label>
                    <label className="block text-xs font-medium">Tipo de local<Req />
                        <select name="kind" required defaultValue={place?.kind ?? ""} className={input}>
                            <option value="" disabled>Escolha…</option>
                            {PLACE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.emoji} {k.label}</option>)}
                        </select>
                    </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Província
                        <select name="province" defaultValue={place?.province ?? ""} className={input}>
                            <option value="">—</option>
                            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </label>
                    <label className="block text-xs font-medium">Endereço ou referência
                        <input name="address" maxLength={200} defaultValue={place?.address} placeholder="Rua, bairro, ponto de referência" className={input} />
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-medium">Coordenadas ou link do mapa
                        <input name="coords" value={coords} onChange={(e) => setCoords(e.target.value)} placeholder="-25.9692, 32.5732  ou  link do Google Maps" className={input} />
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={locateMe} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-1.5 text-xs font-medium hover:bg-[#eef2f8]">📍 Usar a minha localização atual</button>
                        {gps && <span className="text-[11px] text-[#5b6478]">{gps}</span>}
                    </div>
                    <p className={hint}>Estando no local, toque no botão. Ou, no Google Maps, toque longo no ponto, copie as coordenadas e cole aqui.</p>
                </div>

                <label className="block text-xs font-medium">Descrição
                    <textarea name="description" rows={5} maxLength={1500} defaultValue={place?.description} placeholder="O que é, porque vale a pena visitar, dicas para quem for…" className={input} />
                    <span className={hint}>É o texto que a equipa Riendzo usará se publicar o local (mínimo 20 caracteres para o sugerir).</span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium">Telefone<input name="phone" type="tel" maxLength={30} defaultValue={place?.phone} placeholder="84 123 4567" className={input} /></label>
                    <label className="block text-xs font-medium">Site ou página<input name="website" type="url" maxLength={300} defaultValue={place?.website} placeholder="https://…" className={input} /></label>
                </div>

                <div>
                    <p className="text-xs font-medium">Fotografias <span className="font-normal text-[#5b6478]">({photos.length}/{MAX_PHOTOS})</span></p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        {photos.map((p) => (
                            <div key={p} className="relative h-24 w-24 overflow-hidden rounded-xl bg-[#eef2f8]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p} alt="" className="h-full w-full object-cover" />
                                <button type="button" aria-label="Remover fotografia" onClick={() => setPhotos(photos.filter((x) => x !== p))} className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-xs text-white">✕</button>
                            </div>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <>
                                <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files)} />
                                <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#0b1220]/25 text-xs text-[#4b5568] hover:bg-[#eef2f8]">
                                    <span className="text-2xl" aria-hidden="true">＋</span>{busy ? "A enviar…" : "Adicionar"}
                                </button>
                            </>
                        )}
                    </div>
                    {err && <p role="alert" className="mt-2 text-xs text-[#b5311d]">{err}</p>}
                    <p className={hint}>JPG, PNG ou WebP. As fotografias grandes são reduzidas automaticamente.</p>
                </div>

                <label className="block text-xs font-medium">🔒 Notas privadas
                    <textarea name="notes" rows={3} maxLength={1000} defaultValue={place?.notes} placeholder="Só você vê isto: lembretes, preços que pagou, quem conhece lá…" className={input} />
                    <span className={hint}>Nunca são partilhadas com a equipa nem publicadas.</span>
                </label>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <div className={card}>
                    <h2 className="font-baloo text-lg font-bold">Guardar</h2>
                    <p className="mt-1 text-sm text-[#4b5568]">Guarde o local no seu perfil. Só você o vê, até decidir partilhá-lo.</p>
                    {state.error && <p ref={errRef} role="alert" className="mt-3 rounded-xl bg-[#e5533d]/10 px-3 py-2 text-xs text-[#b5311d]">{state.error}{state.id && !place && <span className="mt-1 block text-[#4b5568]">O local ficou guardado só para si. Complete o que falta e volte a sugerir.</span>}</p>}
                    <RequiredNote />
                    <button type="submit" name="intent" value="save" disabled={pending || busy} className="mt-3 w-full cursor-pointer rounded-full bg-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar só para mim"}</button>
                </div>
                <div className={`${card} border-[#0370d6]/30 bg-[#f3f8ff]`}>
                    <h2 className="font-baloo text-lg font-bold">Partilhar com a Riendzo</h2>
                    <p className="mt-1 text-sm text-[#4b5568]">Sugira este local à equipa. Se for aprovado, passa a estar disponível para todos na plataforma.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#4b5568]">
                        <li>Precisa de nome, província, endereço ou coordenadas e uma descrição.</li>
                        <li>A equipa pode ajustar a informação antes de publicar.</li>
                        <li>As suas notas privadas nunca são partilhadas.</li>
                    </ul>
                    <button type="submit" name="intent" value="submit" disabled={pending || busy} className="mt-3 w-full cursor-pointer rounded-full border border-[#0054b5] px-5 py-3 font-baloo text-sm font-medium text-[#0054b5] hover:bg-white disabled:opacity-60">Guardar e sugerir à Riendzo</button>
                </div>
            </aside>
        </form>
    );
}
