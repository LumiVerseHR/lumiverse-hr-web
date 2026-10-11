// The coral scale figure from the maquette: the human each project amplifies.
export function Figure({ height = 28, pointing = false }: { height?: number; pointing?: boolean }) {
  return (
    <svg width={(height * 16) / 40} height={height} viewBox="0 0 16 40" aria-hidden focusable="false">
      <g fill="var(--coral)">
        <circle cx="8" cy="4" r="3.6" />
        <path d="M3.4 9.6h9.2l-1 13.4H4.4z" />
        <rect x="4.6" y="22.4" width="2.8" height="16.6" rx="1.4" />
        <rect x="8.6" y="22.4" width="2.8" height="16.6" rx="1.4" />
        <rect x="0.6" y="10.4" width="2.4" height="12" rx="1.2" transform="rotate(8 1.8 10.4)" />
        {pointing ? (
          <rect x="13" y="1.6" width="2.4" height="12" rx="1.2" transform="rotate(28 14.2 13.6)" />
        ) : (
          <rect x="13" y="10.4" width="2.4" height="12" rx="1.2" transform="rotate(-8 14.2 10.4)" />
        )}
      </g>
    </svg>
  );
}
