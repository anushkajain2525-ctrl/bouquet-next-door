export type Season = "winter" | "spring" | "summer" | "monsoon" | "autumn";

export interface Flower {
  id: string;
  name: string;
  price: number; // nominal retail INR per stem
  color: string; // hex used in preview
  colorTag: string; // colour family for preference matching
  seasons: Season[];
  shape: "round" | "spiky" | "daisy" | "bell" | "ruffle";
}

// Prices are deliberately nominal prototype retail prices (INR per stem).
export const FLOWERS: Flower[] = [
  { id: "rose-red", name: "Red Rose", price: 25, color: "#c1121f", colorTag: "red", seasons: ["winter", "spring", "autumn", "summer"], shape: "round" },
  { id: "rose-pink", name: "Pink Rose", price: 25, color: "#f06292", colorTag: "pink", seasons: ["winter", "spring", "autumn"], shape: "round" },
  { id: "rose-white", name: "White Rose", price: 25, color: "#f8f4ec", colorTag: "white", seasons: ["winter", "spring"], shape: "round" },
  { id: "marigold", name: "Marigold", price: 8, color: "#f59e0b", colorTag: "yellow", seasons: ["winter", "autumn", "summer", "spring"], shape: "ruffle" },
  { id: "gerbera", name: "Gerbera", price: 20, color: "#fb7185", colorTag: "pink", seasons: ["winter", "spring", "summer", "monsoon"], shape: "daisy" },
  { id: "carnation", name: "Carnation", price: 18, color: "#e11d74", colorTag: "pink", seasons: ["winter", "spring", "autumn"], shape: "ruffle" },
  { id: "chrysanthemum", name: "Chrysanthemum", price: 15, color: "#fde047", colorTag: "yellow", seasons: ["autumn", "winter"], shape: "daisy" },
  { id: "tuberose", name: "Tuberose (Rajnigandha)", price: 12, color: "#fffdf5", colorTag: "white", seasons: ["summer", "monsoon", "autumn"], shape: "spiky" },
  { id: "jasmine", name: "Mogra (Jasmine)", price: 6, color: "#ffffff", colorTag: "white", seasons: ["summer", "monsoon"], shape: "bell" },
  { id: "lily", name: "Asiatic Lily", price: 45, color: "#fb923c", colorTag: "orange", seasons: ["summer", "monsoon", "spring"], shape: "bell" },
  { id: "gladiolus", name: "Gladiolus", price: 20, color: "#a855f7", colorTag: "purple", seasons: ["winter", "spring", "autumn"], shape: "spiky" },
  { id: "dahlia", name: "Dahlia", price: 20, color: "#d946ef", colorTag: "purple", seasons: ["winter", "autumn"], shape: "round" },
  { id: "sunflower", name: "Sunflower", price: 30, color: "#facc15", colorTag: "yellow", seasons: ["summer", "spring"], shape: "daisy" },
  { id: "lavender-filler", name: "Statice (filler)", price: 10, color: "#a78bfa", colorTag: "purple", seasons: ["winter", "spring", "summer", "monsoon", "autumn"], shape: "spiky" },
];

export interface Wrap { id: string; name: string; price: number; color: string }
export const WRAPS: Wrap[] = [
  { id: "kraft", name: "Kraft paper", price: 30, color: "#c9a77c" },
  { id: "blush", name: "Blush tissue", price: 40, color: "#f9c6d0" },
  { id: "ivory", name: "Ivory silk", price: 60, color: "#f3ead8" },
  { id: "sage", name: "Sage green", price: 40, color: "#a8b99a" },
];

export const CARD_PRICE = 10;
export const OCCASIONS = ["just because", "anniversary", "birthday", "apology", "date night", "Valentine's"];
export const VIBES = ["romantic", "cheerful", "elegant", "rustic", "bold"];
export const COLOR_TAGS = ["red", "pink", "white", "yellow", "orange", "purple"];
export const COLOR_HEX: Record<string, string> = {
  red: "#c1121f", pink: "#f06292", white: "#f1ebe0", yellow: "#facc15", orange: "#fb923c", purple: "#a855f7",
};

export const SEASON_LABEL: Record<Season, string> = {
  winter: "Winter (Dec–Feb)", spring: "Spring (Feb–Mar)", summer: "Summer (Apr–Jun)",
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
export const wrapById = (id: string) => WRAPS.find((w) => w.id === id);

export interface Stem { id: string; qty: number }

export function priceOf(stems: Stem[], wrapId: string, hasCard: boolean): number {
  const s = stems.reduce((sum, x) => sum + (flowerById(x.id)?.price ?? 0) * x.qty, 0);
  return s + (wrapById(wrapId)?.price ?? 0) + (hasCard ? CARD_PRICE : 0);
}

export const SLOTS = ["10am – 1pm", "1pm – 4pm", "4pm – 7pm", "7pm – 9pm"];
export const DELIVERY_FEE = 49;
