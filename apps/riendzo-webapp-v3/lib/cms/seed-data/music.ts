import type { Artist } from "../artist-types";
import { entry, html } from "./h";

/**
 * Sample artists. Add photos, discographies and audio in the BackOffice.
 * Only audio you have the rights to play should be added (mp3 link or the
 * artist's official YouTube video).
 */
export const ARTISTS: Artist[] = [
    {
        slug: "stewart-sukuma", name: "Stewart Sukuma", genre: "marrabenta", origin: "Niassa", birthYear: 1963, activeSince: "Anos 1990",
        summary: "Cantor e compositor que mistura marrabenta com jazz e ritmos africanos. Embaixador nacional da UNICEF.",
        quote: "A música é a nossa casa comum.",
        body: html(
            "Stewart Sukuma nasceu em 1963 em Cuamba, província do Niassa. A sua música parte da marrabenta e abre-se a influências do jazz, do soul e de outros ritmos africanos.",
            "O álbum <em>Afrikiti</em> (1997) é considerado o primeiro CD lançado em Moçambique. Em 2012 foi nomeado embaixador nacional da UNICEF."
        ),
        albums: [
            { slug: "afrikiti", title: "Afrikiti", year: 1997, description: "Álbum de 1997, apontado como o primeiro CD lançado em território moçambicano.", tracks: [] },
            { slug: "xitchuketa-marrabenta", title: "Xitchuketa Marrabenta", year: 2010, tracks: [] },
        ],
        photoAlbums: [], links: {}, featuredWeek: true,
    },
    {
        slug: "wazimbo", name: "Wazimbo", genre: "marrabenta", origin: "Gaza", activeSince: "Anos 1970",
        summary: "Voz histórica da marrabenta, conhecido como vocalista da Orchestra Marrabenta Star de Moçambique.",
        quote: "A marrabenta é o coração de Maputo.",
        body: html("Wazimbo é natural de Chibuto, província de Gaza. Ficou conhecido como vocalista da Orchestra Marrabenta Star de Moçambique, uma das grandes orquestras do género.", "A sua carreira levou a marrabenta a palcos e festivais internacionais."),
        albums: [], photoAlbums: [],
    },
    {
        slug: "ghorwane", name: "Ghorwane", genre: "marrabenta", origin: "Maputo Cidade", activeSince: "Anos 1980",
        summary: "Grupo de Maputo que modernizou a marrabenta com uma sonoridade própria.",
        body: html("O Ghorwane nasceu em Maputo nos anos 1980 e tornou-se uma das bandas mais respeitadas do país, com várias digressões internacionais."),
        albums: [], photoAlbums: [],
    },
    {
        slug: "fany-mpfumo", name: "Fany Mpfumo", genre: "marrabenta", origin: "Maputo Cidade", activeSince: "Anos 1950",
        summary: "Pioneira da marrabenta, lembrada como a “Rainha da Marrabenta”.",
        body: html("Fany Mpfumo é uma das vozes pioneiras da marrabenta e continua a ser referência para as novas gerações."),
        albums: [], photoAlbums: [],
    },
    {
        slug: "azagaia", name: "Azagaia", realName: "Edson da Luz", genre: "hip-hop", birthYear: 1984, deathYear: 2023, activeSince: "Anos 2000",
        summary: "O “rapper do povo”: letras diretas sobre cidadania, justiça e esperança. Faleceu em 2023.",
        quote: "Cantar também é uma forma de cidadania.",
        body: html(
            "Azagaia foi um dos nomes mais marcantes do hip-hop moçambicano. As suas canções falavam de desigualdade, direitos e orgulho nacional, e tornaram-no uma voz de uma geração.",
            "Lançou <em>Babalaze</em> (2007) e <em>Cubaliwa</em> (2013). Faleceu a 9 de Março de 2023, com 38 anos."
        ),
        albums: [
            { slug: "babalaze", title: "Babalaze", year: 2007, tracks: [] },
            { slug: "cubaliwa", title: "Cubaliwa", year: 2013, description: "Seleção de faixas do álbum.", tracks: [{ title: "A Minha Geração" }, { title: "Revolução Já" }] },
        ],
        photoAlbums: [],
    },
];

