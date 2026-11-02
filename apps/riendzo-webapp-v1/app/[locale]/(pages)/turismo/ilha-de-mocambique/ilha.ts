import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Ilha de Moçambique: pontos de interesse. Content in Portuguese. */
export const ILHA: CatalogItem[] = [
    {
        slug: "fortaleza-sao-sebastiao",
        title: "Fortaleza de São Sebastião",
        tag: "Monumento",
        categories: ["Monumentos"],
        color: "#f0a83a",
        emoji: "🏰",
        summary:
            "Imponente fortaleza na ponta norte da ilha, construída entre meados do século XVI e inícios do XVII para defender o porto.",
        meta: ["Século XVI-XVII", "Vistas sobre a baía"],
        facts: [
            { label: "Localização", value: "Extremo norte da ilha" },
            { label: "Função original", value: "Defesa da rota comercial do Índico" },
            { label: "Visita", value: "Percurso pelas muralhas, cisternas e baluartes" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Não perca",
                items: [
                    "Subir às muralhas ao pôr do sol",
                    "Ver as cisternas e os grandes baluartes",
                    "Olhar para o continente e para a ponte que liga a ilha",
                ],
            },
        ],
        tip: "Vá ao fim da tarde: a luz sobre a pedra e a baía é a melhor do dia.",
        keywords: ["fortaleza", "forte", "sao sebastiao", "muralhas"],
        images: ["/colonial-history/san-sebastian-fort.jpeg"],
    },
    {
        slug: "capela-baluarte",
        title: "Capela de Nossa Senhora de Baluarte",
        tag: "Monumento",
        categories: ["Monumentos"],
        color: "#c86b8c",
        emoji: "⛪",
        summary:
            "Pequena capela de 1522, tradicionalmente apontada como a construção europeia mais antiga do hemisfério sul.",
        meta: ["Data: 1522", "Dentro da fortaleza"],
        facts: [
            { label: "Estilo", value: "Manuelino" },
            { label: "Localização", value: "Junto à Fortaleza de São Sebastião" },
        ],
        blocks: [
            {
                kind: "text",
                items: [
                    "A capela é simples por fora e discreta, mas guarda séculos de história do encontro entre o Índico e a Europa.",
                ],
            },
        ],
        tip: "O espaço é pequeno e frágil: respeite os horários e as indicações do guarda.",
        keywords: ["capela", "baluarte", "manuelino", "1522"],
    },
    {
        slug: "palacio-sao-paulo",
        title: "Palácio e Capela de São Paulo",
        tag: "Museu",
        categories: ["Museus", "Monumentos"],
        color: "#e5533d",
        emoji: "🏛️",
        summary:
            "Antigo colégio jesuíta, depois residência dos governadores, hoje museu com mobiliário e peças que mostram a vida na ilha.",
        meta: ["Início do século XVII", "Museu"],
        facts: [
            { label: "Localização", value: "Cidade de Pedra e Cal" },
            { label: "Visita", value: "Salões, mobiliário e objetos de várias épocas" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Não perca",
                items: [
                    "Os salões com mobiliário de diferentes culturas",
                    "A capela ao lado do palácio",
                    "As vistas para a baía a partir das varandas",
                ],
            },
        ],
        tip: "Combine a visita com um passeio a pé pela cidade de pedra: está tudo a poucos minutos.",
        keywords: ["palacio", "sao paulo", "museu", "governador"],
    },
    {
        slug: "cidade-pedra-macuti",
        title: "Cidade de Pedra e Cal e Cidade de Macuti",
        tag: "Património",
        categories: ["Monumentos", "Cultura"],
        color: "#00aefb",
        emoji: "🏘️",
        summary:
            "Duas cidades numa só ilha: a cidade de pedra e cal, com edifícios antigos, e a cidade de macuti, de casas de palha e vida de bairro.",
        meta: ["Património Mundial da UNESCO (1991)", "Passeio a pé"],
        facts: [
            { label: "UNESCO", value: "Inscrita na lista do Património Mundial em 1991" },
            { label: "Norte", value: "Cidade de pedra e cal" },
            { label: "Sul", value: "Cidade de macuti, de habitação tradicional" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Passear sem pressa pelas ruas estreitas",
                    "Visitar o mercado e o bairro de macuti",
                    "Conversar com artesãos e pescadores",
                    "Fotografar fachadas, portas e varandas antigas",
                ],
            },
        ],
        tip: "A cidade de macuti é um lugar onde as pessoas vivem: peça licença antes de fotografar.",
        keywords: ["unesco", "macuti", "pedra e cal", "patrimonio", "bairro"],
        images: ["/home/ilha_de_mocambique.jpg"],
    },
    {
        slug: "ilha-de-goa",
        title: "Ilha de Goa",
        tag: "Natureza",
        categories: ["Natureza"],
        color: "#35be12",
        emoji: "🛶",
        summary:
            "Pequena ilha vizinha, com farol e praias tranquilas, ideal para uma excursão curta de barco.",
        meta: ["Excursão de barco", "Meio dia"],
        facts: [
            { label: "Como chegar", value: "Barco a partir da Ilha de Moçambique" },
            { label: "Ideal para", value: "Fotografia, praia e silêncio" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Passeio de barco tradicional",
                    "Caminhar pela ilha",
                    "Nadar e fazer snorkelling junto à costa",
                ],
            },
        ],
        tip: "Combine preço e hora de regresso com o barqueiro antes de partir.",
        keywords: ["goa", "farol", "barco", "praia"],
    },
    {
        slug: "encontro-de-culturas",
        title: "Encontro de culturas: suaíli, árabe, indiana e portuguesa",
        tag: "Cultura",
        categories: ["Cultura"],
        color: "#f0a83a",
        emoji: "🕌",
        summary:
            "Mesquitas, igrejas e templos convivem numa ilha que foi porto suaíli antes de ser colónia portuguesa.",
        meta: ["Tufo e outras danças", "Música e fé"],
        facts: [
            { label: "Heranças", value: "Suaíli, árabe, indiana e portuguesa" },
            { label: "Expressão cultural", value: "O tufo, dança tradicional de grupos de mulheres do norte" },
        ],
        blocks: [
            {
                kind: "text",
                items: [
                    "A mistura de línguas, religiões e saberes é visível na arquitetura, na culinária e na música. Procure, nos dias de festa, os grupos de tufo.",
                ],
            },
        ],
        tip: "Quem quiser assistir a cerimónias ou festas deve perguntar na comunidade sobre as datas e o comportamento adequado.",
        keywords: ["tufo", "mesquita", "suaili", "arabe", "indiana"],
    },
    {
        slug: "artes-e-sabores",
        title: "Artesanato e sabores da ilha",
        tag: "Sabores",
        categories: ["Sabores", "Cultura"],
        color: "#c86b8c",
        emoji: "🍤",
        summary:
            "Peixe e marisco fresco, caril de coco, capulanas e objetos feitos à mão pelos artesãos da ilha.",
        meta: ["Mercado local", "Peixe fresco"],
        facts: [
            { label: "Provar", value: "Peixe grelhado, caril de camarão, bolos de coco" },
            { label: "Trazer", value: "Capulanas, esculturas, cestaria e bordados" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Dicas",
                items: [
                    "Ir ao mercado de manhã para ver o peixe chegar",
                    "Comprar artesanato diretamente a quem o faz",
                    "Provar o café ou o chá numa esplanada junto ao mar",
                ],
            },
        ],
        tip: "Negocie com educação e valorize o trabalho do artesão.",
        keywords: ["artesanato", "mercado", "capulana", "caril", "peixe"],
    },
];
