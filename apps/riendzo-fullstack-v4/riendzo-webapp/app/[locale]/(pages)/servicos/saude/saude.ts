import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Saúde. General guidance only; it is not medical advice. */
export const SAUDE: CatalogItem[] = [
    {
        slug: "unidades-sanitarias",
        title: "Unidades sanitárias e hospitais",
        tag: "Rede pública",
        categories: ["Atendimento"],
        color: "#e5533d",
        emoji: "🏥",
        summary:
            "A rede pública vai do centro de saúde da comunidade aos hospitais distritais, provinciais e centrais.",
        meta: ["Serviço Nacional de Saúde", "Triagem à chegada"],
        facts: [
            { label: "Entidade", value: "Ministério da Saúde (MISAU)" },
            { label: "Níveis", value: "Centro de saúde, hospital distrital, provincial e central" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Boas práticas",
                items: [
                    "Procure primeiro o centro de saúde mais próximo",
                    "Leve BI e o cartão de saúde, quando houver",
                    "Chegue cedo, porque as filas podem ser longas",
                    "Pergunte sempre pelo horário de funcionamento",
                ],
            },
        ],
        tip: "Em caso de urgência, não espere: vá diretamente ao serviço de urgências mais próximo.",
        keywords: ["hospital", "centro de saude", "misau", "sns"],
    },
    {
        slug: "vacinacao",
        title: "Vacinação infantil",
        tag: "Prevenção",
        categories: ["Prevenção", "Mãe e criança"],
        color: "#35be12",
        emoji: "💉",
        summary:
            "O Programa Alargado de Vacinação oferece as vacinas essenciais às crianças nas unidades sanitárias públicas.",
        meta: ["Gratuita nas unidades públicas", "Cartão de saúde da criança"],
        facts: [
            { label: "Programa", value: "Programa Alargado de Vacinação (PAV)" },
            { label: "Onde", value: "Unidades sanitárias públicas" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Levar sempre o cartão de saúde da criança",
                    "Cumprir as datas marcadas no cartão",
                    "Perguntar na unidade sanitária qual é o calendário atual",
                    "Procurar o centro de saúde se perder uma dose, sem esperar",
                ],
            },
        ],
        tip: "O calendário pode ser atualizado pelo Ministério da Saúde. Confirme sempre com o profissional de saúde.",
        keywords: ["vacina", "pav", "crianca", "calendario"],
    },
    {
        slug: "saude-mulher-crianca",
        title: "Saúde da mulher e da criança",
        tag: "Mãe e criança",
        categories: ["Mãe e criança"],
        color: "#c86b8c",
        emoji: "🤱",
        summary:
            "Consultas pré-natais, parto assistido, planeamento familiar e acompanhamento do crescimento das crianças.",
        meta: ["Consultas pré-natais", "Parto na unidade sanitária"],
        facts: [
            { label: "Quando começar", value: "Assim que souber que está grávida" },
            { label: "Onde", value: "Centros de saúde e maternidades" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Importante",
                items: [
                    "Fazer as consultas pré-natais ao longo da gravidez",
                    "Preferir o parto numa unidade sanitária",
                    "Levar o recém-nascido às consultas de seguimento",
                    "Falar com a equipa sobre planeamento familiar",
                ],
            },
        ],
        tip: "Sinais de perigo na gravidez exigem ida imediata à unidade sanitária.",
        keywords: ["gravidez", "parto", "mae", "crianca", "planeamento familiar"],
    },
    {
        slug: "malaria",
        title: "Malária: prevenir e tratar",
        tag: "Prevenção",
        categories: ["Prevenção"],
        color: "#f0a83a",
        emoji: "🦟",
        summary:
            "A malária é comum em Moçambique. Dormir debaixo de rede mosquiteira e procurar teste rápido com febre salva vidas.",
        meta: ["Febre: fazer teste", "Rede mosquiteira"],
        facts: [
            { label: "Sinais", value: "Febre, calafrios, dores de cabeça e de corpo" },
            { label: "Prevenção", value: "Rede mosquiteira, repelente e eliminar água parada" },
        ],
        blocks: [
            {
                kind: "steps",
                heading: "Se tiver febre",
                items: [
                    "Não espere: vá à unidade sanitária mais próxima.",
                    "Peça o teste rápido de malária.",
                    "Tome o tratamento até ao fim, como indicado pelo profissional.",
                ],
            },
        ],
        tip: "Viajantes devem falar com um médico sobre profilaxia antes de viajar.",
        keywords: ["malaria", "mosquito", "febre", "rede mosquiteira"],
    },
    {
        slug: "hiv-tb",
        title: "HIV e Tuberculose",
        tag: "Testagem e tratamento",
        categories: ["Prevenção", "Atendimento"],
        color: "#00aefb",
        emoji: "🩺",
        summary:
            "Testagem, aconselhamento e tratamento disponíveis nas unidades sanitárias públicas.",
        meta: ["Testagem confidencial", "Tratamento contínuo"],
        facts: [
            { label: "Onde", value: "Unidades sanitárias públicas" },
            { label: "Importante", value: "Quem inicia tratamento deve mantê-lo sem interrupções" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Em geral",
                items: [
                    "Fazer o teste e receber aconselhamento",
                    "Seguir o tratamento todos os dias",
                    "Tosse com mais de duas semanas: procurar teste de tuberculose",
                    "Falar com profissionais de saúde sem receio",
                ],
            },
        ],
        tip: "Se tiver dúvidas ou medo de ser julgado, fale com um técnico de saúde: é uma conversa profissional.",
        keywords: ["hiv", "sida", "tb", "tuberculose", "teste", "tarv"],
    },
    {
        slug: "emergencias",
        title: "Emergências e números úteis",
        tag: "Urgência",
        categories: ["Urgência"],
        color: "#e5533d",
        emoji: "🚑",
        summary:
            "Saiba quem chamar numa emergência e guarde estes números no telemóvel.",
        meta: ["Ambulância, polícia e bombeiros"],
        facts: [
            { label: "Ambulância", value: "117" },
            { label: "Polícia", value: "119" },
            { label: "Bombeiros", value: "197" },
            { label: "Linha Fala Criança", value: "116" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Ao ligar",
                items: [
                    "Diga onde está, com ponto de referência",
                    "Explique o que aconteceu e quantas pessoas precisam de ajuda",
                    "Mantenha-se na linha e siga as indicações",
                ],
            },
        ],
        tip: "Os números podem mudar ou variar por zona. Confirme-os nos canais oficiais.",
        keywords: ["emergencia", "ambulancia", "117", "119", "197", "116"],
    },
];
