import { db, normPhone } from "@/lib/db";
import { ok, bad, fail, body } from "@/lib/http";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: Request) {
  const b = await body(req);
  const phone = normPhone(b?.phone);
  if (!b || !phone) return bad("Enter a valid 10-digit mobile number");
  if (typeof b.id !== "string" || !UUID.test(b.id)) return bad("Unknown bouquet");
  if (typeof b.liked !== "boolean") return bad("Tell us if she liked it");
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 300) : null;
  try {
    const rows = await db<unknown[]>(`bnd_bouquets?id=eq.${b.id}&phone=eq.${phone}`, {
      method: "PATCH",
      body: JSON.stringify({ liked: b.liked, feedback_note: note, feedback_at: new Date().toISOString() }),
    });
    if (!rows.length) return bad("Bouquet not found", 404);
    return ok({ ok: true });
  } catch (e) { return fail(e); }
}
