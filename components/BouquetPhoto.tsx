import Image from "next/image";
import { Stem, flowerById, flowerImg, vaseById, vaseImg, wrapById } from "@/lib/catalog";

// Photo-based bouquet preview: one flower fills the frame; a mix becomes a collage of its flowers,
// with any extras as round thumbnails, plus the chosen vase. Every image is a real generated photograph.
export default function BouquetPhoto({ stems, wrap, vase = "none", className = "", priority = false }: {
  stems: Stem[]; wrap: string; vase?: string; className?: string; priority?: boolean;
}) {
  const sorted = [...stems].filter((s) => flowerById(s.id) && s.qty > 0).sort((a, b) => b.qty - a.qty);
  const hero = sorted[0];
  const rest = sorted.length === 1 ? [] : sorted.slice(3, 7); // extra flowers beyond the collage tiles
  const count = sorted.reduce((n, s) => n + s.qty, 0);
  const w = wrapById(wrap);
  const v = vase !== "none" ? vaseById(vase) : null;
  const label = sorted.slice(0, 3).map((s) => `${s.qty}× ${flowerById(s.id)!.name}`).join(" · ") + (sorted.length > 3 ? ` +${sorted.length - 3}` : "");

  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden rounded-[1.4rem] bg-paper2 ${className}`}>
      {hero ? (
        <>
          {sorted.length === 1 ? (
            <Image src={flowerImg(hero.id)} alt={flowerById(hero.id)!.name} fill sizes="(max-width: 768px) 90vw, 420px" priority={priority} className="object-cover" />
          ) : (
            // Mixed bouquet: a collage with one tile per flower, the biggest share on the left.
            <div className={`absolute inset-0 grid gap-0.5 ${sorted.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}>
              {sorted.slice(0, 3).map((s, i) => (
                <div key={s.id} className={`relative overflow-hidden ${sorted.length > 2 && i === 0 ? "row-span-2" : ""}`}>
                  <Image src={flowerImg(s.id)} alt={flowerById(s.id)!.name} fill sizes="(max-width: 768px) 50vw, 220px" priority={priority && i === 0} className="object-cover transition duration-500" />
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-3 bottom-3">
            <div className="mb-2 flex -space-x-2.5">
              {rest.map((s) => (
                <span key={s.id} className="relative size-11 overflow-hidden rounded-full border-2 border-white shadow-md" title={`${s.qty}× ${flowerById(s.id)!.name}`}>
                  <Image src={flowerImg(s.id)} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-xs font-medium text-white drop-shadow">{label}</p>
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">{count} stems</span>
          {w && <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] text-ink backdrop-blur"><i className="size-2.5 rounded-full border border-black/10" style={{ background: w.color }} />{w.name}</span>}
          {v && (
            <span className="absolute right-3 top-12 flex items-center gap-2 rounded-full bg-white/85 py-1 pl-1 pr-2.5 text-[11px] backdrop-blur">
              <span className="relative size-7 overflow-hidden rounded-full"><Image src={vaseImg(v.id)} alt="" fill sizes="28px" className="object-cover" /></span>{v.name}
            </span>
          )}
        </>
      ) : (
        <div className="grid h-full place-items-center p-8 text-center text-sm text-soft">Add flowers and the bouquet appears here</div>
      )}
    </div>
  );
}
