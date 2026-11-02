import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Parques Nacionais e reservas. Content in Portuguese, like the recipes. */
export const PARQUES: CatalogItem[] = [
    {
        slug: "gorongosa",
        title: "Parque Nacional da Gorongosa",
        tag: "Sofala",
        categories: ["Safari", "Natureza"],
        color: "#35be12",
        emoji: "🦁",
        summary:
            "Um dos grandes casos de recuperação da vida selvagem em África: leões, elefantes, hipopótamos e centenas de espécies de aves no Grande Vale do Rift.",
        meta: ["Melhor época: Maio a Outubro", "Perto da Beira"],
        facts: [
            { label: "Província", value: "Sofala" },
            { label: "Recuperação", value: "Projeto de restauro em curso desde 2004" },
            { label: "Paisagens", value: "Savana, florestas, planícies do lago Urema e o Monte Gorongosa" },
            { label: "Acampamento principal", value: "Chitengo" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Safári em veículo aberto com guias do parque",
                    "Passeios a pé acompanhados por guias",
                    "Observação de aves no lago Urema",
                    "Caminhada ao Monte Gorongosa, com floresta de altitude",
                    "Visitas às comunidades e projetos de educação do parque",
                ],
            },
            { kind: "tags", heading: "Ideal para", items: ["Safári", "Fotografia", "Famílias", "Observação de aves"] },
        ],
        tip: "Na época das chuvas algumas áreas e estradas ficam inacessíveis; confirme as condições e reserve com antecedência.",
        keywords: ["gorongosa", "safari", "leoes", "elefantes", "sofala", "beira"],
        images: ["/home/gorongosa.png"],
    },
    {
        slug: "niassa",
        title: "Reserva Nacional do Niassa",
        tag: "Niassa",
        categories: ["Safari", "Natureza", "Aventura"],
        color: "#c86b8c",
        emoji: "🐘",
        summary:
            "A maior área protegida de Moçambique: um território imenso e pouco visitado, de savana e florestas de miombo, com cães-selvagens e elefantes.",
        meta: ["Mais de 40 mil km²", "Destino para aventureiros"],
        facts: [
            { label: "Províncias", value: "Niassa e Cabo Delgado" },
            { label: "Ambiente", value: "Floresta de miombo, inselbergs e rios sazonais" },
            { label: "Fauna", value: "Elefantes, leões, cães-selvagens, palanca-negra e muitas aves" },
            { label: "Acesso", value: "Longas viagens de estrada; planeie com operadores locais" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Safári em acampamentos remotos",
                    "Caminhadas guiadas na natureza",
                    "Observação de aves e de grandes mamíferos",
                    "Viagem de aventura para quem procura natureza sem multidões",
                ],
            },
        ],
        tip: "É uma viagem de logística exigente. Leve combustível extra, mantimentos e confirme tudo com os operadores antes de partir.",
        keywords: ["niassa", "reserva", "caes-selvagens", "miombo", "lichinga"],
    },
    {
        slug: "limpopo",
        title: "Parque Nacional do Limpopo",
        tag: "Gaza",
        categories: ["Safari", "Natureza"],
        color: "#f0a83a",
        emoji: "🐘",
        summary:
            "Parte do Grande Parque Transfronteiriço do Limpopo, ligado ao Kruger (África do Sul) e a Gonarezhou (Zimbabwe).",
        meta: ["Parque transfronteiriço", "Rio Limpopo e lago Massingir"],
        facts: [
            { label: "Província", value: "Gaza" },
            { label: "Criação", value: "Parque criado em 2001, no âmbito da área transfronteiriça" },
            { label: "Paisagem", value: "Savana, desfiladeiros do rio dos Elefantes e o lago Massingir" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Safári de dia inteiro com guia",
                    "Observação de elefantes e búfalos",
                    "Passeios de barco no lago Massingir",
                    "Campismo junto ao rio",
                ],
            },
        ],
        tip: "Quem chega pela África do Sul deve confirmar os requisitos de fronteira e de passagem pelo parque.",
        keywords: ["limpopo", "massingir", "gaza", "kruger", "transfronteirico"],
    },
    {
        slug: "quirimbas-parque",
        title: "Parque Nacional das Quirimbas",
        tag: "Cabo Delgado",
        categories: ["Natureza", "Marinho"],
        color: "#00aefb",
        emoji: "🐠",
        summary:
            "Um parque que reúne floresta costeira, mangais e ilhas de coral entre Pemba e o rio Rovuma.",
        meta: ["Criado em 2002", "Terra e mar"],
        facts: [
            { label: "Província", value: "Cabo Delgado" },
            { label: "Área", value: "Mais de 7 mil km², incluindo parte das ilhas Quirimbas" },
            { label: "Fauna", value: "Elefantes de floresta, aves, tartarugas e peixes de recife" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Passeios de barco e mergulho nos recifes",
                    "Observação de aves e vida selvagem",
                    "Visitas às comunidades costeiras",
                ],
            },
        ],
        tip: "Consulte avisos de viagem atualizados antes de visitar áreas de Cabo Delgado.",
        keywords: ["quirimbas", "cabo delgado", "mangais", "recifes"],
        images: ["/home/quirimbas.jpg"],
    },
    {
        slug: "reserva-de-maputo",
        title: "Reserva Especial de Maputo",
        tag: "Maputo",
        categories: ["Safari", "Natureza", "Marinho"],
        color: "#35be12",
        emoji: "🦓",
        summary:
            "Dunas, lagoas, pântanos e praias selvagens a sul de Maputo, onde se veem elefantes, zebras e muitas aves.",
        meta: ["A 2 a 3 horas de Maputo", "Costa preservada"],
        facts: [
            { label: "Província", value: "Maputo" },
            { label: "Área", value: "Cerca de mil km²" },
            { label: "Destaque", value: "Elefantes, aves aquáticas e dunas de costa" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Safári de um dia desde Maputo",
                    "Passeios pelas dunas e lagoas",
                    "Observação de aves",
                    "Combinar com uma estadia em Ponta do Ouro",
                ],
            },
        ],
        tip: "Um veículo 4x4 é recomendado: as pistas dentro da reserva são de areia.",
        keywords: ["maputo", "reserva", "elefantes", "matutuine"],
    },
    {
        slug: "zinave",
        title: "Parque Nacional de Zinave",
        tag: "Inhambane",
        categories: ["Safari", "Natureza"],
        color: "#f0a83a",
        emoji: "🦒",
        summary:
            "Parque renascido: depois de décadas de abandono, voltou a receber animais reintroduzidos, de girafas a zebras e gnus.",
        meta: ["Reintrodução de espécies", "Menos visitado"],
        facts: [
            { label: "Província", value: "Inhambane" },
            { label: "Área", value: "Cerca de 4 mil km²" },
            { label: "Recuperação", value: "Programa de repovoamento com apoio de parceiros de conservação" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Safári em veículo aberto",
                    "Observação de girafas, zebras e antílopes",
                    "Passeios junto ao rio Save",
                ],
            },
        ],
        tip: "Verifique os acessos e a época: algumas estradas ficam difíceis com chuva.",
        keywords: ["zinave", "inhambane", "girafas", "rio save", "reintroducao"],
    },
    {
        slug: "chimanimani",
        title: "Chimanimani",
        tag: "Manica",
        categories: ["Aventura", "Natureza"],
        color: "#e5533d",
        emoji: "⛰️",
        summary:
            "Montanhas na fronteira com o Zimbabwe, com trilhos, cascatas e o Monte Binga, o ponto mais alto de Moçambique.",
        meta: ["Caminhadas de 1 a 4 dias", "Monte Binga: 2 436 m"],
        facts: [
            { label: "Província", value: "Manica" },
            { label: "Destaque", value: "Monte Binga, o pico mais alto do país" },
            { label: "Ideal para", value: "Caminhadas e observação de plantas raras" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Trilhos de montanha com guia local",
                    "Banho nas piscinas naturais e cascatas",
                    "Campismo na montanha",
                    "Observação de aves e flora de altitude",
                ],
            },
        ],
        tip: "Leve roupa quente: à noite faz frio na montanha. Confirme a situação dos trilhos depois da época das chuvas.",
        keywords: ["chimanimani", "binga", "montanha", "manica", "caminhada"],
    },
];
