"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type EspeciariaVideo = {
    /** ID do vídeo no YouTube (a parte depois de `v=`). */
    youtubeId: string;
    title: string;
    /** Nome do criador de conteúdos moçambicano. */
    creator: string;
    /** Link para o canal ou perfil do criador (para dar crédito). */
    channelUrl?: string;
};

export type Especiaria = {
    slug: string;
    name: string;
    /** Tipo em texto livre, ex.: "Pimenta", "Mistura de especiarias", "Raiz". */
    kind: string;
    region: string;
    color: string;
    /** Picância de 0 (nenhuma) a 5 (muito forte). */
    heat: 0 | 1 | 2 | 3 | 4 | 5;
    description: string;
    flavor: string;
    uses: string[];
    pairsWith: string[];
    /** Pratos tradicionais onde aparece. */
    dishes: string[];
    storage?: string;
    /** Fotos, ex.: ["/especiarias/piri-piri-1.jpg"] */
    images: string[];
    /** Vídeos de criadores de conteúdos a usar a especiaria. */
    videos: EspeciariaVideo[];
};

export type EspeciariasGridLabels = {
    flavor: string;
    uses: string;
    pairsWith: string;
    dishes: string;
    storage: string;
    region: string;
    videos: string;
    /** Modelo com "{level}", ex.: "Picância {level} de 5" */
    heat: string;
    /** Modelo com "{creator}", ex.: "por {creator}" */
    videoBy: string;
    viewDetails: string;
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

function HeatDots({
    level,
    color,
    label,
}: {
    level: number;
    color: string;
    label: string;
}) {
    return (
        <span role="img" aria-label={label} className="inline-flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                        backgroundColor: n <= level ? color : "#e6e9f0",
                    }}
                />
            ))}
        </span>
    );
}

export default function EspeciariasGrid({
    especiarias,
    labels,
}: {
    especiarias: Especiaria[];
    labels: EspeciariasGridLabels;
}) {
    const [active, setActive] = useState<Especiaria | null>(null);
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<HTMLElement | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);

    function open(item: Especiaria, trigger: HTMLElement) {
        triggerRef.current = trigger;
        setActive(item);
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
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {especiarias.map((e) => (
                    <li key={e.slug}>
                        <button
                            type="button"
                            onClick={(ev) => open(e, ev.currentTarget)}
                            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#e6e9f0] bg-white text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aefb] focus-visible:ring-offset-2"
                        >
                            <div
                                className="relative aspect-square w-full"
                                style={{ backgroundColor: e.color }}
                            >
                                {e.images[0] ? (
                                    <Image
                                        src={e.images[0]}
                                        alt={e.name}
                                        fill
                                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/90">
                                        {labels.photoSoon}
                                    </span>
                                )}
                                {e.videos.length > 0 && (
                                    <span className="absolute left-3 top-3 rounded-full bg-[#0b1220]/80 px-3 py-1 text-xs font-medium text-white">
                                        {labels.hasVideo}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col gap-2 p-5">
                                <span className="text-sm text-[#5b6478]">
                                    {e.kind}
                                </span>
                                <h3 className="text-xl font-bold text-[#0b1220]">
                                    {e.name}
                                </h3>
                                <p className="line-clamp-2 text-sm leading-relaxed text-[#5b6478]">
                                    {e.description}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                                    <HeatDots
                                        level={e.heat}
                                        color={e.color}
                                        label={fill(labels.heat, {
                                            level: e.heat,
                                        })}
                                    />
                                    <span className="font-semibold text-[#0b1220] group-hover:underline">
                                        {labels.viewDetails}
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
                                        {active.kind}
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
                                    item={active}
                                    photoSoon={labels.photoSoon}
                                />

                                <p className="text-base leading-relaxed text-[#5b6478]">
                                    {active.description}
                                </p>

                                <dl className="grid grid-cols-2 gap-4 rounded-xl bg-[#f7f8fb] p-4 text-sm">
                                    <div>
                                        <dt className="font-semibold text-[#0b1220]">
                                            {labels.region}
                                        </dt>
                                        <dd className="mt-1 text-[#5b6478]">
                                            {active.region}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-[#0b1220]">
                                            {fill(labels.heat, {
                                                level: active.heat,
                                            })}
                                        </dt>
                                        <dd className="mt-1">
                                            <HeatDots
                                                level={active.heat}
                                                color={active.color}
                                                label={fill(labels.heat, {
                                                    level: active.heat,
                                                })}
                                            />
                                        </dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="font-semibold text-[#0b1220]">
                                            {labels.flavor}
                                        </dt>
                                        <dd className="mt-1 text-[#5b6478]">
                                            {active.flavor}
                                        </dd>
                                    </div>
                                </dl>

                                <TagSection
                                    title={labels.uses}
                                    items={active.uses}
                                />
                                <TagSection
                                    title={labels.pairsWith}
                                    items={active.pairsWith}
                                />

                                <section>
                                    <h4 className="mb-3 text-lg font-bold text-[#0b1220]">
                                        {labels.dishes}
                                    </h4>
                                    <ul className="list-disc space-y-1.5 pl-5 text-[#5b6478] marker:text-[#00aefb]">
                                        {active.dishes.map((d) => (
                                            <li key={d}>{d}</li>
                                        ))}
                                    </ul>
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
                                                                href={
                                                                    v.channelUrl
                                                                }
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
                                                            fill(
                                                                labels.videoBy,
                                                                {
                                                                    creator:
                                                                        v.creator,
                                                                }
                                                            )
                                                        )}
                                                    </figcaption>
                                                </figure>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {active.storage && (
                                    <section
                                        className="rounded-xl border-l-4 bg-[#f7f8fb] p-4"
                                        style={{ borderColor: active.color }}
                                    >
                                        <h4 className="mb-1 font-bold text-[#0b1220]">
                                            {labels.storage}
                                        </h4>
                                        <p className="leading-relaxed text-[#5b6478]">
                                            {active.storage}
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

function TagSection({ title, items }: { title: string; items: string[] }) {
    if (items.length === 0) return null;
    return (
        <section>
            <h4 className="mb-3 text-lg font-bold text-[#0b1220]">{title}</h4>
            <ul className="flex flex-wrap gap-2">
                {items.map((i) => (
                    <li
                        key={i}
                        className="rounded-full bg-[#f1f3f8] px-3 py-1 text-sm text-[#0b1220]"
                    >
                        {i}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function Gallery({
    item,
    photoSoon,
}: {
    item: Especiaria;
    photoSoon: string;
}) {
    const [index, setIndex] = useState(0);
    const hasImages = item.images.length > 0;

    return (
        <div>
            <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"
                style={{ backgroundColor: item.color }}
            >
                {hasImages ? (
                    <Image
                        src={item.images[index]}
                        alt={`${item.name} ${index + 1}`}
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

            {item.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                    {item.images.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`${item.name} ${i + 1}`}
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