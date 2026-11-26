"use client";
import { useEffect, useState } from "react";
import { istNow, sameDayCutoff } from "@/lib/catalog";

const fmt = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? "am" : "pm"}`;

// Delivery promise worked out from the real slot cutoffs, so it is always true at the moment it is shown.
function useCutoff() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(t); }, []);
  return now ? { cutoff: sameDayCutoff(now), hour: istNow(now).hour } : null;
}

export function DeliveryBadge({ className = "" }: { className?: string }) {
  const c = useCutoff();
  if (!c) return null;
  return (
    <span className={`rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${c.cutoff !== null ? "text-sage" : "text-ink"} ${className}`}>
      {c.cutoff !== null ? "⚡ Same-day delivery" : "Next-day delivery"}
    </span>
  );
}

export function DeliveryBanner() {
  const c = useCutoff();
  if (!c) return <div className="h-11" aria-hidden />;
  let text: string;
  if (c.cutoff !== null) {
    const mins = Math.max(0, Math.round((c.cutoff - c.hour) * 60));
    const left = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
    text = `Order in the next ${left} (by ${fmt(c.cutoff)}) for same-day delivery across Delhi NCR`;
  } else {
    text = "Same-day orders are closed for today. Order now for tomorrow, from 10 am";
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-card px-4 py-2.5 text-sm">
      <span className="font-semibold text-sage">⚡ {text}</span>
      <span className="text-soft">🌙 Midnight surprise slot (11 pm to 12 am)</span>
      <span className="text-soft">📍 Delhi · Gurugram · Noida · Ghaziabad · Faridabad</span>
    </div>
  );
}
