/** Current weather from Open-Meteo (free, no API key), cached in memory. */

export type Condition =
    | "clear" | "fair" | "partly-cloudy" | "cloudy" | "fog"
    | "drizzle" | "rain" | "showers" | "thunderstorm";

export type Weather = {
    location: string;
    temp: number;
    condition: Condition;
    isDay: boolean;
    dayMax: number;
    nightMin: number;
    updatedAt: string;
};

/** WMO weather code -> condition */
export function conditionFromCode(code: number): Condition {
    if (code === 0) return "clear";
    if (code === 1) return "fair";
    if (code === 2) return "partly-cloudy";
    if (code === 3) return "cloudy";
    if (code === 45 || code === 48) return "fog";
    if (code >= 51 && code <= 57) return "drizzle";
    if ((code >= 61 && code <= 67) || (code >= 71 && code <= 77)) return "rain";
    if (code >= 80 && code <= 86) return "showers";
    if (code >= 95) return "thunderstorm";
    return "cloudy";
}

const TTL = 10 * 60 * 1000;
const STALE = 6 * 60 * 60 * 1000; // if Open-Meteo is down, serve the last answer for up to 6 h
const cache = new Map<string, { at: number; data: Weather }>();

export async function getWeather(lat: number, lon: number, name: string): Promise<Weather> {
    // ~1 km precision is plenty and keeps the cache small
    const la = Math.round(lat * 100) / 100;
    const lo = Math.round(lon * 100) / 100;
    const key = `${la},${lo}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return { ...hit.data, location: name };

    try {
        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${la}&longitude=${lo}` +
            "&current=temperature_2m,weather_code,is_day" +
            "&daily=temperature_2m_max,temperature_2m_min" +
            "&timezone=auto&forecast_days=1";
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const j = (await res.json()) as {
            current: { temperature_2m: number; weather_code: number; is_day: number };
            daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
        };
        const data: Weather = {
            location: name,
            temp: Math.round(j.current.temperature_2m),
            condition: conditionFromCode(j.current.weather_code),
            isDay: j.current.is_day === 1,
            dayMax: Math.round(j.daily.temperature_2m_max[0]),
            nightMin: Math.round(j.daily.temperature_2m_min[0]),
            updatedAt: new Date().toISOString(),
        };
        cache.set(key, { at: Date.now(), data });
        if (cache.size > 200) cache.delete(cache.keys().next().value as string);
        return data;
    } catch (e) {
        if (hit && Date.now() - hit.at < STALE) return { ...hit.data, location: name };
        throw e;
    }
}
