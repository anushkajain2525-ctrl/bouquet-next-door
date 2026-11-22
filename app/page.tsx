import Link from "next/link";
import Intro from "@/components/Intro";
import BouquetSVG from "@/components/BouquetSVG";
import SeasonStrip from "@/components/SeasonStrip";

const demo = [{ id: "rose-pink", qty: 6 }, { id: "gerbera", qty: 4 }, { id: "tuberose", qty: 4 }, { id: "lavender-filler", qty: 3 }];

export default function Home() {
  return (
    <>
      <Intro />
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 pb-16 pt-14 md:grid-cols-[1.15fr_1fr] md:pt-24">
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
            <Link href="/suggestions" className="btn btn-ghost">What suits her now</Link>
          </div>
        </div>
        <div className="card relative grid place-items-center overflow-hidden bg-gradient-to-b from-paper2 to-card p-6" style={{ animationDelay: ".15s" }}>
          <BouquetSVG stems={demo} wrap="blush" className="w-full max-w-sm" />
          <span className="absolute bottom-4 left-4 rounded-full border border-line bg-card px-3 py-1 text-xs text-soft">from ₹210</span>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Her profile", "Colours she loves, flowers she'd pick, flowers she can't stand or is allergic to."],
            ["02", "Build it live", "Pick stems, wrapping and a note card, with a live preview and honest ₹ price."],
            ["03", "Close the loop", "Next visit we ask: did she like it? Your answer shapes what we suggest next."],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6 transition hover:-translate-y-1">
              <span className="font-display text-3xl text-gold">{n}</span>
              <h3 className="font-display mt-3 text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-soft">{d}</p>
            </div>
          ))}
        </div>
        <div className="card mt-4 p-6 md:p-8"><SeasonStrip /></div>
      </section>
    </>
  );
}
