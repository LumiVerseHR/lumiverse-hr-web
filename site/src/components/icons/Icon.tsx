// One stroke family for every icon: 1.6px, round caps, drawn on a 20px grid.
const PATHS = {
  "arrow-right": "M4 10h11M11 5.5 15.5 10 11 14.5",
  "arrow-down": "M10 4v11M5.5 11 10 15.5 14.5 11",
  orbit: "M3.5 10c0-2.2 2.9-4 6.5-4s6.5 1.8 6.5 4-2.9 4-6.5 4c-1.6 0-3-.3-4.2-.9M6.3 11.6 5.4 13.2l1.8.5",
  menu: "M3.5 6.5h13M3.5 13.5h13",
  close: "M5 5l10 10M15 5 5 15",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
      <path d={PATHS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
