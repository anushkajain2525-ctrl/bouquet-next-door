import { db, normPhone } from "@/lib/db";
import { ok, bad, fail } from "@/lib/http";

// The bouquet we should ask about on return: most recent one she hasn't been rated on.
// Only counts bouquets that were ordered (given), or saved more than 1 hour ago.
export async function GET(req: Request) {
  const phone = normPhone(new URL(req.url).searchParams.get("phone"));
  if (!phone) return bad("Enter a valid 10-digit mobile number");
  try {
    const rows = await db<{ id: string; status: string; created_at: string }[]>(
      `bnd_bouquets?phone=eq.${phone}&liked=is.null&select=*&order=created_at.desc&limit=5`,
    );
    const hourAgo = Date.now() - 3600_000;
    const pending = rows.find((r) => r.status === "ordered" || new Date(r.created_at).getTime() < hourAgo) ?? null;
    return ok({ pending });
  } catch (e) { return fail(e); }
}
