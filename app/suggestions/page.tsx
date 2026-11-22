"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, usePhone } from "@/lib/phone";
import PhoneGate from "@/components/PhoneGate";
import BouquetPhoto from "@/components/BouquetPhoto";
import { SEASON_LABEL, flowerById, priceOf } from "@/lib/catalog";
import { suggest, Profile, PastBouquet } from "@/lib/suggest";

export default function Suggestions() {
  const { phone, ready } = usePhone();
  const router = useRouter();
  const [state, setState] = useState<{ profile: Profile | null; history: PastBouquet[] } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!phone) return;
    setState(null); setErr("");
    Promise.all([api<{ profile: Profile | null }>(`/api/profile?phone=${phone}`), api<{ bouquets: PastBouquet[] }>(`/api/bouquets?phone=${phone}`)])
      .then(([p, b]) => setState({ profile: p.profile, history: b.bouquets }))
      .catch((e) => setErr(e.message));
  }, [phone]);

  if (!ready) return null;
  if (!phone) return <div className="px-4 pt-10"><PhoneGate title="Let's find what suits her" /></div>;
  if (err) return <p role="alert" className="mx-auto mt-10 max-w-md text-center text-wine">{err}</p>;
  if (!state) return <p className="pt-10 text-center text-soft">Loading…</p>;
  if (!state.profile) return (
    <div className="mx-auto max-w-md px-6 pt-16 text-center"><h1 className="font-display text-4xl">We don&apos;t know her yet.</h1>
      <p className="mt-2 text-soft">Tell us her tastes first and we&apos;ll suggest something seasonal.</p><Link href="/build" className="btn btn-primary mt-6">Set up her profile</Link></div>
  );
  const { season, items, notes } = suggest(state.profile, state.history);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-12">
      <p className="label">{SEASON_LABEL[season]} · Delhi NCR</p>
      <h1 className="font-display mt-1 text-5xl">For {state.profile.partner_name}, right now</h1>
      <ul className="mt-3 space-y-1 text-sm text-soft">{notes.map((n) => <li key={n}>· {n}</li>)}</ul>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {items.map((s, i) => (
          <article key={s.title} className="card flex flex-col p-5 rise" style={{ animationDelay: `${i * 90}ms` }}>
            <BouquetPhoto stems={s.stems} wrap={s.wrap} vase={s.vase} />
            <h2 className="font-display mt-4 text-2xl">{s.title}</h2>
            <p className="mt-1 text-sm text-soft">{s.why}</p>
            <p className="mt-2 text-xs text-soft">{s.stems.map((x) => `${x.qty}× ${flowerById(x.id)?.name}`).join(" · ")}</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="font-display text-2xl">₹{priceOf(s.stems, s.wrap, false, s.vase)}</span>
              <button className="btn btn-primary" onClick={() => { try { sessionStorage.setItem("bnd-draft", JSON.stringify(s)); } catch {} router.push("/build"); }}>Customise this</button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && <p className="mt-10 text-soft">Nothing fits her tastes this season. Try loosening her “avoid” list.</p>}
    </div>
  );
}
