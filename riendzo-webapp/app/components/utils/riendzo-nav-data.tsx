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
      { icon: <IconScroll />, title: 'Cronologia de Moçambique', desc: 'Dos reinos antigos à Independência nacional.', href: '#' },
      { icon: <IconCrown />, title: 'Reinos e Impérios', desc: 'Antes da ocupação dos exploradores Portugueses.', href: '#' },
      { icon: <IconLandmark />, title: 'Ocupação colonial', desc: 'Período de dominação portuguesa do território moçambicano.', href: '#' },
      { icon: <IconFlag />, title: 'Luta pela Independência', desc: 'De Eduardo Mondlane à proclamação de 1975.', href: '#' },
    ],
  },
  {
    id: 'musica',
    emoji: '🎵',
    label: 'Música',
    links: [
      { icon: <IconNote />, title: 'Marrabenta', desc: 'O ritmo que nasceu nos bairros de Lourenço Marques.', href: '#' },
      { icon: <IconXylophone />, title: 'Timbila', desc: 'Xilofones Chopi, património imaterial da UNESCO.', href: '#' },
      { icon: <IconWave />, title: 'Pandza & Afro-house', desc: 'Os sons da nova geração moçambicana.', href: '#' },
      { icon: <IconStar />, title: 'Artistas em Destaque', desc: 'Biografias, playlists e novos lançamentos.', href: '#' },
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
