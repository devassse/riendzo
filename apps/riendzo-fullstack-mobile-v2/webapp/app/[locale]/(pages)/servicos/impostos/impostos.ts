import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Impostos & Taxas. No rates or deadlines on purpose: they change by law. */
export const IMPOSTOS: CatalogItem[] = [
    {
        slug: "nuit",
        title: "NUIT: Número Único de Identificação Tributária",
        tag: "Autoridade Tributária",
        categories: ["Registo"],
        color: "#35be12",
        emoji: "🔢",
        summary: "O número que identifica contribuintes junto da Autoridade Tributária de Moçambique (AT).",
        meta: ["Pessoas e empresas"],
        facts: [
            { label: "Quem emite", value: "Autoridade Tributária de Moçambique (AT)" },
            { label: "Para quê", value: "Abrir empresa, emitir faturas, declarar impostos e outros serviços" },
        ],
        blocks: [
            {
                kind: "steps",
                heading: "Passo a passo",
                items: [
                    "Leve o BI ou outro documento de identificação ao balcão da AT.",
                    "Preencha o pedido de atribuição de NUIT.",
                    "Receba o número e guarde o comprovativo.",
                ],
            },
        ],
        tip: "Confirme na AT se o pedido pode ser feito online.",
        keywords: ["nuit", "at", "contribuinte", "autoridade tributaria"],
    },
    {
        slug: "e-tributacao",
        title: "e-Tributação",
        tag: "Serviços online",
        categories: ["Online"],
        color: "#00aefb",
        emoji: "💻",
        summary: "Portal da AT para entregar declarações e acompanhar obrigações fiscais.",
        meta: ["Declarações online", "Documento de pagamento (DAR)"],
        facts: [
            { label: "Entidade", value: "Autoridade Tributária de Moçambique" },
            { label: "Pagamento", value: "Através de Documento de Arrecadação de Receitas (DAR), nos bancos" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Boas práticas",
                items: [
                    "Guardar o comprovativo de entrega das declarações",
                    "Gerar o DAR e pagar dentro do prazo",
                    "Conservar os documentos de suporte",
                ],
            },
        ],
        tip: "Use apenas o endereço oficial da AT e nunca partilhe senhas.",
        keywords: ["e-tributacao", "portal", "declaracao", "dar"],
    },
    {
        slug: "irps",
        title: "IRPS: imposto sobre o rendimento das pessoas singulares",
        tag: "Rendimento",
        categories: ["Impostos"],
        color: "#f0a83a",
        emoji: "🧾",
        summary: "Imposto que incide sobre os rendimentos de pessoas, como salários e rendimentos de trabalho independente.",
        meta: ["Trabalhadores"],
        facts: [
            { label: "Quem paga", value: "Pessoas singulares com rendimentos sujeitos a imposto" },
            { label: "Regras", value: "Taxas e escalões definidos por lei e atualizados com o Orçamento" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "O que fazer",
                items: [
                    "Conferir o desconto no recibo de vencimento",
                    "Guardar recibos e comprovativos",
                    "Procurar a AT para dúvidas sobre o seu caso",
                ],
            },
        ],
        tip: "Em caso de dúvida, peça esclarecimento à AT ou a um contabilista certificado.",
        keywords: ["irps", "rendimento", "salario", "imposto"],
    },
    {
        slug: "iva",
        title: "IVA: imposto sobre o valor acrescentado",
        tag: "Consumo",
        categories: ["Impostos"],
        color: "#e5533d",
        emoji: "🛒",
        summary: "Imposto sobre o consumo que aparece nas faturas de bens e serviços.",
        meta: ["Empresas e consumidores"],
        facts: [
            { label: "Introdução", value: "Em vigor em Moçambique desde 2014" },
            { label: "Fatura", value: "Peça sempre fatura, com o NUIT, quando necessário" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Para quem vende",
                items: [
                    "Emitir faturas corretas",
                    "Entregar as declarações dentro dos prazos",
                    "Conservar os documentos",
                ],
            },
        ],
        tip: "Taxas e isenções mudam. Consulte a AT para valores atuais.",
        keywords: ["iva", "fatura", "consumo", "empresa"],
    },
    {
        slug: "pequenos-negocios",
        title: "Pequenos negócios e regime simplificado",
        tag: "Empreendedores",
        categories: ["Impostos", "Registo"],
        color: "#c86b8c",
        emoji: "🏪",
        summary: "Regras mais simples para vendedores, pequenas lojas e prestadores de serviços.",
        meta: ["Imposto simplificado"],
        facts: [
            { label: "Regime", value: "Imposto Simplificado para Pequenos Contribuintes, quando aplicável" },
            { label: "Primeiro passo", value: "Registar-se e obter o NUIT" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Primeiros passos",
                items: [
                    "Obter o NUIT",
                    "Informar-se sobre o regime que lhe cabe",
                    "Guardar registos de vendas e despesas",
                    "Cumprir os prazos de pagamento",
                ],
            },
        ],
        tip: "Peça à AT para esclarecer em que regime se enquadra.",
        keywords: ["pequeno", "negocio", "vendedor", "ispc", "empreendedor"],
    },
    {
        slug: "alfandegas-viajantes",
        title: "Alfândegas para viajantes",
        tag: "Fronteiras",
        categories: ["Viagem"],
        color: "#00aefb",
        emoji: "🧳",
        summary: "O que declarar, o que é proibido e como evitar problemas nas fronteiras e aeroportos.",
        meta: ["Declare valores e mercadorias"],
        facts: [
            { label: "Entidade", value: "Autoridade Tributária (Alfândegas)" },
            { label: "Importante", value: "Limites de isenção e mercadorias proibidas mudam: confirme antes de viajar" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Dicas",
                items: [
                    "Declare dinheiro ou bens acima dos limites",
                    "Guarde faturas de equipamentos caros",
                    "Não transporte produtos de origem animal ou vegetal sem autorização",
                ],
            },
        ],
        tip: "Em caso de dúvida, pergunte ao funcionário da alfândega antes de passar.",
        keywords: ["alfandega", "fronteira", "bagagem", "viajante"],
    },
];
