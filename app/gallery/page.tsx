"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GALLERY, GalleryItem, galleryImg, galleryPrice } from "@/lib/gallery";
import { COLOR_HEX, COLOR_TAGS, OCCASIONS, Season, flowerById, flowerImg, seasonFor } from "@/lib/catalog";
import { api, usePhone } from "@/lib/phone";
import { LoveBadge, scoreFor, useRatings, MIN_RATINGS } from "@/lib/ratings";
import { DeliveryBadge, DeliveryBanner } from "@/components/DeliveryBadge";

const KINDS = [["all", "All styles"], ["mixed", "Mixed flowers"], ["single", "One flower, many colours"]] as const;
const PRICES = [["all", "Any price"], ["u500", "Under ₹500"], ["500-1000", "₹500 to ₹1,000"], ["1000", "₹1,000+"]] as const;
const SORTS = [["loved", "Most loved"], ["low", "Price: low to high"], ["high", "Price: high to low"]] as const;

const inPrice = (p: number, band: string) => band === "all" || (band === "u500" ? p < 500 : band === "1000" ? p >= 1000 : p >= 500 && p < 1000);

export default function Gallery() {
  const router = useRouter();
  const { phone } = usePhone();
  const stats = useRatings();
  const [kind, setKind] = useState("all");
  const [color, setColor] = useState("");
  const [occasion, setOccasion] = useState("");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("loved");
  const [herColors, setHerColors] = useState<string[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  useEffect(() => setSeason(seasonFor()), []);

  // If we know her, flag the bouquets in her colours.
  useEffect(() => {
    if (!phone) return setHerColors([]);
    api<{ profile: { colors: string[] } | null }>(`/api/profile?phone=${phone}`).then((r) => setHerColors(r.profile?.colors ?? [])).catch(() => {});
  }, [phone]);

  const items = useMemo(() => {
    const list = GALLERY.filter((g) => (kind === "all" || g.kind === kind) && (!color || g.colors.includes(color)) && (!occasion || g.occasions.includes(occasion)) && inPrice(galleryPrice(g), price));
    const loved = (g: GalleryItem) => { const s = scoreFor(stats, g.stems); return s && s.rated >= MIN_RATINGS ? s.pct : -1; };
    return [...list].sort((a, b) => (sort === "low" ? galleryPrice(a) - galleryPrice(b) : sort === "high" ? galleryPrice(b) - galleryPrice(a) : loved(b) - loved(a)));
  }, [kind, color, occasion, price, sort, stats]);

  const customise = (g: GalleryItem) => {
    try { sessionStorage.setItem("bnd-draft", JSON.stringify({ stems: g.stems, wrap: g.wrap, vase: g.vase })); } catch {}
    router.push("/build");
  };
  const clear = () => { setKind("all"); setColor(""); setOccasion(""); setPrice("all"); };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6">
      <p className="label">Inspiration</p>
      <h1 className="font-display mt-1 text-4xl sm:text-5xl">Bouquets we love</h1>
      <p className="mt-3 max-w-xl text-soft">Start from a look you like, then change any stem. Ratings come only from real “did she like it?” answers.</p>
      <div className="mt-6"><DeliveryBanner /></div>

      <div className="mt-6 space-y-3">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button className="chip shrink-0" aria-pressed={!occasion} onClick={() => setOccasion("")}>All occasions</button>
          {OCCASIONS.map((o) => <button key={o} className="chip shrink-0 capitalize" aria-pressed={occasion === o} onClick={() => setOccasion(occasion === o ? "" : o)}>{o}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {KINDS.map(([k, label]) => <button key={k} className="chip !py-1.5 !text-xs" aria-pressed={kind === k} onClick={() => setKind(k)}>{label}</button>)}
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
          {COLOR_TAGS.map((c) => (
            <button key={c} className="chip flex items-center gap-1.5 !py-1.5 !text-xs capitalize" aria-pressed={color === c} onClick={() => setColor(color === c ? "" : c)}>
              <i className="size-2.5 rounded-full border border-black/10" style={{ background: COLOR_HEX[c] }} />{c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">{PRICES.map(([k, l]) => <button key={k} className="chip !py-1.5 !text-xs" aria-pressed={price === k} onClick={() => setPrice(k)}>{l}</button>)}</div>
          <label className="flex items-center gap-2 text-sm text-soft">Sort
            <select className="input !w-auto !py-1.5 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        </div>
        <p className="text-xs text-soft">{items.length} bouquet{items.length === 1 ? "" : "s"}</p>
      </div>

      <ul className="mt-4 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
        {items.map((g, i) => {
          const p = galleryPrice(g);
          const stems = g.stems.reduce((n, s) => n + s.qty, 0);
          const allInSeason = !!season && g.stems.every((s) => flowerById(s.id)?.seasons.includes(season!));
          const forHer = herColors.length > 0 && g.colors.some((c) => herColors.includes(c));
          return (
            <li key={g.id} className="card group break-inside-avoid overflow-hidden !rounded-[1.6rem] rise" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="relative overflow-hidden" style={{ aspectRatio: g.ratio.replace("/", " / ") }}>
                <Image src={galleryImg(g.id)} alt={`${g.title}: ${g.blurb}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover transition duration-700 group-hover:scale-[1.06]" />
                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                  {forHer && <span className="rounded-full bg-wine px-2.5 py-1 text-[11px] font-semibold text-white">♥ In her colours</span>}
                  {allInSeason && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-sage backdrop-blur">🌿 In season now</span>}
                </div>
                <DeliveryBadge className="absolute right-3 top-3" />
                {/* What's inside: revealed on hover (always visible on touch screens) */}
                <div className="absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-4 pt-10 transition duration-500 sm:translate-y-full sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/80">What&apos;s inside</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {g.stems.map((s) => (
                      <li key={s.id} className="flex items-center gap-1.5 rounded-full bg-white/90 py-0.5 pl-0.5 pr-2 text-[11px] text-ink">
                        <span className="relative size-5 overflow-hidden rounded-full"><Image src={flowerImg(s.id)} alt="" fill sizes="20px" className="object-cover" /></span>
                        {s.qty}× {flowerById(s.id)?.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl">{g.title}</h2>
                  <div className="text-right"><span className="font-display text-xl text-wine">₹{p}</span><p className="text-[11px] text-soft">{stems} stems</p></div>
                </div>
                <LoveBadge stats={stats} stems={g.stems} className="mt-1 block" />
                <p className="mt-2 text-sm text-soft">{g.blurb}</p>
                <p className="mt-2 text-xs capitalize text-soft">Great for {g.occasions.join(", ")}</p>
                <button className="btn btn-primary mt-4 w-full" onClick={() => customise(g)}>Customise this</button>
              </div>
            </li>
          );
        })}
      </ul>
      {!items.length && (
        <div className="card mt-6 p-10 text-center"><p className="text-soft">No bouquets match all of those filters.</p><button className="btn btn-ghost mt-4" onClick={clear}>Clear filters</button></div>
      )}
    </div>
  );
}
