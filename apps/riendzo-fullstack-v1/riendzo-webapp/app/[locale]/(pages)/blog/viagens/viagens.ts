import { article } from "@/app/components/sections/catalog-helpers";

/** Viagens: dicas práticas. Check details before publishing as they change. */
export const VIAGENS = [
    article({
        slug: "como-se-deslocar",
        title: "Como se deslocar: chapa, machibombo, txopela e ferry",
        tag: "Dicas", categories: ["Transportes"], color: "#00aefb", emoji: "🚐", minutes: 4,
        summary: "Os meios de transporte mais comuns e como usá-los com segurança.",
        body: [
            "Nas cidades, o chapa (minibus partilhado) é o meio mais comum. Para distâncias longas, há machibombos e voos domésticos.",
            "Na Catembe, pode atravessar pela ponte ou de ferry. Em algumas cidades há txopelas (motociclos com cabine).",
        ],
        takeaway: "Combine preço e destino antes de partir.",
        keywords: ["chapa", "machibombo", "txopela", "ferry", "transportes"],
    }),
    article({
        slug: "dinheiro-e-pagamentos",
        title: "Dinheiro e pagamentos em viagem",
        tag: "Dicas", categories: ["Dinheiro"], color: "#f0a83a", emoji: "💰", minutes: 3,
        summary: "Metical, multibanco e carteiras móveis.",
        body: [
            "Leve notas pequenas e pague em metical. Em cidades, muitos locais aceitam cartão ou carteiras móveis.",
            "Nas zonas rurais, o dinheiro vivo é essencial.",
        ],
        takeaway: "Tenha sempre dinheiro de reserva.",
        keywords: ["metical", "cartao", "mpesa", "dinheiro"],
    }),
    article({
        slug: "quando-ir",
        title: "Quando ir: estações e atividades",
        tag: "Planeamento", categories: ["Planeamento"], color: "#35be12", emoji: "🗓️", minutes: 3,
        summary: "Época seca ou das chuvas? Depende do que quer fazer.",
        body: [
            "De Maio a Outubro, é a época seca, boa para safári e praia. De Novembro a Abril, chove mais e há risco de ciclones.",
            "Baleias entre Julho e Outubro; tubarão-baleia todo o ano com mais probabilidade de Outubro a Março.",
        ],
        takeaway: "Escolha a época pelo objetivo da viagem.",
        keywords: ["epoca", "estacao", "clima", "quando"],
    }),
    article({
        slug: "o-que-levar",
        title: "O que levar na mala",
        tag: "Planeamento", categories: ["Planeamento"], color: "#e5533d", emoji: "🎒", minutes: 3,
        summary: "Roupa, saúde e pequenos objetos que ajudam muito.",
        body: [
            "Leve roupa leve, protetor solar, chapéu, repelente e uma lanterna. Um adaptador universal é útil.",
            "Guarde cópias dos documentos e leve medicamentos pessoais.",
        ],
        takeaway: "Pouco, mas bem pensado.",
        keywords: ["mala", "levar", "equipamento"],
    }),
    article({
        slug: "saude-e-seguranca",
        title: "Saúde e segurança em viagem",
        tag: "Segurança", categories: ["Segurança"], color: "#c86b8c", emoji: "🛡️", minutes: 4,
        summary: "Cuidados simples para viajar com tranquilidade.",
        body: [
            "Fale com um médico antes de viajar sobre vacinas e profilaxia da malária. Beba água segura e use repelente.",
            "Não ostente objetos de valor, evite andar sozinho à noite e consulte avisos de viagem atualizados.",
        ],
        takeaway: "Informe-se e preveja imprevistos.",
        keywords: ["saude", "seguranca", "malaria", "vacinas"],
    }),
    article({
        slug: "linguas-e-cortesia",
        title: "Línguas e cortesia",
        tag: "Cultura", categories: ["Cultura"], color: "#f0a83a", emoji: "🤝", minutes: 3,
        summary: "O português é a língua oficial, mas ouvirá muitas outras.",
        body: [
            "Cumprimentar com calma e perguntar como estão é parte da boa educação. Aprender algumas palavras em línguas locais é muito apreciado.",
            "Peça sempre licença antes de fotografar pessoas.",
        ],
        takeaway: "O respeito abre portas.",
        keywords: ["lingua", "cumprimentos", "cortesia", "portugues"],
    }),
];
