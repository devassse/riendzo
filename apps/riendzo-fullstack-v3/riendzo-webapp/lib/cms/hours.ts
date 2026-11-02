/**
 * Opening-hours logic (pure, runs on server and client).
 * All times are Africa/Maputo (UTC+2, no daylight saving).
 */
import { DAYS, type DayKey, type OpeningHours, type TimeRange } from "@/app/components/sections/catalog-types";

export const DAY_LABELS: Record<DayKey, string> = {
    mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta", fri: "Sexta", sat: "Sábado", sun: "Domingo",
};
export const DAY_SHORT: Record<DayKey, string> = {
    mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom",
};

export type OpenState = {
    /** open = green, soon = warning (closes in ≤ 60 min), closed = red, unknown = no schedule */
    state: "open" | "soon" | "closed" | "always" | "unknown";
    label: string;
    minutesLeft?: number;
};

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

const JS_TO_KEY: Record<string, DayKey> = { Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun" };

export function nowInMaputo(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Maputo", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(date);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const hour = Number(get("hour")) % 24;
    return { day: JS_TO_KEY[get("weekday")] ?? "mon", minutes: hour * 60 + Number(get("minute")) };
}

export const hasSchedule = (h?: OpeningHours) =>
    Boolean(h && (h.open24h || DAYS.some((d) => (h[d] ?? []).length > 0)));

export function openState(hours: OpeningHours | undefined, date = new Date()): OpenState {
    if (!hours || !hasSchedule(hours)) return { state: "unknown", label: "" };
    if (hours.open24h) return { state: "always", label: "Aberto 24 horas" };

    const { day, minutes: now } = nowInMaputo(date);
    const idx = DAYS.indexOf(day);
    const today: TimeRange[] = hours[day] ?? [];
    const yesterday: TimeRange[] = hours[DAYS[(idx + 6) % 7]] ?? [];

    let left: number | null = null;
    for (const r of today) {
        const o = toMin(r.open), c = toMin(r.close);
        if (c > o && now >= o && now < c) left = c - now;
        else if (c <= o && now >= o) left = 1440 - now + c; // closes after midnight
    }
    for (const r of yesterday) {
        const o = toMin(r.open), c = toMin(r.close);
        if (c <= o && now < c) left = c - now; // still open from yesterday's late shift
    }

    const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);
    if (left !== null) {
        return left <= 60
            ? { state: "soon", label: `Fecha em ${hm(left)}`, minutesLeft: left }
            : { state: "open", label: "Aberto agora", minutesLeft: left };
    }

    // Closed: when does it open next?
    const later = today.map((r) => toMin(r.open)).filter((o) => o > now).sort((a, b) => a - b)[0];
    if (later !== undefined) {
        return { state: "closed", label: `Fechado · abre às ${String(Math.floor(later / 60)).padStart(2, "0")}:${String(later % 60).padStart(2, "0")}` };
    }
    for (let n = 1; n <= 7; n++) {
        const d = DAYS[(idx + n) % 7];
        const first = (hours[d] ?? []).map((r) => r.open).sort()[0];
        if (first) return { state: "closed", label: `Fechado · abre ${n === 1 ? "amanhã" : DAY_LABELS[d].toLowerCase()} às ${first}` };
    }
    return { state: "closed", label: "Fechado" };
}

export const STATE_STYLE: Record<OpenState["state"], { bg: string; fg: string; dot: string }> = {
    open: { bg: "#2f9e441f", fg: "#1f7a33", dot: "#2f9e44" },
    always: { bg: "#2f9e441f", fg: "#1f7a33", dot: "#2f9e44" },
    soon: { bg: "#ffc14d40", fg: "#8a5a00", dot: "#d98a00" },
    closed: { bg: "#d23b251a", fg: "#b5311d", dot: "#d23b25" },
    unknown: { bg: "#0b122010", fg: "#4b5568", dot: "#8892a6" },
};

/** "08:00–12:00, 14:00–18:00" or "Fechado" */
export function formatDay(ranges: TimeRange[] | undefined) {
    return ranges?.length ? ranges.map((r) => `${r.open}–${r.close}`).join(", ") : "Fechado";
}
