"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, markThisVisit, usePhone } from "@/lib/phone";
import PhoneGate from "@/components/PhoneGate";
import BouquetPhoto from "@/components/BouquetPhoto";
import { CARD_PRICE, COLOR_HEX, COLOR_TAGS, FAMILIES, FLOWERS, OCCASIONS, VASES, VIBES, WRAPS, flowerImg, priceOf, seasonFor, SEASON_LABEL, vaseImg, Stem } from "@/lib/catalog";
import type { Profile } from "@/lib/suggest";
import { LoveBadge, useRatings } from "@/lib/ratings";

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Pick({ list, set, other, setOther, avoidMode }: { list: string[]; set: (v: string[]) => void; other: string[]; setOther: (v: string[]) => void; avoidMode?: boolean }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
      {FAMILIES.map((f) => {
        const on = list.includes(f.id);
        return (
          <button type="button" key={f.id} aria-pressed={on} onClick={() => { set(toggle(list, f.id)); setOther(other.filter((x) => x !== f.id)); }}
            className={`group relative aspect-square overflow-hidden rounded-2xl border text-left transition ${on ? (avoidMode ? "border-ink ring-2 ring-ink" : "border-wine ring-2 ring-wine") : "border-line hover:-translate-y-0.5"}`}>
            <Image src={flowerImg(f.rep)} alt="" fill sizes="120px" className={`object-cover transition ${on && avoidMode ? "grayscale opacity-50" : ""}`} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-1.5 pt-6 text-xs font-medium text-white">{f.name}</span>
            {on && <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-white text-[11px]" aria-hidden>{avoidMode ? "✕" : "♥"}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ProfileForm({ initial, onSaved, phone }: { initial: Profile | null; onSaved: (p: Profile) => void; phone: string }) {
  const [name, setName] = useState(initial?.partner_name && initial.partner_name !== "her" ? initial.partner_name : "");
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [fav, setFav] = useState<string[]>(initial?.favorite_flowers ?? []);
  const [avoid, setAvoid] = useState<string[]>(initial?.avoid_flowers ?? []);
  const [vibe, setVibe] = useState(initial?.vibe ?? "romantic");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api<{ profile: Profile }>("/api/profile", { method: "POST", body: JSON.stringify({ phone, partner_name: name, colors, favorite_flowers: fav, avoid_flowers: avoid, vibe }) });
      onSaved(r.profile);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="card mx-auto max-w-3xl space-y-8 p-6 sm:p-9 rise">
      <div><p className="label">Step 1 of 2</p><h1 className="font-display mt-1 text-4xl">Tell us about her</h1></div>
      <div><label className="label" htmlFor="nm">Her name (or nickname)</label><input id="nm" className="input mt-2" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aanya" /></div>
      <div><p className="label">Colours she gravitates to</p><div className="mt-2 flex flex-wrap gap-2">
        {COLOR_TAGS.map((c) => (<button type="button" key={c} className="chip flex items-center gap-2 capitalize" aria-pressed={colors.includes(c)} onClick={() => setColors(toggle(colors, c))}><i className="size-3 rounded-full border border-black/10" style={{ background: COLOR_HEX[c] }} />{c}</button>))}
      </div></div>
      <div><p className="label">Flowers she loves</p><Pick list={fav} set={setFav} other={avoid} setOther={setAvoid} /></div>
      <div><p className="label">Flowers to avoid (dislike or allergy)</p><Pick list={avoid} set={setAvoid} other={fav} setOther={setFav} avoidMode /></div>
      <div><p className="label">Her vibe</p><div className="mt-2 flex flex-wrap gap-2">
        {VIBES.map((v) => (<button type="button" key={v} className="chip capitalize" aria-pressed={vibe === v} onClick={() => setVibe(v)}>{v}</button>))}
      </div></div>
      {err && <p role="alert" className="text-sm text-wine">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Save and build the bouquet"}</button>
    </form>
  );
}

function Builder({ profile, phone, onEdit }: { profile: Profile; phone: string; onEdit: () => void }) {
  const [season] = useState(() => seasonFor());
  const [qty, setQty] = useState<Record<string, number>>({});
  const [wrap, setWrap] = useState("blush");
  const [vase, setVase] = useState("none");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [card, setCard] = useState("");
  const [family, setFamily] = useState("all");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const stats = useRatings();

  useEffect(() => {
    try {
      const d = sessionStorage.getItem("bnd-draft");
      if (d) {
        const j = JSON.parse(d) as { stems: Stem[]; wrap: string; vase?: string };
        const okIds = new Set(FLOWERS.filter((f) => !profile.avoid_flowers.includes(f.family)).map((f) => f.id));
        setQty(Object.fromEntries(j.stems.filter((s) => okIds.has(s.id)).map((s) => [s.id, s.qty])));
        if (WRAPS.some((w) => w.id === j.wrap)) setWrap(j.wrap);
        if (j.vase && VASES.some((v) => v.id === j.vase)) setVase(j.vase);
        sessionStorage.removeItem("bnd-draft");
      }
    } catch {}
  }, [profile.avoid_flowers]);

  const stems: Stem[] = useMemo(() => Object.entries(qty).filter(([, q]) => q > 0).map(([id, q]) => ({ id, qty: q })), [qty]);
  const count = stems.reduce((n, s) => n + s.qty, 0);
  const total = priceOf(stems, wrap, !!card.trim(), vase);
  const shown = FLOWERS.filter((f) => !profile.avoid_flowers.includes(f.family) && (family === "all" || f.family === family));
  const families = FAMILIES.filter((f) => !profile.avoid_flowers.includes(f.id));
  const set = (id: string, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + d)) }));

  const save = async () => {
    setBusy(true); setErr("");
    try {
      const r = await api<{ bouquet: { id: string } }>("/api/bouquets", { method: "POST", body: JSON.stringify({ phone, stems, wrap, vase, card_message: card, occasion }) });
      markThisVisit(r.bouquet.id);
      setSavedId(r.bouquet.id);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };

  if (savedId) return (
    <div className="card mx-auto max-w-sm p-6 text-center pop">
      <BouquetPhoto stems={stems} wrap={wrap} vase={vase} />
      <h2 className="font-display mt-4 text-4xl">Saved for {profile.partner_name}.</h2>
      <p className="mt-2 text-soft">₹{total} · {count} stems. Ready to have it delivered?</p>
      <div className="mt-6 grid gap-3">
        <Link href={`/orders?b=${savedId}`} className="btn btn-primary">Order at home</Link>
        <button className="btn btn-ghost" onClick={() => { setSavedId(null); setQty({}); setCard(""); setVase("none"); }}>Build another</button>
      </div>
      <p className="mt-4 text-xs text-soft">Next time you visit, we&apos;ll ask how she liked it.</p>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-8 rise">
        <div className="flex items-end justify-between gap-4">
          <div><p className="label">Step 2 of 2 · {SEASON_LABEL[season]}</p><h1 className="font-display mt-1 text-4xl">Build for {profile.partner_name}</h1></div>
          <button onClick={onEdit} className="text-sm text-soft underline">Edit preferences</button>
        </div>
        <div><p className="label">Occasion</p><div className="mt-2 flex flex-wrap gap-2">{OCCASIONS.map((o) => <button key={o} className="chip capitalize" aria-pressed={occasion === o} onClick={() => setOccasion(o)}>{o}</button>)}</div></div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label">Choose flowers · ₹ per stem</p>
            <div className="flex flex-wrap gap-1.5">
              <button className="chip !py-1 !text-xs" aria-pressed={family === "all"} onClick={() => setFamily("all")}>All</button>
              {families.map((f) => <button key={f.id} className="chip !py-1 !text-xs" aria-pressed={family === f.id} onClick={() => setFamily(f.id)}>{f.name}</button>)}
            </div>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shown.map((f) => {
              const q = qty[f.id] ?? 0; const inSeason = f.seasons.includes(season); const fav = profile.favorite_flowers.includes(f.family);
              const fam = FAMILIES.find((x) => x.id === f.family);
              return (
                <li key={f.id} className={`card overflow-hidden !rounded-2xl transition ${q ? "!border-wine ring-1 ring-wine" : ""}`}>
                  <div className="relative aspect-square">
                    <Image src={flowerImg(f.id)} alt={f.name} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover" />
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {fav && <span className="rounded-full bg-wine px-2 py-0.5 text-[10px] font-semibold text-white">her favourite</span>}
                      {fam?.premium && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-white">premium</span>}
                      {!inSeason && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-soft">off-season</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="text-sm font-semibold leading-tight">{f.name}</p><p className="whitespace-nowrap text-xs text-soft">₹{f.price} / stem</p><LoveBadge stats={stats} stems={[{ id: f.id, qty: 1 }]} className="block !text-[11px]" /></div>
                    <div className="flex items-center justify-between gap-1 sm:justify-end">
                      <button aria-label={`Remove one ${f.name}`} className="btn btn-ghost !size-8 !p-0" disabled={!q} onClick={() => set(f.id, -1)}>−</button>
                      <span className="w-5 text-center text-sm tabular-nums" aria-live="polite">{q}</span>
                      <button aria-label={`Add one ${f.name}`} className="btn btn-ghost !size-8 !p-0" onClick={() => set(f.id, 1)}>+</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div><p className="label">Vase (optional)</p>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VASES.map((v) => (
              <li key={v.id}>
                <button type="button" aria-pressed={vase === v.id} onClick={() => setVase(v.id)} className={`card w-full overflow-hidden !rounded-2xl text-left transition hover:-translate-y-0.5 ${vase === v.id ? "!border-wine ring-1 ring-wine" : ""}`}>
                  <div className="relative aspect-square bg-paper2">{v.id !== "none" ? <Image src={vaseImg(v.id)} alt={v.name} fill sizes="160px" className="object-cover" /> : <span className="absolute inset-0 grid place-items-center text-xs text-soft">hand-held</span>}</div>
                  <div className="p-2.5"><p className="text-sm font-semibold">{v.name}</p><p className="text-xs text-soft">{v.price ? `+₹${v.price}` : v.note}</p></div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div><p className="label">Wrapping</p><div className="mt-2 flex flex-wrap gap-2">
          {WRAPS.map((w) => <button key={w.id} className="chip flex items-center gap-2" aria-pressed={wrap === w.id} onClick={() => setWrap(w.id)}><i className="size-3 rounded-full border border-black/10" style={{ background: w.color }} />{w.name} · ₹{w.price}</button>)}
        </div></div>
        <div><label className="label" htmlFor="card">Note card (+₹{CARD_PRICE}, optional)</label>
          <textarea id="card" className="input mt-2" rows={2} maxLength={200} value={card} onChange={(e) => setCard(e.target.value)} placeholder="Write something only you would say…" /></div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-4">
          <BouquetPhoto stems={stems} wrap={wrap} vase={vase} />
          <div className="mt-4 flex items-end justify-between px-1"><div><p className="label">{count} stems</p><p className="font-display text-4xl">₹{total}</p></div><p className="text-xs text-soft">delivery ₹49 extra</p></div>
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
