import { Flower, Stem, flowerById, wrapById } from "@/lib/catalog";

function Bloom({ f, x, y, r, rot }: { f: Flower; x: number; y: number; r: number; rot: number }) {
  const c = f.color;
  const dark = "rgba(0,0,0,.14)";
  const petals = (n: number, rx: number, ry: number, off = 0) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={i} cx={0} cy={-off} rx={rx} ry={ry} fill={c} stroke={dark} strokeWidth=".6" transform={`rotate(${(360 / n) * i})`} />
    ));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}><g className="pop" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      {f.shape === "round" && (<>{petals(7, r * 0.5, r * 0.62, r * 0.42)}<circle r={r * 0.62} fill={c} stroke={dark} strokeWidth=".6" /><path d={`M${-r*.3} 0a${r*.3} ${r*.3} 0 1 1 ${r*.6} 0`} fill="none" stroke={dark} strokeWidth="1.2" /><circle r={r * 0.2} fill={dark} /></>)}
      {f.shape === "daisy" && (<>{petals(14, r * 0.14, r * 0.5, r * 0.5)}<circle r={r * 0.3} fill={f.id === "gerbera" || f.id === "sunflower" ? "#5b3a1e" : "#f59e0b"} /></>)}
      {f.shape === "ruffle" && (<>{petals(10, r * 0.34, r * 0.4, r * 0.55)}{petals(7, r * 0.3, r * 0.34, r * 0.3)}<circle r={r * 0.16} fill={dark} /></>)}
      {f.shape === "bell" && (<>{petals(6, r * 0.26, r * 0.62, r * 0.55)}<circle r={r * 0.12} fill="#e9c46a" /></>)}
      {f.shape === "spiky" && (<>{[-1, 0, 1].map((k) => (<g key={k} transform={`rotate(${k * 22})`}><line x1="0" y1={r * 0.8} x2="0" y2={-r * 0.9} stroke="#5f7a4f" strokeWidth="2" />{[-0.8, -0.45, -0.1, 0.25, 0.6].map((t, i) => (<circle key={i} cx={i % 2 ? 4 : -4} cy={r * t} r={r * 0.2 - i * 0.6} fill={c} stroke={dark} strokeWidth=".5" />))}</g>))}</>)}
    </g></g>
  );
}

export function expand(stems: Stem[], cap = 30): string[] {
  const queues = stems.map((s) => Array(Math.min(s.qty, cap)).fill(s.id) as string[]);
  const out: string[] = [];
  while (out.length < cap && queues.some((q) => q.length)) for (const q of queues) { if (q.length && out.length < cap) out.push(q.pop()!); }
  return out;
}

// Dome layout: blooms placed on rings, centre first.
function slots(n: number) {
  const pts: { x: number; y: number; r: number; rot: number }[] = [{ x: 150, y: 112, r: 30, rot: 0 }];
  const rings = [{ n: 6, rad: 42, r: 27 }, { n: 11, rad: 80, r: 24 }, { n: 16, rad: 114, r: 21 }];
  for (const ring of rings) for (let i = 0; i < ring.n; i++) {
    const a = (Math.PI * 2 * i) / ring.n + ring.rad;
    pts.push({ x: 150 + Math.cos(a) * ring.rad * 1.05, y: 118 + Math.sin(a) * ring.rad * 0.78, r: ring.r, rot: (i * 47) % 360 });
  }
  return pts.slice(0, n);
}

export default function BouquetSVG({ stems, wrap, className = "" }: { stems: Stem[]; wrap: string; className?: string }) {
  const ids = expand(stems);
  const pts = slots(ids.length);
  const w = wrapById(wrap)?.color ?? "#c9a77c";
  const order = pts.map((p, i) => ({ p, id: ids[i] })).reverse(); // outer first, centre on top
  return (
    <svg viewBox="0 0 300 340" className={className} role="img" aria-label={`Bouquet with ${ids.length} stems`}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="38%" r="55%"><stop offset="0" stopColor="#fff" stopOpacity=".8" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="150" cy="130" rx="140" ry="130" fill="url(#glow)" />
      <g className="sway">
        {pts.map((p, i) => (<line key={i} x1={p.x} y1={p.y} x2="150" y2="250" stroke="#6b8a5a" strokeWidth="3" strokeLinecap="round" opacity=".85" />))}
        {order.map(({ p, id }, i) => { const f = flowerById(id); return f ? <Bloom key={i} f={f} {...p} /> : null; })}
        <path d="M82 188 L218 188 L168 322 Q150 332 132 322 Z" fill={w} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M82 188 L150 214 L218 188 L190 262 L150 214 L110 262 Z" fill="rgba(255,255,255,.28)" />
        <path d="M132 322 Q150 332 168 322 L158 300 L142 300 Z" fill="rgba(0,0,0,.1)" />
        <path d="M128 232 Q150 248 172 232 L168 250 Q150 262 132 250 Z" fill="#7a1d3b" opacity=".9" />
      </g>
      {ids.length === 0 && <text x="150" y="130" textAnchor="middle" fontSize="14" fill="#6f5e57">Add flowers to begin</text>}
    </svg>
  );
}
