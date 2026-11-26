"use client";
import { useEffect, useState } from "react";
import type { Stem } from "./catalog";

export type Stats = Record<string, { loved: number; rated: number }>;
export const MIN_RATINGS = 3; // below this we say "New" instead of showing a shaky percentage

let cache: Promise<Stats> | null = null;
export function useRatings() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    cache ??= fetch("/api/ratings").then((r) => (r.ok ? r.json() : { stats: {} })).then((j) => j.stats ?? {}).catch(() => ({}));
    let off = false;
    cache.then((s) => { if (!off) setStats(s); });
    return () => { off = true; };
  }, []);
  return stats;
}

// Combined score for a set of flowers, from real "did she like it?" answers.
export function scoreFor(stats: Stats | null, stems: Stem[]) {
  if (!stats) return null;
  let loved = 0, rated = 0;
  for (const s of stems) { const x = stats[s.id]; if (x) { loved += x.loved; rated += x.rated; } }
  return { loved, rated, pct: rated ? Math.round((loved / rated) * 100) : 0 };
}

export function LoveBadge({ stats, stems, className = "" }: { stats: Stats | null; stems: Stem[]; className?: string }) {
  const s = scoreFor(stats, stems);
  if (!s) return <span className={`inline-block h-4 w-24 animate-pulse rounded bg-paper2 ${className}`} aria-hidden />;
  if (s.rated < MIN_RATINGS) return <span className={`text-xs text-soft ${className}`}>✿ New · no reactions yet</span>;
  return (
    <span className={`text-xs ${className}`} title={`From ${s.rated} real "did she like it?" answers on bouquets with these flowers`}>
      <b className="text-wine">♥ {s.pct}% loved</b> <span className="text-soft">· {s.rated} reactions</span>
    </span>
  );
}
