import { article } from "@/app/components/sections/catalog-helpers";

/**
 * Últimas Notícias: explicadores de temas que marcam a atualidade.
 * Replace with real posts from your CMS when the editorial team is ready.
 */
export const NOTICIAS = [
    article({
        slug: "corredores-de-desenvolvimento",
        title: "Corredores de desenvolvimento: por onde passa a economia",
        tag: "Explicador", categories: ["Economia"], color: "#e5533d", emoji: "🚆", minutes: 4,
        summary: "Maputo, Beira e Nacala: as ligações entre portos, caminhos-de-ferro e países vizinhos.",
        body: [
            "Moçambique tem portos naturais no Índico e vizinhos sem litoral. Por isso, os corredores de Maputo, da Beira e de Nacala ligam o interior de África ao mar.",
            "Estas rotas transportam carvão, cereais, combustíveis e mercadorias, e influenciam onde se instalam empresas e se criam empregos.",
        ],
        takeaway: "Os corredores explicam a geografia da economia moçambicana.",
        keywords: ["corredores", "porto", "maputo", "beira", "nacala"],
    }),
    article({
        slug: "cahora-bassa",
        title: "Cahora Bassa: a barragem que abastece a região",
        tag: "Explicador", categories: ["Energia"], color: "#00aefb", emoji: "💧", minutes: 4,
        summary: "Uma das maiores centrais hidroelétricas de África fica no rio Zambeze, em Tete.",
        body: [
            "A barragem de Cahora Bassa, construída no rio Zambeze, produz eletricidade que serve Moçambique e é exportada para países vizinhos.",
            "A gestão da água, as cheias e o custo da energia são temas que continuam a marcar o debate.",
        ],
        takeaway: "Energia, água e economia andam juntas no Zambeze.",
        keywords: ["cahora bassa", "zambeze", "tete", "energia"],
    }),
    article({
        slug: "gas-do-rovuma",
        title: "Gás do Rovuma: o que está em jogo",
        tag: "Explicador", categories: ["Energia", "Economia"], color: "#f0a83a", emoji: "🔥", minutes: 5,
        summary: "As reservas de gás natural no mar de Cabo Delgado e o que podem significar para o país.",
        body: [
            "A bacia do Rovuma tem grandes reservas de gás natural. Em 2022, uma plataforma flutuante de gás liquefeito iniciou produção ao largo de Cabo Delgado.",
            "Os projetos criam expectativas de receitas e empregos, mas também desafios de segurança, ambiente e distribuição dos benefícios.",
        ],
        takeaway: "O gás pode ser uma oportunidade, mas depende de boa gestão.",
        keywords: ["gas", "rovuma", "cabo delgado", "lng"],
    }),
    article({
        slug: "ciclones",
        title: "Época ciclónica: como se preparar",
        tag: "Explicador", categories: ["Clima"], color: "#35be12", emoji: "🌀", minutes: 4,
        summary: "O que são os ciclones tropicais e como famílias e viajantes se podem proteger.",
        body: [
            "A época ciclónica no Índico sudoeste vai, em geral, de Novembro a Abril. Ciclones como o Idai, em 2019, atingiram a Beira e mostraram a importância dos avisos e da preparação.",
            "Acompanhe os avisos oficiais, tenha um plano de evacuação, guarde documentos em saco impermeável e conheça o abrigo mais próximo.",
        ],
        takeaway: "Informação e preparação salvam vidas.",
        keywords: ["ciclone", "idai", "chuvas", "clima"],
    }),
    article({
        slug: "metical-e-pagamentos-moveis",
        title: "Metical e pagamentos móveis",
        tag: "Explicador", categories: ["Economia", "Tecnologia"], color: "#c86b8c", emoji: "📱", minutes: 3,
        summary: "A moeda nacional e as carteiras móveis que facilitam o dia a dia.",
        body: [
            "A moeda é o metical (MZN). Em muitas cidades, é comum pagar e transferir dinheiro com carteiras móveis, como M-Pesa, e-Mola e mKesh.",
            "Fora das cidades, o dinheiro em numerário continua a ser muito usado. Leve sempre notas pequenas.",
        ],
        takeaway: "Combine dinheiro vivo e pagamentos móveis.",
        keywords: ["metical", "mpesa", "emola", "mkesh", "pagamentos"],
    }),
];
