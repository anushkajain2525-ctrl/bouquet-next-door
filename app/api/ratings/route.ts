import { connection } from "next/server";
import { db } from "@/lib/db";
import { fail } from "@/lib/http";
import type { Stem } from "@/lib/catalog";

// Real reactions only: for each flower, how many rated bouquets contained it and how many of those she loved.
// Returns counts, never phone numbers or any personal data.
export async function GET() {
  await connection();
  try {
    const rows = await db<{ stems: Stem[]; liked: boolean }[]>("bnd_bouquets?liked=not.is.null&select=stems,liked&limit=2000");
    const stats: Record<string, { loved: number; rated: number }> = {};
    for (const r of rows) {
      for (const id of new Set(r.stems.map((s) => s.id))) {
        const s = (stats[id] ??= { loved: 0, rated: 0 });
        s.rated += 1;
        if (r.liked) s.loved += 1;
      }
    }
    return Response.json({ stats }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
  } catch (e) { return fail(e); }
}
