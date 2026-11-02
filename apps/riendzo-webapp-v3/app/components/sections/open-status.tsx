"use client";

import { useEffect, useState } from "react";
import { DAYS, type OpeningHours } from "./catalog-types";
import { DAY_LABELS, STATE_STYLE, formatDay, hasSchedule, nowInMaputo, openState, type OpenState } from "@/lib/cms/hours";

/** Green = open, orange = closing within the hour, red = closed. Refreshes every minute. */
export function OpenPill({ hours, size = "sm" }: { hours?: OpeningHours; size?: "sm" | "md" }) {
    const [state, setState] = useState<OpenState | null>(null);
    useEffect(() => {
        const tick = () => setState(openState(hours));
        tick();
        const id = setInterval(tick, 60_000);
        return () => clearInterval(id);
    }, [hours]);

    if (!state || state.state === "unknown") return null;
    const st = STATE_STYLE[state.state];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[11px]"}`}
            style={{ backgroundColor: st.bg, color: st.fg }}
            role="status"
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
            {state.label}
        </span>
    );
}

/** Weekly table with today highlighted. */
export function HoursTable({ hours, color = "#0054b5" }: { hours?: OpeningHours; color?: string }) {
    const [today, setToday] = useState<string | null>(null);
    useEffect(() => setToday(nowInMaputo().day), []);
    if (!hours || !hasSchedule(hours)) return hours?.note ? <p className="text-sm text-[#5b6478]">{hours.note}</p> : null;

    return (
        <div>
            {hours.open24h ? (
                <p className="text-sm font-medium text-[#1f7a33]">Aberto 24 horas</p>
            ) : (
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                    {DAYS.map((d) => (
                        <div key={d} className="contents">
                            <dt className={today === d ? "font-semibold" : "text-[#5b6478]"} style={today === d ? { color } : undefined}>{DAY_LABELS[d]}</dt>
                            <dd className={today === d ? "font-semibold" : ""} style={today === d ? { color } : undefined}>{formatDay(hours[d])}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {hours.note && <p className="mt-2 text-xs text-[#5b6478]">{hours.note}</p>}
        </div>
    );
}
