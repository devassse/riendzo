/** Short texts that open some pages (e.g. "pequena história" of Evolução Musical), edited in the BackOffice (Textos das páginas). */
import path from "node:path";
import { CMS_DIR, locked, readJson, writeJson } from "./store";

export type Intro = { title: string; story: string };

export const INTROS = [
    {
        id: "music-evolution",
        label: "Música › Evolução Musical",
        hint: "Pequena história que aparece por cima da linha do tempo. A linha do tempo vem dos conteúdos registados em Música › Evolução Musical. Separe os parágrafos com uma linha em branco.",
        fallback: {
            title: "Uma pequena história da música moçambicana",
            story:
                "A música de Moçambique nasce da terra e das comunidades: as timbilas dos chopes, os tambores e as danças do norte e do centro, os cantos de trabalho e de cerimónia. Cada região guardou os seus instrumentos, as suas línguas e os seus ritmos.\n\n" +
                "Com o crescimento das cidades, e em especial de Maputo, esses sons encontraram influências de outros lugares e deram origem a estilos urbanos, como a marrabenta. Depois da independência a música tornou-se também voz do país, e nas últimas décadas o hip-hop, o pandza e outros sons novos continuam a contar Moçambique de maneira própria.",
        } satisfies Intro,
    },
] as const;

const FILE = path.join(CMS_DIR, "_page-intros.json");
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function getIntro(id: string): Promise<Intro> {
    const def = INTROS.find((i) => i.id === id)?.fallback ?? { title: "", story: "" };
    const stored = ((await readJson<Record<string, Partial<Intro>>>(FILE)) ?? {})[id];
    return { title: stored?.title?.trim() || def.title, story: stored?.story?.trim() || def.story };
}

export function saveIntro(id: string, input: Partial<Intro>) {
    return locked(async () => {
        if (!INTROS.some((i) => i.id === id)) return { ok: false as const, error: "Página desconhecida." };
        const all = (await readJson<Record<string, Intro>>(FILE)) ?? {};
        all[id] = { title: clean(input.title, 120), story: clean(input.story, 4000) };
        await writeJson(FILE, all);
        return { ok: true as const };
    });
}
