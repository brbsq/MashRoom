import type { StudentProfile } from "./types";

export const appearanceSlots = ["hair", "body", "head", "eyes", "brows", "nose", "mouth", "makeup", "tops", "bottoms", "shoes", "accessories"] as const;
export type AppearanceSlot = typeof appearanceSlots[number];
export const roomieGenders=[{id:"girl",label:"Girl"},{id:"boy",label:"Boy"}] as const;
// Legacy saved values remain readable; only the requested choices are offered.
export type RoomieGender=typeof roomieGenders[number]["id"] | "unspecified" | "nonbinary";
export const clothingSlots: AppearanceSlot[] = ["tops", "bottoms", "shoes", "accessories"];
export const options: Record<AppearanceSlot, string[]> = {
  hair: ["Soft curls", "Swept fringe", "Round crop", "Long waves", "Side part", "Short curls"],
  body: ["Classic", "Petite", "Broad", "Tall", "Round", "Compact"],
  head: ["Round", "Oval", "Soft square", "Wide", "Small", "Heart"],
  eyes: ["Bright", "Happy", "Round", "Sleepy", "Wide", "Gentle"],
  brows: ["Soft", "Straight", "Arched", "Bold", "Fine", "Curved"],
  nose: ["Button", "Small", "Round", "Pointed", "Soft", "Petite"],
  mouth: ["Smile", "Grin", "Gentle", "Round", "Little smile", "Happy"],
  makeup: ["Natural", "Peach blush", "Rose cheeks", "Freckles", "Warm glow", "Berry"],
  tops: ["Everyday tee", "Roomie hoodie", "Pocket shirt", "Stripe tee", "Weekend knit", "Soft cardigan", "MashRoom logo tee"],
  bottoms: ["Relaxed trousers", "Summer shorts", "Pleated skirt", "Joggers", "Straight trousers", "Cuffed shorts"],
  shoes: ["Everyday trainers", "Canvas shoes", "Comfy boots", "Slip-ons", "Walking shoes", "High tops"],
  accessories: ["Round glasses", "Little scarf", "No accessories", "Square glasses", "Pendant", "Bright scarf", "Original Roomie specs"],
};
export type RoomieAppearance = {
  version: 1; name: string; created: boolean; customized: boolean;
  selection: Record<AppearanceSlot, number>;
  colors: Record<AppearanceSlot, string>;
  favourites: string[]; swatches: string[];
  itemColours: Record<string,string>;
  gender:RoomieGender;
};
export const skinTones = ["#f8d9c1", "#efbc93", "#d79a70", "#ad7350", "#80523c", "#51382d"];
export function defaultAppearance(name = "Mochi"): RoomieAppearance {
  return { version: 1, name, created: false, customized: false, gender:"unspecified",
    selection: Object.fromEntries(appearanceSlots.map(s => [s, 0])) as RoomieAppearance["selection"],
    colors: { hair: "#40312c", body: "#efbc93", head: "#efbc93", eyes: "#513329", brows: "#40312c", nose: "#c38362", mouth: "#a15d4b", makeup: "#e69b93", tops: "#303035", bottoms: "#bdc0c6", shoes: "#e8e6df", accessories: "#777c87" },
    favourites: [], swatches: ["#5bcc00", "#007dcc", "#d90037", "#ef9147", "#00ceb5"], itemColours: {} };
}
const hex = (v: unknown, fallback: string) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
export const isClothingFavourite = (id: string) => {
  const [slot, index] = id.split(":");
  return clothingSlots.includes(slot as AppearanceSlot) && /^\d+$/.test(index || "") && Number(index) < options[slot as AppearanceSlot].length;
};
export const mashroomTeeIndex = 6;
export const isMashroomTee = (slot:AppearanceSlot,index:number) => slot === "tops" && index === mashroomTeeIndex;
export function catalogueIndices(slot:AppearanceSlot) {
  const indices=options[slot].map((_,i)=>i);
  const rank=(i:number)=>slot==="accessories"?(i===2?-2:i===6?-1:0):slot==="tops"&&i===mashroomTeeIndex?-1:0;
  return indices.sort((a,b)=>rank(a)-rank(b));
}
export function appearanceItemColour(appearance:RoomieAppearance,slot:AppearanceSlot) {
  const index=appearance.selection[slot];
  return appearance.itemColours?.[`${slot}:${index}`] || (isMashroomTee(slot,index) ? "#ffffff" : slot==="accessories"&&index===6?"#b7b9b8":appearance.colors[slot]);
}
export function selectAppearanceItem(appearance:RoomieAppearance,slot:AppearanceSlot,index:number):RoomieAppearance {
  const next={...appearance,customized:true,selection:{...appearance.selection,[slot]:index},itemColours:{...appearance.itemColours}};
  if(clothingSlots.includes(slot)) {
    next.itemColours[`${slot}:${appearance.selection[slot]}`]=appearanceItemColour(appearance,slot);
    next.colors={...appearance.colors,[slot]:appearanceItemColour(next,slot)};
  }
  return next;
}
export function setAppearanceColour(appearance:RoomieAppearance,slot:AppearanceSlot,colour:string):RoomieAppearance {
  return {...appearance,customized:true,colors:{...appearance.colors,[slot]:colour,...(slot==="head"?{body:colour}:{})},itemColours:clothingSlots.includes(slot)?{...appearance.itemColours,[`${slot}:${appearance.selection[slot]}`]:colour}:{...appearance.itemColours}};
}
export function normalizeAppearance(value: unknown, name = "Mochi"): RoomieAppearance {
  const d = defaultAppearance(name);
  if (!value || typeof value !== "object") return d;
  const v = value as Partial<RoomieAppearance>;
  return { ...d, name: typeof v.name === "string" && v.name.trim() ? v.name.trim().slice(0, 60) : d.name,
    gender:["girl","boy","unspecified","nonbinary"].includes(v.gender||"")?v.gender!:"unspecified",
    created: v.created === true, customized: v.customized === true,
    selection: Object.fromEntries(appearanceSlots.map(s => [s, Number.isInteger(v.selection?.[s]) && v.selection![s] >= 0 && v.selection![s] < options[s].length ? v.selection![s] : 0])) as RoomieAppearance["selection"],
    colors: Object.fromEntries(appearanceSlots.map(s => [s, hex(v.colors?.[s], d.colors[s])])) as RoomieAppearance["colors"],
    favourites: [...new Set(Array.isArray(v.favourites) ? v.favourites.filter(id => typeof id === "string" && isClothingFavourite(id)) : [])].slice(0, clothingSlots.reduce((total,slot)=>total+options[slot].length,0)),
    itemColours: Object.fromEntries(v.itemColours && typeof v.itemColours === "object" && !Array.isArray(v.itemColours) ? Object.entries(v.itemColours).filter(([id,value])=>isClothingFavourite(id)&&typeof value==="string"&&/^#[0-9a-f]{6}$/i.test(value)) : []),
    swatches: [...new Set(Array.isArray(v.swatches) ? v.swatches.filter(s => typeof s === "string" && /^#[0-9a-f]{6}$/i.test(s)) : d.swatches)].slice(0, 30) };
}
export const appearanceStorageKey = (p: StudentProfile) => `mashroom:appearance:v1:${p.mode}:${encodeURIComponent(p.id)}:${encodeURIComponent(p.classId)}`;
export function readAppearance(raw: string | null, name = "Mochi") { try { return normalizeAppearance(JSON.parse(raw || "null"), name); } catch { return defaultAppearance(name); } }
export type EditHistory<T> = { past: T[]; present: T; future: T[] };
export function editHistory<T>(history: EditHistory<T>, value: T): EditHistory<T> { return { past: [...history.past, history.present].slice(-50), present: value, future: [] }; }
export function undoHistory<T>(h: EditHistory<T>): EditHistory<T> { return h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h; }
export function redoHistory<T>(h: EditHistory<T>): EditHistory<T> { return h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h; }
