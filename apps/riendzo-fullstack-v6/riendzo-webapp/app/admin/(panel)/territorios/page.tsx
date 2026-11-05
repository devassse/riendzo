import { requireAdmin } from "@/lib/cms/auth";
import { PROVINCES } from "@/lib/data/mozambique";
import { getTerritories } from "@/lib/cms/territories";
import TerritoriesManager from "../../_components/territories-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Divisão administrativa | Riendzo BackOffice" };

export default async function TerritoriesAdmin() {
    const s = await requireAdmin();
    if (s.role === "owner") return null;
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="font-baloo text-3xl font-bold">Divisão administrativa</h1>
            <p className="mb-6 mt-1 text-sm text-[#4b5568]">Registe distritos, municípios, postos, localidades e bairros e associe-os ao que lhes corresponde. Aparecem no mapa de Moçambique, quando se clica numa província.</p>
            <TerritoriesManager all={await getTerritories()} provinces={PROVINCES.map((p) => ({ id: p.id, name: p.name }))} />
        </div>
    );
}
