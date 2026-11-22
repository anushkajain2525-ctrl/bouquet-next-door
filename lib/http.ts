import { DbError } from "./db";
export const ok = (data: unknown, status = 200) => Response.json(data, { status });
export const bad = (msg: string, status = 400) => Response.json({ error: msg }, { status });
export function fail(e: unknown) {
  if (e instanceof DbError) return bad(e.message, 503);
  console.error(e);
  return bad("Something went wrong. Please try again.", 500);
}
export async function body(req: Request): Promise<Record<string, unknown> | null> {
  try { const j = await req.json(); return j && typeof j === "object" ? j : null; } catch { return null; }
}
