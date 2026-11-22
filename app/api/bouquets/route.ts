import { db, normPhone } from "@/lib/db";
import { ok, bad, fail, body } from "@/lib/http";
import { OCCASIONS, VASES, WRAPS, flowerById, priceOf, seasonFor, Stem } from "@/lib/catalog";

export async function GET(req: Request) {
  const phone = normPhone(new URL(req.url).searchParams.get("phone"));
  if (!phone) return bad("Enter a valid 10-digit mobile number");
  try {
    const rows = await db(`bnd_bouquets?phone=eq.${phone}&select=*&order=created_at.desc&limit=30`);
    return ok({ bouquets: rows });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  const b = await body(req);
  const phone = normPhone(b?.phone);
  if (!b || !phone) return bad("Enter a valid 10-digit mobile number");
  const stems: Stem[] = Array.isArray(b.stems)
    ? b.stems
        .filter((s): s is Stem => !!s && typeof s.id === "string" && Number.isInteger(s.qty) && s.qty > 0 && s.qty <= 30 && !!flowerById(s.id))
        .slice(0, 12)
    : [];
  const count = stems.reduce((n, s) => n + s.qty, 0);
  if (count < 3) return bad("Add at least 3 stems to make a bouquet");
  if (count > 60) return bad("That's a lot of flowers! Keep it under 60 stems");
  const wrap = typeof b.wrap === "string" && WRAPS.some((w) => w.id === b.wrap) ? b.wrap : "kraft";
  const vase = typeof b.vase === "string" && VASES.some((v) => v.id === b.vase) ? b.vase : "none";
  const card = typeof b.card_message === "string" ? b.card_message.trim().slice(0, 200) : "";
  const occasion = typeof b.occasion === "string" && OCCASIONS.includes(b.occasion) ? b.occasion : "just because";
  try {
    const profile = await db<unknown[]>(`bnd_profiles?phone=eq.${phone}&select=phone`);
    if (!profile.length) return bad("Save her preferences first", 409);
    const rows = await db<unknown[]>("bnd_bouquets", {
      method: "POST",
      body: JSON.stringify({ phone, occasion, stems, wrap, vase, card_message: card, total_inr: priceOf(stems, wrap, !!card, vase), season: seasonFor() }),
    });
    return ok({ bouquet: rows[0] }, 201);
  } catch (e) { return fail(e); }
}
