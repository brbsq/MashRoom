import { decorCatalog, type DecorKind } from "./room-decor";
import { selectAppearanceItem, setAppearanceColour, type RoomieAppearance } from "./roomie";
import type { StudentProfile } from "./types";

export const shopCategories = ["All", "Clothing", "Furniture", "Decorations", "Arcade Tokens", "Saved"] as const;
export type ShopCategory = typeof shopCategories[number];
export type ShopItem = {
  id: string; name: string; brand: string; category: "Clothing" | "Furniture" | "Decorations" | "Arcade Tokens";
  description: string; kind?: DecorKind; slot?: "tops" | "accessories"; index?: number;
  colours?: readonly string[]; tag: string; price: number; tokens?: number;
};
export const shopCatalogue: ShopItem[] = [
  { id: "logo-tee", name: "MashRoom logo tee", brand: "MashRoom", category: "Clothing", slot: "tops", index: 6,
    colours: ["#ffffff", "#7cfeef", "#f2adbd", "#c9c1e8"], tag: "Roomie original", price:45,
    description: "A little hello, stitched close to your heart. Try a fresh colour on your Roomie." },
  { id: "original-specs", name: "Original Roomie specs", brand: "MashRoom", category: "Clothing", slot: "accessories", index: 6,
    colours: ["#b7b9b8", "#66534c", "#c78f55", "#b4a3cf"], tag: "Roomie original", price:35,
    description: "Familiar frames for a curious little face. A small detail that feels like you." },
  ...decorCatalog.map(item => ({ id: item.id, name: item.name, brand: "Roomie Home", category: item.category,
    kind: item.id, price:({lamp:60,arcade:120,cushion:40} as Record<string,number>)[item.id] || 0,
    tag: ["lamp","arcade","cushion"].includes(item.id) ? "New little find" : "Free starter",
    description: ({ sofa: "A soft landing for slow afternoons and little daydreams.", table: "A rounded little table, with room for your favourite things.", shelf: "A cosy home for stories, treasures and everything in between.", plant: "A little green company. Every corner could use a friend.", rug: "A warm patch of sunshine, whatever the weather outside.", art: "A quiet little moon to keep your room full of wonder.", lamp:"A soft little star to light up your favourite corner.", arcade:"A pastel cabinet for your play corner. A decorative collectible, not a playable game.", cushion:"A squishy guava-pink heart. A little extra love for your room." })[item.id] })),
  {id:"tokens-1",name:"1 arcade token",brand:"Roomie Arcade",category:"Arcade Tokens",price:10,tokens:1,tag:"A little play",description:"One token for your arcade wallet. Game redemption will connect in a later update."},
  {id:"tokens-5",name:"5 arcade tokens",brand:"Roomie Arcade",category:"Arcade Tokens",price:45,tokens:5,tag:"5 points saved",description:"A pocketful of play. Five tokens, saved together in your device-local wallet."},
  {id:"tokens-12",name:"12 arcade tokens",brand:"Roomie Arcade",category:"Arcade Tokens",price:100,tokens:12,tag:"20 points saved",description:"A little stash for another day. Twelve tokens for your future arcade visits."},
];

export function filterShop(category: ShopCategory, query: string, saved: readonly string[], sort: "featured" | "az") {
  const needle = query.trim().toLowerCase();
  const items = shopCatalogue.filter(item =>
    (category === "All" || (category === "Saved" ? saved.includes(item.id) : item.category === category)) &&
    `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(needle));
  const featured=(item:ShopItem)=>["lamp","arcade","cushion"].includes(item.id)?-1:0;
  return sort === "az" ? items.sort((a,b) => a.name.localeCompare(b.name)) : items.sort((a,b)=>featured(a)-featured(b));
}
export function shopPreview(appearance: RoomieAppearance, item: ShopItem, colour = item.colours?.[0]) {
  if (!item.slot || item.index === undefined || !colour) return appearance;
  return setAppearanceColour(selectAppearanceItem(appearance, item.slot, item.index), item.slot, colour);
}
export const shopStorageKey = (p: StudentProfile) => `mashroom:shop-saved:v1:${p.mode}:${encodeURIComponent(p.id)}:${encodeURIComponent(p.classId)}`;
export function readShopSaved(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && shopCatalogue.some(item => item.id === id)))] : [];
  } catch { return []; }
}
