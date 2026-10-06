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
      href: '/musica',
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
      { icon: <IconPot />, title: 'Receitas Tradicionais', desc: 'Matapa, xima e caril de amendoim.', href: '#' },
      { icon: <IconShrimp />, title: 'Frutos do Mar', desc: 'Camarão à moçambicana e siri-siri da costa.', href: '#' },
      { icon: <IconChili />, title: 'Piri-piri & Especiarias', desc: 'A herança viva da rota das especiarias.', href: '#' },
      { icon: <IconGlass />, title: 'Bebidas Locais', desc: 'Tipo Tinto, 2M e sumos tropicais.', href: '#' },
    ],
  },
  {
    id: 'turismo',
    emoji: '🏝️',
    label: 'Turismo',
    links: [
      { icon: <IconPalm />, title: 'Praias & Ilhas', desc: "Bazaruto, Vilankulo e Ponta d'Ouro.", href: '#' },
      { icon: <IconLeaf />, title: 'Parques Nacionais', desc: 'Gorongosa, Niassa e Limpopo.', href: '#' },
      { icon: <IconShip />, title: 'Ilha de Moçambique', desc: 'História e arquitetura à beira-mar.', href: '#' },
      { icon: <IconMap />, title: 'Roteiros Sugeridos', desc: 'Itinerários prontos por província.', href: '#' },
    ],
  },
  {
    id: 'servicos',
    emoji: '🏛️',
    label: 'Serviços Públicos',
    links: [
      { icon: <IconId />, title: 'Documentos & BI', desc: 'Emissão, renovação e requisitos.', href: '#' },
      { icon: <IconHeart />, title: 'Saúde', desc: 'Unidades sanitárias e calendário de vacinação.', href: '#' },
      { icon: <IconBook />, title: 'Educação', desc: 'Matrículas e calendário escolar.', href: '#' },
      { icon: <IconReceipt />, title: 'Impostos & Taxas', desc: 'Autoridade Tributária de Moçambique.', href: '#' },
    ],
  },
  {
    id: 'entretenimento',
    emoji: '🎭',
    label: 'Entretenimento',
    links: [
      { icon: <IconFilm />, title: 'Cinema & Séries', desc: 'Estreias e produções nacionais.', href: '#' },
      { icon: <IconTicket />, title: 'Eventos', desc: 'Festivais e concertos por província.', href: '#' },
      { icon: <IconBall />, title: 'Desporto', desc: 'Futebol, basquetebol e mais.', href: '#' },
      { icon: <IconGame />, title: 'Jogos & Cultura Pop', desc: 'Conteúdo para todas as idades.', href: '#' },
    ],
  },
  {
    id: 'blog',
    emoji: '📰',
    label: 'Blog',
    links: [
      { icon: <IconNews />, title: 'Últimas Notícias', desc: 'Atualidade em Moçambique.', href: '#' },
      { icon: <IconCulture />, title: 'Cultura', desc: 'Histórias e tradições vivas.', href: '#' },
      { icon: <IconPlane />, title: 'Viagens', desc: 'Dicas de quem já esteve lá.', href: '#' },
      { icon: <IconVoice />, title: 'Opinião', desc: 'Vozes moçambicanas em destaque.', href: '#' },
    ],
  },
];
