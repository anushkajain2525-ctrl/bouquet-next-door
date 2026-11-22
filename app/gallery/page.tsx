"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GALLERY, galleryImg, galleryPrice } from "@/lib/gallery";
import { COLOR_HEX, COLOR_TAGS, flowerById } from "@/lib/catalog";

const KINDS = [["all", "All"], ["mixed", "Mixed flowers"], ["single", "One flower, many colours"]] as const;

export default function Gallery() {
  const router = useRouter();
  const [kind, setKind] = useState<string>("all");
  const [color, setColor] = useState<string>("");
  const items = GALLERY.filter((g) => (kind === "all" || g.kind === kind) && (!color || g.colors.includes(color)));

  const customise = (id: string) => {
    const g = GALLERY.find((x) => x.id === id)!;
    try { sessionStorage.setItem("bnd-draft", JSON.stringify({ stems: g.stems, wrap: g.wrap, vase: g.vase })); } catch {}
    router.push("/build");
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6">
      <p className="label">Inspiration</p>
      <h1 className="font-display mt-1 text-5xl">Bouquets we love</h1>
      <p className="mt-3 max-w-xl text-soft">Start from a look you like, then change any stem. Mixed arrangements, or a single flower in several colours.</p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {KINDS.map(([k, label]) => <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{label}</button>)}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        {COLOR_TAGS.map((c) => (
          <button key={c} className="chip flex items-center gap-2 capitalize" aria-pressed={color === c} onClick={() => setColor(color === c ? "" : c)}>
            <i className="size-3 rounded-full border border-black/10" style={{ background: COLOR_HEX[c] }} />{c}
          </button>
        ))}
      </div>

      <ul className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
        {items.map((g, i) => (
          <li key={g.id} className="card group break-inside-avoid overflow-hidden !rounded-[1.6rem] rise" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: g.ratio.replace("/", " / ") }}>
              <Image src={galleryImg(g.id)} alt={g.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
              <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{g.kind === "single" ? "One flower · many colours" : "Mixed"}</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3"><h2 className="font-display text-2xl">{g.title}</h2><span className="font-display text-xl text-wine">₹{galleryPrice(g)}</span></div>
              <p className="mt-1 text-sm text-soft">{g.blurb}</p>
              <p className="mt-2 text-xs text-soft">{g.stems.map((s) => `${s.qty}× ${flowerById(s.id)?.name}`).join(" · ")}</p>
              <button className="btn btn-primary mt-4 w-full" onClick={() => customise(g.id)}>Customise this</button>
            </div>
          </li>
        ))}
      </ul>
      {!items.length && <p className="mt-10 text-soft">No bouquets with that mix yet. Try another colour.</p>}
    </div>
  );
}
