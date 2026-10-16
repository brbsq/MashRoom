import type { StudentProfile } from "./types";
import { rooms, type RoomId } from "./pet-room";

export const decorCatalog = [
  { id: "sofa", name: "Cloud sofa", category: "Furniture", surface: "floor", heightRatio: .42, aspect: 1.5 },
  { id: "table", name: "Pebble table", category: "Furniture", surface: "floor", heightRatio: .32, aspect: 1.5 },
  { id: "shelf", name: "Little bookshelf", category: "Furniture", surface: "floor", heightRatio: .72, aspect: .85 },
  { id: "plant", name: "Happy plant", category: "Decorations", surface: "floor", heightRatio: .5, aspect: .7 },
  { id: "rug", name: "Sunshine rug", category: "Decorations", surface: "floor", heightRatio: .17, aspect: 2.5 },
  { id: "art", name: "Moon print", category: "Decorations", surface: "wall", heightRatio: .32, aspect: .85 },
  { id: "lamp", name: "Starlight lamp", category: "Decorations", surface: "floor", heightRatio: .48, aspect: .8 },
  { id: "arcade", name: "Pocket arcade cabinet", category: "Furniture", surface: "floor", heightRatio: .62, aspect: .75 },
  { id: "cushion", name: "Guava heart cushion", category: "Decorations", surface: "floor", heightRatio: .21, aspect: 1.2 },
] as const;
export const starterDecorIds = ["sofa", "table", "shelf", "plant", "rug", "art"] as const;
export const isStarterDecor = (id:string) => starterDecorIds.some(kind => kind === id);
const furnitureAssetDimensions = { sofa: [190,128], table: [170,118], shelf: [130,164], plant: [110,181], rug: [192,90], art: [140,165], lamp:[130,170], arcade:[130,170], cushion:[150,115] };
export const furnitureDefinitions: FurnitureDefinition[] = decorCatalog.map(entry => ({ ...entry, allowedSurfaces: [entry.surface], assetDimensions: { width: furnitureAssetDimensions[entry.id][0], height: furnitureAssetDimensions[entry.id][1] } }));
export type DecorKind = (typeof decorCatalog)[number]["id"];
export type DecorItem = {
  id: string;
  kind: DecorKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  foreground: boolean;
  layer: "behind" | "auto" | "front";
  order: number;
  interaction?: { actionId: string; label: string };
};
export type RoomLayouts = Partial<Record<RoomId, DecorItem[]>>;
export const decorStorageKey = (p: StudentProfile) =>
  `mashroom:decor:v1:${p.mode}:${encodeURIComponent(p.id)}:${encodeURIComponent(p.classId)}`;
const clamp = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, v))
    : fallback;
export function normalizeDecor(value: unknown): DecorItem[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.slice(0, 40).flatMap((v) => {
    if (
      !v ||
      typeof v.id !== "string" ||
      !v.id ||
      v.id.length > 100 ||
      ids.has(v.id) ||
      !decorCatalog.some((k) => k.id === v.kind)
    )
      return [];
    ids.add(v.id);
    return [
      {
        id: v.id,
        kind: v.kind as DecorKind,
        x: clamp(v.x, 0, 100, 50),
        y: clamp(v.y, 0, 100, 60),
        scale: clamp(v.scale, 0.25, 2.5, 1),
        rotation: clamp(v.rotation, -180, 180, 0),
        foreground: v.foreground === true,
        layer: v.layer === "behind" || v.layer === "front" || v.layer === "auto" ? v.layer : v.foreground === true ? "front" : "behind",
        order: clamp(v.order, -10000, 10000, 0),
        ...(v.interaction && typeof v.interaction.actionId === "string" && typeof v.interaction.label === "string" ? { interaction: { actionId: v.interaction.actionId.slice(0, 80), label: v.interaction.label.slice(0, 80) } } : {}),
      },
    ];
  });
}

