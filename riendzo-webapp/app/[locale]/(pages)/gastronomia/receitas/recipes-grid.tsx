"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { CATEGORIES, type Category } from "./recipe-categories";

export type Difficulty = "easy" | "medium" | "hard";

export type Recipe = {
    slug: string;
    name: string;
    /** Small tag, e.g. "Zambézia", "Costa", "Nacional" */
    region: string;
    /** One or more categories */
    categories: Category[];
    /** Accent colour (hex) */
    color: string;
    minutes: number;
    servings: number;
    difficulty: Difficulty;
    description: string;
    ingredients: string[];
    steps: string[];
    tip?: string;
    /** Photos of the dish, e.g. ["/receitas/matapa-1.jpg", "/receitas/matapa-2.jpg"] */
    images?: string[];
};

export type RecipesGridLabels = {
    all: string;
    searchPlaceholder: string;
    noResults: string;
    /** e.g. "{count} receitas" */
    results: string;
    /** e.g. "Página {count}" */
    page: string;
    prev: string;
    next: string;
    categories: Record<Category, string>;
    ingredients: string;
    steps: string;
    tip: string;
    /** e.g. "{count} min" */
    minutes: string;
    /** e.g. "{count} pessoas" */
    servings: string;
    difficulty: Record<Difficulty, string>;
    close: string;
    viewRecipe: string;
    photoSoon: string;
};

const INK = "#0b1220";

/**
 * Renders children straight into <body>, so the side panel is never trapped
 * inside a parent stacking context and always sits above the navbar.
 */
function Portal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted ? createPortal(children, document.body) : null;
}

const PAGE_SIZE = 6;

const fill = (tpl: string, count: number) =>
    tpl.replace("{count}", String(count));

const normalize = (str: string) =>
    str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** 1 … 4 5 6 … 12 */
function pageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    sorted.forEach((n, i) => {
        if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
        out.push(n);
    });
    return out;
}

/** Placeholder plate, used when a recipe has no photos yet. */
function PlatePlaceholder({ color, label }: { color: string; label?: string }) {
    return (
        <div
            className="relative flex h-full w-full items-center justify-center"
            style={{
                background: `linear-gradient(135deg, ${color}40 0%, ${color}12 70%, transparent 100%)`,
            }}
        >
            <svg viewBox="0 0 120 120" className="h-24 w-24 opacity-70">
                <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="2" />
                <circle cx="60" cy="60" r="40" fill={color} opacity="0.18" />
                <circle cx="60" cy="60" r="26" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
                <circle cx="60" cy="60" r="12" fill={color} opacity="0.35" />
            </svg>
            {label && (
                <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-[0.18em] text-[#5b6478]">
                    {label}
                </span>
            )}
        </div>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
            <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.3c2.2.8 3.5 2.8 3.5 5.7" />
        </svg>
    );
}

function Meta({ recipe, labels }: { recipe: Recipe; labels: RecipesGridLabels }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5b6478]">
            <span className="flex items-center gap-1.5">
                <ClockIcon />
                {fill(labels.minutes, recipe.minutes)}
            </span>
            <span className="flex items-center gap-1.5">
                <UsersIcon />
                {fill(labels.servings, recipe.servings)}
            </span>
            <span className="flex items-center gap-1.5">
                <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: recipe.color }}
                />
                {labels.difficulty[recipe.difficulty]}
            </span>
        </div>
    );
}

function RecipeCard({
    recipe,
    labels,
    onOpen,
}: {
    recipe: Recipe;
    labels: RecipesGridLabels;
    onOpen: (recipe: Recipe, trigger: HTMLElement) => void;
}) {
    const cover = recipe.images?.[0];

    return (
        <button
            type="button"
            onClick={(e) => onOpen(recipe, e.currentTarget)}
            aria-haspopup="dialog"
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#0b1220]/10 bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0b1220]/25 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: recipe.color }}
        >
            {/* Cover */}
            <div className="relative h-44 w-full overflow-hidden">
                {cover ? (
                    <Image
                        src={cover}
                        alt={recipe.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <PlatePlaceholder color={recipe.color} />
                )}

                {/* Region tag */}
                <span
                    className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-montserrat-italic uppercase tracking-[0.18em] backdrop-blur-sm"
                    style={{ color: recipe.color }}
                >
                    {recipe.region}
                </span>
            </div>

            {/* Text */}
            <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                <h3 className="font-baloo text-lg font-medium text-[#0b1220]">
                    {recipe.name}
                </h3>

                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#5b6478]">
                    {recipe.description}
                </p>

                <p
                    className="mt-3 text-[10px] font-montserrat-italic uppercase tracking-[0.18em]"
                    style={{ color: recipe.color }}
                >
                    {recipe.categories.map((c) => labels.categories[c]).join(" · ")}
                </p>

                <div className="mt-4">
                    <Meta recipe={recipe} labels={labels} />
                </div>

                <span
                    className="mt-5 flex items-center gap-1 text-sm font-baloo font-medium"
                    style={{ color: recipe.color }}
                >
                    {labels.viewRecipe}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                    </span>
                </span>
            </div>

            {/* Bottom hover line */}
            <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: recipe.color }}
            />
        </button>
    );
}

