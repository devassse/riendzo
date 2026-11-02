"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveItemAction, toggleExperienceAction } from "../actions";
import { RequiredNote } from "@/app/components/utils/req";
import { highlightLabels } from "@/lib/cms/highlights";
import type { CatalogContact, CatalogItem, CatalogPost, CatalogVideo, OfferGroup, OpeningHours } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import { BLOCK_KINDS } from "@/lib/cms/collections";
import type { ListItem } from "@/lib/cms/lists-defaults";
import { slugify } from "@/lib/cms/validate";
import { BlocksEditor, Card, ColorField, Field, FactsEditor, ImagesEditor, inputClass, type BlockDraft, type Fact } from "./fields";
import RichEditor from "./rich-editor";
import { ContactEditor, HoursEditor, LocationEditor, OffersEditor, PostsEditor, VideosEditor } from "./editors-extra";

type Common = { slug: string; color: string; status: "published" | "draft"; tip: string; images: string[]; body: string; videos: CatalogVideo[] };
type CatalogDraft = Common & {
    title: string; tag: string; provinces: string[]; posts: CatalogPost[]; showOnHome: boolean; realm: boolean; bgTone: string; emoji: string; summary: string; categories: string[];
    metaText: string; facts: Fact[]; blocks: BlockDraft[]; tipLabel: string;
    linkLabel: string; linkHref: string; keywordsText: string;
    contact: CatalogContact; lat: string; lng: string; hours: OpeningHours; offers: OfferGroup[]; featured: boolean; currency: string;
};
type RecipeDraft = Common & {
    name: string; region: string; description: string; categories: string[];
    minutes: string; servings: string; difficulty: "easy" | "medium" | "hard";
    ingredientsText: string; stepsText: string;
};

const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);

function catalogDraft(i: CatalogItem | null, color: string): CatalogDraft {
    return {
        slug: i?.slug ?? "", title: i?.title ?? "", tag: i?.tag ?? "", provinces: i?.provinces ?? (i?.tag ? [i.tag] : []), posts: i?.posts ?? [], showOnHome: Boolean(i?.showOnHome), realm: Boolean(i?.realm), bgTone: i?.bgTone ?? "", emoji: i?.emoji ?? "✨",
        color: i?.color ?? color, status: i?.status ?? "published", summary: i?.summary ?? "", categories: i?.categories ?? [],
        metaText: (i?.meta ?? []).join("\n"), facts: i?.facts ?? [],
        blocks: (i?.blocks ?? []).map((b) => ({ kind: b.kind, heading: b.heading ?? "", text: b.items.join("\n") })),
        tip: i?.tip ?? "", tipLabel: i?.tipLabel ?? "", linkLabel: i?.link?.label ?? "", linkHref: i?.link?.href ?? "",
        keywordsText: (i?.keywords ?? []).join(", "), images: i?.images ?? [], body: i?.body ?? "", videos: i?.videos ?? [],
        contact: i?.contact ?? {}, lat: i?.location ? String(i.location.lat) : "", lng: i?.location ? String(i.location.lng) : "",
        hours: i?.hours ?? {}, offers: i?.offers ?? [], featured: Boolean(i?.featured), currency: i?.currency ?? "MZN",
    };
}

function recipeDraft(r: Recipe | null, color: string): RecipeDraft {
    return {
        slug: r?.slug ?? "", name: r?.name ?? "", region: r?.region ?? "", color: r?.color ?? color,
        status: r?.status ?? "published", description: r?.description ?? "", categories: r?.categories ?? [],
        minutes: String(r?.minutes ?? 30), servings: String(r?.servings ?? 4), difficulty: r?.difficulty ?? "easy",
        ingredientsText: (r?.ingredients ?? []).join("\n"), stepsText: (r?.steps ?? []).join("\n"),
        tip: r?.tip ?? "", images: r?.images ?? [], body: r?.body ?? "", videos: r?.videos ?? [],
    };
}

