import { db, normPhone } from "@/lib/db";
import { ok, bad, fail, body } from "@/lib/http";
import { COLOR_TAGS, FLOWERS, VIBES } from "@/lib/catalog";

const ids = new Set(FLOWERS.map((f) => f.id));
const pick = (v: unknown, allowed: (x: string) => boolean) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && allowed(x)).slice(0, 20) : [];

export async function GET(req: Request) {
  const phone = normPhone(new URL(req.url).searchParams.get("phone"));
  if (!phone) return bad("Enter a valid 10-digit mobile number");
  try {
    const rows = await db<unknown[]>(`bnd_profiles?phone=eq.${phone}&select=*`);
    return ok({ profile: rows[0] ?? null });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  const b = await body(req);
  const phone = normPhone(b?.phone);
  if (!b || !phone) return bad("Enter a valid 10-digit mobile number");
  const name = typeof b.partner_name === "string" ? b.partner_name.trim().slice(0, 40) : "";
  const row = {
    phone,
    partner_name: name || "her",
    colors: pick(b.colors, (x) => COLOR_TAGS.includes(x)),
    favorite_flowers: pick(b.favorite_flowers, (x) => ids.has(x)),
    avoid_flowers: pick(b.avoid_flowers, (x) => ids.has(x)),
    vibe: typeof b.vibe === "string" && VIBES.includes(b.vibe) ? b.vibe : "romantic",
    updated_at: new Date().toISOString(),
  };
  try {
    const rows = await db<unknown[]>("bnd_profiles?on_conflict=phone", {
      method: "POST", body: JSON.stringify(row), prefer: "resolution=merge-duplicates,return=representation",
    });
    return ok({ profile: rows[0] });
  } catch (e) { return fail(e); }
}
