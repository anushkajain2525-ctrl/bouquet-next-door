"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, usePhone } from "@/lib/phone";
import PhoneGate from "@/components/PhoneGate";
import BouquetSVG from "@/components/BouquetSVG";
import { CARD_PRICE, COLOR_HEX, COLOR_TAGS, FLOWERS, OCCASIONS, VIBES, WRAPS, priceOf, seasonFor, SEASON_LABEL, Stem } from "@/lib/catalog";
import type { Profile } from "@/lib/suggest";

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function ProfileForm({ initial, onSaved, phone }: { initial: Profile | null; onSaved: (p: Profile) => void; phone: string }) {
  const [name, setName] = useState(initial?.partner_name && initial.partner_name !== "her" ? initial.partner_name : "");
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [fav, setFav] = useState<string[]>(initial?.favorite_flowers ?? []);
  const [avoid, setAvoid] = useState<string[]>(initial?.avoid_flowers ?? []);
  const [vibe, setVibe] = useState(initial?.vibe ?? "romantic");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const flowers = FLOWERS.filter((f) => f.id !== "lavender-filler");

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api<{ profile: Profile }>("/api/profile", { method: "POST", body: JSON.stringify({ phone, partner_name: name, colors, favorite_flowers: fav, avoid_flowers: avoid, vibe }) });
      onSaved(r.profile);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="card mx-auto max-w-2xl space-y-7 p-6 sm:p-9 rise">
      <div><p className="label">Step 1 of 2</p><h1 className="font-display mt-1 text-4xl">Tell us about her</h1></div>
      <div><label className="label" htmlFor="nm">Her name (or nickname)</label><input id="nm" className="input mt-2" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aanya" /></div>
      <div><p className="label">Colours she gravitates to</p><div className="mt-2 flex flex-wrap gap-2">
        {COLOR_TAGS.map((c) => (<button type="button" key={c} className="chip flex items-center gap-2" aria-pressed={colors.includes(c)} onClick={() => setColors(toggle(colors, c))}><i className="size-3 rounded-full border border-black/10" style={{ background: COLOR_HEX[c] }} />{c}</button>))}
      </div></div>
      <div><p className="label">Flowers she loves</p><div className="mt-2 flex flex-wrap gap-2">
        {flowers.map((f) => (<button type="button" key={f.id} className="chip" aria-pressed={fav.includes(f.id)} disabled={avoid.includes(f.id)} onClick={() => setFav(toggle(fav, f.id))}>{f.name}</button>))}
      </div></div>
      <div><p className="label">Flowers to avoid (dislike or allergy)</p><div className="mt-2 flex flex-wrap gap-2">
        {flowers.map((f) => (<button type="button" key={f.id} className="chip avoid" aria-pressed={avoid.includes(f.id)} onClick={() => { setAvoid(toggle(avoid, f.id)); setFav(fav.filter((x) => x !== f.id)); }}>{f.name}</button>))}
      </div></div>
      <div><p className="label">Her vibe</p><div className="mt-2 flex flex-wrap gap-2">
        {VIBES.map((v) => (<button type="button" key={v} className="chip capitalize" aria-pressed={vibe === v} onClick={() => setVibe(v)}>{v}</button>))}
      </div></div>
      {err && <p role="alert" className="text-sm text-wine">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Save and build the bouquet"}</button>
    </form>
  );
}

