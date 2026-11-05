/** Timelines of the three history eras ("Fita do tempo"), edited in the BackOffice (Linhas do tempo). */
import path from "node:path";
import { CMS_DIR, locked, readJson, writeJson } from "./store";

export type TimelineEvent = { year: string; text: string };

export const TIMELINES = [
    { id: "antiga", label: "Reinos e Impérios (História antiga)" },
    { id: "colonial", label: "História Colonial" },
    { id: "moderna", label: "Moçambique Moderno" },
    { id: "musica", label: "Música › Evolução Musical" },
] as const;
export type TimelineId = (typeof TIMELINES)[number]["id"];

/** First content (what each page showed before it became editable). */
const DEFAULTS: Record<TimelineId, TimelineEvent[]> = {
    antiga: [
        { year: "Sécs. I–V", text: "Povos de língua bantu chegam à região e fixam-se com a agricultura e o trabalho do ferro." },
        { year: "Séc. XI–XV", text: "O Grande Zimbábue prospera com o comércio do ouro e do marfim pelos portos da costa de Sofala." },
        { year: "c. 1450", text: "Forma-se o Estado de Mutapa (Monomotapa), entre o Zambeze e o Save." },
        { year: "1498", text: "Vasco da Gama chega à Ilha de Moçambique, a caminho da Índia." },
    ],
    colonial: [
        { year: "1498", text: "Vasco da Gama chega à Ilha de Moçambique, a caminho da Índia." },
        { year: "1558", text: "Começa a construção da Fortaleza de São Sebastião, na Ilha de Moçambique." },
        { year: "1884-85", text: "Conferência de Berlim: Portugal é obrigado a ocupar efetivamente o território." },
        { year: "1895", text: "Ngungunyane, imperador de Gaza, é capturado em Chaimite." },
        { year: "1898", text: "Lourenço Marques (Maputo) torna-se a capital da colónia." },
        { year: "1962", text: "É fundada a FRELIMO, em Dar es Salaam." },
        { year: "1964", text: "Começa a luta armada de libertação, em Cabo Delgado." },
        { year: "1975", text: "A 25 de Junho, Moçambique torna-se independente." },
    ],
    // empty = the page builds the timeline from what is registered in Música › Evolução Musical
    musica: [],
    moderna: [
        { year: "1975", text: "A 25 de Junho, Moçambique torna-se independente, com Samora Machel como primeiro Presidente." },
        { year: "1977", text: "Começa a guerra civil, que dura 16 anos." },
        { year: "1986", text: "Morre o Presidente Samora Machel, em Mbuzini." },
        { year: "1992", text: "Em Roma, é assinado o Acordo Geral de Paz." },
        { year: "1994", text: "Realizam-se as primeiras eleições multipartidárias." },
    ],
};

const FILE = path.join(CMS_DIR, "_timelines.json");
type Stored = Partial<Record<TimelineId, TimelineEvent[]>>;

export async function getTimeline(id: TimelineId): Promise<TimelineEvent[]> {
    const stored = (await readJson<Stored>(FILE)) ?? {};
    return stored[id] ?? DEFAULTS[id];
}

export async function getAllTimelines() {
    return Object.fromEntries(await Promise.all(TIMELINES.map(async (t) => [t.id, await getTimeline(t.id)]))) as Record<TimelineId, TimelineEvent[]>;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function saveTimeline(id: string, events: TimelineEvent[]) {
    return locked(async () => {
        if (!TIMELINES.some((t) => t.id === id)) return { ok: false as const, error: "Linha do tempo desconhecida." };
        const list = (Array.isArray(events) ? events : []).map((e) => ({ year: clean(e.year, 20), text: clean(e.text, 300) })).filter((e) => e.year || e.text);
        if (list.some((e) => !e.year || !e.text)) return { ok: false as const, error: "Cada acontecimento precisa de ano e de texto." };
        if (list.length > 40) return { ok: false as const, error: "No máximo 40 acontecimentos." };
        const all = (await readJson<Stored>(FILE)) ?? {};
        all[id as TimelineId] = list;
        await writeJson(FILE, all);
        return { ok: true as const };
    });
}
