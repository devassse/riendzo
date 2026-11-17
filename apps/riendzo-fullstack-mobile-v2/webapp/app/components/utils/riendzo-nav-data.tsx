import type { ReactNode } from 'react';
import {
  IconScroll,
  IconCrown,
  IconFlag,
  IconLandmark,
  IconNote,
  IconXylophone,
  IconWave,
  IconStar,
  IconPot,
  IconShrimp,
  IconChili,
  IconGlass,
  IconPalm,
  IconLeaf,
  IconShip,
  IconMap,
  IconId,
  IconHeart,
  IconBook,
  IconReceipt,
  IconFilm,
  IconTicket,
  IconBall,
  IconGame,
  IconNews,
  IconCulture,
  IconPlane,
  IconVoice,
  IconDisc,
  IconHistory,
  IconArtist
} from './riendzo-icons';

export type NavLink = {
  icon: ReactNode;
  title: string;
  desc: string;
  href: string;
};

export type NavSection = {
  id: string;
  emoji: string;
  label: string;
  links: NavLink[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'historia',
    emoji: '📜',
    label: 'História',
    links: [
      { icon: <IconScroll />, title: 'Cronologia de Moçambique', desc: 'Dos reinos antigos à Independência nacional.', href: '/historia' },
      { icon: <IconCrown />, title: 'Reinos e Impérios', desc: 'Antes da ocupação dos exploradores Portugueses.', href: '/historia/antiga' },
      { icon: <IconLandmark />, title: 'Ocupação colonial', desc: 'Período de dominação portuguesa do território moçambicano.', href: '/historia/colonial' },
      { icon: <IconFlag />, title: 'História Moderna', desc: 'Um país rumo ao Progresso.', href: '/historia/moderna' },
    ],
  },
  {
  id: 'musica',
  emoji: '🎵',
  label: 'Música',
  links: [
    {
      icon: <IconHistory />,
      title: 'Evolução Musical',
      desc: 'Como os sons de Moçambique mudaram ao longo das gerações.',
      href: '/musica/evolucao',
    },
    {
      icon: <IconArtist />,
      title: 'Artistas Moçambicanos',
      desc: 'Biografias, carreiras, fotografias, álbuns e principais obras.',
      href: '/musica/artistas',
    },
    {
      icon: <IconDisc />,
      title: 'Discografias',
      desc: 'Explore álbuns, singles e lançamentos por artista e por época.',
      href: '/musica/discografias',
    },
    {
      icon: <IconNote />,
      title: 'Géneros Musicais',
      desc: 'Marrabenta, Pandza, Timbila, Xigubo, Afro-house e muito mais.',
      href: '/musica/generos',
    },
  ],
},
  {
    id: 'gastronomia',
    emoji: '🍲',
    label: 'Gastronomia',
    links: [
      { icon: <IconPot />, title: 'Receitas Tradicionais', desc: 'Matapa, xima e caril de amendoim.', href: '/gastronomia/receitas' },
      { icon: <IconShrimp />, title: 'Frutos do Mar', desc: 'Camarão à moçambicana e siri-siri da costa.', href: '/gastronomia/mariscos' },
      { icon: <IconStar />, title: 'Restaurantes', desc: 'Menus, preços, horários e página de cada restaurante.', href: '/gastronomia/restaurantes' },
      { icon: <IconGlass />, title: 'Bebidas Locais', desc: 'Tipo Tinto, 2M e sumos tropicais.', href: '/gastronomia/bebidas' },
    ],
  },
  {
    id: 'turismo',
    emoji: '🏝️',
    label: 'Turismo',
    links: [
      { icon: <IconPalm />, title: 'Praias & Ilhas', desc: "Bazaruto, Vilankulo e Ponta d'Ouro.", href: '/turismo/praias' },
      { icon: <IconLeaf />, title: 'Parques Nacionais', desc: 'Gorongosa, Niassa e Limpopo.', href: '/turismo/parques' },
      { icon: <IconLandmark />, title: 'Alojamentos', desc: 'Hotéis, guest houses e lodges: quartos e preços.', href: '/turismo/alojamentos' },
      { icon: <IconVoice />, title: 'Guias Turísticos', desc: 'Guias registados, com contacto por WhatsApp.', href: '/turismo/guias' },
      { icon: <IconPlane />, title: 'Transportes & Operadores', desc: 'Voos, ferries, autocarros e operadores.', href: '/turismo/transportes' },
      { icon: <IconShip />, title: 'Rent-a-car', desc: 'Viaturas, condições e preços.', href: '/turismo/rent-a-car' },
      { icon: <IconMap />, title: 'Roteiros Sugeridos', desc: 'Itinerários prontos por província.', href: '/turismo/roteiros' },
    ],
  },
  {
    id: 'servicos',
    emoji: '🏛️',
    label: 'Serviços Públicos',
    links: [
      { icon: <IconId />, title: 'Documentos & BI', desc: 'Emissão, renovação e requisitos.', href: '/servicos/documentos' },
      { icon: <IconHeart />, title: 'Saúde', desc: 'Unidades sanitárias e calendário de vacinação.', href: '/servicos/saude' },
      { icon: <IconBook />, title: 'Educação', desc: 'Matrículas e calendário escolar.', href: '/servicos/educacao' },
      { icon: <IconReceipt />, title: 'Impostos & Taxas', desc: 'Autoridade Tributária de Moçambique.', href: '/servicos/impostos' },
      { icon: <IconLandmark />, title: 'Bancos', desc: 'Balcões, horários e como chegar.', href: '/servicos/bancos' },
      { icon: <IconStar />, title: 'Mercados & Lojas', desc: 'Mercados, supermercados e lojas com preços.', href: '/servicos/comercio' },
      { icon: <IconWave />, title: 'Bombas de Combustível', desc: 'Postos de abastecimento e serviços.', href: '/servicos/combustivel' },
      { icon: <IconHeart />, title: 'Emergências', desc: 'Bombeiros, polícia e ambulâncias.', href: '/servicos/emergencias' },
      { icon: <IconBook />, title: 'Escolas & Centros Literários', desc: 'Onde ficam e horários.', href: '/servicos/escolas' },
      { icon: <IconNews />, title: 'Telefonia, TV & Rádio', desc: 'Operadoras, televisões e rádios.', href: '/servicos/comunicacoes' },
      { icon: <IconStar />, title: 'Serviços Gerais', desc: 'Canalização, eletricidade, limpeza, mecânica e mais.', href: '/servicos/gerais' },
    ],
  },
  {
    id: 'entretenimento',
    emoji: '🎭',
    label: 'Entretenimento',
    links: [
      { icon: <IconFilm />, title: 'Cinema & Séries', desc: 'Estreias e produções nacionais.', href: '/entretenimento/cinema' },
      { icon: <IconTicket />, title: 'Eventos', desc: 'Festivais e concertos por província.', href: '/entretenimento/eventos' },
      { icon: <IconBall />, title: 'Desporto', desc: 'Futebol, basquetebol e mais.', href: '/entretenimento/desporto' },
      { icon: <IconGame />, title: 'Jogos & Cultura Pop', desc: 'Conteúdo para todas as idades.', href: '/entretenimento/jogos' },
    ],
  },
  {
    id: 'blog',
    emoji: '📰',
    label: 'Blog',
    links: [
      { icon: <IconNews />, title: 'Últimas Notícias', desc: 'Atualidade em Moçambique.', href: '/blog/noticias' },
      { icon: <IconCulture />, title: 'Cultura', desc: 'Histórias e tradições vivas.', href: '/blog/cultura' },
      { icon: <IconPlane />, title: 'Viagens', desc: 'Dicas de quem já esteve lá.', href: '/blog/viagens' },
      { icon: <IconVoice />, title: 'Opinião', desc: 'Vozes moçambicanas em destaque.', href: '/blog/opiniao' },
      { icon: <IconArtist />, title: 'Criadores de Conteúdo', desc: 'Criadores nacionais: culinária, viagens e música.', href: '/blog/criadores' },
    ],
  },
];
