'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import { Link } from '@/i18n/navigation';

/* ---------------------------------------------------------------- */
/*  Icons                                                            */
/* ---------------------------------------------------------------- */

function Base(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        />
    );
}

const IconId = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="11" r="2" />
        <path d="M5.5 16c.5-1.8 1.8-2.5 3-2.5s2.5.7 3 2.5" />
        <path d="M14 9h5M14 12h5M14 15h3" />
    </Base>
);

const IconHealth = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 21s-7-4.5-9.5-9.2C1 8.3 2.7 5 6 5c2 0 3.3 1 4 2.3C10.7 6 12 5 14 5c3.3 0 5 3.3 3.5 6.8C15 16.5 12 21 12 21z" />
        <path d="M9 12h2l1-2 2 4 1-2h2" />
    </Base>
);

const IconEducation = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M2 8l10-4 10 4-10 4-10-4z" />
        <path d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
        <path d="M22 8v6" />
    </Base>
);

const IconTax = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M9 8h6M9 11.5h6M9 15h4" />
        <path d="M9 3v0" />
    </Base>
);

const IconPin = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.4" />
    </Base>
);

const IconClock = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
    </Base>
);

const IconPhone = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M5 4h3l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v3a2 2 0 01-2 2C10 21 3 14 3 6a2 2 0 012-2z" />
    </Base>
);

const IconCompass = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-2 5-5 2 2-5 5-2z" />
    </Base>
);

const IconClose = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M6 6l12 12M18 6L6 18" />
    </Base>
);

const IconArrow = (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </Base>
);

/* ---------------------------------------------------------------- */
/*  Data                                                             */
/* ---------------------------------------------------------------- */

type ServiceLocation = {
    name: string;
    address: string;
    hours: string;
    phone: string;
    lat: number;
    lng: number;
};

/** One entry of a category: a place (with coordinates) or an information page. */
export type ServiceRow = {
    name: string;
    href: string;
    summary?: string;
    address?: string;
    hours?: string;
    phone?: string;
    lat?: number;
    lng?: number;
};

export type EmergencyNumber = { emoji: string; label: string; number: string };

export type ServiceCategory = {
    title: string;
    description: string;
    href: string;
    /** "documents" | "health" | "education" | "taxes" | anything else (default icon) */
    iconKey: string;
    rows: ServiceRow[];
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "services-documents": <IconId />, "services-health": <IconHealth />, "services-education": <IconEducation />, "services-taxes": <IconTax />,
};

/* ---------------------------------------------------------------- */
/*  Directions modal                                                 */
/* ---------------------------------------------------------------- */

type GeoStatus =
    | 'idle'
    | 'loading'
    | 'granted'
    | 'denied'
    | 'unsupported';

