import React from 'react';

type P = React.SVGProps<SVGSVGElement> & { size?: number };

const S: React.FC<P & { children: React.ReactNode }> = ({ size = 14, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-glyph"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const IconSearch = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </S>
);

export const IconPlus = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconMinus = (p: P) => (
  <S {...p}>
    <path d="M5 12h14" />
  </S>
);

export const IconFit = (p: P) => (
  <S {...p}>
    <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
  </S>
);

export const IconLink = (p: P) => (
  <S {...p}>
    <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
    <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.4-1.4" />
  </S>
);

export const IconMind = (p: P) => (
  <S {...p}>
    <rect x="2.5" y="9" width="6" height="6" rx="2" />
    <rect x="15.5" y="2.5" width="6" height="5" rx="1.6" />
    <rect x="15.5" y="9.5" width="6" height="5" rx="1.6" />
    <rect x="15.5" y="16.5" width="6" height="5" rx="1.6" />
    <path d="M8.5 12h3.5V5h3.5M12 12h3.5M12 12v7h3.5" />
  </S>
);

export const IconNetwork = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="5" r="2.4" />
    <circle cx="5" cy="17" r="2.4" />
    <circle cx="19" cy="17" r="2.4" />
    <circle cx="12" cy="12" r="1.6" />
    <path d="M12 7.4v3M10.7 13.2 6.4 15.6M13.3 13.2l4.3 2.4" />
  </S>
);

export const IconConcept = (p: P) => (
  <S {...p}>
    <rect x="3" y="3" width="7.5" height="5.5" rx="1.4" />
    <rect x="13.5" y="15.5" width="7.5" height="5.5" rx="1.4" />
    <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.4" />
    <path d="M6.7 8.5v7M10.5 6h3.2a2 2 0 0 1 2 2v7.5" />
  </S>
);

export const IconHybrid = (p: P) => (
  <S {...p}>
    <circle cx="8" cy="8" r="4.2" />
    <circle cx="16" cy="16" r="4.2" />
    <path d="M11 11l2 2" />
  </S>
);

export const IconTree = (p: P) => (
  <S {...p}>
    <path d="M3 6h6M3 12h6M3 18h6M14 6h2M14 12h2M14 18h2" />
    <path d="M9 6v12" />
  </S>
);

export const IconRadial = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="12" cy="12" r="8.5" strokeDasharray="1.5 3" />
    <circle cx="12" cy="3.5" r="1.4" />
    <circle cx="20.5" cy="12" r="1.4" />
    <circle cx="12" cy="20.5" r="1.4" />
  </S>
);

export const IconOrganic = (p: P) => (
  <S {...p}>
    <path d="M6 16c-2-3-1-7 2-8.5C11 6 13 4.5 16 6c3 1.6 3 5.5 1.5 8S12.5 20 9.5 19 7 18 6 16Z" />
    <circle cx="10" cy="11" r="1.2" />
    <circle cx="15" cy="14" r="1.2" />
    <circle cx="9" cy="15.5" r="1.2" />
  </S>
);

export const IconChevron = (p: P) => (
  <S {...p}>
    <path d="m9 6 6 6-6 6" />
  </S>
);

export const IconDown = (p: P) => (
  <S {...p}>
    <path d="m6 9 6 6 6-6" />
  </S>
);

export const IconClose = (p: P) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);

export const IconTrash = (p: P) => (
  <S {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13M10 11v5M14 11v5" />
  </S>
);

export const IconCopy = (p: P) => (
  <S {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" />
  </S>
);

export const IconDownload = (p: P) => (
  <S {...p}>
    <path d="M12 4v11M7.5 11 12 15.5 16.5 11M4 20h16" />
  </S>
);

export const IconUpload = (p: P) => (
  <S {...p}>
    <path d="M12 16V5M7.5 9 12 4.5 16.5 9M4 20h16" />
  </S>
);

export const IconUndo = (p: P) => (
  <S {...p}>
    <path d="M8 5 4 9l4 4" />
    <path d="M4 9h9a6 6 0 0 1 0 12h-2" />
  </S>
);

export const IconRedo = (p: P) => (
  <S {...p}>
    <path d="m16 5 4 4-4 4" />
    <path d="M20 9h-9a6 6 0 0 0 0 12h2" />
  </S>
);

export const IconOrbit = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="2.4" />
    <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(-28 12 12)" />
    <circle cx="20" cy="7" r="1.3" fill="currentColor" stroke="none" />
  </S>
);

export const IconGrid = (p: P) => (
  <S {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </S>
);

export const IconLayers = (p: P) => (
  <S {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" opacity=".55" />
  </S>
);

export const IconSettings = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.9l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.9 1.2v.17a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-2.9-1.2l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3 15a1.7 1.7 0 0 0-1.53-1H1.3a2 2 0 1 1 0-4h.17A1.7 1.7 0 0 0 3 9a1.7 1.7 0 0 0-.34-1.9l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 4.6h.09a1.7 1.7 0 0 0 1-1.55V2.8a2 2 0 1 1 4 0v.17a1.7 1.7 0 0 0 2.9 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.17a1.7 1.7 0 0 0-1.43 1Z" />
  </S>
);

export const IconArrowUpRight = (p: P) => (
  <S {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </S>
);

export const IconTarget = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </S>
);

export const IconEye = (p: P) => (
  <S {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </S>
);

export const IconEyeOff = (p: P) => (
  <S {...p}>
    <path d="M4 4l16 16M9.9 5.8A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.1 3.9M6.1 8A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </S>
);

export const IconSparkle = (p: P) => (
  <S {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </S>
);

export const IconHelp = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
    <circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none" />
  </S>
);

export const IconCompress = (p: P) => (
  <S {...p}>
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </S>
);

export const IconExpand = (p: P) => (
  <S {...p}>
    <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
  </S>
);
