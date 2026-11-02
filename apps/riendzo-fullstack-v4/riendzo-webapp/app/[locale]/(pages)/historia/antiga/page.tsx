import EraPage from "@/app/components/history/era-page";
import { LanguageExplorer } from "@/app/components/history/mozambique-explorer";

export default async function Page() {
    return (
        <EraPage
            collection="history-ancient" id="antiga" title="Reinos, povos e línguas"
            lead="Muito antes da chegada dos europeus, o território era casa de povos de língua bantu, de reinos do interior e de cidades-porto da costa. Explore o mapa das línguas e descubra os marcos desta história."
            extras={<LanguageExplorer />}
            
            gridTitle="Marcos e personagens" gridDescription="Reinos, rotas comerciais e povos de Moçambique antes da ocupação portuguesa."
        />
    );
}
