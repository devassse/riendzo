"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveItemAction } from "../actions";
import type { Album, Artist, PhotoAlbum, Track } from "@/lib/cms/artist-types";
import type { ListItem } from "@/lib/cms/lists-defaults";
import { slugify } from "@/lib/cms/validate";
import { Card, Field, ImagesEditor, inputClass } from "./fields";
import { formatLrc } from "@/lib/cms/lrc";
import { AudioUploadButton, LyricsSync } from "./lyrics-tools";
import RichEditor from "./rich-editor";
import { RequiredNote } from "@/app/components/utils/req";

type EditTrack = Track & { lyricsLrc?: string };
const small = "cursor-pointer rounded-full border border-[#0b1220]/15 px-3 py-1 text-xs font-medium hover:bg-[#0b1220]/5 disabled:opacity-30";
const swap = <T,>(a: T[], i: number, j: number) => { const n = [...a]; [n[i], n[j]] = [n[j], n[i]]; return n; };

/** One image field (photo / cover). */
function OneImage({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
    return <ImagesEditor value={value ? [value] : []} onChange={(v) => onChange(v.at(-1))} />;
}

export default function ArtistEditor({ originalSlug, initial, genres, provinces, backHref, publicHref }: {
    originalSlug: string | null; initial: Artist | null; genres: ListItem[]; provinces: ListItem[]; backHref: string; publicHref?: string;
}) {
    const router = useRouter();
    const [pending, start] = useTransition();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [touched, setTouched] = useState(Boolean(originalSlug));
    const [syncOpen, setSyncOpen] = useState<string | null>(null);
    const [a, setA] = useState<Artist>(() => initial ? { ...initial, albums: initial.albums.map((al) => ({ ...al, tracks: al.tracks.map((t) => ({ ...t, lyricsLrc: formatLrc(t.lyrics) } as EditTrack)) })) } : { slug: "", name: "", genre: genres[0]?.value ?? "", summary: "", albums: [], photoAlbums: [], status: "published" });
    const patch = (x: Partial<Artist>) => setA((s) => ({ ...s, ...x }));
    const setAlbum = (i: number, x: Partial<Album>) => patch({ albums: a.albums.map((al, n) => (n === i ? { ...al, ...x } : al)) });
    const setTrack = (ai: number, ti: number, x: Partial<EditTrack>) => setAlbum(ai, { tracks: a.albums[ai].tracks.map((t, n) => (n === ti ? { ...t, ...x } : t)) });
    const setPhotoAlbum = (i: number, x: Partial<PhotoAlbum>) => patch({ photoAlbums: a.photoAlbums.map((p, n) => (n === i ? { ...p, ...x } : p)) });

    function submit(status?: "published" | "draft") {
        setMessage(null);
        start(async () => {
            const payload = { ...a, status: status ?? a.status, albums: a.albums.map((al) => ({ ...al, tracks: al.tracks.map(({ lyrics: _l, ...t }) => t) })) };
            const res = await saveItemAction("music-artists", originalSlug, payload);
            if (res.ok) { router.push(backHref); router.refresh(); }
            else { setErrors(res.errors); setMessage(res.message ?? "Não foi possível guardar."); window.scrollTo({ top: 0, behavior: "smooth" }); }
        });
    }

    const num = (v: string) => (v === "" ? undefined : Number(v));
    return (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="space-y-5">
                {message && <p role="alert" className="rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm font-medium text-[#b5311d]">{message}{Object.values(errors).length ? ` ${Object.values(errors).join(" ")}` : ""}</p>}

                <Card title="Perfil do artista">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field required label="Nome artístico" error={errors.name}><input className={inputClass} value={a.name} onChange={(e) => { patch({ name: e.target.value, ...(!touched && { slug: slugify(e.target.value) }) }); }} /></Field>
                        <Field label="Nome verdadeiro (opcional)"><input className={inputClass} value={a.realName ?? ""} onChange={(e) => patch({ realName: e.target.value })} /></Field>
                        <Field label="Endereço (slug)" error={errors.slug}><input className={inputClass} value={a.slug} onChange={(e) => { setTouched(true); patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }); }} onBlur={(e) => patch({ slug: slugify(e.target.value) })} /></Field>
                        <Field required label="Estilos musicais" error={errors.genre} hint="Escolha um ou mais. O primeiro que marcar é o principal." className="sm:col-span-2">
                            <div className="flex flex-wrap gap-2">
                                {genres.map((g) => {
                                    const list = a.genres?.length ? a.genres : a.genre ? [a.genre] : [];
                                    const on = list.includes(g.value);
                                    return (
                                        <button key={g.value} type="button" aria-pressed={on} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0b1220]/15 hover:bg-[#0b1220]/5"}`}
                                            onClick={() => { const next = on ? list.filter((x) => x !== g.value) : [...list, g.value]; patch({ genres: next, genre: next[0] ?? "" }); }}>
                                            {on && list[0] === g.value ? "★ " : ""}{g.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <select hidden>
                                <option value="">Escolha…</option>{genres.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Origem (província)"><select className={inputClass} value={a.origin ?? ""} onChange={(e) => patch({ origin: e.target.value || undefined })}><option value="">—</option>{provinces.map((p) => <option key={p.value}>{p.label}</option>)}</select></Field>
                        <Field label="Ativo desde"><input className={inputClass} value={a.activeSince ?? ""} onChange={(e) => patch({ activeSince: e.target.value })} placeholder="Anos 1990" /></Field>
                        <Field label="Ano de nascimento"><input type="number" className={inputClass} value={a.birthYear ?? ""} onChange={(e) => patch({ birthYear: num(e.target.value) })} /></Field>
                        <Field label="Ano de falecimento (se aplicável)"><input type="number" className={inputClass} value={a.deathYear ?? ""} onChange={(e) => patch({ deathYear: num(e.target.value) })} /></Field>
                    </div>
                    <Field required label="Resumo (cartões)" error={errors.summary}><textarea rows={2} className={inputClass} value={a.summary} onChange={(e) => patch({ summary: e.target.value })} /></Field>
                    <Field label="Frase de destaque" hint="Mostrada no hero quando é o artista da semana."><input className={inputClass} value={a.quote ?? ""} onChange={(e) => patch({ quote: e.target.value })} /></Field>
                </Card>

                <Card title="Fotografia de perfil e capa"><div className="grid gap-5 sm:grid-cols-2"><div><p className="mb-2 text-xs font-medium">Foto de perfil (redonda)</p><OneImage value={a.photo} onChange={(photo) => patch({ photo })} /></div><div><p className="mb-2 text-xs font-medium">Capa larga (fundo do perfil)</p><OneImage value={a.cover} onChange={(cover) => patch({ cover })} /></div></div></Card>

                <Card title="Biografia" description="Texto completo com imagens e vídeos."><RichEditor value={a.body ?? ""} onChange={(body) => patch({ body })} minHeight="16rem" /></Card>

                <Card title="Discografia" description="Cada álbum aparece como um cartão com capa; ao clicar abre a lista de faixas.">
                    {errors.albums && <p className="text-xs font-medium text-[#b5311d]">{errors.albums}</p>}
                    <div className="space-y-4">
                        {a.albums.map((al, ai) => (
                            <div key={ai} className="rounded-2xl border border-[#0b1220]/12 bg-[#f8f9fc] p-4">
                                <div className="grid gap-3 sm:grid-cols-[1fr_6rem_1fr]">
                                    <input className={inputClass} placeholder="Título do álbum" value={al.title} onChange={(e) => setAlbum(ai, { title: e.target.value })} aria-label="Título do álbum" />
                                    <input className={inputClass} type="number" placeholder="Ano" value={al.year ?? ""} onChange={(e) => setAlbum(ai, { year: num(e.target.value) })} aria-label="Ano" />
                                    <input className={inputClass} placeholder="Editora (opcional)" value={al.label ?? ""} onChange={(e) => setAlbum(ai, { label: e.target.value })} aria-label="Editora" />
                                </div>
                                <textarea rows={2} className={`${inputClass} mt-3`} placeholder="Descrição do álbum" value={al.description ?? ""} onChange={(e) => setAlbum(ai, { description: e.target.value })} aria-label="Descrição" />
                                <details className="mt-3"><summary className="cursor-pointer text-xs font-medium text-[#0054b5]">Capa do álbum {al.cover ? "✓" : ""}</summary><div className="mt-3"><OneImage value={al.cover} onChange={(cover) => setAlbum(ai, { cover })} /></div></details>

                                <p className="mt-4 text-xs font-medium">Faixas ({al.tracks.length})</p>
                                <div className="mt-2 space-y-2">
                                    {al.tracks.map((tr, ti) => {
                                        const t = tr as EditTrack;
                                        const key = `${ai}-${ti}`;
                                        return (
                                            <div key={ti} className="rounded-xl bg-white p-2">
                                                <div className="grid gap-2 sm:grid-cols-[1.3fr_5rem_1.6fr_1.6fr_auto]">
                                                    <input className={inputClass} placeholder="Título" value={t.title} onChange={(e) => setTrack(ai, ti, { title: e.target.value })} aria-label="Título da faixa" />
                                                    <input className={inputClass} placeholder="3:45" value={t.duration ?? ""} onChange={(e) => setTrack(ai, ti, { duration: e.target.value })} aria-label="Duração" />
                                                    <input className={inputClass} placeholder="Áudio (.mp3) com direitos" value={t.audioUrl ?? ""} onChange={(e) => setTrack(ai, ti, { audioUrl: e.target.value })} aria-label="Endereço do áudio" />
                                                    <input className={inputClass} placeholder="YouTube oficial" value={t.youtubeUrl ?? ""} onChange={(e) => setTrack(ai, ti, { youtubeUrl: e.target.value })} aria-label="Link do YouTube" />
                                                    <span className="flex gap-1">
                                                        <button type="button" className={small} disabled={ti === 0} onClick={() => setAlbum(ai, { tracks: swap(al.tracks, ti, ti - 1) })} aria-label="Subir">↑</button>
                                                        <button type="button" className={small} onClick={() => setAlbum(ai, { tracks: al.tracks.filter((_, n) => n !== ti) })} aria-label="Remover">✕</button>
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <AudioUploadButton onUploaded={(url) => setTrack(ai, ti, { audioUrl: url })} />
                                                    <details className="flex-1" open={Boolean(t.lyricsLrc)}>
                                                        <summary className="cursor-pointer text-xs font-medium text-[#0054b5]">♪ Letra e karaoke {t.lyricsLrc ? "✓" : ""}</summary>
                                                        <div className="mt-2">
                                                            <textarea rows={6} spellCheck={false} className={`${inputClass} font-mono text-xs`} value={t.lyricsLrc ?? ""} onChange={(e) => setTrack(ai, ti, { lyricsLrc: e.target.value })} aria-label="Letra" placeholder={"Um verso por linha.\nCom tempos (formato LRC): [00:12.50] Primeiro verso\nPalavra a palavra (opcional): [00:17.00]<00:17.00>Palavra <00:17.60>seguinte"} />
                                                            <p className="mt-1 text-[11px] leading-relaxed text-[#5b6478]">Escreva a letra e use o sincronizador para marcar o início de cada verso. Sem tempos, a letra aparece como texto simples. Os tempos por palavra são opcionais: sem eles, as palavras são distribuídas ao longo do verso.</p>
                                                            <p className="mt-1 rounded-lg bg-[#ffc14d]/20 p-2 text-[11px] leading-relaxed text-[#6b4700]"><b>Direitos de autor:</b> as letras têm direitos de autor. Só publique letras que o autor ou a editora tenham autorizado.</p>
                                                            {t.audioUrl && /\.(mp3|m4a|ogg|oga|wav|aac)(\?.*)?$/i.test(t.audioUrl) ? (
                                                                <>
                                                                    <button type="button" className={`${small} mt-2`} onClick={() => setSyncOpen(syncOpen === key ? null : key)}>{syncOpen === key ? "Fechar sincronizador" : "⏱ Sincronizar com o áudio"}</button>
                                                                    {syncOpen === key && <LyricsSync audioUrl={t.audioUrl} value={t.lyricsLrc ?? ""} onChange={(lrc) => setTrack(ai, ti, { lyricsLrc: lrc })} />}
                                                                </>
                                                            ) : <p className="mt-2 text-[11px] text-[#5b6478]">Para sincronizar, defina primeiro o áudio da faixa (carregue o ficheiro ou cole o endereço .mp3).</p>}
                                                        </div>
                                                    </details>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button type="button" className={small} onClick={() => setAlbum(ai, { tracks: [...al.tracks, { title: "" }] })}>+ Faixa</button>
                                </div>
                                <div className="mt-4 flex justify-end gap-1.5">
                                    <button type="button" className={small} disabled={ai === 0} onClick={() => patch({ albums: swap(a.albums, ai, ai - 1) })}>↑</button>
                                    <button type="button" className={small} disabled={ai === a.albums.length - 1} onClick={() => patch({ albums: swap(a.albums, ai, ai + 1) })}>↓</button>
                                    <button type="button" className={small} onClick={() => window.confirm(`Remover o álbum “${al.title || "sem título"}”?`) && patch({ albums: a.albums.filter((_, n) => n !== ai) })}>Remover álbum</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" className={small} onClick={() => patch({ albums: [...a.albums, { slug: "", title: "", tracks: [] }] })}>+ Adicionar álbum</button>
                    </div>
                    <p className="rounded-xl bg-[#ffc14d]/20 p-3 text-xs leading-relaxed text-[#6b4700]"><b>Direitos de autor:</b> só adicione áudio que tenha autorização para publicar (cedido pelo artista ou editora) ou links de vídeos oficiais do YouTube. Faixas sem áudio aparecem na lista, mas sem botão de reprodução.</p>
                </Card>

                <Card title="Álbuns de fotografias" description="Galerias do artista: concertos, bastidores, capas…">
                    <div className="space-y-4">
                        {a.photoAlbums.map((pa, i) => (
                            <div key={i} className="rounded-2xl border border-[#0b1220]/12 bg-[#f8f9fc] p-4">
                                <div className="flex gap-2"><input className={inputClass} placeholder="Título do álbum de fotografias" value={pa.title} onChange={(e) => setPhotoAlbum(i, { title: e.target.value })} aria-label="Título" /><button type="button" className={small} onClick={() => window.confirm("Remover este álbum de fotografias?") && patch({ photoAlbums: a.photoAlbums.filter((_, n) => n !== i) })}>Remover</button></div>
                                <div className="mt-3"><ImagesEditor value={pa.images.map((x) => x.src)} onChange={(srcs) => setPhotoAlbum(i, { images: srcs.map((src) => pa.images.find((x) => x.src === src) ?? { src }) })} /></div>
                            </div>
                        ))}
                        <button type="button" className={small} onClick={() => patch({ photoAlbums: [...a.photoAlbums, { title: "", images: [] }] })}>+ Adicionar álbum de fotografias</button>
                    </div>
                </Card>

                <Card title="Ligações">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {(["youtube", "spotify", "instagram", "facebook", "website"] as const).map((k) => (
                            <Field key={k} label={k[0].toUpperCase() + k.slice(1)} error={errors[`link-${k}`]}><input className={inputClass} placeholder="https://…" value={a.links?.[k] ?? ""} onChange={(e) => patch({ links: { ...a.links, [k]: e.target.value } })} /></Field>
                        ))}
                    </div>
                </Card>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                <Card title="Publicação">
                    <Field label="Estado"><select className={inputClass} value={a.status ?? "published"} onChange={(e) => patch({ status: e.target.value as Artist["status"] })}><option value="published">Publicado</option><option value="draft">Rascunho</option></select></Field>
                    <label className="flex items-start gap-2 rounded-xl bg-[#ffc14d]/20 p-3 text-xs"><input type="checkbox" className="mt-0.5" checked={Boolean(a.featuredWeek)} onChange={(e) => patch({ featuredWeek: e.target.checked || undefined })} /><span><b>★ Artista da semana</b><br />Aparece no hero de Música &gt; Artistas. Só um artista pode ter esta marca: ao guardar, a anterior é retirada.</span></label>
                    <div className="flex flex-wrap gap-2">
                        <RequiredNote />
                        <button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar"}</button>
                        <button type="button" disabled={pending} onClick={() => submit("draft")} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5">Guardar como rascunho</button>
                        <Link href={backHref} className="rounded-full px-4 py-2.5 text-sm text-[#5b6478]">Cancelar</Link>
                    </div>
                    {publicHref && <a href={publicHref} target="_blank" rel="noopener noreferrer" className="block border-t border-[#0b1220]/10 pt-3 text-sm text-[#0054b5] hover:underline">Ver perfil público ↗</a>}
                </Card>
            </aside>
        </form>
    );
}
