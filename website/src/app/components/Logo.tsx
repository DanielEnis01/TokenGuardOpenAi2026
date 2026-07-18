export function Logo({ size = 28 }: { size?: number }) {
  const wordmarkSize = Math.round(size * 1.24);

  return (
    <div className="flex items-center gap-3">
      <ShieldMark size={size} />
      <div
        style={{
          font: `500 ${wordmarkSize}px/0.92 var(--font-family-display)`,
          letterSpacing: '-0.03em',
          color: '#f2f2f4',
          textRendering: 'geometricPrecision',
        }}
      >
        Token<span style={{ color: 'rgba(242, 242, 244, 0.42)', fontWeight: 400 }}>Guard</span>
      </div>
    </div>
  );
}

export function LogoIcon({ size = 28 }: { size?: number }) {
  return <ShieldMark size={size} />;
}

function ShieldMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2.5 19 5.6v6.3c0 4.53-2.94 7.22-7 9.1-4.06-1.88-7-4.57-7-9.1V5.6L12 2.5Z"
        stroke="rgba(242, 242, 244, 0.9)"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 11.8 2.1 2.15 4.35-4.5"
        stroke="rgba(242, 242, 244, 0.82)"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
