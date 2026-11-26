export type Season = "winter" | "spring" | "summer" | "monsoon" | "autumn";
const ALL: Season[] = ["winter", "spring", "summer", "monsoon", "autumn"];

export interface Family { id: string; name: string; rep: string; premium?: boolean }
export const FAMILIES: Family[] = [
  { id: "rose", name: "Rose", rep: "rose-pink" },
  { id: "orchid", name: "Orchid", rep: "orchid", premium: true },
  { id: "lily", name: "Lily", rep: "lily-pink" },
  { id: "tulip", name: "Tulip", rep: "tulip-pink", premium: true },
  { id: "peony", name: "Peony", rep: "peony", premium: true },
  { id: "hydrangea", name: "Hydrangea", rep: "hydrangea", premium: true },
  { id: "gerbera", name: "Gerbera", rep: "gerbera" },
  { id: "carnation", name: "Carnation", rep: "carnation" },
  { id: "sunflower", name: "Sunflower", rep: "sunflower" },
  { id: "marigold", name: "Marigold", rep: "marigold" },
  { id: "tuberose", name: "Tuberose", rep: "tuberose" },
  { id: "lavender", name: "Lavender", rep: "lavender" },
];

export interface Flower {
  id: string; family: string; name: string;
  price: number; // nominal retail INR per stem
  color: string; colorTag: string; seasons: Season[];
}

// Prices are nominal prototype retail prices (INR per stem). Premium families are mostly imported/greenhouse in Delhi NCR.
export const FLOWERS: Flower[] = [
  { id: "rose-red", family: "rose", name: "Red Rose", price: 25, color: "#b3122a", colorTag: "red", seasons: ["winter", "spring", "summer", "autumn"] },
  { id: "rose-pink", family: "rose", name: "Pink Rose", price: 25, color: "#f0879a", colorTag: "pink", seasons: ["winter", "spring", "autumn"] },
  { id: "rose-white", family: "rose", name: "White Rose", price: 25, color: "#f5efe4", colorTag: "white", seasons: ["winter", "spring"] },
  { id: "orchid", family: "orchid", name: "Phalaenopsis Orchid", price: 120, color: "#f3dbe6", colorTag: "pink", seasons: ALL },
  { id: "lily-white", family: "lily", name: "White Lily", price: 45, color: "#fbf8f1", colorTag: "white", seasons: ["spring", "summer", "monsoon"] },
  { id: "lily-pink", family: "lily", name: "Pink Lily", price: 45, color: "#ee8fb0", colorTag: "pink", seasons: ["spring", "summer", "monsoon"] },
  { id: "lily-orange", family: "lily", name: "Orange Lily", price: 45, color: "#f28a30", colorTag: "orange", seasons: ["spring", "summer", "monsoon"] },
  { id: "lily-yellow", family: "lily", name: "Yellow Lily", price: 45, color: "#f6cf3c", colorTag: "yellow", seasons: ["spring", "summer", "monsoon"] },
  { id: "tulip-red", family: "tulip", name: "Red Tulip", price: 60, color: "#d1242f", colorTag: "red", seasons: ["winter", "spring"] },
  { id: "tulip-pink", family: "tulip", name: "Pink Tulip", price: 60, color: "#f299b5", colorTag: "pink", seasons: ["winter", "spring"] },
  { id: "tulip-yellow", family: "tulip", name: "Yellow Tulip", price: 60, color: "#f7d23e", colorTag: "yellow", seasons: ["winter", "spring"] },
  { id: "tulip-white", family: "tulip", name: "White Tulip", price: 60, color: "#f7f3ea", colorTag: "white", seasons: ["winter", "spring"] },
  { id: "peony", family: "peony", name: "Blush Peony", price: 150, color: "#f4b6c4", colorTag: "pink", seasons: ["spring"] },
  { id: "hydrangea", family: "hydrangea", name: "Hydrangea", price: 90, color: "#a9b4e8", colorTag: "purple", seasons: ["summer", "monsoon"] },
  { id: "gerbera", family: "gerbera", name: "Gerbera Daisy", price: 20, color: "#f56a79", colorTag: "pink", seasons: ["winter", "spring", "summer", "monsoon"] },
  { id: "carnation", family: "carnation", name: "Carnation", price: 18, color: "#e46a9a", colorTag: "pink", seasons: ["winter", "spring", "autumn"] },
  { id: "sunflower", family: "sunflower", name: "Sunflower", price: 30, color: "#f8c81c", colorTag: "yellow", seasons: ["spring", "summer", "monsoon"] },
  { id: "marigold", family: "marigold", name: "Marigold (Genda)", price: 8, color: "#f59a0c", colorTag: "orange", seasons: ["winter", "spring", "summer", "autumn"] },
  { id: "tuberose", family: "tuberose", name: "Tuberose (Rajnigandha)", price: 12, color: "#fffaf0", colorTag: "white", seasons: ["summer", "monsoon", "autumn"] },
  { id: "lavender", family: "lavender", name: "Lavender", price: 15, color: "#9c86d6", colorTag: "purple", seasons: ["winter", "spring"] },
];

