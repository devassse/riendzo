"use client";

import { useEffect, useState } from "react";
import type { Weather } from "@/lib/weather";

const TTL = 10 * 60 * 1000;
let cache: { at: number; data: Weather | null } | null = null;
let inflight: Promise<Weather | null> | null = null;

function load(force = false): Promise<Weather | null> {
    if (!force && cache && Date.now() - cache.at < TTL) return Promise.resolve(cache.data);
    inflight ??= fetch("/api/weather")
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j?.data as Weather | undefined) ?? null)
        .catch(() => null)
        .then((data) => {
            cache = { at: Date.now(), data: data ?? cache?.data ?? null };
            inflight = null;
            return cache.data;
        });
    return inflight;
}

/** Current weather (shared between the top bar and the hero card). `loading` is true until the first answer. */
export function useWeather() {
    const [state, setState] = useState<{ weather: Weather | null; loading: boolean }>({
        weather: cache?.data ?? null,
        loading: !cache,
    });

    useEffect(() => {
        let alive = true;
        const run = (force: boolean) =>
            load(force).then((weather) => alive && setState({ weather, loading: false }));
        run(false);
        const id = setInterval(() => run(true), TTL);
        return () => {
            alive = false;
            clearInterval(id);
        };
    }, []);

    return state;
}