function Builder({ profile, phone, onEdit }: { profile: Profile; phone: string; onEdit: () => void }) {
  const season = seasonFor();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [wrap, setWrap] = useState("blush");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [card, setCard] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const d = sessionStorage.getItem("bnd-draft");
      if (d) {
        const j = JSON.parse(d) as { stems: Stem[]; wrap: string };
        setQty(Object.fromEntries(j.stems.filter((s) => !profile.avoid_flowers.includes(s.id)).map((s) => [s.id, s.qty])));
        setWrap(j.wrap);
        sessionStorage.removeItem("bnd-draft");
      }
    } catch {}
  }, [profile.avoid_flowers]);

  const stems: Stem[] = useMemo(() => Object.entries(qty).filter(([, q]) => q > 0).map(([id, q]) => ({ id, qty: q })), [qty]);
  const count = stems.reduce((n, s) => n + s.qty, 0);
  const total = priceOf(stems, wrap, !!card.trim());
  const shown = FLOWERS.filter((f) => !profile.avoid_flowers.includes(f.id));
  const set = (id: string, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + d)) }));

  const save = async () => {
    setBusy(true); setErr("");
    try {
      const r = await api<{ bouquet: { id: string } }>("/api/bouquets", { method: "POST", body: JSON.stringify({ phone, stems, wrap, card_message: card, occasion }) });
      setSavedId(r.bouquet.id);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };

  if (savedId) return (
    <div className="card mx-auto max-w-md p-8 text-center pop">
      <BouquetSVG stems={stems} wrap={wrap} className="mx-auto h-56" />
      <h2 className="font-display mt-2 text-4xl">Saved for {profile.partner_name}.</h2>
      <p className="mt-2 text-soft">₹{total} · {count} stems. Ready to have it delivered?</p>
      <div className="mt-6 grid gap-3">
        <Link href={`/orders?b=${savedId}`} className="btn btn-primary">Order at home</Link>
        <button className="btn btn-ghost" onClick={() => { setSavedId(null); setQty({}); setCard(""); }}>Build another</button>
      </div>
      <p className="mt-4 text-xs text-soft">Next time you visit, we&apos;ll ask how she liked it.</p>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6 rise">
        <div className="flex items-end justify-between gap-4">
          <div><p className="label">Step 2 of 2 · {SEASON_LABEL[season]}</p><h1 className="font-display mt-1 text-4xl">Build for {profile.partner_name}</h1></div>
          <button onClick={onEdit} className="text-sm text-soft underline">Edit preferences</button>
        </div>
        <div><p className="label">Occasion</p><div className="mt-2 flex flex-wrap gap-2">{OCCASIONS.map((o) => <button key={o} className="chip capitalize" aria-pressed={occasion === o} onClick={() => setOccasion(o)}>{o}</button>)}</div></div>
        <div>
          <p className="label">Flowers · ₹ per stem</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {shown.map((f) => {
              const q = qty[f.id] ?? 0; const inSeason = f.seasons.includes(season); const fav = profile.favorite_flowers.includes(f.id);
              return (
                <li key={f.id} className={`card flex items-center gap-3 !rounded-2xl p-3 transition ${q ? "border-wine" : ""}`}>
                  <i className="size-9 shrink-0 rounded-full border border-black/10" style={{ background: f.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{f.name}</p>
                    <p className="text-xs text-soft">₹{f.price}{fav && " · her favourite"}{!inSeason && " · off-season"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button aria-label={`Remove one ${f.name}`} className="btn btn-ghost !size-8 !p-0" disabled={!q} onClick={() => set(f.id, -1)}>−</button>
                    <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{q}</span>
                    <button aria-label={`Add one ${f.name}`} className="btn btn-ghost !size-8 !p-0" onClick={() => set(f.id, 1)}>+</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div><p className="label">Wrapping</p><div className="mt-2 flex flex-wrap gap-2">
          {WRAPS.map((w) => <button key={w.id} className="chip flex items-center gap-2" aria-pressed={wrap === w.id} onClick={() => setWrap(w.id)}><i className="size-3 rounded-full border border-black/10" style={{ background: w.color }} />{w.name} · ₹{w.price}</button>)}
        </div></div>
        <div><label className="label" htmlFor="card">Note card (+₹{CARD_PRICE}, optional)</label>
          <textarea id="card" className="input mt-2" rows={2} maxLength={200} value={card} onChange={(e) => setCard(e.target.value)} placeholder="Write something only you would say…" /></div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden p-5">
          <div className="rounded-2xl bg-gradient-to-b from-paper2 to-card p-3"><BouquetSVG stems={stems} wrap={wrap} className="mx-auto h-72 w-full" /></div>
          <div className="mt-4 flex items-end justify-between"><div><p className="label">{count} stems</p><p className="font-display text-4xl">₹{total}</p></div><p className="text-xs text-soft">delivery ₹49 extra</p></div>
          {err && <p role="alert" className="mt-3 text-sm text-wine">{err}</p>}
          <button className="btn btn-primary mt-4 w-full" disabled={busy || count < 3} onClick={save}>{busy ? "Saving…" : count < 3 ? "Add at least 3 stems" : "Save bouquet"}</button>
        </div>
      </aside>
    </div>
  );
}

export default function BuildPage() {
  const { phone, ready } = usePhone();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!phone) return;
    setProfile(undefined); setErr("");
    api<{ profile: Profile | null }>(`/api/profile?phone=${phone}`).then((r) => setProfile(r.profile)).catch((e) => { setErr(e.message); setProfile(null); });
  }, [phone]);

  return (
    <div className="px-4 pb-16 pt-10 sm:px-6">
      {!ready ? null : !phone ? <PhoneGate /> : profile === undefined ? <p className="text-center text-soft">Loading…</p> : (
        <>
          {err && <p role="alert" className="mx-auto mb-4 max-w-2xl rounded-xl border border-wine/30 bg-rose/20 p-3 text-sm text-wine">{err}</p>}
          {profile && !editing ? <Builder profile={profile} phone={phone} onEdit={() => setEditing(true)} />
            : <ProfileForm initial={profile} phone={phone} onSaved={(p) => { setProfile(p); setEditing(false); }} />}
        </>
      )}
    </div>
  );
}
