import Link from "next/link";
import Image from "next/image";
import Intro from "@/components/Intro";
import SeasonStrip from "@/components/SeasonStrip";
import { DeliveryBadge, DeliveryBanner } from "@/components/DeliveryBadge";
import { GALLERY, galleryImg, galleryPrice } from "@/lib/gallery";
import { flowerImg } from "@/lib/catalog";

const hero = GALLERY[0];
const preview = [GALLERY[1], GALLERY[6], GALLERY[4]];

export default function Home() {
  return (
    <>
      <Intro />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div className="rise">
          <p className="label">Delhi NCR · Bouquets that remember her</p>
          <h1 className="font-display mt-4 text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
            Not just flowers.<br /><em className="text-wine">Her flowers.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg text-soft">
            Tell us what she loves. Design the bouquet stem by stem. Next time, tell us how it landed. We get smarter, and in season, every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/build" className="btn btn-primary">Design her bouquet</Link>
            <Link href="/gallery" className="btn btn-ghost">Browse inspiration</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line shadow-[0_30px_60px_-30px_rgba(74,15,36,.45)]">
            <Image src={galleryImg(hero.id)} alt={hero.title} fill priority sizes="(max-width: 768px) 90vw, 440px" className="object-cover" />
          </div>
          <div className="card absolute -bottom-5 -left-4 flex items-center gap-3 !rounded-2xl p-2.5 pr-4 shadow-lg sm:-left-8">
            <span className="relative size-12 overflow-hidden rounded-xl"><Image src={flowerImg("peony")} alt="Blush peony" fill sizes="48px" className="object-cover" /></span>
            <div><p className="text-sm font-semibold">{hero.title}</p><p className="text-xs text-soft">from ₹{galleryPrice(hero)}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8"><DeliveryBanner /></section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Her profile", "Colours she loves, flowers she'd pick, flowers she can't stand or is allergic to."],
            ["02", "Build it live", "Pick stems and a vase, add a note card, and see the bouquet take shape with an honest ₹ price."],
            ["03", "Close the loop", "Next visit we ask: did she like it? Your answer shapes what we suggest next."],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6 transition hover:-translate-y-1">
              <span className="font-display text-3xl text-gold">{n}</span>
              <h3 className="font-display mt-3 text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-5 flex items-end justify-between"><h2 className="font-display text-4xl">Bouquets we love</h2><Link href="/gallery" className="text-sm text-wine underline">See all</Link></div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {preview.map((g) => (
            <li key={g.id}>
              <Link href="/gallery" className="card group block overflow-hidden !rounded-3xl">
                <div className="relative aspect-[4/5] overflow-hidden"><Image src={galleryImg(g.id)} alt={`${g.title}: ${g.blurb}`} fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover transition duration-700 group-hover:scale-105" /><DeliveryBadge className="absolute right-3 top-3" /></div>
                <div className="flex items-center justify-between p-4"><span className="font-display text-xl">{g.title}</span><span className="text-sm text-soft">₹{galleryPrice(g)}</span></div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20"><div className="card p-6 md:p-8"><SeasonStrip /></div></section>
    </>
  );
}
