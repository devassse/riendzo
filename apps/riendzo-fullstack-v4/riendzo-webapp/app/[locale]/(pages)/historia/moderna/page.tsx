import EraPage from "@/app/components/history/era-page";
import { ProvinceExplorer } from "@/app/components/history/mozambique-explorer";
import { getTerritories } from "@/lib/cms/territories";

export default async function Page() {
    return (
        <EraPage
            collection="history-modern" id="moderna" title="Independência, guerra, paz e democracia"
            lead="Desde 1975, Moçambique construiu o seu Estado, atravessou 16 anos de guerra civil e conquistou a paz. Conheça as províncias, a população e os marcos dos últimos 60 anos."
            extras={<ProvinceExplorer territories={await getTerritories()} />}
            
            gridTitle="Marcos e personagens" gridDescription="Da luta de libertação à democracia: as datas e as figuras que marcaram o país."
        />
    );
}