export interface Wrap { id: string; name: string; price: number; color: string }
export const WRAPS: Wrap[] = [
  { id: "kraft", name: "Kraft paper", price: 30, color: "#c9a77c" },
  { id: "blush", name: "Blush tissue", price: 40, color: "#f4c4cd" },
  { id: "ivory", name: "Ivory silk", price: 60, color: "#f3ead8" },
  { id: "sage", name: "Sage green", price: 40, color: "#a8b99a" },
];

export interface Vase { id: string; name: string; price: number; note: string }
export const VASES: Vase[] = [
  { id: "none", name: "No vase", price: 0, note: "Just the bouquet" },
  { id: "glass", name: "Glass cylinder", price: 150, note: "Clear, classic" },
  { id: "ceramic", name: "Matte ceramic", price: 250, note: "Soft white, round" },
  { id: "bud", name: "Bud vase trio", price: 200, note: "Three small glass vases" },
];

export const CARD_PRICE = 10;
export const OCCASIONS = ["just because", "anniversary", "birthday", "apology", "date night", "Valentine's"];
export const VIBES = ["romantic", "cheerful", "elegant", "rustic", "bold"];
export const COLOR_TAGS = ["red", "pink", "white", "yellow", "orange", "purple"];
export const COLOR_HEX: Record<string, string> = {
  red: "#c1121f", pink: "#f06292", white: "#f1ebe0", yellow: "#facc15", orange: "#fb923c", purple: "#a78bfa",
};

export const SEASON_LABEL: Record<Season, string> = {
  winter: "Winter (Dec–Feb)", spring: "Spring (Mar)", summer: "Summer (Apr–Jun)",
  monsoon: "Monsoon (Jul–Sep)", autumn: "Autumn (Oct–Nov)",
};

// Delhi NCR season by month (0 = Jan).
export function seasonFor(date = new Date()): Season {
  const m = date.getMonth();
  if (m === 11 || m === 0 || m === 1) return "winter";
  if (m === 2) return "spring";
  if (m >= 3 && m <= 5) return "summer";
  if (m >= 6 && m <= 8) return "monsoon";
  return "autumn";
}

export const flowerById = (id: string) => FLOWERS.find((f) => f.id === id);
export const familyById = (id: string) => FAMILIES.find((f) => f.id === id);
export const wrapById = (id: string) => WRAPS.find((w) => w.id === id);
export const vaseById = (id: string) => VASES.find((v) => v.id === id);
export const flowerImg = (id: string) => `/img/flowers/${id}.jpg`;
export const vaseImg = (id: string) => `/img/vases/${id}.jpg`;

export interface Stem { id: string; qty: number }

export function priceOf(stems: Stem[], wrapId: string, hasCard: boolean, vaseId = "none"): number {
  const s = stems.reduce((sum, x) => sum + (flowerById(x.id)?.price ?? 0) * x.qty, 0);
  return s + (wrapById(wrapId)?.price ?? 0) + (hasCard ? CARD_PRICE : 0) + (vaseById(vaseId)?.price ?? 0);
}

export const SLOTS = ["10am – 1pm", "1pm – 4pm", "4pm – 7pm", "7pm – 9pm", "11pm – 12am (midnight)"];
// Hour (IST, 24h) each slot starts. Florists need PREP_HOURS between order and slot start.
export const SLOT_START: Record<string, number> = { "10am – 1pm": 10, "1pm – 4pm": 13, "4pm – 7pm": 16, "7pm – 9pm": 19, "11pm – 12am (midnight)": 23 };
export const PREP_HOURS = 3;
export const DELIVERY_FEE = 49;

// Current date (YYYY-MM-DD) and hour in India, regardless of server or browser timezone.
export function istNow(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600_000);
  return { date: ist.toISOString().slice(0, 10), hour: ist.getUTCHours() + ist.getUTCMinutes() / 60 };
}

// A slot is bookable if it is on a future day, or today with enough prep time left.
export function slotOpen(date: string, slot: string, now = new Date()) {
  const { date: today, hour } = istNow(now);
  if (date > today) return true;
  if (date < today) return false;
  return SLOT_START[slot] - hour >= PREP_HOURS;
}

// Latest same-day order time today (IST hour), or null if same-day is closed for today.
export function sameDayCutoff(now = new Date()) {
  const { hour } = istNow(now);
  const open = SLOTS.map((s) => SLOT_START[s] - PREP_HOURS).filter((h) => h > hour);
  return open.length ? Math.max(...open) : null;
}
