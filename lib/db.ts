// Minimal server-only PostgREST client. Uses the service role key, so never import in client code.
const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export class DbError extends Error {}

export async function db<T = unknown>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  if (!URL_ || !KEY) throw new DbError("Database is not configured");
  const { prefer, ...rest } = init;
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer ?? "return=representation",
      ...(rest.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new DbError(res.status === 404 || body.includes("PGRST205") ? "Database tables missing. Run supabase/schema.sql" : `Database error (${res.status})`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export function normPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const d = raw.replace(/\D/g, "");
  const n = d.length === 12 && d.startsWith("91") ? d.slice(2) : d;
  return /^[6-9]\d{9}$/.test(n) ? n : null;
}
