import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export const IconScroll = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 4h9a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H8" />
    <path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1" />
    <path d="M9 9h6M9 13h6" />
  </Icon>
);
export const IconCrown = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" />
  </Icon>
);
export const IconFlag = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M5 3v18" />
    <path d="M5 4h13l-3 4 3 4H5" />
  </Icon>
);
export const IconLandmark = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6M8 21v-6M12 21v-6M16 21v-6" />
  </Icon>
);
export const IconNote = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </Icon>
);
export const IconXylophone = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="7" width="4" height="10" rx="1" />
    <rect x="10" y="5" width="4" height="12" rx="1" />
    <rect x="17" y="8" width="4" height="9" rx="1" />
  </Icon>
);
export const IconWave = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
  </Icon>
);
export const IconStar = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.9 6.3.6-4.8 4.2 1.4 6.3L12 16.9 6.4 20l1.4-6.3L3 9.5l6.3-.6L12 3z" />
  </Icon>
);
export const IconPot = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 11h16l-1.5 8h-13L4 11z" />
    <path d="M2 11h20M9 11V8a3 3 0 0 1 6 0v3" />
  </Icon>
);
export const IconShrimp = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 14c0-5 4-9 9-9 3 0 5 2 5 4 0 3-3 3-3 6 0 2 2 3 2 3" />
    <path d="M4 14l3 3M6 12l2 2M8 10l2 2" />
  </Icon>
);
export const IconChili = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9 4c1 1 1 2 0 3" />
    <path d="M9 7c6 0 10 4 10 8 0 3-3 5-6 5-5 0-9-4-9-9 0-2 2-4 5-4z" />
  </Icon>
);
export const IconGlass = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z" />
    <path d="M8 8h8" />
  </Icon>
);
export const IconPalm = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 22V11" />
    <path d="M12 11c-2-4-6-5-9-4 2 3 5 4 9 4zM12 11c2-4 6-5 9-4-2 3-5 4-9 4zM12 11c-1-3-1-6 1-8M12 11c1-3 1-6-1-8" />
  </Icon>
);
export const IconLeaf = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 20c8 0 15-6 16-16-9 1-15 7-16 16z" />
    <path d="M6 18c3-4 6-7 12-11" />
  </Icon>
);
export const IconShip = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 16l2 4h14l2-4-9-2-9 2z" />
    <path d="M8 16V6h5l3 4M12 2v4" />
  </Icon>
);
export const IconMap = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Icon>
);
export const IconId = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="12" r="2" />
    <path d="M14 10h5M14 14h5M6 17c1-2 5-2 6 0" />
  </Icon>
);
export const IconHeart = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 20s-7-4.4-9.5-9C1 8 2.5 4.5 6 4c2-.3 3.7.8 4.5 2.2C11.3 4.8 13 3.7 15 4c3.5.5 5 4 3.5 7-2.5 4.6-9.5 9-9.5 9z" />
  </Icon>
);
export const IconBook = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 5c3-1.5 6-1.5 8 0 2-1.5 5-1.5 8 0v13c-3-1.5-6-1.5-8 0-2-1.5-5-1.5-8 0V5z" />
    <path d="M12 5v13" />
  </Icon>
);
export const IconReceipt = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6" />
  </Icon>
);
export const IconFilm = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 4v5M16 4v5" />
  </Icon>
);
export const IconTicket = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
    <path d="M10 6v12" strokeDasharray="2 2" />
  </Icon>
);
export const IconBall = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const IconGame = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="2" y="7" width="20" height="10" rx="4" />
    <path d="M7 10v4M5 12h4" />
    <circle cx="16" cy="10.5" r="1" />
    <circle cx="18.5" cy="13" r="1" />
  </Icon>
);
export const IconNews = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 4h13v16H6a2 2 0 0 1-2-2V4z" />
    <path d="M17 8h3v10a2 2 0 0 1-2 2H6M7 8h6M7 12h6M7 16h4" />
  </Icon>
);
export const IconCulture = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3l7 4v2H5V7l7-4z" />
    <path d="M5 20h14M6 9v9M10 9v9M14 9v9M18 9v9" />
  </Icon>
);
export const IconPlane = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 12l18-8-6 8 6 8-18-8zM3 12h6" />
  </Icon>
);
export const IconVoice = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M8 9a4 4 0 0 1 8 0v3a4 4 0 0 1-8 0V9z" />
    <path d="M5 12a7 7 0 0 0 14 0M12 19v2" />
  </Icon>
);
