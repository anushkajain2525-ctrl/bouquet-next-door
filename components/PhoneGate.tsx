"use client";
import { useState } from "react";
import { usePhone } from "@/lib/phone";

export default function PhoneGate({ title = "Who's planning the surprise?", note }: { title?: string; note?: string }) {
  const { setPhone } = usePhone();
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = v.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(d)) return setErr("Enter a valid 10-digit Indian mobile number");
    setPhone(d);
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md p-8 rise">
      <p className="label mb-2">Your number</p>
      <h2 className="font-display text-3xl mb-2">{title}</h2>
      <p className="text-soft text-sm mb-6">{note ?? "No password. We use your number only to remember her preferences and ask how the last bouquet went."}</p>
      <div className="flex gap-2">
        <span className="input !w-auto flex items-center text-soft">+91</span>
        <input className="input" inputMode="numeric" autoComplete="tel-national" placeholder="98xxxxxxxx" value={v}
          onChange={(e) => { setV(e.target.value); setErr(""); }} aria-label="Mobile number" aria-invalid={!!err} />
      </div>
      {err && <p role="alert" className="text-sm text-wine mt-2">{err}</p>}
      <button className="btn btn-primary w-full mt-5">Continue</button>
    </form>
  );
}
