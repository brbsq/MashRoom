import type { StudentProfile } from "./types";
import { rooms, type RoomId } from "./pet-room";

export const decorCatalog = [
  { id: "sofa", name: "Cloud sofa", category: "Furniture" },
  { id: "table", name: "Pebble table", category: "Furniture" },
  { id: "shelf", name: "Little bookshelf", category: "Furniture" },
  { id: "plant", name: "Happy plant", category: "Decorations" },
  { id: "rug", name: "Sunshine rug", category: "Decorations" },
  { id: "art", name: "Moon print", category: "Decorations" },
] as const;
export type DecorKind = (typeof decorCatalog)[number]["id"];
export type DecorItem = {
  id: string;
  kind: DecorKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  foreground: boolean;
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
        x: clamp(v.x, 8, 92, 50),
        y: clamp(v.y, 18, 92, 60),
        scale: clamp(v.scale, 0.5, 1.6, 1),
        rotation: clamp(v.rotation, -180, 180, 0),
        foreground: v.foreground === true,
      },
    ];
  });
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
