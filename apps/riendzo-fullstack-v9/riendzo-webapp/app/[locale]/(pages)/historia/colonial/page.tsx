import EraPage from "@/app/components/history/era-page";
import { getTimeline } from "@/lib/cms/timelines";

export default async function Page() {
    return (
        <EraPage
            collection="history-colonial" id="colonial" title="Do contacto europeu à luta pela independência"
            lead="A partir de 1498, Moçambique entrou na rota marítima da Índia. Durante séculos, o território foi ocupado, administrado e explorado, e foi também palco de resistência e de nascimento do nacionalismo."
            
            timeline={await getTimeline("colonial")}
            gridTitle="Marcos do período colonial" gridDescription="Os acontecimentos, os sistemas e as personagens que marcaram este período."
        />
    );
}
