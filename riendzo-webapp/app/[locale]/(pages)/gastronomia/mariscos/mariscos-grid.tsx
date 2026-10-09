"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Dificuldade = "easy" | "medium" | "hard";

export type PratoVideo = {
    /** ID do vídeo no YouTube (a parte depois de `v=`). */
    youtubeId: string;
    title: string;
    /** Nome do criador de conteúdos moçambicano. */
    creator: string;
    /** Link para o canal ou perfil do criador (para dar crédito). */
    channelUrl?: string;
};

export type Prato = {
    slug: string;
    name: string;
    region: string;
    color: string;
    minutes: number;
    servings: number;
    difficulty: Dificuldade;
    description: string;
    ingredients: string[];
    steps: string[];
    tip?: string;
    /** Fotos do prato, ex.: ["/mariscos/camarao-grelhado-1.jpg"] */
    images: string[];
    /** Vídeos de criadores de conteúdos a preparar o prato. */
    videos: PratoVideo[];
};

export type MariscosGridLabels = {
    ingredients: string;
    steps: string;
    tip: string;
    videos: string;
    /** Modelo com "{count}", ex.: "{count} min" */
    minutes: string;
    /** Modelo com "{count}", ex.: "{count} doses" */
    servings: string;
    /** Modelo com "{creator}", ex.: "por {creator}" */
    videoBy: string;
    difficulty: Record<Dificuldade, string>;
    viewRecipe: string;
    hasVideo: string;
    photoSoon: string;
    close: string;
};

const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
        template
    );

const CLOSE_MS = 250;

