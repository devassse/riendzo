/**
 * Forgiving search (pure functions, usable on the server and in the browser):
 * ignores accents and case, accepts typos and spelling variants ("praya" finds "Praia",
 * "marabenta" finds "Marrabenta", "Azagaia" finds "Azagaias") and says what to highlight.
 */

export const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Lower-case words without accents or punctuation. */
export const tokens = (s: string) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);

/** Spelling variants that sound alike are written the same: y→i, k→c, ph→f, ce/ci→se/si, double letters… */
export function phonetic(w: string) {
    return w
        .replace(/ph/g, "f").replace(/ck/g, "c").replace(/k/g, "c").replace(/y/g, "i").replace(/w/g, "u")
        .replace(/c(?=[ei])/g, "s").replace(/z/g, "s").replace(/ss/g, "s").replace(/ç/g, "s")
        .replace(/h/g, "").replace(/(.)\1+/g, "$1");
}

/** Edit distance counting a swap of two neighbouring letters as one mistake (Damerau–Levenshtein). */
function distance(a: string, b: string, max: number) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const prev2: number[] = [];
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        let best = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, (prev2[j - 2] ?? 99) + 1);
            cur[j] = v;
            best = Math.min(best, v);
        }
        if (best > max) return max + 1;
        prev2.splice(0, prev2.length, ...prev);
        prev = cur;
    }
    return prev[b.length];
}

/** How many typos are tolerated for a word of this length. */
const allowed = (len: number) => (len <= 3 ? 0 : len <= 5 ? 1 : 2);

/**
 * How well a typed word matches one word of the content: 1 exact, 0.9 beginning of the word,
 * 0.8 inside the word, 0.7 sounds alike / small typo, 0 no match.
 */
export function wordScore(q: string, t: string): number {
    if (!q || !t) return 0;
    if (q === t) return 1;
    if (q.length >= 2 && t.startsWith(q)) return 0.9;
    if (q.length >= 3 && t.includes(q)) return 0.8;
    const pq = phonetic(q);
    const pt = phonetic(t);
    if (pq.length >= 3 && pq === pt) return 0.75;
    if (pq.length >= 3 && pt.length > pq.length && pt.startsWith(pq)) return 0.72;
    const max = allowed(Math.min(q.length, t.length));
    if (max === 0) return 0;
    if (distance(q, t, max) <= max) return 0.7;
    // typo at the beginning of a longer word ("praya" vs "prayas")
    if (t.length > q.length && distance(q, t.slice(0, q.length), max) <= max) return 0.65;
    return 0;
}

export type Match = { score: number; /** at least one word matched only approximately */ fuzzy: boolean };

/** Every typed word must match something in the content; the score favours exact and title matches. */
export function matchText(queryWords: string[], contentTokens: string[], titleTokens: string[] = []): Match | null {
    if (!queryWords.length) return null;
    let total = 0;
    let fuzzy = false;
    for (const q of queryWords) {
        let best = 0;
        for (const t of contentTokens) {
            const s = wordScore(q, t);
            if (s > best) best = s;
            if (best === 1) break;
        }
        if (best === 0) return null;
        let inTitle = 0;
        for (const t of titleTokens) inTitle = Math.max(inTitle, wordScore(q, t));
        if (best < 0.8) fuzzy = true;
        total += best + inTitle * 2;
    }
    return { score: total, fuzzy };
}

/** Splits a text into pieces, marking the words that match what was typed (used for highlighting). */
export function highlightParts(text: string, query: string): { text: string; hit: boolean }[] {
    const words = tokens(query);
    if (!words.length || !text) return [{ text, hit: false }];
    return text.split(/([\p{L}\p{N}]+)/u).filter((p) => p !== "").map((p) => {
        const isWord = /^[\p{L}\p{N}]+$/u.test(p);
        return { text: p, hit: isWord && words.some((q) => wordScore(q, fold(p)) >= 0.65) };
    });
}
