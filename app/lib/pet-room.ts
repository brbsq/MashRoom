import type { CareAction, PetState } from "./types";
import { assetHref } from "./asset";

export const needs = [
  {
    key: "happiness",
    label: "Fun / happiness",
    icon: "55bb7.svg",
    action: "play",
    verb: "Play",
    good: "Feeling cheerful",
    low: "Could use some playtime",
  },
  {
    key: "hunger",
    label: "Hunger",
    icon: "18539.svg",
    action: "feed",
    verb: "Feed",
    good: "Tummy is satisfied",
    low: "Ready for a snack",
  },
  {
    key: "hygiene",
    label: "Hygiene",
    icon: "1a6b4.svg",
    action: "shower",
    verb: "Shower",
    good: "Fresh and clean",
    low: "Time to freshen up",
  },
  {
    key: "energy",
    label: "Sleep",
    icon: "208a2.svg",
    action: "sleep",
    verb: "Sleep",
    good: "Feeling rested",
    low: "A little sleepy",
  },
  {
    key: "bladder",
    label: "Bladder",
    icon: "4e125.svg",
    action: "toilet",
    verb: "Use toilet",
    good: "Feeling comfortable",
    low: "Needs a toilet break",
  },
  {
    key: "health",
    label: "Health",
    icon: "95f6b.svg",
    action: "rest",
    verb: "Rest",
    good: "Feeling well",
    low: "Needs some gentle care",
  },
] as const satisfies readonly {
  key: keyof PetState;
  label: string;
  icon: string;
  action: CareAction;
  verb: string;
  good: string;
  low: string;
}[];
export type Need = (typeof needs)[number];
export const needValue = (value: number) =>
  Math.round(Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)));
export const needTone = (value: number) =>
  value >= 50 ? "green" : value >= 25 ? "yellow" : "red";
export type RoomId = "living" | "bedroom" | "kitchen" | "bathroom" | "outdoors";
export type RoomPosition = { x: number; y: number };
export type RoomObject = {
  id: string;
  label: string;
  position: RoomPosition;
  action?: CareAction;
};
export type RoomInteraction = { roomId: RoomId; object: RoomObject };
export const rooms: readonly {
  id: RoomId;
  name: string;
  image: string;
  lighting: string;
  objects: readonly RoomObject[];
}[] = [
  {
    id: "living",
    name: "living room",
    image: assetHref("/rooms/3551a.png"),
    lighting: "none",
    objects: [],
  },
  {
    id: "bedroom",
    name: "bedroom",
    image: assetHref("/rooms/3551a.png"),
    lighting: "linear-gradient(#706ba34d, #a0b4ee18)",
    objects: [],
  },
  {
    id: "kitchen",
    name: "kitchen",
    image: assetHref("/rooms/3551a.png"),
    lighting: "linear-gradient(#fff3c433, #ffd28322)",
    objects: [],
  },
  {
    id: "bathroom",
    name: "bathroom",
    image: assetHref("/rooms/3551a.png"),
    lighting: "linear-gradient(#9bdde855, #b9efe933)",
    objects: [],
  },
  {
    id: "outdoors",
    name: "outdoors",
    image: assetHref("/plaza.png"),
    lighting: "none",
    objects: [],
  },
];
export const startingPosition: RoomPosition = { x: 60.65, y: 94.81 };
export function boundRoomPosition(
  position: RoomPosition,
  halfWidth = 11.224,
): RoomPosition {
  return {
    x: Math.max(
      Math.max(27, halfWidth),
      Math.min(
        Math.min(86, 100 - halfWidth),
        Number.isFinite(position.x) ? position.x : startingPosition.x,
      ),
    ),
    y: Math.max(
      83,
      Math.min(
        97,
        Number.isFinite(position.y) ? position.y : startingPosition.y,
      ),
    ),
  };
}
