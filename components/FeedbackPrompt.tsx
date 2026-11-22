"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, usePhone } from "@/lib/phone";
import { flowerById, Stem } from "@/lib/catalog";
import BouquetPhoto from "./BouquetPhoto";

interface Pending { id: string; occasion: string; stems: Stem[]; wrap: string; vase?: string; created_at: string }

export default function FeedbackPrompt() {
  const { phone } = usePhone();
  const [p, setP] = useState<Pending | null>(null);
  const [step, setStep] = useState<"ask" | "note" | "done">("ask");
  const [liked, setLiked] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!phone) { setP(null); return; }
    let off = false;
    api<{ pending: Pending | null }>(`/api/pending?phone=${phone}`).then((r) => { if (!off) { setP(r.pending); setStep("ask"); } }).catch(() => {});
    return () => { off = true; };
  }, [phone]);

  if (!p || !phone) return null;
  const names = p.stems.map((s) => flowerById(s.id)?.name).filter(Boolean).slice(0, 3).join(", ");

  const send = async (l: boolean, n: string) => {
    setBusy(true); setErr("");
    try { await api("/api/feedback", { method: "POST", body: JSON.stringify({ phone, id: p.id, liked: l, note: n }) }); setLiked(l); setStep("done"); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Bouquet feedback" className="fixed inset-0 z-50 grid place-items-center bg-winedeep/50 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md overflow-hidden p-6 pop">
        <BouquetPhoto stems={p.stems} wrap={p.wrap} vase={p.vase} className="mx-auto !aspect-[16/10] max-w-xs" />
        {step === "ask" && (<>
          <p className="label text-center mt-2">Last time · {p.occasion}</p>
          <h2 className="font-display text-3xl text-center mt-1">Did she like the bouquet?</h2>
          <p className="text-sm text-soft text-center mt-1">{names}{p.stems.length > 3 ? " …" : ""}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="btn btn-primary" disabled={busy} onClick={() => { setLiked(true); setStep("note"); }}>She loved it</button>
            <button className="btn btn-ghost" disabled={busy} onClick={() => { setLiked(false); setStep("note"); }}>Not really</button>
          </div>
          <button className="mt-4 w-full text-xs text-soft underline" onClick={() => setP(null)}>Ask me later</button>
        </>)}
        {step === "note" && (<>
          <h2 className="font-display text-2xl text-center mt-2">{liked ? "Lovely! Anything she especially liked?" : "Thanks for being honest. What missed?"}</h2>
          <textarea className="input mt-4" rows={3} maxLength={300} placeholder="Optional: colour too loud, smell, size…" value={note} onChange={(e) => setNote(e.target.value)} />
          {err && <p role="alert" className="text-sm text-wine mt-2">{err}</p>}
          <button className="btn btn-primary w-full mt-4" disabled={busy} onClick={() => send(liked!, note)}>{busy ? "Saving…" : "Save feedback"}</button>
        </>)}
        {step === "done" && (<>
          <h2 className="font-display text-3xl text-center mt-2">Noted.</h2>
          <p className="text-center text-soft text-sm mt-1">We&apos;ll tune this season&apos;s suggestions to her taste.</p>
          <div className="mt-5 grid gap-3">
            <Link href="/suggestions" onClick={() => setP(null)} className="btn btn-primary">See new suggestions</Link>
            <button className="btn btn-ghost" onClick={() => setP(null)}>Close</button>
          </div>
        </>)}
      </div>
    </div>
  );
}
