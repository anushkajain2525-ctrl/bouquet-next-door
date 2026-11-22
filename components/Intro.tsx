"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "closed" | "open" | "narrow" | "fly" | "done";

// Deterministic pseudo-random so server and client render the same pleats.
function rng(seed: number) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

// Irregular fabric folds: light ridge -> soft shadow valley, of uneven widths.
function pleats(seed: number) {
  const r = rng(seed); const stops: string[] = []; let x = 0;
  while (x < 100) {
    const w = 5 + r() * 7;
    stops.push(`rgba(255,255,255,${0.2 + r() * 0.12}) ${x.toFixed(1)}%`,
      `rgba(255,255,255,0) ${(x + w * 0.35).toFixed(1)}%`,
      `rgba(120,55,75,${0.2 + r() * 0.16}) ${(x + w * 0.78).toFixed(1)}%`,
      `rgba(255,255,255,${0.12 + r() * 0.1}) ${(x + w).toFixed(1)}%`);
    x += w;
  }
  return `linear-gradient(90deg, ${stops.join(",")})`;
}

function Panel({ side, open }: { side: "l" | "r"; open: boolean }) {
  const folds = useMemo(() => pleats(side === "l" ? 11 : 29), [side]);
  const origin = side === "l" ? "left" : "right";
  const id = `weave-${side}`;
  return (
    <div className="absolute top-0 h-full w-[52%]"
      style={{ [origin]: 0, transformOrigin: `${origin} top`,
        transform: open ? "scaleX(.16)" : "scaleX(1)",
        transition: `transform 4.2s cubic-bezier(.45,.05,.25,1) ${side === "r" ? ".35s" : "0s"}`, willChange: "transform" }}>
      {/* the sway lives on an inner layer so the hem trails the fabric like real cloth */}
      <div className="absolute inset-0 origin-top" style={{ animation: open ? `hem${side} 4.6s ease-in-out ${side === "r" ? ".35s" : "0s"} both` : undefined }}>
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <filter id={id} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.01" numOctaves="2" seed={side === "l" ? 4 : 9} result="n" />
              <feColorMatrix in="n" values="0 0 0 0 .55  0 0 0 0 .3  0 0 0 0 .38  0 0 0 .13 0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#f2c9cf" opacity=".93" />
          <rect width="100%" height="100%" filter={`url(#${id})`} />
        </svg>
        <div className="absolute inset-0" style={{ background: folds }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(${side === "l" ? "90deg" : "270deg"}, rgba(255,255,255,0) 70%, rgba(255,255,255,.35))` }} />
        <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(rgba(110,50,70,.28), transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(transparent, rgba(255,255,255,.22))" }} />
      </div>
    </div>
  );
}

export default function Intro() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [skip, setSkip] = useState(false);
  const inner = useRef<HTMLDivElement>(null);
  const [fly, setFly] = useState("translate(0px,0px) scale(1)");

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("bnd-intro") === "1"; } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setSkip(true); return; }
    const root = document.documentElement;
    root.dataset.intro = "playing";
    root.style.overflow = "hidden";
    const T = (ms: number, p: Phase) => setTimeout(() => setPhase(p), ms);
    const ids = [T(900, "open"), T(5600, "narrow"), T(7000, "fly"), T(8100, "done")];
    return () => { ids.forEach(clearTimeout); root.dataset.intro = "done"; root.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (phase === "fly") {
      const logo = document.getElementById("bnd-logo")?.getBoundingClientRect();
      const el = inner.current?.getBoundingClientRect();
      if (logo && el) {
        const s = logo.width / el.width;
        setFly(`translate(${logo.left + logo.width / 2 - window.innerWidth / 2}px, ${logo.top + logo.height / 2 - window.innerHeight / 2}px) scale(${s})`);
      }
    }
    if (phase === "done") {
      try { sessionStorage.setItem("bnd-intro", "1"); } catch {}
      document.documentElement.dataset.intro = "done";
      document.documentElement.style.overflow = "";
    }
  }, [phase]);

  const finish = () => { setPhase("done"); };
  if (skip || phase === "done") return null;
  const narrow = phase === "narrow" || phase === "fly";
  const collapse = (open: boolean): React.CSSProperties => ({
    display: "inline-block", overflow: "hidden", verticalAlign: "bottom", whiteSpace: "pre",
    maxWidth: open ? "0em" : "6em", opacity: open ? 0 : 1, transition: "max-width 1.1s cubic-bezier(.65,0,.2,1), opacity .8s",
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" aria-label="Bouquet Next Door" role="img" style={{ pointerEvents: phase === "fly" ? "none" : "auto" }}>
      {/* soft morning window light behind the curtains */}
      <div className="absolute inset-0" style={{ opacity: phase === "fly" ? 0 : 1, transition: "opacity 1s ease .1s",
        background: "radial-gradient(ellipse at 50% 38%, #fffaf3 0, #fbeee4 45%, #f1d9cf 100%)" }} />
      <div className="absolute inset-0 grid place-items-center">
        <div ref={inner} className="font-display text-wine font-semibold whitespace-nowrap select-none"
          style={{ fontSize: "clamp(2.2rem, 7.5vw, 5.8rem)", transform: fly, transition: "transform 1.1s cubic-bezier(.65,0,.2,1), opacity 2.2s ease",
            opacity: phase === "closed" || phase === "open" ? (phase === "open" ? 1 : 0) : 1 }}>
          <span>B</span><span style={collapse(narrow)}>ouquet </span>
          <span>N</span><span style={collapse(narrow)}>ext </span>
          <span>D</span><span style={collapse(narrow)}>oor</span><span className="text-gold">.</span>
        </div>
      </div>
      <div style={{ opacity: phase === "fly" ? 0 : 1, transition: "opacity .8s" }}>
        <Panel side="l" open={phase !== "closed"} />
        <Panel side="r" open={phase !== "closed"} />
        {/* curtain rod with rings */}
        <div className="absolute inset-x-0 top-0 h-3" style={{ background: "linear-gradient(#d9b98a, #a9854f 60%, #8a6a3b)", boxShadow: "0 6px 14px rgba(80,40,20,.3)" }} />
      </div>
      <button onClick={finish} className="absolute bottom-6 right-6 rounded-full border border-wine/30 bg-white/60 px-4 py-2 text-xs text-wine backdrop-blur">Skip</button>
    </div>
  );
}