/** Select that keeps a legacy value (not in the list any more) selectable. */
function ListSelect({ value, options, onChange, placeholder }: { value: string; options: ListItem[]; onChange: (v: string) => void; placeholder: string }) {
    const known = options.some((o) => o.value === value);
    return (
        <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{placeholder}</option>
            {value && !known && <option value={value}>{value} (fora da lista)</option>}
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

export type EditorProps = {
    collectionId: string; kind: "catalog" | "recipe"; originalSlug: string | null; initial: CatalogItem | Recipe | null;
    tags: ListItem[]; categories: ListItem[]; creators: string[]; defaultColor: string; singular: string;
    tagLabel: string; contact: boolean; featured: boolean; directory: boolean;
    offers?: { group: string; item: string; title: string };
    mode: "admin" | "owner"; backHref: string; publicHref?: string; qrHref?: string;
    /** show the "Mostrar na Home" switch (history, services, entertainment) */
    homeToggle?: boolean;
    /** guides and creators can publish posts ("aventuras") */
    posts?: { label: string };
    /** history: switches that only exist in the Cronologia page */
    history?: { realm?: boolean; tone?: boolean };
    /** can be one of the "6 experiências imperdíveis" (only for saved content) */
    experience?: { on: boolean; max: number };
};

export default function ItemEditor(p: EditorProps) {
    const router = useRouter();
    const [pending, start] = useTransition();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [slugTouched, setSlugTouched] = useState(Boolean(p.originalSlug));
    const owner = p.mode === "owner";

    const isRecipe = p.kind === "recipe";
    const [c, setC] = useState<CatalogDraft>(() => catalogDraft(isRecipe ? null : (p.initial as CatalogItem | null), p.defaultColor));
    const [r, setR] = useState<RecipeDraft>(() => recipeDraft(isRecipe ? (p.initial as Recipe | null) : null, p.defaultColor));
    const patchC = (x: Partial<CatalogDraft>) => setC((s) => ({ ...s, ...x }));
    const patchR = (x: Partial<RecipeDraft>) => setR((s) => ({ ...s, ...x }));
    const common = isRecipe ? r : c;
    const title = isRecipe ? r.name : c.title;
    const setCommon = (x: Partial<Common>) => (isRecipe ? patchR(x) : patchC(x));

    const onTitle = (v: string) => {
        const slug = slugTouched ? undefined : slugify(v);
        if (isRecipe) patchR({ name: v, ...(slug !== undefined && { slug }) });
        else patchC({ title: v, ...(slug !== undefined && { slug }) });
    };

    function submit(status?: "published" | "draft") {
        setMessage(null);
        const st = status ?? common.status;
        const payload = isRecipe
            ? { ...r, status: st, minutes: Number(r.minutes), servings: Number(r.servings), ingredients: lines(r.ingredientsText), steps: lines(r.stepsText) }
            : {
                  ...c, status: st, meta: lines(c.metaText),
                  keywords: c.keywordsText.split(/[,\n]/).map((k) => k.trim()).filter(Boolean),
                  blocks: c.blocks.map((b) => ({ kind: b.kind, heading: b.heading, items: lines(b.text) })),
                  link: { label: c.linkLabel, href: c.linkHref }, location: { lat: c.lat, lng: c.lng },
              };
        start(async () => {
            const res = await saveItemAction(p.collectionId, p.originalSlug, payload);
            if (res.ok) { router.push(p.backHref); router.refresh(); }
            else { setErrors(res.errors); setMessage(res.message ?? "Não foi possível guardar."); window.scrollTo({ top: 0, behavior: "smooth" }); }
        });
    }

    const cover = common.images[0];
    // Establishments (restaurants, hotels, banks…) can be present in more than one province
    const multiProv = !isRecipe && p.directory && p.tagLabel === "Província";
    const toggleCat = (v: string) => {
        const cats = common.categories ?? [];
        const next = cats.includes(v) ? cats.filter((x) => x !== v) : [...cats, v];
        if (isRecipe) patchR({ categories: next }); else patchC({ categories: next });
    };
    const catOptions = [...p.categories, ...common.categories.filter((v) => !p.categories.some((o) => o.value === v)).map((v) => ({ value: v, label: v }))];
    const labelOf = (v: string) => catOptions.find((o) => o.value === v)?.label ?? v;

    return (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="space-y-5">
                {message && <p role="alert" className="rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm font-medium text-[#b5311d]">{message}</p>}

                <Card title="Informação principal">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field required label={isRecipe ? "Nome" : "Título"} error={errors.title ?? errors.name} className="sm:col-span-2">
                            <input className={inputClass} value={title} onChange={(e) => onTitle(e.target.value)} />
                        </Field>
                        {!owner && (
                            <Field label="Endereço (slug)" error={errors.slug} hint="Parte final do endereço público. Gerado a partir do título.">
                                <input className={inputClass} value={common.slug} onChange={(e) => { setSlugTouched(true); setCommon({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }); }} onBlur={(e) => setCommon({ slug: slugify(e.target.value) })} />
                            </Field>
                        )}
                        {multiProv ? (
                            <Field required label="Províncias onde atua" error={errors.tag} hint="Escolha uma ou mais (ex.: Maputo e Gaza)." className="sm:col-span-2">
                                <div className="flex flex-wrap gap-2">
                                    {p.tags.map((o) => {
                                        const on = c.provinces.includes(o.value);
                                        return (
                                            <button key={o.value} type="button" aria-pressed={on} onClick={() => patchC({ provinces: on ? c.provinces.filter((x) => x !== o.value) : [...c.provinces, o.value] })} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0b1220]/15 hover:bg-[#0b1220]/5"}`}>{o.label}</button>
                                        );
                                    })}
                                </div>
                            </Field>
                        ) : (
                            <Field required label={p.tagLabel} error={errors.region ?? errors.tag}>
                                <ListSelect value={isRecipe ? r.region : c.tag} options={p.tags} placeholder={`Escolha…`} onChange={(v) => (isRecipe ? patchR({ region: v }) : patchC({ tag: v }))} />
                            </Field>
                        )}
                        {!isRecipe && (
                            <Field label="Emoji da capa" hint="Mostrado quando não há fotografia."><input className={inputClass} value={c.emoji} maxLength={8} onChange={(e) => patchC({ emoji: e.target.value })} /></Field>
                        )}
                        <Field label="Cor de destaque" error={errors.color}><ColorField value={common.color} onChange={(color) => setCommon({ color })} /></Field>
                    </div>

                    <Field required={isRecipe} label="Categorias" error={errors.categories} hint={catOptions.length ? "Escolha uma ou mais. A lista é gerida em Administrador > Dados genéricos." : "Ainda não há categorias: crie-as em Administrador > Dados genéricos."}>
                        <div className="flex flex-wrap gap-2">
                            {catOptions.map((o) => {
                                const on = common.categories.includes(o.value);
                                return (
                                    <button key={o.value} type="button" aria-pressed={on} onClick={() => toggleCat(o.value)} className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${on ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0b1220]/15 hover:bg-[#0b1220]/5"}`}>{o.label}</button>
                                );
                            })}
                        </div>
                    </Field>

                    <Field required label={isRecipe ? "Descrição curta" : "Resumo (aparece no cartão)"} error={errors.summary ?? errors.description}>
                        <textarea rows={3} className={inputClass} value={isRecipe ? r.description : c.summary} onChange={(e) => (isRecipe ? patchR({ description: e.target.value }) : patchC({ summary: e.target.value }))} />
                    </Field>
                </Card>

                <Card title="Descrição completa" description="Texto formatado, com imagens, ligações e vídeos do YouTube no meio do texto.">
                    <RichEditor value={common.body} onChange={(body) => setCommon({ body })} />
                </Card>

                {isRecipe ? (
                    <Card title="Preparação">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field required label="Tempo (min)" error={errors.minutes}><input type="number" min={1} className={inputClass} value={r.minutes} onChange={(e) => patchR({ minutes: e.target.value })} /></Field>
                            <Field required label="Pessoas" error={errors.servings}><input type="number" min={1} className={inputClass} value={r.servings} onChange={(e) => patchR({ servings: e.target.value })} /></Field>
                            <Field label="Dificuldade"><select className={inputClass} value={r.difficulty} onChange={(e) => patchR({ difficulty: e.target.value as RecipeDraft["difficulty"] })}><option value="easy">Fácil</option><option value="medium">Média</option><option value="hard">Difícil</option></select></Field>
                        </div>
                        <Field required label="Ingredientes" error={errors.ingredients} hint="Um por linha."><textarea rows={7} className={inputClass} value={r.ingredientsText} onChange={(e) => patchR({ ingredientsText: e.target.value })} /></Field>
                        <Field required label="Passos" error={errors.steps} hint="Um por linha."><textarea rows={8} className={inputClass} value={r.stepsText} onChange={(e) => patchR({ stepsText: e.target.value })} /></Field>
                        <Field label="Dica"><textarea rows={2} className={inputClass} value={r.tip} onChange={(e) => patchR({ tip: e.target.value })} /></Field>
                    </Card>
                ) : (
                    <>
                        {p.directory && (
                            <>
                                <Card title="Horário de funcionamento" description="No site: verde = aberto, laranja = a fechar em menos de 1 hora, vermelho = fechado.">
                                    {errors.hours && <p className="text-xs font-medium text-[#b5311d]">{errors.hours}</p>}
                                    <HoursEditor value={c.hours} onChange={(hours) => patchC({ hours })} />
                                </Card>
                            </>
                        )}
                        {/* Coordinates for every place (beaches, parks, public services, restaurants…): map + "Como chegar" */}
                        <Card title="Localização" description="Latitude e longitude para o mapa e para o botão “Como chegar”. Opcional, mas recomendado em todos os locais.">
                            {errors.location && <p className="text-xs font-medium text-[#b5311d]">{errors.location}</p>}
                            <LocationEditor value={{ lat: c.lat, lng: c.lng }} onChange={(v) => patchC({ lat: v.lat, lng: v.lng })} />
                        </Card>
                        {p.contact && <Card title="Contactos" description="Telefone, WhatsApp, e-mail e redes."><ContactEditor value={c.contact} onChange={(contact) => patchC({ contact })} errors={errors} /></Card>}
                        {p.offers && (
                            <Card title={p.offers.title} description="Itens com preço, fotografias e descrição. Os preços aparecem na página do estabelecimento.">
                                <Field label="Moeda"><select className={`${inputClass} !w-40`} value={c.currency} onChange={(e) => patchC({ currency: e.target.value })}><option value="MZN">Metical (MT)</option><option value="USD">Dólar (US$)</option><option value="ZAR">Rand (R)</option><option value="EUR">Euro (€)</option></select></Field>
                                <OffersEditor value={c.offers} onChange={(offers) => patchC({ offers })} groupLabel={p.offers.group} itemLabel={p.offers.item} labels={highlightLabels(p.collectionId)} />
                            </Card>
                        )}
                        <Card title="Dados rápidos" description="Aparecem no cartão e no painel lateral.">
                            <Field label="Destaques do cartão" hint="Até 3 linhas curtas."><textarea rows={3} className={inputClass} value={c.metaText} onChange={(e) => patchC({ metaText: e.target.value })} /></Field>
                            <Field label="Factos (rótulo e valor)"><FactsEditor value={c.facts} onChange={(facts) => patchC({ facts })} /></Field>
                        </Card>
                        <Card title="Blocos de conteúdo" description="Listas, passo a passo, textos e etiquetas.">
                            <BlocksEditor value={c.blocks} onChange={(blocks) => patchC({ blocks })} kinds={BLOCK_KINDS} />
                        </Card>
                        <Card title="Dica, link e pesquisa">
                            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                                <Field label="Título da dica"><input className={inputClass} value={c.tipLabel} onChange={(e) => patchC({ tipLabel: e.target.value })} /></Field>
                                <Field label="Texto da dica"><input className={inputClass} value={c.tip} onChange={(e) => patchC({ tip: e.target.value })} /></Field>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                                <Field label="Texto do link"><input className={inputClass} value={c.linkLabel} onChange={(e) => patchC({ linkLabel: e.target.value })} /></Field>
                                <Field label="Endereço do link" error={errors.link}><input className={inputClass} value={c.linkHref} onChange={(e) => patchC({ linkHref: e.target.value })} placeholder="https://…" /></Field>
                            </div>
                            <Field label="Palavras-chave" hint="Separadas por vírgulas. Ajudam a pesquisa."><input className={inputClass} value={c.keywordsText} onChange={(e) => patchC({ keywordsText: e.target.value })} /></Field>
                        </Card>
                    </>
                )}

                {!isRecipe && p.posts && (
                    <Card title={p.posts.label} description="Conte as suas experiências: cada publicação tem texto, galeria de fotografias e vídeos do YouTube com pré-visualização. A mais recente aparece primeiro na sua página.">
                        {errors.posts && <p className="text-xs font-medium text-[#b5311d]">{errors.posts}</p>}
                        <PostsEditor value={c.posts} onChange={(posts) => patchC({ posts })} label={p.posts.label} />
                    </Card>
                )}
                <Card title="Vídeos de criadores nacionais" description="Links do YouTube, por exemplo de cozinheiros nas receitas ou de vídeos dos locais no turismo.">
                    {errors.videos && <p className="text-xs font-medium text-[#b5311d]">{errors.videos}</p>}
                    <VideosEditor value={common.videos} onChange={(videos) => setCommon({ videos })} creators={p.creators} />
                </Card>

                <Card title="Fotografias" description="A primeira é a capa. Em estabelecimentos, as restantes formam o álbum.">
                    <ImagesEditor value={common.images} onChange={(images) => setCommon({ images })} />
                </Card>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                <Card title="Publicação">
                    {!owner && (
                        <Field label="Estado">
                            <select className={inputClass} value={common.status} onChange={(e) => setCommon({ status: e.target.value as Common["status"] })}>
                                <option value="published">Publicado (visível no site)</option><option value="draft">Rascunho (oculto)</option>
                            </select>
                        </Field>
                    )}
                    {!owner && p.featured && !isRecipe && (
                        <label className="flex items-start gap-2 rounded-xl bg-[#ffc14d]/20 p-3 text-xs"><input type="checkbox" className="mt-0.5" checked={c.featured} onChange={(e) => patchC({ featured: e.target.checked })} /><span><b>Patrocinado / em destaque</b><br />Aparece primeiro nas listas, com o selo “Patrocinado”.</span></label>
                    )}
                    {!owner && p.homeToggle && !isRecipe && (
                        <label className="flex items-start gap-2 rounded-xl bg-[#00aefb]/10 p-3 text-xs"><input type="checkbox" className="mt-0.5" checked={c.showOnHome} onChange={(e) => patchC({ showOnHome: e.target.checked })} /><span><b>Mostrar na Home</b><br />Aparece na página inicial (Breve História, Serviços Públicos, Emergências ou Entretenimento).</span></label>
                    )}
                    {!owner && p.history?.realm && (
                        <label className="flex items-start gap-2 rounded-xl bg-[#ecdfc4]/60 p-3 text-xs"><input type="checkbox" className="mt-0.5" checked={c.realm} onChange={(e) => patchC({ realm: e.target.checked })} /><span><b>Mostrar em “Reinos e Impérios”</b><br />Aparece na secção de reinos da página Cronologia.</span></label>
                    )}
                    {!owner && p.history?.tone && (
                        <Field label="Cor de fundo na Cronologia" hint="Cor do painel desta entrada na secção “História independente”.">
                            <select className={inputClass} value={c.bgTone} onChange={(e) => patchC({ bgTone: e.target.value })}>
                                <option value="">Automática (alterna)</option><option value="black">Preto</option><option value="green">Verde</option><option value="red">Vermelho</option><option value="yellow">Amarelo</option>
                            </select>
                        </Field>
                    )}
                    {!owner && p.experience && p.originalSlug && !isRecipe && <ExperienceToggle collection={p.collectionId} slug={p.originalSlug} initial={p.experience.on} />}
                    <RequiredNote />
                    <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{pending ? "A guardar…" : "Guardar"}</button>
                        {!owner && <button type="button" disabled={pending} onClick={() => submit("draft")} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2.5 text-sm font-medium hover:bg-[#0b1220]/5 disabled:opacity-60">Guardar como rascunho</button>}
                        <Link href={p.backHref} className="rounded-full px-4 py-2.5 text-sm text-[#5b6478] hover:text-[#0b1220]">Cancelar</Link>
                    </div>
                    {p.publicHref && (
                        <div className="space-y-1.5 border-t border-[#0b1220]/10 pt-3 text-sm">
                            <a href={p.publicHref} target="_blank" rel="noopener noreferrer" className="block text-[#0054b5] hover:underline">Ver página pública ↗</a>
                            {p.qrHref && <Link href={p.qrHref} className="block text-[#0054b5] hover:underline">Código QR para imprimir →</Link>}
                        </div>
                    )}
                </Card>

                <Card title="Pré-visualização" description={`Como o ${p.singular} aparece no cartão.`}>
                    <div className="overflow-hidden rounded-3xl border border-[#0b1220]/10">
                        <div className="relative flex h-32 items-center justify-center" style={{ background: `linear-gradient(135deg, ${common.color}45, ${common.color}14)` }}>
                            {cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover} alt="" className="h-full w-full object-cover" /> : <span className="text-4xl">{isRecipe ? "🍽️" : c.emoji}</span>}
                            <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em]" style={{ color: common.color }}>{(isRecipe ? r.region : c.tag) || "Etiqueta"}</span>
                        </div>
                        <div className="p-4">
                            <p className="font-baloo text-base font-medium">{title || "Título"}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-[#5b6478]">{(isRecipe ? r.description : c.summary) || "Resumo do conteúdo…"}</p>
                            <p className="mt-2 text-[9px] uppercase tracking-[0.16em]" style={{ color: common.color }}>{common.categories.map(labelOf).join(" · ")}</p>
                        </div>
                    </div>
                </Card>
            </aside>
        </form>
    );
}

/** Button inside each place: add it to / remove it from the six experiences of the Home page. */
function ExperienceToggle({ collection, slug, initial }: { collection: string; slug: string; initial: boolean }) {
    const [on, setOn] = useState(initial);
    const [msg, setMsg] = useState("");
    const [busy, start] = useTransition();
    return (
        <div className="rounded-xl bg-[#f3f6fb] p-3 text-xs">
            <p className="font-medium text-[#0b1220]">{on ? "★ Uma das 6 experiências imperdíveis da Home" : "Experiências imperdíveis da Home"}</p>
            <button
                type="button" disabled={busy}
                onClick={() => start(async () => { const r = await toggleExperienceAction(collection, slug, !on); if (r.error) setMsg(r.error); else { setOn(!on); setMsg(""); } })}
                className={`mt-2 cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-60 ${on ? "border border-[#d23b25]/40 text-[#b5311d] hover:bg-[#d23b25]/10" : "bg-[#0054b5] text-white hover:opacity-90"}`}
            >{on ? "Retirar das 6 experiências" : "Definir como uma das 6 experiências…"}</button>
            {msg && <p role="alert" className="mt-1.5 font-medium text-[#b5311d]">{msg}</p>}
            <p className="mt-1.5 text-[11px] text-[#5b6478]">Escolha e ordene todas em <Link href="/admin/home" className="underline">Home</Link>.</p>
        </div>
    );
}
