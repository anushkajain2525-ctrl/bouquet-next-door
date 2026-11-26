"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, markThisVisit, usePhone } from "@/lib/phone";
import PhoneGate from "@/components/PhoneGate";
import BouquetPhoto from "@/components/BouquetPhoto";
import { DELIVERY_FEE, SLOTS, flowerById, istNow, slotOpen, PREP_HOURS, Stem } from "@/lib/catalog";

interface Bq { vase?: string; id: string; occasion: string; stems: Stem[]; wrap: string; card_message: string; total_inr: number; status: string; liked: boolean | null; created_at: string }
interface Ord { id: string; bouquet_id: string; address: string; delivery_date: string; slot: string; total_inr: number; status: string }

const firstOpen = (date: string) => SLOTS.find((s) => slotOpen(date, s)) ?? "";
function defaultDate() {
  const today = istNow().date;
  return firstOpen(today) ? today : istNow(new Date(Date.now() + 86400_000)).date;
}

function OrderForm({ bq, phone, onDone }: { bq: Bq; phone: string; onDone: () => void }) {
  const [address, setAddress] = useState(""); const [pincode, setPincode] = useState("");
  const [date, setDateRaw] = useState(defaultDate); const [slot, setSlot] = useState(() => firstOpen(defaultDate()));
  const setDate = (d: string) => { setDateRaw(d); if (!slotOpen(d, slot)) setSlot(firstOpen(d)); };
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [done, setDone] = useState(false);
  const [min] = useState(() => defaultDate());
  const [max] = useState(() => istNow(new Date(Date.now() + 30 * 864e5)).date);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    if (!slot) { setBusy(false); return setErr("No slots left for that day. Pick another date"); }
    try { await api("/api/orders", { method: "POST", body: JSON.stringify({ phone, bouquet_id: bq.id, address, pincode, delivery_date: date, slot }) }); markThisVisit(bq.id); setDone(true); onDone(); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  if (done) return (
    <div className="card p-8 text-center pop"><h2 className="font-display text-4xl">Order request received.</h2>
      <p className="mt-2 text-soft">We&apos;ll confirm by call on +91 {phone} before delivery. Pay on delivery for now.</p></div>
  );
  return (
    <form onSubmit={submit} className="card space-y-4 p-6 rise">
      <h2 className="font-display text-3xl">Deliver this bouquet</h2>
      <div><label className="label" htmlFor="ad">Address</label><textarea id="ad" className="input mt-2" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, building, area, city" /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label" htmlFor="pc">Pincode</label><input id="pc" className="input mt-2" inputMode="numeric" maxLength={6} required value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="110001" /></div>
        <div><label className="label" htmlFor="dt">Date</label><input id="dt" type="date" className="input mt-2" min={min} max={max} required value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="label" htmlFor="sl">Slot</label><select id="sl" className="input mt-2" value={slot} onChange={(e) => setSlot(e.target.value)}>{SLOTS.map((s) => { const open = slotOpen(date, s); return <option key={s} value={s} disabled={!open}>{s}{open ? "" : " (closed)"}</option>; })}</select></div>
      </div>
      <p className="text-xs text-soft">Same-day delivery needs {PREP_HOURS} hours to arrange fresh. Midnight surprises: order by 8 pm.</p>
      <p className="text-sm text-soft">Bouquet ₹{bq.total_inr} + delivery ₹{DELIVERY_FEE} = <b className="text-ink">₹{bq.total_inr + DELIVERY_FEE}</b></p>
      {err && <p role="alert" className="text-sm text-wine">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Placing…" : "Request delivery"}</button>
    </form>
  );
}

function Inner() {
  const { phone, ready } = usePhone();
  const sel = useSearchParams().get("b");
  const [bqs, setBqs] = useState<Bq[] | null>(null);
  const [ords, setOrds] = useState<Ord[]>([]);
  const [pick, setPick] = useState<string | null>(sel);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    if (!phone) return;
    Promise.all([api<{ bouquets: Bq[] }>(`/api/bouquets?phone=${phone}`), api<{ orders: Ord[] }>(`/api/orders?phone=${phone}`)])
      .then(([b, o]) => { setBqs(b.bouquets); setOrds(o.orders); }).catch((e) => setErr(e.message));
  }, [phone]);
  useEffect(load, [load]);

  if (!ready) return null;
  if (!phone) return <div className="px-4 pt-10"><PhoneGate title="See your bouquets" /></div>;
  if (err) return <p role="alert" className="mt-10 text-center text-wine">{err}</p>;
  if (!bqs) return <p className="pt-10 text-center text-soft">Loading…</p>;
  const chosen = bqs.find((b) => b.id === pick);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-12">
      <h1 className="font-display text-5xl">My bouquets</h1>
      {chosen && <div className="mt-6 grid gap-5 md:grid-cols-[1fr_1.3fr]">
        <div className="card p-4"><BouquetPhoto stems={chosen.stems} wrap={chosen.wrap} vase={chosen.vase} /></div>
        <OrderForm bq={chosen} phone={phone} onDone={load} />
      </div>}
      {!bqs.length && <div className="card mt-8 p-10 text-center"><p className="text-soft">No bouquets yet.</p><Link href="/build" className="btn btn-primary mt-4">Build your first</Link></div>}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bqs.map((b) => {
          const o = ords.find((x) => x.bouquet_id === b.id);
          return (
            <li key={b.id} className="card p-4">
              <BouquetPhoto stems={b.stems} wrap={b.wrap} vase={b.vase} className="!aspect-[16/11]" />
              <p className="mt-2 text-sm font-semibold capitalize">{b.occasion} · ₹{b.total_inr}</p>
              <p className="text-xs text-soft">{b.stems.map((s) => `${s.qty}× ${flowerById(s.id)?.name}`).join(", ")}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-paper2 px-2 py-1">{b.liked === true ? "She loved it" : b.liked === false ? "Didn't land" : "Awaiting feedback"}</span>
                {o ? <span className="rounded-full bg-sage/20 px-2 py-1 text-sage">{o.status} · {o.delivery_date}, {o.slot}</span>
                  : <button className="btn btn-ghost !px-3 !py-1 text-xs" onClick={() => setPick(b.id)}>Order at home</button>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Orders() { return <Suspense fallback={null}><Inner /></Suspense>; }
