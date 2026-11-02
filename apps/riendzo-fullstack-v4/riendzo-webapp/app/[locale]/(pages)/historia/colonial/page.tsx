import EraPage from "@/app/components/history/era-page";

const TIMELINE = [
    { year: "1498", text: "Vasco da Gama chega à Ilha de Moçambique, a caminho da Índia." },
    { year: "1558", text: "Começa a construção da Fortaleza de São Sebastião, na Ilha de Moçambique." },
    { year: "1884-85", text: "Conferência de Berlim: Portugal é obrigado a ocupar efetivamente o território." },
    { year: "1895", text: "Ngungunyane, imperador de Gaza, é capturado em Chaimite." },
    { year: "1898", text: "Lourenço Marques (Maputo) torna-se a capital da colónia." },
    { year: "1962", text: "É fundada a FRELIMO, em Dar es Salaam." },
    { year: "1964", text: "Começa a luta armada de libertação, em Cabo Delgado." },
    { year: "1975", text: "A 25 de Junho, Moçambique torna-se independente." },
];

export default async function Page() {
    return (
        <EraPage
            collection="history-colonial" id="colonial" title="Do contacto europeu à luta pela independência"
            lead="A partir de 1498, Moçambique entrou na rota marítima da Índia. Durante séculos, o território foi ocupado, administrado e explorado, e foi também palco de resistência e de nascimento do nacionalismo."
            
            timeline={TIMELINE}
            gridTitle="Marcos do período colonial" gridDescription="Os acontecimentos, os sistemas e as personagens que marcaram este período."
        />
    );
}
