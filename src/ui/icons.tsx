import type { SoundId } from "@/lib/catalog";

/** Line icons drawn for CozyMix on a 24px grid. They inherit the text colour. */
const paths = {
  rain: (
    <>
      <path d="M7 14.5h9.5a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 7.4 8.4 3 3 0 0 0 7 14.5Z" />
      <path d="m8.5 17.5-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5" />
    </>
  ),
  thunder: (
    <>
      <path d="M7 14.5h9.5a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 7.4 8.4 3 3 0 0 0 7 14.5Z" />
      <path d="m12.8 15.5-2.3 3.2h3l-2.3 3.3" />
    </>
  ),
  wind: (
    <>
      <path d="M3 9h10.5a2.75 2.75 0 1 0-2.6-3.6" />
      <path d="M3 13h15a3 3 0 1 1-2.8 4" />
      <path d="M3 17h6.5" />
    </>
  ),
  waves: (
    <>
      <path d="M2.5 9.5c2.4 0 2.4-2.5 4.8-2.5s2.4 2.5 4.7 2.5 2.4-2.5 4.8-2.5 2.4 2.5 4.7 2.5" />
      <path d="M2.5 15c2.4 0 2.4-2.5 4.8-2.5S9.7 15 12 15s2.4-2.5 4.8-2.5S19.2 15 21.5 15" />
      <path d="M5 19.5h14" />
    </>
  ),
  stream: (
    <>
      <path d="M12 3.5c-2.8 3.4-4.5 5.8-4.5 8.2a4.5 4.5 0 0 0 9 0c0-2.4-1.7-4.8-4.5-8.2Z" />
      <path d="M3 20c1.5 0 1.5-1.3 3-1.3s1.5 1.3 3 1.3 1.5-1.3 3-1.3 1.5 1.3 3 1.3 1.5-1.3 3-1.3 1.5 1.3 3 1.3" />
    </>
  ),
  fireplace: (
    <>
      <path d="M12 21c-3.6 0-5.8-2.4-5.8-5.6 0-3.4 2.5-5 3.1-8.4 1.2 1.2 1.8 2.6 1.9 4 1.3-1.3 2-3.4 1.7-6.5 3.6 2.4 5 6.6 5 10.7 0 3.4-2.3 5.8-5.9 5.8Z" />
      <path d="M12 21c-1.4 0-2.4-1-2.4-2.4 0-1.6 1.3-2.4 1.6-3.8 1.6 1 3.2 2.4 3.2 3.9 0 1.4-1 2.3-2.4 2.3Z" />
    </>
  ),
  cafe: (
    <>
      <path d="M4.5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4Z" />
      <path d="M15.5 11h1.3a2.5 2.5 0 0 1 0 5h-1.6" />
      <path d="M8.5 3.5c-.7.9-.7 1.8 0 2.7M12 3.5c-.7.9-.7 1.8 0 2.7M3.5 21.5h13" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3.5" width="14" height="14" rx="3" />
      <path d="M5 10.5h14M8.5 14.2h.01M15.5 14.2h.01M9 17.5 7 21M15 17.5l2 3.5" />
    </>
  ),
  nebulizer: (
    <>
      <rect x="4.5" y="11" width="15" height="9" rx="2" />
      <path d="M9 11V8.5h6V11M8 15.5h3M15.5 15.5h.01" />
      <path d="M10 5.5c0-1.2 1-1.3 1-2.5M13.5 5.5c0-1.2 1-1.3 1-2.5" />
    </>
  ),
  brown: (
    <>
      <path d="M3 8c3-2.5 6 2.5 9 0s6 2.5 9 0" />
      <path d="M3 13c3-2.5 6 2.5 9 0s6 2.5 9 0" />
      <path d="M3 18c3-2.5 6 2.5 9 0s6 2.5 9 0" />
    </>
  ),
  play: <path d="M8 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7Z" fill="currentColor" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
    </>
  ),
  moon: <path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1Z" />,
  share: <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />,
  save: <path d="M6.5 4h11v16.5L12 16.8l-5.5 3.7Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8h.01" />
    </>
  ),
  close: <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />,
  volume: (
    <>
      <path d="M4 9.5h3l4.5-4v13L7 14.5H4Z" />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  trash: <path d="M5 7h14M10 4h4M7 7l.8 12a1.5 1.5 0 0 0 1.5 1.5h5.4a1.5 1.5 0 0 0 1.5-1.5L17 7M10.5 11v5.5M13.5 11v5.5" />,
  power: <path d="M12 3.5v7.5M7 6.3a7.5 7.5 0 1 0 10 0" />,
  download: <path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5M5 20h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
} satisfies Record<SoundId | string, React.ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