export default function MariscosGrid({
    pratos,
    labels,
}: {
    pratos: Prato[];
    labels: MariscosGridLabels;
}) {
    const [active, setActive] = useState<Prato | null>(null);
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<HTMLElement | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);

    function open(prato: Prato, trigger: HTMLElement) {
        triggerRef.current = trigger;
        setActive(prato);
        requestAnimationFrame(() => setVisible(true));
    }

    function close() {
        setVisible(false);
        window.setTimeout(() => {
            setActive(null);
            triggerRef.current?.focus();
        }, CLOSE_MS);
    }

    // Esc fecha, bloqueia o scroll da página e foca o botão de fechar.
    useEffect(() => {
        if (!active) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKey);
        closeBtnRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    return (
        <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pratos.map((p) => (
                    <li key={p.slug}>
                        <button
                            type="button"
                            onClick={(e) => open(p, e.currentTarget)}
                            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#e6e9f0] bg-white text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aefb] focus-visible:ring-offset-2"
                        >
                            <div
                                className="relative aspect-[4/3] w-full"
                                style={{ backgroundColor: p.color }}
                            >
                                {p.images[0] ? (
                                    <Image
                                        src={p.images[0]}
                                        alt={p.name}
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/90">
                                        {labels.photoSoon}
                                    </span>
                                )}
                                {p.videos.length > 0 && (
                                    <span className="absolute left-3 top-3 rounded-full bg-[#0b1220]/80 px-3 py-1 text-xs font-medium text-white">
                                        {labels.hasVideo}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col gap-2 p-5">
                                <span className="text-sm text-[#5b6478]">
                                    {p.region}
                                </span>
                                <h3 className="text-xl font-bold text-[#0b1220]">
                                    {p.name}
                                </h3>
                                <p className="line-clamp-2 text-sm leading-relaxed text-[#5b6478]">
                                    {p.description}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                                    <span className="text-[#5b6478]">
                                        {fill(labels.minutes, {
                                            count: p.minutes,
                                        })}
                                        {" · "}
                                        {labels.difficulty[p.difficulty]}
                                    </span>
                                    <span className="font-semibold text-[#0b1220] group-hover:underline">
                                        {labels.viewRecipe}
                                    </span>
                                </div>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>

            {active &&
                createPortal(
                <div
                    className="fixed inset-0 z-[9999]"
                    role="dialog"
                    aria-modal="true"
                    aria-label={active.name}
                >
                    {/* Fundo */}
                    <div
                        onClick={close}
                        className={`absolute inset-0 bg-[#0b1220]/50 transition-opacity duration-[250ms] motion-reduce:transition-none ${
                            visible ? "opacity-100" : "opacity-0"
                        }`}
                    />

                    {/* Sidebar direito */}
                    <aside
                        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-[250ms] ease-out motion-reduce:transition-none ${
                            visible ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#e6e9f0] px-6 py-4">
                            <div>
                                <p className="text-sm text-[#5b6478]">
                                    {active.region}
                                </p>
                                <h3 className="text-2xl font-bold text-[#0b1220]">
                                    {active.name}
                                </h3>
                            </div>
                            <button
                                ref={closeBtnRef}
                                type="button"
                                onClick={close}
                                aria-label={labels.close}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0b1220] hover:bg-[#f1f3f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aefb]"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                >
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                            <Gallery
                                key={active.slug}
                                prato={active}
                                photoSoon={labels.photoSoon}
                            />

                            <p className="text-base leading-relaxed text-[#5b6478]">
                                {active.description}
                            </p>

                            <div className="flex flex-wrap gap-2 text-sm">
                                {[
                                    fill(labels.minutes, {
                                        count: active.minutes,
                                    }),
                                    fill(labels.servings, {
                                        count: active.servings,
                                    }),
                                    labels.difficulty[active.difficulty],
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full bg-[#f1f3f8] px-3 py-1 text-[#0b1220]"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <section>
                                <h4 className="mb-3 text-lg font-bold text-[#0b1220]">
                                    {labels.ingredients}
                                </h4>
                                <ul className="list-disc space-y-1.5 pl-5 text-[#5b6478] marker:text-[#00aefb]">
                                    {active.ingredients.map((i) => (
                                        <li key={i}>{i}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h4 className="mb-3 text-lg font-bold text-[#0b1220]">
                                    {labels.steps}
                                </h4>
                                <ol className="space-y-4">
                                    {active.steps.map((s, idx) => (
                                        <li key={idx} className="flex gap-3">
                                            <span
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                                style={{
                                                    backgroundColor:
                                                        active.color,
                                                }}
                                            >
                                                {idx + 1}
                                            </span>
                                            <p className="leading-relaxed text-[#5b6478]">
                                                {s}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            {active.videos.length > 0 && (
                                <section>
                                    <h4 className="mb-3 text-lg font-bold text-[#0b1220]">
                                        {labels.videos}
                                    </h4>
                                    <div className="space-y-6">
                                        {active.videos.map((v) => (
                                            <figure key={v.youtubeId}>
                                                <div className="aspect-video w-full overflow-hidden rounded-xl bg-[#0b1220]">
                                                    <iframe
                                                        src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                                                        title={v.title}
                                                        loading="lazy"
                                                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        referrerPolicy="strict-origin-when-cross-origin"
                                                        className="h-full w-full"
                                                    />
                                                </div>
                                                <figcaption className="mt-2 text-sm text-[#5b6478]">
                                                    <span className="font-medium text-[#0b1220]">
                                                        {v.title}
                                                    </span>{" "}
                                                    {v.channelUrl ? (
                                                        <a
                                                            href={v.channelUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline hover:text-[#0b1220]"
                                                        >
                                                            {fill(
                                                                labels.videoBy,
                                                                {
                                                                    creator:
                                                                        v.creator,
                                                                }
                                                            )}
                                                        </a>
                                                    ) : (
                                                        fill(labels.videoBy, {
                                                            creator: v.creator,
                                                        })
                                                    )}
                                                </figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {active.tip && (
                                <section
                                    className="rounded-xl border-l-4 bg-[#f7f8fb] p-4"
                                    style={{ borderColor: active.color }}
                                >
                                    <h4 className="mb-1 font-bold text-[#0b1220]">
                                        {labels.tip}
                                    </h4>
                                    <p className="leading-relaxed text-[#5b6478]">
                                        {active.tip}
                                    </p>
                                </section>
                            )}
                        </div>
                    </aside>
                </div>,
                document.body
            )}
        </>
    );
}

function Gallery({
    prato,
    photoSoon,
}: {
    prato: Prato;
    photoSoon: string;
}) {
    const [index, setIndex] = useState(0);
    const hasImages = prato.images.length > 0;

    return (
        <div>
            <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"
                style={{ backgroundColor: prato.color }}
            >
                {hasImages ? (
                    <Image
                        src={prato.images[index]}
                        alt={`${prato.name} ${index + 1}`}
                        fill
                        sizes="(min-width: 640px) 576px, 100vw"
                        className="object-cover"
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/90">
                        {photoSoon}
                    </span>
                )}
            </div>

            {prato.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                    {prato.images.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`${prato.name} ${i + 1}`}
                            aria-current={i === index}
                            className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aefb] ${
                                i === index
                                    ? "border-[#0b1220]"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            }`}
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
        </div>
    );
}