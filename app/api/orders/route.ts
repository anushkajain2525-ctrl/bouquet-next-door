import { db, normPhone } from "@/lib/db";
import { ok, bad, fail, body } from "@/lib/http";
import { SLOTS, DELIVERY_FEE } from "@/lib/catalog";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: Request) {
  const phone = normPhone(new URL(req.url).searchParams.get("phone"));
  if (!phone) return bad("Enter a valid 10-digit mobile number");
  try {
    return ok({ orders: await db(`bnd_orders?phone=eq.${phone}&select=*&order=created_at.desc&limit=20`) });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  const b = await body(req);
  const phone = normPhone(b?.phone);
  if (!b || !phone) return bad("Enter a valid 10-digit mobile number");
  if (typeof b.bouquet_id !== "string" || !UUID.test(b.bouquet_id)) return bad("Unknown bouquet");
  const address = typeof b.address === "string" ? b.address.trim().slice(0, 300) : "";
  const pincode = typeof b.pincode === "string" ? b.pincode.trim() : "";
  const slot = typeof b.slot === "string" && SLOTS.includes(b.slot) ? b.slot : "";
  const date = typeof b.delivery_date === "string" ? b.delivery_date : "";
  if (address.length < 10) return bad("Please enter a full delivery address");
  if (!/^(110|121|122|201|124)\d{3}$/.test(pincode)) return bad("We're live only in Delhi NCR. Check the pincode");
  if (!slot) return bad("Pick a delivery slot");
  const d = new Date(date + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (isNaN(+d) || d < today || +d > +today + 30 * 86400_000) return bad("Pick a delivery date within the next 30 days");
  try {
    const bq = await db<{ total_inr: number }[]>(`bnd_bouquets?id=eq.${b.bouquet_id}&phone=eq.${phone}&select=total_inr`);
    if (!bq.length) return bad("Bouquet not found", 404);
    const rows = await db<unknown[]>("bnd_orders", {
      method: "POST",
      body: JSON.stringify({ bouquet_id: b.bouquet_id, phone, address, pincode, delivery_date: date, slot, total_inr: bq[0].total_inr + DELIVERY_FEE }),
    });
    await db(`bnd_bouquets?id=eq.${b.bouquet_id}`, { method: "PATCH", body: JSON.stringify({ status: "ordered" }) });
    return ok({ order: rows[0] }, 201);
  } catch (e) { return fail(e); }
}
