import { requireAdmin } from "@/lib/cms/auth";
import { getIntro, INTROS } from "@/lib/cms/page-intros";
import PageIntros from "../../_components/page-intros";

export const dynamic = "force-dynamic";
export const metadata = { title: "Textos das páginas | Riendzo BackOffice" };

export default async function PageTexts() {
    const s = await requireAdmin();
    if (s.role === "owner") return null;
    const rows = await Promise.all(INTROS.map(async (i) => ({ id: i.id, label: i.label, hint: i.hint, ...(await getIntro(i.id)) })));
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="font-baloo text-3xl font-bold">Textos das páginas</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Pequenos textos que abrem algumas páginas do site.</p>
            <PageIntros rows={rows} />
        </div>
    );
}
