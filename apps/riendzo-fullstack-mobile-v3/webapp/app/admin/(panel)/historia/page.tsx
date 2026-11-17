import { requireAdmin } from "@/lib/cms/auth";
import { getHistoryTheme, HISTORY_SECTIONS } from "@/lib/cms/history-theme";
import HistoryTheme from "../../_components/history-theme";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aspeto da Cronologia | Riendzo BackOffice" };

export default async function HistoryAppearance() {
    const s = await requireAdmin();
    if (s.role === "owner") return null;
    const theme = await getHistoryTheme();
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="font-baloo text-3xl font-bold">Aspeto da Cronologia</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Cor de fundo de cada secção da página Cronologia de Moçambique. O conteúdo de cada secção vem dos menus História; em “História independente” cada entrada pode ter a sua cor (preto, verde, vermelho ou amarelo).</p>
            <HistoryTheme sections={HISTORY_SECTIONS.map((x) => ({ id: x.id, label: x.label, fallback: x.fallback, value: theme[x.id] ?? "" }))} />
        </div>
    );
}
