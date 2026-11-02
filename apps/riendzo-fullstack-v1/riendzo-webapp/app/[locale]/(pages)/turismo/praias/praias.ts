import type { CatalogItem } from "@/app/components/sections/catalog-types";

/**
 * Praias & Ilhas. Content in Portuguese, like the recipes.
 * To add photos: images: ["/turismo/bazaruto-1.jpg", ...] (files in /public).
 * Without photos an emoji cover is shown.
 */
export const PRAIAS: CatalogItem[] = [
    {
        slug: "bazaruto",
        title: "Arquipélago de Bazaruto",
        tag: "Inhambane",
        categories: ["Ilhas", "Mergulho"],
        color: "#00aefb",
        emoji: "🏝️",
        summary:
            "Cinco ilhas de dunas, águas turquesa e recifes de coral, protegidas desde 1971 como parque nacional marinho.",
        meta: ["Melhor época: Maio a Outubro", "Acesso: barco ou voo desde Vilankulo"],
        facts: [
            { label: "Província", value: "Inhambane" },
            { label: "Ilhas principais", value: "Bazaruto, Benguérua, Magaruque, Santa Carolina e Bangué" },
            { label: "Ponto de partida", value: "Vilankulo" },
            { label: "Destaque", value: "Dugongo, tartarugas e recifes de coral" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Passeio de dhow (barco tradicional à vela) entre as ilhas",
                    "Mergulho e snorkelling nos recifes",
                    "Descer as dunas de areia da ilha de Bazaruto",
                    "Pesca desportiva com guias locais",
                    "Almoço de marisco fresco numa praia deserta",
                ],
            },
            { kind: "tags", heading: "Ideal para", items: ["Casais", "Mergulhadores", "Fotografia", "Descanso"] },
        ],
        tip: "Reserve a travessia com um operador registado em Vilankulo e confirme sempre a maré e o vento antes de sair.",
        keywords: ["bazaruto", "vilankulo", "dugongo", "mergulho", "parque marinho"],
        images: ["/home/bazaruto.jpeg"],
    },
    {
        slug: "tofo-barra",
        title: "Tofo e Barra",
        tag: "Inhambane",
        categories: ["Vida marinha", "Mergulho", "Aventura"],
        color: "#35be12",
        emoji: "🦈",
        summary:
            "Dois dos melhores locais do país para mergulhar com tubarões-baleia e jiboias-do-mar (mantas), e para ver baleias-corcunda.",
        meta: ["Baleias: Julho a Outubro", "Surf e mergulho todo o ano"],
        facts: [
            { label: "Província", value: "Inhambane" },
            { label: "Cidade mais próxima", value: "Inhambane (cerca de 20 a 30 minutos de estrada)" },
            { label: "Vida marinha", value: "Tubarão-baleia, mantas, golfinhos e baleias-corcunda (sazonal)" },
            { label: "Ambiente", value: "Praias longas, pousadas de mochileiros e escolas de mergulho" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Saída de barco para nadar com tubarões-baleia",
                    "Mergulho nos recifes de Manta Reef e arredores",
                    "Aulas de surf em Tofo",
                    "Passeio de bicicleta ou quad pelas dunas",
                    "Pôr do sol na praia da Barra",
                ],
            },
        ],
        tip: "Escolha operadores que respeitem as regras de interação com os animais: nunca toque nem persiga tubarões e mantas.",
        keywords: ["tofo", "barra", "tubarao-baleia", "manta", "surf", "baleias"],
        images: ["/home/dolphins.jpg"],
    },
    {
        slug: "vilankulo",
        title: "Vilankulo",
        tag: "Inhambane",
        categories: ["Relax", "Ilhas"],
        color: "#f0a83a",
        emoji: "⛵",
        summary:
            "Vila costeira tranquila, com barcos tradicionais na praia, mercado de peixe e ponto de partida para o Bazaruto.",
        meta: ["Ambiente descontraído", "Voos desde Maputo"],
        facts: [
            { label: "Província", value: "Inhambane" },
            { label: "Como chegar", value: "Estrada EN1 ou voo para o aeroporto local" },
            { label: "Ideal para", value: "Base para ilhas, kitesurf e descanso" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Ver os dhows a sair e a entrar de manhã e ao fim do dia",
                    "Comer peixe e marisco grelhado na marginal",
                    "Excursão de um dia à Ilha de Santa Carolina",
                    "Experimentar kitesurf e vela nas águas rasas",
                ],
            },
        ],
        tip: "Compre peixe e camarão diretamente aos pescadores ao fim da tarde: é fresco e mais barato.",
        keywords: ["vilankulo", "dhow", "kitesurf", "santa carolina"],
    },
    {
        slug: "ponta-do-ouro",
        title: "Ponta d'Ouro e Malongane",
        tag: "Maputo",
        categories: ["Vida marinha", "Aventura", "Mergulho"],
        color: "#00aefb",
        emoji: "🐬",
        summary:
            "Praias de dunas junto à fronteira sul, famosas pelos golfinhos, pelo mergulho e pelo ambiente de festa.",
        meta: ["Golfinhos todo o ano", "Perto da fronteira com a África do Sul"],
        facts: [
            { label: "Província", value: "Maputo" },
            { label: "Reserva marinha", value: "Reserva Parcial Marinha da Ponta do Ouro" },
            { label: "Ambiente", value: "Alojamento em chalés e campismo; vida noturna animada em Malongane" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Nadar com golfinhos (com operadores licenciados)",
                    "Mergulho em recifes como Pinnacles e Kinkie's",
                    "Pesca e passeios de barco",
                    "Festivais de música em Malongane, em Maio",
                    "Passeio pelas dunas até à Reserva Especial de Maputo",
                ],
            },
        ],
        tip: "As estradas de areia exigem cuidado: confirme o estado do percurso e leve um veículo adequado, de preferência 4x4.",
        keywords: ["ponta do ouro", "malongane", "golfinhos", "mergulho", "sul"],
    },
    {
        slug: "quirimbas",
        title: "Arquipélago das Quirimbas",
        tag: "Cabo Delgado",
        categories: ["Ilhas", "Mergulho", "Relax"],
        color: "#c86b8c",
        emoji: "🌴",
        summary:
            "Cerca de três dezenas de ilhas de coral ao largo de Pemba, com recifes intactos, ruínas coloniais e ourivesaria tradicional na ilha do Ibo.",
        meta: ["Melhor época: Maio a Novembro", "Acesso desde Pemba"],
        facts: [
            { label: "Província", value: "Cabo Delgado" },
            { label: "Ilhas conhecidas", value: "Ibo, Quirimba, Matemo, Medjumbe, Vamizi e Quilálea" },
            { label: "Destaque", value: "Mergulho em recifes e vila histórica do Ibo" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Velejar de dhow entre as ilhas",
                    "Visitar os fortes e as casas antigas da ilha do Ibo",
                    "Ver ourives a trabalhar a prata no Ibo",
                    "Mergulhar nos recifes de coral",
                ],
            },
        ],
        tip: "Antes de planear a viagem, consulte os avisos de viagem atualizados para Cabo Delgado e fale com operadores locais sobre a situação de segurança.",
        keywords: ["quirimbas", "ibo", "vamizi", "pemba", "ilhas"],
        images: ["/home/quirimbas.jpg"],
    },
    {
        slug: "bilene-xai-xai",
        title: "Bilene e Xai-Xai",
        tag: "Gaza",
        categories: ["Praias", "Relax"],
        color: "#35be12",
        emoji: "🏖️",
        summary:
            "As praias favoritas de quem vive em Maputo: a lagoa calma de Bilene e as longas praias de Xai-Xai.",
        meta: ["Perto de Maputo", "Ótimo para famílias"],
        facts: [
            { label: "Província", value: "Gaza" },
            { label: "Distância de Maputo", value: "Cerca de 2 a 3 horas de estrada" },
            { label: "Ambiente", value: "Lagoa de águas calmas e praia de mar aberto" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Nadar e passear de barco na lagoa de Bilene",
                    "Caminhadas ao longo da praia de Xai-Xai",
                    "Almoçar camarão e peixe grelhado",
                    "Fim de semana em família, com poucas horas de viagem",
                ],
            },
        ],
        tip: "Aos fins de semana e feriados as praias enchem; chegue cedo e reserve alojamento com antecedência.",
        keywords: ["bilene", "xai-xai", "gaza", "lagoa", "familia"],
    },
    {
        slug: "pemba-wimbe",
        title: "Pemba e Praia de Wimbe",
        tag: "Cabo Delgado",
        categories: ["Praias", "Mergulho"],
        color: "#f0a83a",
        emoji: "🌅",
        summary:
            "Cidade portuária ao redor de uma grande baía, com a praia de Wimbe, restaurantes de marisco e acesso às Quirimbas.",
        meta: ["Aeroporto internacional", "Base para o norte"],
        facts: [
            { label: "Província", value: "Cabo Delgado" },
            { label: "Como chegar", value: "Voo desde Maputo ou outras cidades" },
            { label: "Destaque", value: "Praia de Wimbe e baía de Pemba" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Passear pela praia de Wimbe ao fim da tarde",
                    "Mergulhar no litoral perto da cidade",
                    "Provar peixe e marisco nos restaurantes locais",
                    "Organizar a viagem às ilhas Quirimbas",
                ],
            },
        ],
        tip: "Confirme os avisos de viagem para a região antes de sair e prefira operadores locais com boa reputação.",
        keywords: ["pemba", "wimbe", "cabo delgado", "baia"],
    },
    {
        slug: "inhaca",
        title: "Ilha de Inhaca",
        tag: "Maputo",
        categories: ["Ilhas", "Vida marinha"],
        color: "#00aefb",
        emoji: "🐢",
        summary:
            "A ilha mais próxima de Maputo: praias, mangais, recifes e uma estação de biologia marinha da Universidade Eduardo Mondlane.",
        meta: ["Excursão de um dia", "Saída do porto de Maputo"],
        facts: [
            { label: "Província", value: "Maputo (Baía de Maputo)" },
            { label: "Como chegar", value: "Ferry ou lancha desde o porto de Maputo" },
            { label: "Destaque", value: "Recifes, mangais e observação de aves" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Snorkelling nos recifes junto à costa",
                    "Caminhar pelas dunas e pelos mangais",
                    "Conhecer a vida da comunidade local",
                    "Almoço de peixe e marisco na ilha",
                ],
            },
        ],
        tip: "Verifique o horário de regresso do ferry logo à chegada: se o perder, terá de pernoitar.",
        keywords: ["inhaca", "ferry", "maputo", "mangal", "snorkelling"],
    },
    {
        slug: "ilha-de-mocambique",
        title: "Ilha de Moçambique",
        tag: "Nampula",
        categories: ["Ilhas", "Património"],
        color: "#f0a83a",
        emoji: "🏰",
        summary: "Património Mundial da UNESCO desde 1991: fortaleza, capela de 1522, palácio-museu e duas cidades numa só ilha.",
        meta: ["Melhor época: Maio a Novembro", "Ligada ao continente por uma ponte"],
        facts: [
            { label: "Província", value: "Nampula" },
            { label: "UNESCO", value: "Património Mundial desde 1991" },
            { label: "Destaques", value: "Fortaleza de São Sebastião, Capela de Nossa Senhora de Baluarte, Palácio de São Paulo" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que ver",
                items: [
                    "Fortaleza de São Sebastião, iniciada em 1558",
                    "Capela de Nossa Senhora de Baluarte (1522)",
                    "Palácio e Capela de São Paulo, hoje museu",
                    "Cidade de pedra e cal e cidade de macuti",
                    "Mercado, artesanato e peixe fresco",
                ],
            },
        ],
        tip: "Passe pelo menos uma noite: a luz ao fim do dia sobre a fortaleza e a baía é inesquecível.",
        keywords: ["ilha de mocambique", "unesco", "fortaleza", "nampula", "patrimonio"],
        images: ["/home/ilha_de_mocambique.jpg"],
    },
];
