import { FLOWERS, Season, Stem, flowerById, seasonFor } from "./catalog";

export interface Profile {
  phone: string; partner_name: string; colors: string[];
  favorite_flowers: string[]; // flower FAMILY ids, e.g. "rose"
  avoid_flowers: string[];    // flower FAMILY ids
  vibe: string;
}
export interface PastBouquet { stems: Stem[]; liked: boolean | null; wrap: string; vase?: string }
export interface Suggestion { title: string; why: string; stems: Stem[]; wrap: string; vase: string }

export function scoreFlowers(profile: Profile, history: PastBouquet[], season: Season) {
  const scores = new Map<string, number>();
  for (const f of FLOWERS) {
    if (profile.avoid_flowers.includes(f.family)) continue;
    let s = f.seasons.includes(season) ? 3 : -2; // in season = fresher and cheaper
    if (profile.favorite_flowers.includes(f.family)) s += 4;
    if (profile.colors.includes(f.colorTag)) s += 2;
    scores.set(f.id, s);
  }
  for (const b of history) {
    if (b.liked === null) continue;
    for (const st of b.stems) if (scores.has(st.id)) scores.set(st.id, scores.get(st.id)! + (b.liked ? 2 : -3));
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}

export function suggest(profile: Profile, history: PastBouquet[], now = new Date()): { season: Season; items: Suggestion[]; notes: string[] } {
  const season = seasonFor(now);
  const ranked = scoreFlowers(profile, history, season);
  const filler = "lavender";
  // best variant per family, so we never suggest three colours of the same lily by accident
  const seen = new Set<string>();
  const top = ranked.map(([id]) => id).filter((id) => { const fam = flowerById(id)!.family; if (seen.has(fam)) return false; seen.add(fam); return true; });
  const hero = top.filter((id) => id !== filler);

  const notes: string[] = [];
  const liked = history.filter((h) => h.liked === true).length;
  const disliked = history.filter((h) => h.liked === false).length;
  if (liked) notes.push(`She liked ${liked} earlier bouquet${liked > 1 ? "s" : ""}, so we leaned on those flowers.`);
  if (disliked) notes.push(`${disliked} bouquet${disliked > 1 ? "s" : ""} missed, so we pushed those blooms down.`);
  if (!history.length) notes.push("No feedback yet. These come from her profile and the season.");

  const mk = (title: string, why: string, ids: string[], wrap: string, vase = "none"): Suggestion => ({
    title, why, wrap, vase, stems: ids.map((id, i) => ({ id, qty: i === 0 ? 6 : i === 1 ? 4 : 3 })),
  });
  const items: Suggestion[] = [];
  if (hero.length >= 2) items.push(mk("Her signature", "Her favourites that are also in season in Delhi right now.", [hero[0], hero[1], ...(hero[2] ? [hero[2]] : [])], "blush"));
  const lastLiked = history.find((h) => h.liked === true);
  if (lastLiked) items.push({ title: "Repeat of a hit", why: "She loved this one. A fresh version of it.", wrap: lastLiked.wrap, vase: lastLiked.vase ?? "none", stems: lastLiked.stems });
  const seasonal = hero.filter((id) => flowerById(id)!.seasons.includes(season));
  if (seasonal.length >= 2) items.push(mk(`${season[0].toUpperCase()}${season.slice(1)} pick`, "Best value: freshest and most affordable this season.", [seasonal[0], seasonal[Math.min(2, seasonal.length - 1)], filler], "kraft"));
  const known = new Set(history.flatMap((h) => h.stems.map((s) => flowerById(s.id)?.family)));
  const fresh = hero.find((id) => !known.has(flowerById(id)!.family) && flowerById(id)!.seasons.includes(season));
  if (fresh && history.length) items.push(mk("Something new", "A flower she hasn't received from you yet.", [fresh, hero[0], filler], "sage", "glass"));
  // one-flower-many-colours idea, in season
  const fam = (seasonal[0] && flowerById(seasonal[0])!.family) || "";
  const variants = FLOWERS.filter((f) => f.family === fam && f.seasons.includes(season) && !profile.avoid_flowers.includes(f.family));
  if (variants.length >= 3) items.push({ title: `${fam[0].toUpperCase()}${fam.slice(1)}s in every colour`, why: "One flower, several colours. Easy to get right.", wrap: "kraft", vase: "none", stems: variants.slice(0, 4).map((f) => ({ id: f.id, qty: 3 })) });
  return { season, items: items.slice(0, 4), notes };
}
