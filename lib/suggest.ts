import { FLOWERS, Season, Stem, flowerById, seasonFor } from "./catalog";

export interface Profile {
  phone: string; partner_name: string; colors: string[];
  favorite_flowers: string[]; // flower FAMILY ids, e.g. "rose"
  avoid_flowers: string[];    // flower FAMILY ids
  vibe: string;
}
export interface PastBouquet { stems: Stem[]; liked: boolean | null; wrap: string; vase?: string }
export interface Suggestion { title: string; why: string; stems: Stem[]; wrap: string; vase: string }

// Traditional/puja flowers only go in a romantic bouquet if she has said she likes them.
const ONLY_IF_FAVOURITE = ["marigold", "tuberose"];
// Small accent flowers used to fill out a bouquet, best first.
const FILLERS = ["lavender", "carnation", "gerbera", "rose-white"];

export function scoreFlowers(profile: Profile, history: PastBouquet[], season: Season) {
  const scores = new Map<string, number>();
  for (const f of FLOWERS) {
    if (profile.avoid_flowers.includes(f.family)) continue;
    if (ONLY_IF_FAVOURITE.includes(f.family) && !profile.favorite_flowers.includes(f.family)) continue;
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
  // Filler: an in-season accent she doesn't avoid (lavender is off-season most of the year).
  const filler = FILLERS.find((id) => ranked.some(([r]) => r === id) && flowerById(id)!.seasons.includes(season)) ?? "";
  // best variant per family, so we never suggest three colours of the same lily by accident
  const seen = new Set<string>();
  const top = ranked.map(([id]) => id).filter((id) => { const fam = flowerById(id)!.family; if (seen.has(fam)) return false; seen.add(fam); return true; });
  const hero = top.filter((id) => id !== filler);
  const withFiller = (ids: string[]) => (filler && !ids.includes(filler) ? [...ids, filler] : ids);

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
  // Her signature: her best-scoring flowers that are actually in season now (falls back to best overall).
  const inSeasonHero = hero.filter((id) => flowerById(id)!.seasons.includes(season));
  const sig = inSeasonHero.length >= 2 ? inSeasonHero : hero;
  if (sig.length >= 2) items.push(mk("Her signature", sig === inSeasonHero ? "Her favourites that are also in season in Delhi right now." : "Her favourites. Not all are in season, so expect a slightly higher price.", sig.slice(0, 3), "blush"));
  const lastLiked = history.find((h) => h.liked === true);
  // Repeat a hit, minus anything she has since been marked as avoiding.
  const hitStems = lastLiked?.stems.filter((st) => { const f = flowerById(st.id); return f && !profile.avoid_flowers.includes(f.family); }) ?? [];
  if (lastLiked && hitStems.length) items.push({ title: "Repeat of a hit", why: "She loved this one. A fresh version of it.", wrap: lastLiked.wrap, vase: lastLiked.vase ?? "none", stems: hitStems });
  const seasonal = hero.filter((id) => flowerById(id)!.seasons.includes(season));
  // Seasonal pick: in-season flowers that are NOT already the signature, cheapest first, so the two ideas differ.
  const used = new Set(items[0]?.stems.map((x) => x.id) ?? []);
  const alt = ranked.map(([id]) => id).filter((id) => id !== filler && !used.has(id) && flowerById(id)!.seasons.includes(season))
    .slice(0, 4).sort((a, b) => flowerById(a)!.price - flowerById(b)!.price).slice(0, 2);
  const seasonIds = alt.length ? alt : seasonal.length >= 2 ? [seasonal[0], seasonal[Math.min(2, seasonal.length - 1)]] : [];
  if (seasonIds.length) items.push(mk(`${season[0].toUpperCase()}${season.slice(1)} pick`, "Best value: freshest and most affordable this season.", withFiller(seasonIds), "kraft"));
  const known = new Set(history.flatMap((h) => h.stems.map((s) => flowerById(s.id)?.family)));
  const fresh = hero.find((id) => !known.has(flowerById(id)!.family) && flowerById(id)!.seasons.includes(season));
  if (fresh && history.length) items.push(mk("Something new", "A flower she hasn't received from you yet.", withFiller([fresh, hero[0]]), "sage", "glass"));
  // one-flower-many-colours idea, in season
  const fam = (seasonal[0] && flowerById(seasonal[0])!.family) || "";
  const variants = FLOWERS.filter((f) => f.family === fam && f.seasons.includes(season) && !profile.avoid_flowers.includes(f.family));
  if (variants.length >= 3) items.push({ title: `${fam[0].toUpperCase()}${fam.slice(1)}s in every colour`, why: "One flower, several colours. Easy to get right.", wrap: "kraft", vase: "none", stems: variants.slice(0, 4).map((f) => ({ id: f.id, qty: 3 })) });
  return { season, items: items.slice(0, 4), notes };
}
