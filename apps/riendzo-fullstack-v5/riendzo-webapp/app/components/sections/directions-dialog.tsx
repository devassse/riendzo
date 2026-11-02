"use client";

import { useEffect, useState } from "react";

type GeoStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

const IconClose = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

/**
 * "Como chegar" pop-up: shows the route from where the visitor is (with their permission) to the place,
 * right inside the page. The button to open it in Google Maps is inside the pop-up.
 */
export default function DirectionsDialog({
    location,
    onClose,
}: {
    location: { name: string; lat: number; lng: number; address?: string } | null;
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
