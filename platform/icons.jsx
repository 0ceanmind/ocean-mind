/* ============================================================
   OceanMind — icons + tiny shared primitives
   Exposes (window): Icon, ProgressRing, fmt
   ============================================================ */

// Stroke icon set. 24x24 viewBox, inherits currentColor.
const ICON_PATHS = {
  iceberg: '<path d="M12 3 4 12h3l-2 9h14l-2-9h3z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  catalog: '<path d="M4 5h10a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-4a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h4z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  flame: '<path d="M12 3c.6 3-2.4 4.2-2.4 7.2A2.4 2.4 0 0 0 12 12.6a2.4 2.4 0 0 0 2.4-2.4c0-.9-.4-1.6-.4-1.6.9.5 3 2.4 3 5.4a5 5 0 1 1-10 0c0-3.6 3.4-4.8 5-11z"/>',
  bolt: '<path d="M13 3 5 13h5l-1 8 8-10h-5z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  checkcircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2 11 14.7l4.6-5"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  pause: '<rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  network: '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="19" cy="17" r="2"/><path d="M7 6.6 10.4 11M7 17.4 10.4 13M13.6 11 17 7.6M13.6 13 17 16.4"/>',
  beaker: '<path d="M9 3h6M10 3v6l-4.5 8A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14h6M10 20h4M12 14v6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-.5 4M20 5v6h-6"/>',
  book: '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18h13"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8M12 16.5h.01"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  read: '<path d="M4 5h16M4 10h16M4 15h11M4 20h7"/>',
  logout: '<path d="M14 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"/><path d="M9 12h11M17 8l4 4-4 4"/>',
  star: '<path d="M12 3.5l2.5 5.5 6 .6-4.5 4 1.3 5.9L12 16.6 6.7 19.5 8 13.6l-4.5-4 6-.6z"/>',
  wave: '<path d="M2 8c2.5-3 5-3 7.5 0s5 3 7.5 0 3.7-2 5-1M2 14c2.5-3 5-3 7.5 0s5 3 7.5 0 3.7-2 5-1"/>',
  dot: '<circle cx="12" cy="12" r="3.5"/>',
  seat: '<path d="M6 18v-5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5M8 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M6 18h12"/>',
};

function Icon({ name, size = 18, stroke = 2, fill = 'none', style, className }) {
  const inner = ICON_PATHS[name] || '';
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24',
    fill, stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className, style,
    dangerouslySetInnerHTML: { __html: inner },
  });
}

// Circular progress ring
function ProgressRing({ value = 0, size = 54, stroke = 5, color = 'var(--accent)', track = 'rgba(255,255,255,.1)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <span className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)' }} />
      </svg>
      {children != null && <span className="rt" style={{ fontSize: size * 0.26 }}>{children}</span>}
    </span>
  );
}

const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : String(n);

Object.assign(window, { Icon, ProgressRing, fmt });
