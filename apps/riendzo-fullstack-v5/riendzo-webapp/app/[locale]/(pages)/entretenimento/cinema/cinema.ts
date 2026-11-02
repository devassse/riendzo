import type { CatalogItem } from "@/app/components/sections/catalog-types";

/** Cinema & Séries: realizadores, filmes e festivais. Content in Portuguese. */
export const CINEMA: CatalogItem[] = [
    {
        slug: "kuxa-kanema",
        title: "Kuxa Kanema: o cinema da independência",
        tag: "História",
        categories: ["História do cinema"],
        color: "#c86b8c",
        emoji: "🎞️",
        summary: "O jornal de atualidades do Instituto Nacional de Cinema, que levou imagens do novo país às salas e às aldeias.",
        meta: ["Anos 1970 e 1980", "Cinema ambulante"],
        facts: [
            { label: "Nome", value: "Kuxa Kanema significa, em ronga, o nascimento do cinema" },
            { label: "Função", value: "Mostrar o país a si próprio, depois da independência" },
        ],
        blocks: [
            { kind: "text", items: ["Equipas e cinemas ambulantes percorriam o território para projetar as reportagens e filmes nacionais, numa época em que o cinema era um instrumento de unidade e memória."] },
        ],
        tip: "Procure documentários sobre o Kuxa Kanema em festivais e arquivos: são uma janela para a história do país.",
        keywords: ["kuxa kanema", "inc", "arquivo", "independencia"],
    },
    {
        slug: "ruy-guerra",
        title: "Ruy Guerra",
        tag: "Realizador",
        categories: ["Realizadores"],
        color: "#f0a83a",
        emoji: "🎬",
        summary: "Nascido em Lourenço Marques (Maputo), é um dos nomes do Cinema Novo brasileiro e autor de filmes sobre Moçambique.",
        meta: ["Os Fuzis (1964)", "Mueda, Memória e Massacre (1979)"],
        facts: [
            { label: "Nascimento", value: "Maputo, 1931" },
            { label: "Obras de referência", value: "Os Fuzis; Mueda, Memória e Massacre" },
        ],
        blocks: [
            { kind: "list", heading: "Porque ver", items: ["Ligação entre Moçambique e o cinema mundial", "Olhar sobre a história e a memória coletiva", "Influência em gerações de cineastas"] },
        ],
        tip: "Comece pelo filme sobre Mueda e depois explore a obra brasileira.",
        keywords: ["ruy guerra", "mueda", "cinema novo"],
    },
    {
        slug: "licinio-azevedo",
        title: "Licínio Azevedo",
        tag: "Realizador",
        categories: ["Realizadores"],
        color: "#00aefb",
        emoji: "📽️",
        summary: "Cineasta e escritor que filma histórias de pessoas comuns em Moçambique, entre o documentário e a ficção.",
        meta: ["Virgem Margarida (2012)", "Cinema de memória"],
        facts: [
            { label: "Obra", value: "Documentários e ficções sobre guerra, vida rural e memória" },
            { label: "Exemplo", value: "Virgem Margarida" },
        ],
        blocks: [
            { kind: "list", heading: "Porque ver", items: ["Histórias contadas com sensibilidade", "Atores e comunidades locais", "Retrato do pós-guerra"] },
        ],
        tip: "Veja os filmes em ciclos de cinema ou festivais.",
        keywords: ["licinio azevedo", "virgem margarida"],
    },
    {
        slug: "terra-sonambula",
        title: "Terra Sonâmbula",
        tag: "Filme",
        categories: ["Filmes"],
        color: "#35be12",
        emoji: "🌍",
        summary: "Adaptação para cinema do romance de Mia Couto, realizada por Teresa Prata em 2007.",
        meta: ["2007", "Baseado em Mia Couto"],
        facts: [
            { label: "Realização", value: "Teresa Prata" },
            { label: "Base", value: "Romance de Mia Couto" },
        ],
        blocks: [
            { kind: "text", items: ["Passa-se durante a guerra civil e segue duas personagens num autocarro queimado, entre sonho e memória."] },
        ],
        tip: "Leia o livro e veja o filme para comparar.",
        keywords: ["terra sonambula", "mia couto", "teresa prata"],
    },
    {
        slug: "jardim-do-outro-homem",
        title: "O Jardim do Outro Homem",
        tag: "Filme",
        categories: ["Filmes"],
        color: "#e5533d",
        emoji: "🌴",
        summary: "Longa-metragem de Sol de Carvalho (2006), sobre a vida urbana e os desafios dos jovens em Maputo.",
        meta: ["2006", "Ficção"],
        facts: [
            { label: "Realização", value: "Sol de Carvalho" },
            { label: "Tema", value: "Vida urbana e juventude" },
        ],
        blocks: [
            { kind: "text", items: ["Um dos títulos de ficção nacionais mais referidos desta geração."] },
        ],
        tip: "Procure sessões em centros culturais.",
        keywords: ["sol de carvalho", "jardim do outro homem"],
    },
    {
        slug: "dockanema",
        title: "Dockanema",
        tag: "Festival",
        categories: ["Festivais"],
        color: "#c86b8c",
        emoji: "🍿",
        summary: "Festival de cinema documental de Maputo, que traz filmes africanos e do mundo e promove debates.",
        meta: ["Maputo", "Documentário"],
        facts: [
            { label: "Onde", value: "Maputo" },
            { label: "Foco", value: "Documentário e cinema africano" },
        ],
        blocks: [
            { kind: "list", heading: "O que esperar", items: ["Sessões de documentários", "Conversas com realizadores", "Oficinas e formação"] },
        ],
        tip: "As datas mudam todos os anos: confirme no site e nas redes do festival.",
        keywords: ["dockanema", "festival", "documentario"],
    },
];
