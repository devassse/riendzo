/**
 * LRC lyrics format (the de-facto standard for synchronised lyrics).
 *
 *   [00:12.50]Verse one line
 *   [00:17.00]<00:17.00>Word <00:17.40>by <00:17.80>word      (enhanced LRC, optional)
 *
 * Lines without a timestamp are kept as plain (unsynchronised) text.
 * Pure module: used by the BackOffice editor, the server validation and the player.
 */
import type { LyricLine } from "./artist-types";

const LINE_TIME = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/;
const WORD_TIME = /<(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?>/g;

const toSeconds = (m: string, s: string, f?: string) =>
    Number(m) * 60 + Number(s) + (f ? Number(f) / 10 ** f.length : 0);

export const MAX_LINES = 400;

export function parseLrc(text: string): LyricLine[] {
    const out: LyricLine[] = [];
    let expanded = false;
    for (const raw of text.replace(/\r/g, "").split("\n")) {
        if (out.length >= MAX_LINES) break;
        let rest = raw.trim();
        // metadata tags such as [ar:Artist] or [ti:Title]
        if (/^\[[a-z]{2,}:[^\]]*\]$/i.test(rest)) continue;

        const times: number[] = [];
        let m: RegExpExecArray | null;
        while ((m = LINE_TIME.exec(rest))) {
            times.push(toSeconds(m[1], m[2], m[3]));
            rest = rest.slice(m[0].length).trim();
        }

        // enhanced LRC: <mm:ss.xx>word
        let words: LyricLine["words"];
        if (/<\d/.test(rest)) {
            const parts = rest.split(WORD_TIME); // [pre, m, s, f, word, m, s, f, word...]
            const ws: { time: number; text: string }[] = [];
            for (let i = 1; i + 3 < parts.length + 1; i += 4) {
                const w = (parts[i + 3] ?? "").trim();
                if (w) ws.push({ time: toSeconds(parts[i], parts[i + 1], parts[i + 2] || undefined), text: w });
            }
            if (ws.length) {
                words = ws;
                rest = ws.map((w) => w.text).join(" ");
            } else rest = rest.replace(WORD_TIME, "").trim();
        }

        const clean = rest.slice(0, 200);
        if (times.length === 0) {
            out.push({ text: clean });
        } else {
            if (times.length > 1) expanded = true;
            for (const t of times) out.push({ time: Math.round(t * 100) / 100, text: clean, ...(words && times.length === 1 ? { words } : {}) });
        }
    }
    // Lines with several timestamps ([01:05][01:30]chorus) were expanded above: put them in time
    // order. Untimed lines keep their place by inheriting the time of the line before them.
    if (expanded) {
        let carry = 0;
        const keyed = out.map((l, i) => { if (l.time !== undefined) carry = l.time; return { l, k: carry, i }; });
        return keyed.sort((a, b) => a.k - b.k || a.i - b.i).map((x) => x.l);
    }
    return out;
}

export const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t - m * 60;
    return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
};

export function formatLrc(lines: LyricLine[] | undefined): string {
    return (lines ?? [])
        .map((l) => {
            if (l.time === undefined) return l.text;
            const body = l.words?.length ? l.words.map((w) => `<${formatTime(w.time)}>${w.text}`).join(" ") : l.text;
            return `[${formatTime(l.time)}]${body}`;
        })
        .join("\n");
}

/** Plain lines (with or without LRC stamps) -> texts only. */
export const plainLines = (text: string) => parseLrc(text).map((l) => l.text);

export const isSynced = (lines: LyricLine[] | undefined) =>
    Boolean(lines && lines.filter((l) => l.time !== undefined).length >= 2);

/**
 * Start / end of every word of a line, in seconds. Real word timings are used when
 * available; otherwise the line's duration is shared between words by their length.
 */
export function wordTimings(lines: LyricLine[], index: number, fallbackEnd: number): { text: string; start: number; end: number }[] {
    const line = lines[index];
    if (line.time === undefined) return [];
    const nextTimed = lines.slice(index + 1).find((l) => l.time !== undefined);
    const lineEnd = Math.min(nextTimed?.time ?? fallbackEnd, line.time + 12);

    if (line.words?.length) {
        return line.words.map((w, i) => ({ text: w.text, start: w.time, end: line.words![i + 1]?.time ?? lineEnd }));
    }
    const words = line.text.split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const weights = words.map((w) => Math.max(2, w.length));
    const total = weights.reduce((a, b) => a + b, 0);
    // leave a short breath before the next line starts
    const span = Math.max(0.4, lineEnd - line.time - 0.15);
    let cursor = line.time;
    return words.map((text, i) => {
        const start = cursor;
        cursor += (weights[i] / total) * span;
        return { text, start, end: cursor };
    });
}

/** Index of the line being sung at time `t` (-1 before the first line). */
export function currentLine(lines: LyricLine[], t: number): number {
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        const lt = lines[i].time;
        if (lt !== undefined && lt <= t + 0.05) idx = i;
        else if (lt !== undefined && lt > t) break;
    }
    return idx;
}
