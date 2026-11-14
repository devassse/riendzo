import { requireAdmin } from "@/lib/cms/auth";
import { getAllTimelines, TIMELINES } from "@/lib/cms/timelines";
import { getPublishedItems } from "@/lib/cms/store";
import type { CatalogItem } from "@/app/components/sections/catalog-types";
import TimelinesEditor from "../../_components/timelines-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Linhas do tempo | Riendzo BackOffice" };

export default async function TimelinesAdmin() {
    const s = await requireAdmin();
    if (s.role === "owner") return null;
    const all = await getAllTimelines();
    // Evolução Musical: until edited here, the timeline is the registered content (era + title)
    const derived = (await getPublishedItems<CatalogItem>("music-evolution")).map((i) => ({ year: i.tag, text: i.title }));
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="font-baloo text-3xl font-bold">Linhas do tempo da História</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Os marcos que aparecem em cada página de História (Reinos e Impérios, História Colonial e Moçambique Moderno).</p>
            <TimelinesEditor eras={TIMELINES.map((t) => ({ id: t.id, label: t.label, events: t.id === "musica" && all.musica.length === 0 ? derived : all[t.id], hint: t.id === "musica" ? "Enquanto não guardar aqui, a página usa os conteúdos registados em Música › Evolução Musical (era + título). Ao guardar, passa a usar esta lista; para voltar ao automático, apague todos os acontecimentos e guarde." : undefined }))} />
        </div>
    );
}
