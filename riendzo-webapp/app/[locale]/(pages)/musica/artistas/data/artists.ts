/* Artist data. Photos go in /public/images/artists/<slug>.jpg (square, ~400px).
   If a photo is missing, the UI shows the artist's initials instead.
   Fill in `bio`, `discography` and `bibliography` as you verify them. */

export type Generation = 'velha' | 'nova';

export type Artist = {
    slug: string;
    name: string;
    genre: string;
    generation: Generation;
    photo: string;
    summary: string;
    songs?: string[];
    bio: string[];
    discography: { title: string; year?: number; type?: 'Álbum' | 'EP' | 'Single' | 'Colectânea' }[];
    bibliography: { title: string; url?: string }[];
};

const SOURCES = [
    { title: 'Spotify — playlist Velha Guarda', url: 'https://open.spotify.com/playlist/4ghnX1OIlGfPkeuUAcaih3' },
    { title: 'Africultures', url: 'https://africultures.com/murmures/?no=19823' },
    { title: 'Bantumen — Estas são cinco músicas que marcaram Moçambique', url: 'https://www.bantumen.com/artigo/estas-sao-cinco-musicas-que-marcaram-mocambique/' },
    { title: 'Spotify — playlist Moçambique', url: 'https://open.spotify.com/playlist/6kAYPaX87o0YqqF8zvBAc5' },
];

const photo = (slug: string) => `/images/artists/${slug}.jpg`;

export const ARTISTS: Artist[] = [
    /* ---------------------------- Velha Guarda ---------------------------- */
    {
        slug: 'dilon-djindji',
        name: 'Dilon Djindji',
        genre: 'Marrabenta',
        generation: 'velha',
        photo: photo('dilon-djindji'),
        summary: 'Considerado um dos "padrinhos" ou mestres da marrabenta, com uma carreira de décadas dedicada aos ritmos tradicionais e à consolidação deste género.',
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'xidiminguana',
        name: 'Xidiminguana (António Constantino Dos Santos)',
        genre: 'Marrabenta',
        generation: 'velha',
        photo: photo('xidiminguana'),
        summary: 'Ícone histórico da marrabenta e da música moçambicana.',
        songs: ['Xikona', 'Titabem'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'wazimbo',
        name: 'Wazimbo (Gildo Refógios)',
        genre: 'Marrabenta',
        generation: 'velha',
        photo: photo('wazimbo'),
        summary: 'Voz inconfundível da música moçambicana e antiga figura central da Orquestra Marrabenta Star de Moçambique.',
        songs: ['Nwahulwana'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'antonio-marcos',
        name: 'António Marcos',
        genre: 'Canção',
        generation: 'velha',
        photo: photo('antonio-marcos'),
        summary: 'Compositor e cantor de referência.',
        songs: ['Uyo Pfumela'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'mingas',
        name: 'Mingas (Lázara Tembe)',
        genre: 'Canção',
        generation: 'velha',
        photo: photo('mingas'),
        summary: 'Voz poderosa da música moçambicana.',
        songs: ['A Va Saty Va Lomu'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'jeremias-nguenha',
        name: 'Jeremias Nguenha',
        genre: 'Música ligeira e tradicional',
        generation: 'velha',
        photo: photo('jeremias-nguenha'),
        summary: 'Conhecido por clássicos da música ligeira e tradicional moçambicana.',
        songs: ['A Bunu', 'La Famba Bicha'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'chico-antonio',
        name: 'Chico António',
        genre: 'Canção',
        generation: 'velha',
        photo: photo('chico-antonio'),
        summary: 'Músico e compositor de grande relevo, reconhecido pela sua contribuição à renovação e riqueza da canção moçambicana.',
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'madala',
        name: 'Madala',
        genre: 'Sons tradicionais',
        generation: 'velha',
        photo: photo('madala'),
        summary: 'Violonista e cantor mestre dos sons tradicionais.',
        songs: ['Ponéssa Musi Wango'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'eugenio-mucavel',
        name: 'Eugénio Mucavel',
        genre: 'Música popular do sul',
        generation: 'velha',
        photo: photo('eugenio-mucavel'),
        summary: 'Nome histórico associado a canções tradicionais e populares do sul de Moçambique.',
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'zaida-e-carlos-chongo',
        name: 'Zaida Chongo e Carlos Chongo',
        genre: 'Música ligeira',
        generation: 'velha',
        photo: photo('zaida-e-carlos-chongo'),
        summary: 'Duo vocal emblemático da música ligeira moçambicana.',
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'avelino-mondlane',
        name: 'Avelino Mondlane',
        genre: 'Canção clássica',
        generation: 'velha',
        photo: photo('avelino-mondlane'),
        summary: 'Cantor clássico da música moçambicana.',
        songs: ['Nakombela Ungaranfzi', 'Mutxela Usiwana'],
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },
    {
        slug: 'hortencio-langa',
        name: 'Hortêncio Langa',
        genre: 'Acústica e tradição',
        generation: 'velha',
        photo: photo('hortencio-langa'),
        summary: 'Compositor e figura incontornável na valorização da acústica e da tradição musical do país.',
        bio: [],
        discography: [],
        bibliography: SOURCES,
    },

    /* ----------------------------- Nova Guarda ----------------------------- */
    {
        slug: 'kapa-dech',
        name: 'Kapa Dêch',
        genre: 'Transição',
        generation: 'nova',
        photo: photo('kapa-dech'),
        summary: 'Grupo que marcou a transição e a modernização de sonoridades acústicas e populares.',
        bio: [],
        discography: [],
        bibliography: [],
    },
    {
        slug: 'neyma',
        name: 'Neyma',
        genre: 'Pop e música dançante',
        generation: 'nova',
        photo: photo('neyma'),
        summary: 'Embora com uma carreira consolidada, representa a continuidade moderna da música pop e de ritmos dançantes moçambicanos.',
        bio: [],
        discography: [],
        bibliography: [],
    },
    {
        slug: 'mr-bow',
        name: 'Mr. Bow',
        genre: 'R&B e marrabenta contemporânea',
        generation: 'nova',
        photo: photo('mr-bow'),
        summary: 'Um dos maiores expoentes da música popular urbana moderna.',
        bio: [],
        discography: [],
        bibliography: [],
    },
    {
        slug: 'lourena-nhate',
        name: 'Lourena Nhate',
        genre: 'Marrabenta moderna',
        generation: 'nova',
        photo: photo('lourena-nhate'),
        summary: 'Voz proeminente que cruza a tradição da marrabenta com roupagens modernas.',
        bio: [],
        discography: [],
        bibliography: [],
    },
    {
        slug: 'lay-lizzy',
        name: 'Lay Lizzy (Assane Djalo)',
        genre: 'Hip-hop e trap',
        generation: 'nova',
        photo: photo('lay-lizzy'),
        summary: 'Um dos principais nomes do hip-hop e trap moçambicano, com forte projeção internacional.',
        bio: [],
        discography: [],
        bibliography: [],
    },
    {
        slug: 'hernani-da-silva',
        name: 'Hernâni da Silva (Hernâni Mudjilo)',
        genre: 'Hip-hop',
        generation: 'nova',
        photo: photo('hernani-da-silva'),
        summary: 'Rapper, produtor e compositor influente da nova escola do hip-hop moçambicano.',
        bio: [],
        discography: [],
        bibliography: [],
    },
];

export const getArtist = (slug: string) => ARTISTS.find((a) => a.slug === slug);
export const byGeneration = (g: Generation) => ARTISTS.filter((a) => a.generation === g);