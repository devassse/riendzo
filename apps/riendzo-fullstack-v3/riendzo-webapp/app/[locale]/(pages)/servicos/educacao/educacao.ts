import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Educação. General guidance; calendars and dates are set by the ministry each year. */
export const EDUCACAO: CatalogItem[] = [
    {
        slug: "sistema-de-ensino",
        title: "Como funciona o sistema de ensino",
        tag: "Visão geral",
        categories: ["Ensino"],
        color: "#f0a83a",
        emoji: "🏫",
        summary: "Do ensino primário ao superior, passando pelo secundário e pelo ensino técnico-profissional.",
        meta: ["Ensino público gratuito no básico"],
        facts: [
            { label: "Entidade", value: "Ministério da Educação e Desenvolvimento Humano" },
            { label: "Níveis", value: "Primário, secundário, técnico-profissional e superior" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Em resumo",
                items: [
                    "O ensino primário é a base e é gratuito nas escolas públicas",
                    "O ensino secundário prepara para o trabalho ou para o superior",
                    "O técnico-profissional oferece cursos práticos",
                    "O superior é oferecido por universidades e institutos",
                ],
            },
        ],
        tip: "As regras e o número de classes podem mudar com as reformas curriculares: confirme na escola.",
        keywords: ["ensino", "escola", "primario", "secundario"],
    },
    {
        slug: "matriculas",
        title: "Matrículas e inscrições",
        tag: "Escola",
        categories: ["Matrículas"],
        color: "#00aefb",
        emoji: "📝",
        summary: "Como inscrever uma criança ou jovem numa escola pública.",
        meta: ["Antes do início do ano letivo"],
        facts: [
            { label: "Onde", value: "Escola pretendida" },
            { label: "Levar", value: "Certidão ou BI, fotografias e documentos de classes anteriores" },
        ],
        blocks: [
            {
                kind: "steps",
                heading: "Passo a passo",
                items: [
                    "Escolha a escola mais próxima de casa.",
                    "Informe-se sobre as datas de matrícula e os documentos exigidos.",
                    "Entregue os documentos na secretaria.",
                    "Guarde o comprovativo de matrícula.",
                ],
            },
        ],
        tip: "Chegue cedo: as vagas podem esgotar e as datas são divulgadas pelas escolas e pela direção de educação.",
        keywords: ["matricula", "inscricao", "escola", "vaga"],
    },
    {
        slug: "calendario-escolar",
        title: "Calendário escolar",
        tag: "Calendário",
        categories: ["Ensino"],
        color: "#35be12",
        emoji: "📅",
        summary: "O ano letivo costuma começar no início do ano civil e dividir-se em trimestres.",
        meta: ["Datas oficiais variam"],
        facts: [
            { label: "Publicação", value: "Divulgado pelo Ministério da Educação" },
            { label: "Organização", value: "Trimestres, com pausas entre eles" },
        ],
        blocks: [
            {
                kind: "text",
                items: [
                    "Para saber as datas exatas, consulte a escola ou os canais oficiais do Ministério.",
                ],
            },
        ],
        tip: "Marque as datas de início, exames e feriados escolares no calendário da família.",
        keywords: ["calendario", "ferias", "trimestre", "exames"],
    },
    {
        slug: "ensino-superior",
        title: "Ensino superior",
        tag: "Universidades",
        categories: ["Superior"],
        color: "#c86b8c",
        emoji: "🎓",
        summary: "Universidades públicas e privadas em todo o país, com exames de admissão e inscrições anuais.",
        meta: ["Exames de admissão"],
        facts: [
            { label: "Exemplos", value: "UEM, Universidade Pedagógica, UniLúrio e UniZambeze" },
            { label: "Entrada", value: "Normalmente, exame de admissão ou critérios definidos pela instituição" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Antes de se candidatar",
                items: [
                    "Escolha o curso e a instituição",
                    "Confirme os prazos de candidatura",
                    "Prepare os documentos e as taxas",
                    "Informe-se sobre bolsas",
                ],
            },
        ],
        tip: "Procure cursos reconhecidos e acreditados.",
        keywords: ["universidade", "uem", "unilurio", "unizambeze", "admissao"],
    },
    {
        slug: "bolsas-de-estudo",
        title: "Bolsas de estudo",
        tag: "Apoio",
        categories: ["Superior", "Apoio"],
        color: "#e5533d",
        emoji: "🪙",
        summary: "Apoios para estudar em Moçambique ou no estrangeiro, concedidos mediante concurso.",
        meta: ["Concursos periódicos"],
        facts: [
            { label: "Entidade", value: "Instituto de Bolsas de Estudo, entre outras" },
            { label: "Condições", value: "Definidas em cada concurso" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Dicas",
                items: [
                    "Acompanhe os anúncios oficiais",
                    "Leia o regulamento até ao fim",
                    "Entregue todos os documentos no prazo",
                    "Desconfie de quem cobra por vagas de bolsas",
                ],
            },
        ],
        tip: "As bolsas oficiais não são vendidas. Verifique sempre a fonte.",
        keywords: ["bolsa", "estudo", "ibe", "apoio"],
    },
    {
        slug: "ensino-tecnico-profissional",
        title: "Ensino técnico-profissional",
        tag: "Formação",
        categories: ["Ensino", "Apoio"],
        color: "#f0a83a",
        emoji: "🛠️",
        summary: "Cursos práticos em áreas como agricultura, mecânica, eletricidade, turismo e informática.",
        meta: ["Cursos práticos", "Ligação ao trabalho"],
        facts: [
            { label: "Onde", value: "Institutos e escolas técnicas" },
            { label: "Vantagem", value: "Preparação direta para o mercado de trabalho" },
        ],
        blocks: [
            {
                kind: "list",
                heading: "Áreas comuns",
                items: ["Agricultura", "Eletricidade", "Mecânica", "Turismo e hotelaria", "Informática"],
            },
        ],
        tip: "Pergunte pela duração, pelos estágios e pelo reconhecimento do certificado.",
        keywords: ["tecnico", "profissional", "formacao", "curso"],
    },
];
