import type { CatalogItem } from "@/app/components/sections/catalog-types";

/**
 * Documentos & BI. General guidance only: requirements, fees and times change,
 * so every item sends people to confirm with the issuing office.
 */
export const DOCUMENTOS: CatalogItem[] = [
    {
        slug: "bilhete-de-identidade",
        title: "Bilhete de Identidade (BI)",
        tag: "Identificação civil",
        categories: ["Identificação"],
        color: "#00aefb",
        emoji: "🪪",
        summary:
            "O documento de identificação dos cidadãos moçambicanos, emitido pela Direcção Nacional de Identificação Civil (DNIC).",
        meta: ["Primeira emissão gratuita", "Agendamento disponível"],
        facts: [
            { label: "Quem emite", value: "Direcção Nacional de Identificação Civil (Ministério do Interior)" },
            { label: "Primeira vez", value: "A emissão gratuita para quem trata o BI pela primeira vez está em curso desde novembro de 2023" },
            { label: "Agendamento", value: "Portal da DNIC ou linha gratuita 1488 (rede Tmcel)" },
        ],
        blocks: [
            {
                kind: "steps",
                heading: "Passo a passo",
                items: [
                    "Reúna os documentos de base, como a certidão de nascimento, e confirme a lista no posto.",
                    "Faça o agendamento pelo portal da DNIC ou pela linha 1488, quando o posto o exigir.",
                    "Compareça no dia marcado para registo de dados e fotografia.",
                    "Guarde o comprovativo e volte para levantar o BI quando estiver pronto.",
                ],
            },
            { kind: "tags", heading: "Ideal para", items: ["Jovens", "Primeira emissão", "Renovação", "Perda ou extravio"] },
        ],
        tip: "Não pague a intermediários. Em caso de cobrança indevida, use a linha 1488 para fazer uma denúncia.",
        keywords: ["bi", "bilhete", "identidade", "dnic", "identificacao"],
    },
    {
        slug: "passaporte",
        title: "Passaporte",
        tag: "Migração",
        categories: ["Viagem"],
        color: "#f0a83a",
        emoji: "🛂",
        summary: "Documento de viagem internacional, tratado nos serviços de migração.",
        meta: ["Requer BI válido", "Prazo varia"],
        facts: [
            { label: "Quem trata", value: "Serviço Nacional de Migração (SENAMI)" },
            { label: "Base", value: "BI válido e outros documentos exigidos pelo serviço" },
        ],
        blocks: [
            {
                kind: "steps",
                heading: "Passo a passo",
                items: [
                    "Confirme no serviço de migração mais próximo os documentos e a taxa atual.",
                    "Pague a taxa pelos canais indicados e guarde o comprovativo.",
                    "Compareça para recolha de dados biométricos.",
                    "Levante o passaporte quando estiver pronto.",
                ],
            },
        ],
        tip: "Verifique a validade do passaporte antes de viajar: muitos países exigem pelo menos seis meses.",
        keywords: ["passaporte", "migracao", "senami", "viagem"],
    },
    {
        slug: "certidao-de-nascimento",
        title: "Certidão de Nascimento e Registo Civil",
        tag: "Registo civil",
        categories: ["Identificação"],
        color: "#35be12",
        emoji: "📜",
        summary:
            "O registo de nascimento é o primeiro documento de uma pessoa e abre a porta ao BI, à escola e à saúde.",
        meta: ["Conservatórias do Registo Civil", "Deve ser feito cedo"],
        facts: [
            { label: "Onde", value: "Conservatórias do Registo Civil" },
            { label: "Importância", value: "Necessária para escola, BI e outros serviços" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que levar, em geral",
                items: [
                    "Declaração de nascimento da unidade sanitária, quando existe",
                    "Documentos de identificação dos pais",
                    "Documentos de casamento, se aplicável",
                ],
            },
        ],
        tip: "Registe as crianças o mais cedo possível: registos tardios costumam exigir mais passos.",
        keywords: ["certidao", "nascimento", "registo civil", "conservatoria"],
    },
    {
        slug: "registo-criminal",
        title: "Certificado de Registo Criminal",
        tag: "Justiça",
        categories: ["Justiça"],
        color: "#c86b8c",
        emoji: "⚖️",
        summary: "Documento muitas vezes pedido para emprego, estudos ou processos no estrangeiro.",
        meta: ["Pedido nos serviços de registos", "Taxa a confirmar"],
        facts: [
            { label: "Quem trata", value: "Serviços de registos e notariado do Ministério da Justiça" },
            { label: "Uso comum", value: "Emprego, concursos, vistos e candidaturas" },
        ],
        blocks: [
            {
                kind: "steps",
                heading: "Passo a passo",
                items: [
                    "Confirme o local e os documentos exigidos para o pedido.",
                    "Apresente o BI e pague a taxa, se aplicável.",
                    "Aguarde o prazo indicado e levante o certificado.",
                ],
            },
        ],
        tip: "Verifique a validade que a entidade que pede o certificado aceita.",
        keywords: ["registo criminal", "certificado", "justica"],
    },
    {
        slug: "carta-de-conducao",
        title: "Carta de Condução",
        tag: "Transportes",
        categories: ["Transportes"],
        color: "#e5533d",
        emoji: "🚗",
        summary: "Licença para conduzir, obtida depois da formação numa escola de condução e do exame.",
        meta: ["Escola de condução", "Exame teórico e prático"],
        facts: [
            { label: "Entidade", value: "Instituto Nacional dos Transportes Terrestres (INATTER)" },
            { label: "Passos", value: "Escola de condução, exames e emissão" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que esperar",
                items: [
                    "Inscrição numa escola de condução licenciada",
                    "Aulas teóricas e práticas",
                    "Exames e avaliação",
                    "Emissão da carta e renovação no prazo",
                ],
            },
        ],
        tip: "Escolha escolas licenciadas e guarde recibos e comprovativos de cada etapa.",
        keywords: ["carta", "conducao", "inatter", "licenca"],
    },
    {
        slug: "dire-estrangeiros",
        title: "DIRE para estrangeiros residentes",
        tag: "Migração",
        categories: ["Viagem", "Identificação"],
        color: "#00aefb",
        emoji: "🌍",
        summary: "Documento de Identificação e Residência de Estrangeiro, para quem reside legalmente no país.",
        meta: ["Residentes", "Pedido junto da Migração"],
        facts: [
            { label: "Quem trata", value: "Serviço Nacional de Migração" },
            { label: "Para quem", value: "Estrangeiros com autorização de residência" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Em geral, vai precisar de",
                items: [
                    "Passaporte válido",
                    "Visto ou autorização de residência",
                    "Comprovativo de morada ou de atividade",
                    "Fotografias e taxas aplicáveis",
                ],
            },
        ],
        tip: "As regras mudam: confirme sempre no serviço de migração.",
        keywords: ["dire", "estrangeiro", "residencia", "visto"],
    },
];
