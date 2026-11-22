"use client";
import Image from "next/image";
import { FLOWERS, SEASON_LABEL, Season, flowerImg, seasonFor } from "@/lib/catalog";
import { useEffect, useState } from "react";

export default function SeasonStrip() {
  const [s, setS] = useState<Season | null>(null);
  useEffect(() => setS(seasonFor()), []);
  if (!s) return <div className="h-28" aria-hidden />;
  const inSeason = FLOWERS.filter((f) => f.seasons.includes(s) && true);
  return (
    <div>
      <p className="label">Delhi NCR right now</p>
      <h3 className="font-display text-2xl mt-1">{SEASON_LABEL[s]}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {inSeason.map((f) => (
          <span key={f.id} className="chip flex items-center gap-2 !cursor-default !py-1.5">
            <span className="relative inline-block size-6 overflow-hidden rounded-full"><Image src={flowerImg(f.id)} alt="" fill sizes="24px" className="object-cover" /></span>{f.name} <b className="font-semibold text-soft">₹{f.price}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
