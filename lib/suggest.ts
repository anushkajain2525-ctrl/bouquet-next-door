import { FLOWERS, Season, Stem, flowerById, seasonFor, COLOR_TAGS } from "./catalog";

export interface Profile {
  phone: string; partner_name: string; colors: string[];
  favorite_flowers: string[]; avoid_flowers: string[]; vibe: string;
}
export interface PastBouquet { stems: Stem[]; liked: boolean | null; wrap: string }
export interface Suggestion { title: string; why: string; stems: Stem[]; wrap: string }

// Score each flower from her profile + past feedback + current season.
export function scoreFlowers(profile: Profile, history: PastBouquet[], season: Season) {
  const scores = new Map<string, number>();
  for (const f of FLOWERS) {
    if (profile.avoid_flowers.includes(f.id)) continue;
    let s = 0;
    if (f.seasons.includes(season)) s += 3; else s -= 2; // in season = fresher and cheaper
    if (profile.favorite_flowers.includes(f.id)) s += 4;
    if (profile.colors.includes(f.colorTag)) s += 2;
    scores.set(f.id, s);
  }
  for (const b of history) {
    if (b.liked === null) continue;
    for (const st of b.stems) {
      if (!scores.has(st.id)) continue;
      scores.set(st.id, scores.get(st.id)! + (b.liked ? 2 : -3));
    }
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}

export function suggest(profile: Profile, history: PastBouquet[], now = new Date()): { season: Season; items: Suggestion[]; notes: string[] } {
  const season = seasonFor(now);
  const ranked = scoreFlowers(profile, history, season);
  const filler = "lavender-filler";
  const top = ranked.filter(([id]) => id !== filler).map(([id]) => id);
  const notes: string[] = [];
  const liked = history.filter((h) => h.liked === true).length;
  const disliked = history.filter((h) => h.liked === false).length;
  if (liked) notes.push(`She liked ${liked} earlier bouquet${liked > 1 ? "s" : ""}, so we leaned on those flowers.`);
  if (disliked) notes.push(`${disliked} bouquet${disliked > 1 ? "s" : ""} missed, so we pushed those blooms down.`);
  if (!history.length) notes.push("No feedback yet. These come from her profile and the season.");

  const lastLiked = history.find((h) => h.liked === true);
  const mk = (title: string, why: string, ids: string[], wrap: string): Suggestion => ({
    title, why, wrap,
    stems: ids.map((id, i) => ({ id, qty: i === 0 ? 6 : i === 1 ? 4 : 3 })),
  });
  const items: Suggestion[] = [];
  const t3 = top.slice(0, 3);
  if (t3.length) items.push(mk("Her signature", "Her favourites that are also in season in Delhi right now.", [...t3.slice(0, 2), filler], "blush"));
  if (lastLiked) items.push({ title: "Repeat of a hit", why: "She loved this one. A fresh version of it.", wrap: lastLiked.wrap, stems: lastLiked.stems });
  const seasonal = ranked.filter(([id]) => id !== filler && flowerById(id)?.seasons.includes(season)).map(([id]) => id);
  if (seasonal.length >= 2) items.push(mk(`${season[0].toUpperCase()}${season.slice(1)} pick`, "Best value: freshest and most affordable this season.", [seasonal[0], seasonal[Math.min(2, seasonal.length - 1)], filler], "kraft"));
  const known = new Set(history.flatMap((h) => h.stems.map((s) => s.id)));
  const fresh = top.find((id) => !known.has(id) && flowerById(id)?.seasons.includes(season));
  if (fresh && history.length) items.push(mk("Something new", "A flower she hasn't received from you yet.", [fresh, top[0], filler], "sage"));
  void COLOR_TAGS;
  return { season, items: items.slice(0, 4), notes };
}