export const GENRES = [
    entry({ slug: "marrabenta", title: "Marrabenta", tag: "Anos 1950-60", categories: ["Dança", "Urbano"], color: "#35be12", emoji: "🎸", summary: "O ritmo urbano de Maputo, de guitarras vivas e dança contagiante.", body: html("A marrabenta nasceu nos arredores de Maputo (então Lourenço Marques) no século XX e mistura ritmos locais com guitarra elétrica e outros instrumentos. O nome liga-se ao verbo “rebentar”, pela energia com que se tocava.") }),
    entry({ slug: "pandza", title: "Pandza", tag: "Anos 2000", categories: ["Dança", "Urbano"], color: "#c86b8c", emoji: "💃", summary: "Estilo urbano e dançante, muito popular entre os jovens das cidades.", body: html("A pandza é um estilo urbano e dançante que cresceu nas cidades e nas festas, com batidas eletrónicas e muita presença de dança.") }),
    entry({ slug: "afro-house", title: "Afro-House", tag: "Anos 2010", categories: ["Eletrónica"], color: "#00aefb", emoji: "🎧", summary: "Batidas eletrónicas com percussão africana, em pistas e rádios por todo o mundo.", body: html("O afro-house junta house music com percussões e vozes africanas. Produtores e DJs moçambicanos fazem parte desta cena regional.") }),
    entry({ slug: "hip-hop", title: "Hip-Hop", tag: "Anos 2000", categories: ["Urbano", "Palavra"], color: "#f0a83a", emoji: "🎤", summary: "Rap em português e em línguas nacionais, com forte voz social.", body: html("O hip-hop moçambicano cresceu nas cidades com artistas que falam de cidadania, desigualdade e identidade. Azagaia é uma das suas vozes mais lembradas.") }),
    entry({ slug: "tufo", title: "Tufo", tag: "Raízes", categories: ["Tradição", "Dança"], color: "#a85bd6", emoji: "🥁", summary: "Dança e canto de grupos de mulheres do norte, com forte herança suaíli.", body: html("O tufo é uma dança e canto tradicional de grupos de mulheres, muito ligado à Ilha de Moçambique e ao litoral norte.") }),
    entry({ slug: "timbila", title: "Timbila", tag: "Raízes", categories: ["Tradição", "Instrumentos"], color: "#d98a00", emoji: "🎶", summary: "Orquestras de xilofones do povo Chope, proclamadas pela UNESCO em 2005.", body: html("As timbila são xilofones tocados em grandes orquestras, acompanhados de dança e poesia, no sul do país (Inhambane). Em 2005, a UNESCO proclamou-as obra-prima do património oral e imaterial da humanidade.") }),
    entry({ slug: "gospel", title: "Gospel", tag: "Hoje", categories: ["Religiosa"], color: "#1f6fe0", emoji: "🙏", summary: "Música de louvor, muito presente nas igrejas e nos palcos do país.", body: html("A música gospel é uma presença forte nas comunidades, com coros e artistas que enchem igrejas e festivais.") }),
    entry({ slug: "pop", title: "Pop", tag: "Hoje", categories: ["Urbano"], color: "#e5533d", emoji: "✨", summary: "Canções contemporâneas em português e em línguas nacionais.", body: html("A pop moçambicana mistura influências locais e internacionais, e vive hoje sobretudo nas plataformas digitais.") }),
];

export const EVOLUTION = [
    entry({ slug: "raizes", title: "Raízes: timbila, xigubo, mapiko e tufo", tag: "Raízes", categories: ["Tradição"], color: "#d98a00", emoji: "🪘", summary: "A música tradicional ligava-se à vida da comunidade: trabalho, rituais, festas e histórias.", body: html("Antes da música gravada, cada região tinha as suas formas: a timbila no sul, o mapiko entre os Macondes, o tufo no litoral norte.") }),
    entry({ slug: "nasce-a-marrabenta", title: "Nasce a marrabenta", tag: "Anos 1950-60", categories: ["Urbano"], color: "#35be12", emoji: "🎸", summary: "Nos subúrbios de Maputo, a guitarra encontra os ritmos locais.", body: html("A marrabenta afirma-se como o som urbano de Maputo, cantada em ronga e changana, e dançada em festas de bairro.") }),
    entry({ slug: "independencia-e-musica", title: "Independência e música de intervenção", tag: "Anos 1970", categories: ["História"], color: "#e5533d", emoji: "🇲🇿", summary: "Com a independência, a música ganha um papel de unidade nacional.", body: html("Após 1975, as canções acompanham o projeto de construção nacional, com hinos, grupos culturais e festivais.") }),
    entry({ slug: "orquestras-e-ghorwane", title: "Orquestras e novas bandas", tag: "Anos 1980", categories: ["Bandas"], color: "#1f6fe0", emoji: "🎺", summary: "Orquestras e grupos como o Ghorwane dão novo fôlego à marrabenta.", body: html("Nos anos 1980 surgem formações que modernizam o género. O Ghorwane forma-se em Maputo e ganha respeito dentro e fora do país.") }),
    entry({ slug: "paz-e-gravacao", title: "Paz e gravação em Moçambique", tag: "Anos 1990", categories: ["Indústria"], color: "#00aefb", emoji: "💿", summary: "Com a paz, a música ganha novos estúdios e novos palcos.", body: html("Em 1997, <em>Afrikiti</em>, de Stewart Sukuma, é apontado como o primeiro CD lançado em Moçambique.") }),
    entry({ slug: "hip-hop-e-novas-vozes", title: "Hip-hop e novas vozes", tag: "Anos 2000", categories: ["Urbano"], color: "#f0a83a", emoji: "🎤", summary: "O rap ganha as ruas e as rádios, com Azagaia à cabeça.", body: html("Em 2007, Azagaia lança <em>Babalaze</em>; a nova geração usa o rap para falar de cidadania e identidade.") }),
    entry({ slug: "afro-house-e-pandza", title: "Afro-house, pandza e fusão", tag: "Anos 2010", categories: ["Eletrónica"], color: "#c86b8c", emoji: "🎧", summary: "A cena eletrónica e a dança urbana tomam conta das festas.", body: html("Os anos 2010 trazem um som mais eletrónico, com colaborações entre artistas de géneros diferentes. Em 2013, <em>Cubaliwa</em>, de Azagaia, é referência.") }),
    entry({ slug: "streaming-e-criadores", title: "Streaming e criadores digitais", tag: "Hoje", categories: ["Digital"], color: "#a85bd6", emoji: "📱", summary: "Plataformas digitais aproximam artistas e público, dentro e fora do país.", body: html("Hoje, YouTube, redes sociais e streaming permitem a qualquer artista chegar ao público, e criam espaço para uma nova geração de criadores.") }),
];
