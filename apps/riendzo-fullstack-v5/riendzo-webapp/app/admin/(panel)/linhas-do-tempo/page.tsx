import { requireAdmin } from "@/lib/cms/auth";
import { getAllTimelines, TIMELINES } from "@/lib/cms/timelines";
import TimelinesEditor from "../../_components/timelines-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Linhas do tempo | Riendzo BackOffice" };

export default async function TimelinesAdmin() {
    const s = await requireAdmin();
    if (s.role === "owner") return null;
    const all = await getAllTimelines();
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="font-baloo text-3xl font-bold">Linhas do tempo da História</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Os marcos que aparecem em cada página de História (Reinos e Impérios, História Colonial e Moçambique Moderno).</p>
            <TimelinesEditor eras={TIMELINES.map((t) => ({ id: t.id, label: t.label, events: all[t.id] }))} />
        </div>
    );
}
