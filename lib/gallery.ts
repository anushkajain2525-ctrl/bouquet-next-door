import { Stem, priceOf } from "./catalog";

export interface GalleryItem {
  id: string; title: string; kind: "mixed" | "single"; blurb: string;
  colors: string[]; stems: Stem[]; wrap: string; vase: string; ratio: "4/5" | "3/4";
  occasions: string[]; // matches OCCASIONS in catalog
}

export const GALLERY: GalleryItem[] = [
  { id: "blush-garden", occasions: ["anniversary", "birthday", "date night"], title: "Blush Garden", kind: "mixed", blurb: "Blush pink roses and peonies in soft kraft paper.", colors: ["pink"], ratio: "4/5", wrap: "kraft", vase: "none",
    stems: [{ id: "rose-pink", qty: 6 }, { id: "peony", qty: 4 }] },
  { id: "sunday-market", occasions: ["birthday", "just because"], title: "Sunday Market", kind: "mixed", blurb: "Sunflowers, gerberas and marigolds. Pure cheer.", colors: ["yellow", "orange", "pink"], ratio: "3/4", wrap: "kraft", vase: "none",
    stems: [{ id: "sunflower", qty: 5 }, { id: "gerbera", qty: 4 }, { id: "marigold", qty: 6 }] },
  { id: "pure-white", occasions: ["apology", "anniversary"], title: "Pure White", kind: "mixed", blurb: "White roses, tuberose, lilies and hydrangea. Quiet and elegant.", colors: ["white"], ratio: "4/5", wrap: "ivory", vase: "none",
    stems: [{ id: "rose-white", qty: 5 }, { id: "tuberose", qty: 4 }, { id: "lily-white", qty: 3 }, { id: "hydrangea", qty: 1 }] },
  { id: "romeo-red", occasions: ["Valentine's", "anniversary", "date night"], title: "Romeo Red", kind: "mixed", blurb: "Deep red roses with red tulips. The classic, done well.", colors: ["red"], ratio: "3/4", wrap: "blush", vase: "none",
    stems: [{ id: "rose-red", qty: 8 }, { id: "tulip-red", qty: 4 }] },
  { id: "lavender-dreams", occasions: ["birthday", "date night"], title: "Lavender Dreams", kind: "mixed", blurb: "Hydrangea, lavender, pink roses and a touch of orchid.", colors: ["purple", "pink"], ratio: "4/5", wrap: "blush", vase: "glass",
    stems: [{ id: "hydrangea", qty: 2 }, { id: "lavender", qty: 4 }, { id: "rose-pink", qty: 4 }, { id: "orchid", qty: 2 }] },
  { id: "sunset-orange", occasions: ["birthday", "just because"], title: "Sunset Orange", kind: "mixed", blurb: "Orange lilies, marigolds and yellow tulips.", colors: ["orange", "yellow"], ratio: "3/4", wrap: "ivory", vase: "none",
    stems: [{ id: "lily-orange", qty: 4 }, { id: "marigold", qty: 6 }, { id: "tulip-yellow", qty: 4 }] },
  { id: "lily-rainbow", occasions: ["birthday", "just because"], title: "Lily Rainbow", kind: "single", blurb: "Only lilies, in white, pink, orange and yellow.", colors: ["white", "pink", "orange", "yellow"], ratio: "4/5", wrap: "kraft", vase: "none",
    stems: [{ id: "lily-white", qty: 2 }, { id: "lily-pink", qty: 2 }, { id: "lily-orange", qty: 2 }, { id: "lily-yellow", qty: 2 }] },
  { id: "tulip-parade", occasions: ["just because", "birthday"], title: "Tulip Parade", kind: "single", blurb: "Only tulips, in red, pink, yellow and white.", colors: ["red", "pink", "yellow", "white"], ratio: "3/4", wrap: "kraft", vase: "none",
    stems: [{ id: "tulip-red", qty: 3 }, { id: "tulip-pink", qty: 3 }, { id: "tulip-yellow", qty: 3 }, { id: "tulip-white", qty: 3 }] },
  { id: "rose-ombre", occasions: ["apology", "anniversary", "Valentine's"], title: "Rose Ombré", kind: "single", blurb: "Only roses, fading from deep red to blush to cream.", colors: ["red", "pink", "white"], ratio: "4/5", wrap: "blush", vase: "none",
    stems: [{ id: "rose-red", qty: 3 }, { id: "rose-pink", qty: 3 }, { id: "rose-white", qty: 3 }] },
];

export const galleryImg = (id: string) => `/img/bouquets/${id}.jpg`;
export const galleryPrice = (g: GalleryItem) => priceOf(g.stems, g.wrap, false, g.vase);
