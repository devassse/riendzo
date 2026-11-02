"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveItemAction } from "../actions";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import type { Recipe } from "@/app/[locale]/(pages)/gastronomia/receitas/recipes-grid";
import { BLOCK_KINDS, RECIPE_CATEGORIES, RECIPE_CATEGORY_LABELS } from "@/lib/cms/collections";
import { slugify } from "@/lib/cms/validate";
import {
    BlocksEditor, Card, ChipsInput, ColorField, Field, FactsEditor, ImagesEditor, inputClass,
    type BlockDraft, type Fact,
} from "./fields";

type Common = { slug: string; color: string; status: "published" | "draft"; tip: string; images: string[] };
type CatalogDraft = Common & {
    title: string; tag: string; emoji: string; summary: string; categories: string[];
    metaText: string; facts: Fact[]; blocks: BlockDraft[]; tipLabel: string;
    linkLabel: string; linkHref: string; keywordsText: string;
};
type RecipeDraft = Common & {
    name: string; region: string; description: string; categories: string[];
    minutes: string; servings: string; difficulty: "easy" | "medium" | "hard";
    ingredientsText: string; stepsText: string;
};

const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);

function catalogDraft(i: CatalogItem | null, defaultColor: string): CatalogDraft {
    return {
        slug: i?.slug ?? "", title: i?.title ?? "", tag: i?.tag ?? "", emoji: i?.emoji ?? "✨",
        color: i?.color ?? defaultColor, status: i?.status ?? "published",
        summary: i?.summary ?? "", categories: i?.categories ?? [],
        metaText: (i?.meta ?? []).join("\n"), facts: i?.facts ?? [],
        blocks: (i?.blocks ?? []).map((b) => ({ kind: b.kind, heading: b.heading ?? "", text: b.items.join("\n") })),
        tip: i?.tip ?? "", tipLabel: i?.tipLabel ?? "",
        linkLabel: i?.link?.label ?? "", linkHref: i?.link?.href ?? "",
        keywordsText: (i?.keywords ?? []).join(", "), images: i?.images ?? [],
    };
}

function recipeDraft(r: Recipe | null, defaultColor: string): RecipeDraft {
    return {
        slug: r?.slug ?? "", name: r?.name ?? "", region: r?.region ?? "", color: r?.color ?? defaultColor,
        status: r?.status ?? "published", description: r?.description ?? "", categories: r?.categories ?? [],
        minutes: String(r?.minutes ?? 30), servings: String(r?.servings ?? 4), difficulty: r?.difficulty ?? "easy",
        ingredientsText: (r?.ingredients ?? []).join("\n"), stepsText: (r?.steps ?? []).join("\n"),
        tip: r?.tip ?? "", images: r?.images ?? [],
    };
}