export type PlacementSurface = "floor" | "wall" | "ceiling";
// Catalogue extension port: new ceiling assets use these surface bounds.
export type FurnitureDefinition = { id: string; name: string; surface: PlacementSurface; allowedSurfaces: PlacementSurface[]; heightRatio: number; aspect: number; assetDimensions: { width: number; height: number } };
export const surfaceBounds = (surface: PlacementSurface, outdoors = false): [number,number] => surface === "floor" ? [outdoors ? 50 : 83,97] : surface === "wall" ? [15,77] : [4,20];
export type FurnitureInteraction = { roomId: RoomId; item: DecorItem; actionId: string };
export function boundDecor(item: DecorItem, roomId: RoomId = "living", aspect = 16/9, characterHeight = 70.8333): DecorItem {
  const entry = decorCatalog.find(c => c.id === item.kind)!;
  const [surfaceTop,surfaceBottom] = surfaceBounds(entry.surface,roomId === "outdoors");
  const height = entry.heightRatio * characterHeight;
  const width = height * entry.aspect / aspect;
  const radians = item.rotation * Math.PI / 180, cos = Math.cos(radians), sin = Math.sin(radians);
  // Rotate around the same floor-contact / wall-centre origin used by CSS.
  const top = entry.surface === "wall" ? -height/2 : -height;
  const bottom = entry.surface === "wall" ? height/2 : 0;
  const corners = [-width/2,width/2].flatMap(x=>[top,bottom].map(y=>({x:x*cos-y/aspect*sin,y:x*aspect*sin+y*cos})));
  const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
  const scale = Math.min(item.scale,92/(maxX-minX),(entry.surface==="wall"?surfaceBottom-surfaceTop:93)/(maxY-minY),entry.surface==="floor"&&maxY>0?(surfaceBottom-surfaceTop)/maxY:Infinity);
  const lowY=entry.surface==="wall"?surfaceTop-minY*scale:Math.max(surfaceTop,4-minY*scale);
  const y=Math.max(lowY,Math.min(surfaceBottom-maxY*scale,item.y));
  return { ...item, scale, x: Math.max(4-minX*scale,Math.min(96-maxX*scale,item.x)), y:entry.surface==="floor"?Math.min(surfaceBottom,Math.max(surfaceTop,y)):y };
}
export function sceneLayers(items: DecorItem[], characterY: number) {
  const ranked = items.map(item => {
    const surface = decorCatalog.find(c => c.id === item.kind)!.surface;
    const band = item.kind === "rug" ? 0 : item.layer === "front" ? 4 : item.layer === "behind" || surface === "wall" ? 2 : 3;
    return { id: item.id, key: band * 100000 + (band === 3 ? item.y * 100 : 0) + item.order };
  });
  ranked.push({ id: "__character", key: 300000 + characterY * 100 });
  ranked.sort((a,b) => a.key - b.key || a.id.localeCompare(b.id));
  return Object.fromEntries(ranked.map((item,index) => [item.id, index + 2]));
}
export function orderDecor(items: DecorItem[], id: string, direction: -1 | 1): DecorItem[] {
  const item=items.find(i=>i.id===id);if(!item)return items;
  const depth=(i:DecorItem)=>i.layer==="auto"?i.y*100+i.order:i.order;
  const same=items.filter(i=>i.layer===item.layer&&((i.kind==="rug") === (item.kind==="rug"))&&decorCatalog.find(c=>c.id===i.kind)!.surface===decorCatalog.find(c=>c.id===item.kind)!.surface).sort((a,b)=>depth(a)-depth(b)||a.id.localeCompare(b.id));
  const neighbour=same[same.findIndex(i=>i.id===id)+direction];if(!neighbour)return items;
  const order=depth(neighbour)+direction-(item.layer==="auto"?item.y*100:0);
  return items.map(i=>i.id===id?{...i,order}:i);
}
export function readLayouts(raw: string | null): RoomLayouts {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      rooms.map((room) => [room.id, normalizeDecor(parsed[room.id])]),
    );
  } catch {
    return {};
  }
}
