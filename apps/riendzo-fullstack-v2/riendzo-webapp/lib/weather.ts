/**
 * Weather for the site (server only). Reads from the Riendzo API when
 * RIENDZO_API_URL is set; otherwise asks Open-Meteo directly (free, no key).
 */
export type Condition =
    | "clear" | "fair" | "partly-cloudy" | "cloudy" | "fog"
    | "drizzle" | "rain" | "showers" | "thunderstorm";

export type Weather = {
    location: string;
    /** °C, rounded */
    temp: number;
    condition: Condition;
    isDay: boolean;
    /** today's maximum ("Day") and minimum ("Night"), °C */
    dayMax: number;
    nightMin: number;
    updatedAt: string;
};

export const MAPUTO = { name: "Maputo", lat: -25.96, lon: 32.59 };

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

async function fromOpenMeteo(): Promise<Weather> {
    const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${MAPUTO.lat}&longitude=${MAPUTO.lon}` +
        "&current=temperature_2m,weather_code,is_day" +
        "&daily=temperature_2m_max,temperature_2m_min" +
        "&timezone=Africa%2FMaputo&forecast_days=1";
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const j = await res.json();
    return {
        location: MAPUTO.name,
        temp: Math.round(j.current.temperature_2m),
        condition: conditionFromCode(j.current.weather_code),
        isDay: j.current.is_day === 1,
        dayMax: Math.round(j.daily.temperature_2m_max[0]),
        nightMin: Math.round(j.daily.temperature_2m_min[0]),
        updatedAt: new Date().toISOString(),
    };
}

export async function getWeather(): Promise<Weather | null> {
    const api = (process.env.RIENDZO_API_URL ?? "").replace(/\/+$/, "");
    try {
        if (api) {
            const res = await fetch(
                `${api}/api/v1/weather?lat=${MAPUTO.lat}&lon=${MAPUTO.lon}&name=${MAPUTO.name}`,
                { next: { revalidate: 600 } }
            );
            if (res.ok) return ((await res.json()) as { data: Weather }).data;
        }
        return await fromOpenMeteo();
    } catch {
        return null;
    }
}