export default function RecipesGrid({
    recipes,
    labels,
}: {
    recipes: Recipe[];
    labels: RecipesGridLabels;
}) {
    // `selected` stays set while the panel slides out, so content doesn't vanish mid-animation
    const [selected, setSelected] = useState<Recipe | null>(null);
    const [open, setOpen] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    // Filters + pagination
    const [category, setCategory] = useState<"all" | Category>("all");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const gridTopRef = useRef<HTMLDivElement>(null);

    const counts = useMemo(() => {
        const c = { all: recipes.length } as Record<"all" | Category, number>;
        CATEGORIES.forEach(
            (cat) => (c[cat] = recipes.filter((r) => r.categories.includes(cat)).length)
        );
        return c;
    }, [recipes]);

    const filtered = useMemo(() => {
        const q = normalize(query.trim());
        return recipes.filter(
            (r) =>
                (category === "all" || r.categories.includes(category)) &&
                (!q ||
                    normalize(r.name).includes(q) ||
                    normalize(r.region).includes(q) ||
                    r.ingredients.some((i) => normalize(i).includes(q)))
        );
    }, [recipes, category, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visible = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const goToPage = (n: number) => {
        setPage(n);
        gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const chips: { key: "all" | Category; label: string }[] = [
        { key: "all", label: labels.all },
        // only show categories that have at least one recipe
        ...CATEGORIES.filter((c) => counts[c] > 0).map((c) => ({
            key: c as "all" | Category,
            label: labels.categories[c],
        })),
    ];

    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    const openRecipe = useCallback((recipe: Recipe, trigger: HTMLElement) => {
        triggerRef.current = trigger;
        setSelected(recipe);
        setActiveImg(0);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        setOpen(false);
        triggerRef.current?.focus();
    }, []);

    // Escape to close, lock body scroll, focus management
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", onKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        panelRef.current?.scrollTo({ top: 0 });
        closeRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, close]);

    const images = selected?.images ?? [];

    return (
        <>
            {/* Search + category filter */}
            <div ref={gridTopRef} className="scroll-mt-28">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                    }}
                    placeholder={labels.searchPlaceholder}
                    aria-label={labels.searchPlaceholder}
                    className="w-full rounded-full border border-[#0b1220]/15 bg-white px-5 py-3 text-sm text-[#0b1220] outline-none transition-colors placeholder:text-[#5b6478] focus:border-[#0b1220]/50"
                />

                <div
                    role="tablist"
                    aria-label="Categorias"
                    className="mt-4 flex flex-wrap items-center gap-2"
                >
                    {chips.map((chip) => {
                        const active = category === chip.key;
                        return (
                            <button
                                key={chip.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => {
                                    setCategory(chip.key);
                                    setPage(1);
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-baloo font-medium transition-colors duration-200"
                                style={{
                                    borderColor: active ? INK : `${INK}1a`,
                                    backgroundColor: active ? INK : "transparent",
                                    color: active ? "#fff" : INK,
                                }}
                            >
                                {chip.label}
                                <span className="opacity-60">{counts[chip.key]}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="mt-4 text-xs text-[#5b6478]" aria-live="polite">
                    {fill(labels.results, filtered.length)}
                </p>
            </div>

            {/* Cards */}
            {visible.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((recipe) => (
                        <RecipeCard
                            key={recipe.slug}
                            recipe={recipe}
                            labels={labels}
                            onOpen={openRecipe}
                        />
                    ))}
                </div>
            ) : (
                <p className="mt-16 text-center text-sm text-[#5b6478]">
                    {labels.noResults}
                </p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav
                    aria-label="Paginação"
                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                >
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label={labels.prev}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#0b1220]/15 text-[#0b1220] transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        ←
                    </button>

                    {pageNumbers(currentPage, totalPages).map((n, i) =>
                        n === "…" ? (
                            <span key={`gap-${i}`} className="px-1 text-[#5b6478]">
                                …
                            </span>
                        ) : (
                            <button
                                key={n}
                                type="button"
                                onClick={() => goToPage(n)}
                                aria-label={fill(labels.page, n)}
                                aria-current={n === currentPage ? "page" : undefined}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-sm font-baloo font-medium transition-colors"
                                style={{
                                    borderColor: n === currentPage ? INK : `${INK}26`,
                                    backgroundColor: n === currentPage ? INK : "transparent",
                                    color: n === currentPage ? "#fff" : INK,
                                }}
                            >
                                {n}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label={labels.next}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#0b1220]/15 text-[#0b1220] transition-colors hover:bg-[#0b1220]/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        →
                    </button>
                </nav>
            )}

            {/* =====================================================
                RIGHT SIDE PANEL
            ====================================================== */}
            <Portal>
            <div
                className={`fixed inset-0 z-[9999] ${
                    open
                        ? "visible"
                        : "pointer-events-none invisible transition-[visibility] delay-300"
                }`}
                aria-hidden={!open}
            >
                {/* Backdrop */}
                <div
                    onClick={close}
                    className={`absolute inset-0 bg-[#0b1220]/60 backdrop-blur-sm transition-opacity duration-300 ${
                        open ? "opacity-100" : "opacity-0"
                    }`}
                />

                {/* Panel */}
                <aside
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={selected?.name}
                    className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out sm:rounded-l-[2rem] ${
                        open ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    {selected && (
                        <>
                            {/* Hero image */}
                            <div className="relative h-64 w-full overflow-hidden sm:h-72">
                                {images.length > 0 ? (
                                    <Image
                                        key={images[activeImg]}
                                        src={images[activeImg]}
                                        alt={`${selected.name} (${activeImg + 1}/${images.length})`}
                                        fill
                                        sizes="(min-width: 640px) 576px, 100vw"
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <PlatePlaceholder
                                        color={selected.color}
                                        label={labels.photoSoon}
                                    />
                                )}

                                {/* Close button */}
                                <button
                                    ref={closeRef}
                                    type="button"
                                    onClick={close}
                                    aria-label={labels.close}
                                    className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#0b1220] shadow-md backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                                    style={{ outlineColor: selected.color }}
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M6 6l12 12M18 6L6 18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 px-6 pt-4">
                                    {images.map((src, i) => (
                                        <button
                                            key={src}
                                            type="button"
                                            onClick={() => setActiveImg(i)}
                                            aria-label={`${selected.name} ${i + 1}`}
                                            aria-current={i === activeImg}
                                            className="relative h-16 w-20 cursor-pointer overflow-hidden rounded-xl transition-opacity"
                                            style={{
                                                opacity: i === activeImg ? 1 : 0.55,
                                                boxShadow:
                                                    i === activeImg
                                                        ? `0 0 0 2px ${selected.color}`
                                                        : "none",
                                            }}
                                        >
                                            <Image
                                                src={src}
                                                alt=""
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="px-6 pb-12 pt-6">
                                <span
                                    className="text-[10px] font-montserrat-italic uppercase tracking-[0.18em]"
                                    style={{ color: selected.color }}
                                >
                                    {selected.region}
                                </span>

                                <h3 className="mt-1 font-baloo text-3xl font-bold leading-tight text-[#0b1220]">
                                    {selected.name}
                                </h3>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selected.categories.map((c) => (
                                        <span
                                            key={c}
                                            className="rounded-full px-3 py-1 text-xs font-baloo font-medium"
                                            style={{
                                                backgroundColor: `${selected.color}1f`,
                                                color: selected.color,
                                            }}
                                        >
                                            {labels.categories[c]}
                                        </span>
                                    ))}
                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
                                    {selected.description}
                                </p>

                                <div className="mt-4">
                                    <Meta recipe={selected} labels={labels} />
                                </div>

                                {/* Ingredients */}
                                <h4 className="mt-8 font-baloo text-lg font-medium text-[#0b1220]">
                                    {labels.ingredients}
                                </h4>
                                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                                    {selected.ingredients.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2.5 text-sm text-[#0b1220]"
                                        >
                                            <span
                                                className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full"
                                                style={{ backgroundColor: selected.color }}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                {/* Steps */}
                                <h4 className="mt-8 font-baloo text-lg font-medium text-[#0b1220]">
                                    {labels.steps}
                                </h4>
                                <ol className="mt-3 space-y-4">
                                    {selected.steps.map((step, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span
                                                className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold text-white"
                                                style={{ backgroundColor: selected.color }}
                                            >
                                                {i + 1}
                                            </span>
                                            <p className="pt-0.5 text-sm leading-relaxed text-[#0b1220]">
                                                {step}
                                            </p>
                                        </li>
                                    ))}
                                </ol>

                                {/* Tip */}
                                {selected.tip && (
                                    <div
                                        className="mt-8 rounded-2xl p-4 text-sm leading-relaxed text-[#0b1220]"
                                        style={{ backgroundColor: `${selected.color}14` }}
                                    >
                                        <span
                                            className="mb-1 block text-[10px] font-montserrat-italic uppercase tracking-[0.18em]"
                                            style={{ color: selected.color }}
                                        >
                                            {labels.tip}
                                        </span>
                                        {selected.tip}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </aside>
            </div>
            </Portal>
        </>
    );
}