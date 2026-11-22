"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Ctx { phone: string | null; ready: boolean; setPhone: (p: string | null) => void }
const PhoneCtx = createContext<Ctx>({ phone: null, ready: false, setPhone: () => {} });
const KEY = "bnd-phone";

export function PhoneProvider({ children }: { children: React.ReactNode }) {
  const [phone, setP] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setP(localStorage.getItem(KEY)); } catch {}
    setReady(true);
  }, []);
  const setPhone = useCallback((p: string | null) => {
    setP(p);
    try { if (p) localStorage.setItem(KEY, p); else localStorage.removeItem(KEY); } catch {}
  }, []);
  return <PhoneCtx.Provider value={{ phone, ready, setPhone }}>{children}</PhoneCtx.Provider>;
}
export const usePhone = () => useContext(PhoneCtx);

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data as T;
}
