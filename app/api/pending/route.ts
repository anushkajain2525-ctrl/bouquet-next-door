import { db, normPhone } from "@/lib/db";
import { ok, bad, fail } from "@/lib/http";
import { istNow } from "@/lib/catalog";

// Bouquets we can ask about on a return visit: not rated yet, and if ordered, the delivery date has come.
// The browser skips bouquets made during the current visit, so the question comes "next time".
export async function GET(req: Request) {
  const phone = normPhone(new URL(req.url).searchParams.get("phone"));
  if (!phone) return bad("Enter a valid 10-digit mobile number");
  try {
    const [rows, orders] = await Promise.all([
      db<{ id: string }[]>(`bnd_bouquets?phone=eq.${phone}&liked=is.null&select=*&order=created_at.desc&limit=10`),
      db<{ bouquet_id: string; delivery_date: string }[]>(`bnd_orders?phone=eq.${phone}&select=bouquet_id,delivery_date`),
    ]);
    const today = istNow().date;
    const candidates = rows.filter((r) => {
      const o = orders.find((x) => x.bouquet_id === r.id);
      return !o || o.delivery_date <= today;
    });
    return ok({ candidates });
  } catch (e) { return fail(e); }
}
