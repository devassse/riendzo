/** Background colour of each section of the Cronologia page (BackOffice: História). */
import path from "node:path";
import { CMS_DIR, locked, readJson, writeJson } from "./store";

export const HISTORY_SECTIONS = [
    { id: "realms", label: "Reinos e Impérios", fallback: "#ecdfc4" },
    { id: "ancient", label: "Povos antigos (linha do tempo)", fallback: "#5e8ed8" },
    { id: "colonial", label: "História colonial", fallback: "#dee5e8" },
    { id: "independent", label: "História independente", fallback: "#f4ecd8" },
] as const;
export type HistorySectionId = (typeof HISTORY_SECTIONS)[number]["id"];
export type HistoryTheme = Partial<Record<HistorySectionId, string>>;

const FILE = path.join(CMS_DIR, "_history-theme.json");
const HEX = /^#[0-9a-fA-F]{6}$/;

export async function getHistoryTheme(): Promise<HistoryTheme> {
    return (await readJson<HistoryTheme>(FILE)) ?? {};
}

export function saveHistoryTheme(input: HistoryTheme) {
    return locked(async () => {
        const out: HistoryTheme = {};
        for (const s of HISTORY_SECTIONS) if (input[s.id] && HEX.test(input[s.id]!)) out[s.id] = input[s.id];
        await writeJson(FILE, out);
        return out;
    });
}