export default function ItemEditor({
    collectionId, collectionLabel, kind, originalSlug, initial, suggestions, defaultColor, singular,
}: {
    collectionId: string; collectionLabel: string; kind: "catalog" | "recipe";
    originalSlug: string | null; initial: CatalogItem | Recipe | null;
    suggestions: string[]; defaultColor: string; singular: string;
}) {
    const router = useRouter();
    const [pending, start] = useTransition();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [slugTouched, setSlugTouched] = useState(Boolean(originalSlug));

    const isRecipe = kind === "recipe";
    const [c, setC] = useState<CatalogDraft>(() => catalogDraft(isRecipe ? null : (initial as CatalogItem | null), defaultColor));
    const [r, setR] = useState<RecipeDraft>(() => recipeDraft(isRecipe ? (initial as Recipe | null) : null, defaultColor));

    const patchC = (p: Partial<CatalogDraft>) => setC((s) => ({ ...s, ...p }));
    const patchR = (p: Partial<RecipeDraft>) => setR((s) => ({ ...s, ...p }));
    const common = isRecipe ? r : c;
    const title = isRecipe ? r.name : c.title;

    const onTitle = (v: string) => {
        const slug = slugTouched ? undefined : slugify(v);
        if (isRecipe) patchR({ name: v, ...(slug !== undefined && { slug }) });
        else patchC({ title: v, ...(slug !== undefined && { slug }) });
    };
    const setCommon = (p: Partial<Common>) => (isRecipe ? patchR(p) : patchC(p));

    function submit(status?: "published" | "draft") {
        setMessage(null);
        const st = status ?? common.status;
        const payload = isRecipe
            ? {
                  ...r, status: st, minutes: Number(r.minutes), servings: Number(r.servings),
                  ingredients: lines(r.ingredientsText), steps: lines(r.stepsText),
              }
            : {
                  ...c, status: st, meta: lines(c.metaText),
                  keywords: c.keywordsText.split(/[,\n]/).map((k) => k.trim()).filter(Boolean),
                  blocks: c.blocks.map((b) => ({ kind: b.kind, heading: b.heading, items: lines(b.text) })),
                  link: { label: c.linkLabel, href: c.linkHref },
              };

        start(async () => {
            const res = await saveItemAction(collectionId, originalSlug, payload);
            if (res.ok) {
                router.push(`/admin/c/${collectionId}`);
                router.refresh();
            } else {
                setErrors(res.errors);
                setMessage(res.message ?? "Não foi possível guardar.");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    const cover = common.images[0];

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
        >
            <div className="space-y-5">
                {message && (
                    <p role="alert" className="rounded-2xl bg-[#e5533d]/10 px-4 py-3 text-sm font-medium text-[#b5311d]">
                        {message}
                    </p>
                )}

                <Card title="Informação principal">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={isRecipe ? "Nome" : "Título"} error={errors.title ?? errors.name} className="sm:col-span-2">
                            <input className={inputClass} value={title} onChange={(e) => onTitle(e.target.value)} />
                        </Field>
                        <Field label="Endereço (slug)" error={errors.slug} hint="Parte final do endereço. Gerado a partir do título.">
                            <input
                                className={inputClass} value={common.slug}
                                onChange={(e) => { setSlugTouched(true); setCommon({ slug: slugify(e.target.value) }); }}
                            />
                        </Field>
                        <Field label={isRecipe ? "Região" : "Etiqueta"} error={errors.region ?? errors.tag} hint={isRecipe ? "Ex.: Nacional, Costa, Zambézia" : "Ex.: Inhambane, Nacional, Opinião"}>
                            <input className={inputClass} value={isRecipe ? r.region : c.tag} onChange={(e) => (isRecipe ? patchR({ region: e.target.value }) : patchC({ tag: e.target.value }))} />
                        </Field>
                        {!isRecipe && (
                            <Field label="Emoji da capa" hint="Mostrado quando não há fotografia.">
                                <input className={inputClass} value={c.emoji} maxLength={8} onChange={(e) => patchC({ emoji: e.target.value })} />
                            </Field>
                        )}
                        <Field label="Cor de destaque" error={errors.color}>
                            <ColorField value={common.color} onChange={(color) => setCommon({ color })} />
                        </Field>
                    </div>

                    <Field label="Categorias" error={errors.categories}>
                        {isRecipe ? (
                            <div className="flex flex-wrap gap-2">
                                {RECIPE_CATEGORIES.map((cat) => {
                                    const on = r.categories.includes(cat);
                                    return (
                                        <button
                                            key={cat} type="button" aria-pressed={on}
                                            onClick={() => patchR({ categories: on ? r.categories.filter((x) => x !== cat) : [...r.categories, cat] })}
                                            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${on ? "border-[#0054b5] bg-[#0054b5] text-white" : "border-[#0b1220]/15 hover:bg-[#0b1220]/5"}`}
                                        >
                                            {RECIPE_CATEGORY_LABELS[cat]}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <ChipsInput value={c.categories} onChange={(categories) => patchC({ categories })} suggestions={suggestions} placeholder="Escreva e prima Enter" />
                        )}
                    </Field>

                    <Field label={isRecipe ? "Descrição" : "Resumo"} error={errors.summary ?? errors.description}>
                        <textarea rows={3} className={inputClass} value={isRecipe ? r.description : c.summary} onChange={(e) => (isRecipe ? patchR({ description: e.target.value }) : patchC({ summary: e.target.value }))} />
                    </Field>
                </Card>

                {isRecipe ? (
                    <Card title="Preparação">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="Tempo (min)" error={errors.minutes}>
                                <input type="number" min={1} className={inputClass} value={r.minutes} onChange={(e) => patchR({ minutes: e.target.value })} />
                            </Field>
                            <Field label="Pessoas" error={errors.servings}>
                                <input type="number" min={1} className={inputClass} value={r.servings} onChange={(e) => patchR({ servings: e.target.value })} />
                            </Field>
                            <Field label="Dificuldade">
                                <select className={inputClass} value={r.difficulty} onChange={(e) => patchR({ difficulty: e.target.value as RecipeDraft["difficulty"] })}>
                                    <option value="easy">Fácil</option>
                                    <option value="medium">Média</option>
                                    <option value="hard">Difícil</option>
                                </select>
                            </Field>
                        </div>
                        <Field label="Ingredientes" error={errors.ingredients} hint="Um ingrediente por linha.">
                            <textarea rows={7} className={inputClass} value={r.ingredientsText} onChange={(e) => patchR({ ingredientsText: e.target.value })} />
                        </Field>
                        <Field label="Passos" error={errors.steps} hint="Um passo por linha.">
                            <textarea rows={8} className={inputClass} value={r.stepsText} onChange={(e) => patchR({ stepsText: e.target.value })} />
                        </Field>
                        <Field label="Dica">
                            <textarea rows={2} className={inputClass} value={r.tip} onChange={(e) => patchR({ tip: e.target.value })} />
                        </Field>
                    </Card>
                ) : (
                    <>
                        <Card title="Dados rápidos" description="Aparecem no cartão e no painel lateral.">
                            <Field label="Destaques do cartão" hint="Até 3 linhas curtas. Ex.: Melhor época: Maio a Outubro">
                                <textarea rows={3} className={inputClass} value={c.metaText} onChange={(e) => patchC({ metaText: e.target.value })} />
                            </Field>
                            <Field label="Factos (rótulo e valor)">
                                <FactsEditor value={c.facts} onChange={(facts) => patchC({ facts })} />
                            </Field>
                        </Card>

                        <Card title="Conteúdo" description="Blocos de texto, listas e passos que aparecem no painel de detalhe.">
                            <BlocksEditor value={c.blocks} onChange={(blocks) => patchC({ blocks })} kinds={BLOCK_KINDS} />
                        </Card>

                        <Card title="Dica, link e pesquisa">
                            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                                <Field label="Título da dica" hint="Opcional. Ex.: Em resumo">
                                    <input className={inputClass} value={c.tipLabel} onChange={(e) => patchC({ tipLabel: e.target.value })} />
                                </Field>
                                <Field label="Texto da dica">
                                    <input className={inputClass} value={c.tip} onChange={(e) => patchC({ tip: e.target.value })} />
                                </Field>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                                <Field label="Texto do link">
                                    <input className={inputClass} value={c.linkLabel} onChange={(e) => patchC({ linkLabel: e.target.value })} placeholder="Site oficial" />
                                </Field>
                                <Field label="Endereço do link" error={errors.link}>
                                    <input className={inputClass} value={c.linkHref} onChange={(e) => patchC({ linkHref: e.target.value })} placeholder="https://…" />
                                </Field>
                            </div>
                            <Field label="Palavras-chave" hint="Separadas por vírgulas. Ajudam a pesquisa no site.">
                                <input className={inputClass} value={c.keywordsText} onChange={(e) => patchC({ keywordsText: e.target.value })} />
                            </Field>
                        </Card>
                    </>
                )}

                <Card title="Fotografias">
                    <ImagesEditor value={common.images} onChange={(images) => setCommon({ images })} />
                </Card>
            </div>

            {/* Side column */}
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                <Card title="Publicação">
                    <Field label="Estado">
                        <select className={inputClass} value={common.status} onChange={(e) => setCommon({ status: e.target.value as Common["status"] })}>
                            <option value="published">Publicado (visível no site)</option>
                            <option value="draft">Rascunho (oculto)</option>
                        </select>
                    </Field>
                    <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-[#0054b5] px-5 py-2.5 font-baloo text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                            {pending ? "A guardar…" : "Guardar"}
                        </button>
                        <button type="button" disabled={pending} onClick={() => submit("draft")} className="cursor-pointer rounded-full border border-[#0b1220]/20 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#0b1220]/5 disabled:opacity-60">
                            Guardar como rascunho
                        </button>
                        <Link href={`/admin/c/${collectionId}`} className="rounded-full px-4 py-2.5 text-sm text-[#5b6478] hover:text-[#0b1220]">
                            Cancelar
                        </Link>
                    </div>
                </Card>

                <Card title="Pré-visualização" description={`Como o ${singular} aparece no cartão.`}>
                    <div className="overflow-hidden rounded-3xl border border-[#0b1220]/10">
                        <div className="relative flex h-32 items-center justify-center" style={{ background: `linear-gradient(135deg, ${common.color}45, ${common.color}14)` }}>
                            {cover ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={cover} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-4xl">{isRecipe ? "🍽️" : c.emoji}</span>
                            )}
                            <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em]" style={{ color: common.color }}>
                                {(isRecipe ? r.region : c.tag) || "Etiqueta"}
                            </span>
                        </div>
                        <div className="p-4">
                            <p className="font-baloo text-base font-medium">{title || "Título"}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-[#5b6478]">{(isRecipe ? r.description : c.summary) || "Resumo do conteúdo…"}</p>
                            <p className="mt-2 text-[9px] uppercase tracking-[0.16em]" style={{ color: common.color }}>
                                {isRecipe ? r.categories.map((x) => RECIPE_CATEGORY_LABELS[x as keyof typeof RECIPE_CATEGORY_LABELS]).join(" · ") : c.categories.join(" · ")}
                            </p>
                        </div>
                    </div>
                </Card>
            </aside>
        </form>
    );
}