function DirectionsModal({
    location,
    onClose,
}: {
    location: ServiceLocation | null;
    onClose: () => void;
}) {
    const [status, setStatus] = useState<GeoStatus>('idle');

    const [origin, setOrigin] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        if (!location) return;

        if (!('geolocation' in navigator)) {
            setStatus('unsupported');
            return;
        }

        setStatus('loading');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setOrigin({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });

                setStatus('granted');
            },
            () => {
                setStatus('denied');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    }, [location]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        if (location) {
            document.addEventListener('keydown', handleKey);
        }

        return () => {
            document.removeEventListener('keydown', handleKey);
        };
    }, [location, onClose]);

    if (!location) return null;

    const destParam = `${location.lat},${location.lng}`;

    const embedSrc = origin
        ? `https://maps.google.com/maps?saddr=${origin.lat},${origin.lng}&daddr=${destParam}&output=embed`
        : `https://maps.google.com/maps?q=${destParam}&output=embed`;

    const openInMapsHref = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destParam}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destParam}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Como chegar a ${location.name}`}
                className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Modal header */}

                <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#05a8e9]">
                            Como chegar
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-[#050f22]">
                            {location.name}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[#5c6660] transition-colors hover:bg-black/5"
                    >
                        <IconClose className="h-5 w-5" />
                    </button>
                </div>

                {/* Map */}

                <div className="relative aspect-[4/3] w-full bg-[#f0f2ee] sm:aspect-[16/10]">
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#05a8e9] border-t-transparent" />

                            <p className="text-sm text-[#5c6660]">
                                A obter a sua localização…
                            </p>
                        </div>
                    )}

                    {status === 'denied' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                            <p className="text-sm text-[#5c6660]">
                                Não conseguimos aceder à sua localização.
                                <br />
                                Pode abrir a rota directamente no Google Maps.
                            </p>

                            <a
                                href={openInMapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-[#05a8e9] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#05a8e9]/90"
                            >
                                Abrir no Google Maps
                            </a>
                        </div>
                    )}

                    {status === 'unsupported' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                            <p className="text-sm text-[#5c6660]">
                                O seu navegador não suporta localização
                                automática.
                            </p>

                            <a
                                href={openInMapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-[#05a8e9] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#05a8e9]/90"
                            >
                                Abrir no Google Maps
                            </a>
                        </div>
                    )}

                    {status === 'granted' && (
                        <iframe
                            title={`Rota até ${location.name}`}
                            src={embedSrc}
                            className="h-full w-full border-0"
                            loading="lazy"
                        />
                    )}
                </div>

                {/* Modal footer */}

                <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[#5c6660]">
                        {location.address}
                    </p>

                    <a
                        href={openInMapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-none text-xs font-semibold text-[#05a8e9] hover:underline"
                    >
                        Abrir no Google Maps →
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Location card                                                    */
/* ---------------------------------------------------------------- */

function RowCard({
    row,
    onDirections,
    directionsLabel,
    openLabel,
}: {
    row: ServiceRow;
    onDirections: (loc: ServiceLocation) => void;
    directionsLabel: string;
    openLabel: string;
}) {
    const located = typeof row.lat === 'number' && typeof row.lng === 'number';
    return (
        <div className="rounded-xl border border-black/5 bg-[#f7f5f0] p-5">
            <div className="flex items-start gap-2">
                <IconPin className="mt-0.5 h-4 w-4 flex-none text-[#05a8e9]" />
                <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-[#050f22]">{row.name}</p>
                    {(row.address || row.summary) && <p className="mt-1 text-xs leading-relaxed text-[#5c6660]">{row.address ?? row.summary}</p>}
                </div>
            </div>

            {(row.hours || row.phone) && (
                <div className="mt-3 space-y-1.5 pl-6">
                    {row.hours && (
                        <div className="flex items-start gap-2 text-xs text-[#5c6660]"><IconClock className="mt-0.5 h-3.5 w-3.5 flex-none" /><span>{row.hours}</span></div>
                    )}
                    {row.phone && (
                        <div className="flex items-center gap-2 text-xs text-[#5c6660]"><IconPhone className="h-3.5 w-3.5 flex-none" /><span>{row.phone}</span></div>
                    )}
                </div>
            )}

            {located ? (
                <button
                    type="button"
                    onClick={() => onDirections({ name: row.name, address: row.address ?? '', hours: row.hours ?? '', phone: row.phone ?? '', lat: row.lat!, lng: row.lng! })}
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#05a8e9] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#05a8e9]/90 hover:shadow-md"
                >
                    <IconCompass className="h-4 w-4" />
                    {directionsLabel}
                </button>
            ) : (
                <Link href={row.href} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#05a8e9] px-4 py-2 text-xs font-semibold text-[#05a8e9] transition-colors hover:bg-[#05a8e9]/10">
                    {openLabel}
                    <IconArrow className="h-3.5 w-3.5" />
                </Link>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Category card                                                    */
/* ---------------------------------------------------------------- */

function CategoryCard({
    category,
    onDirections,
    labels,
}: {
    category: ServiceCategory;
    onDirections: (loc: ServiceLocation) => void;
    labels: ServicesLabels;
}) {
    /*
     * Only three locations are shown in the homepage preview.
     * The complete list belongs to the category page.
     */
    const previewLocations = category.rows.slice(0, 3);

    return (
        <div className="rounded-2xl border border-black/5 bg-white p-6 transition-shadow duration-300 hover:shadow-lg">
            {/* Category header */}

            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#05a8e9]/10 text-[#05a8e9]">
                    <span className="h-5 w-5">
                        {CATEGORY_ICONS[category.iconKey] ?? <IconPin />}
                    </span>
                </span>

                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-[#050f22]">
                        {category.title}
                    </h3>

                    <p className="mt-1 text-sm leading-relaxed text-[#5c6660]">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Locations */}

            <div className="mt-5 space-y-3">
                {previewLocations.map((location) => (
                    <RowCard
                        key={location.href}
                        row={location}
                        onDirections={onDirections}
                        directionsLabel={labels.directions}
                        openLabel={labels.open}
                    />
                ))}
            </div>

            {/* See all */}

            <div className="mt-5 border-t border-black/5 pt-4">
                <Link
                    href={category.href}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-[#05a8e9] transition-all"
                >
                    <span>{labels.seeAll}</span>

                    <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- */
/*  Section                                                          */
/* ---------------------------------------------------------------- */

export type ServicesLabels = {
    eyebrow: string; title: string; description: string; directions: string; open: string; seeAll: string; exploreAll: string;
    emergencyEyebrow: string; emergencyTitle: string; emergencyAll: string; emergencyNote: string; call: string;
};

export default function PublicServicesView({ categories, emergency, labels }: { categories: ServiceCategory[]; emergency: EmergencyNumber[]; labels: ServicesLabels }) {
    const [selected, setSelected] = useState<ServiceLocation | null>(null);

    return (
        <section id="servicos" aria-labelledby="services-title" className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-20">
                <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold tracking-[0.15em] text-[#05a8e9]">{labels.eyebrow}</span>
                    <h2 id="services-title" className="mt-2 text-4xl font-bold tracking-tight text-[#050f22] sm:text-5xl">{labels.title}</h2>
                    <p className="mt-4 text-base leading-relaxed text-[#5c6660]">{labels.description}</p>
                </div>

                {categories.length > 0 && (
                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        {categories.map((category) => (
                            <CategoryCard key={category.href} category={category} onDirections={setSelected} labels={labels} />
                        ))}
                    </div>
                )}

                {/* Emergency numbers: always one tap away (managed in Serviços > Emergências) */}
                {emergency.length > 0 && (
                    <div className="mt-10 rounded-3xl border border-[#e5533d]/30 bg-[#e5533d]/[0.06] p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e5533d]">{labels.emergencyEyebrow}</p>
                                <h3 className="font-baloo text-xl font-bold text-[#050f22]">{labels.emergencyTitle}</h3>
                            </div>
                            <Link href="/servicos/emergencias" className="text-sm font-medium text-[#050f22] underline underline-offset-4">{labels.emergencyAll}</Link>
                        </div>
                        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {emergency.map((e) => (
                                <li key={e.label + e.number}>
                                    <a href={`tel:${e.number.replace(/[^\d+]/g, '')}`} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm transition-transform hover:-translate-y-0.5" aria-label={`${labels.call} ${e.label} ${e.number}`}>
                                        <span className="text-2xl" aria-hidden="true">{e.emoji}</span>
                                        <span>
                                            <span className="block text-xs text-[#4b5568]">{e.label}</span>
                                            <span className="block font-baloo text-2xl font-bold leading-none text-[#e5533d]">{e.number}</span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-[11px] text-[#5b6478]">{labels.emergencyNote}</p>
                    </div>
                )}

                <div className="mt-10 flex justify-center">
                    <Link href="/servicos" className="group inline-flex items-center gap-2 rounded-full border border-[#050f22]/10 bg-[#050f22] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
                        <span>{labels.exploreAll}</span>
                        <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
            <DirectionsModal location={selected} onClose={() => setSelected(null)} />
        </section>
    );
}
