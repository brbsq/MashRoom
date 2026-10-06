import type { CareAction, DemoState, PetState, StudentProfile } from "./types";
export const classes = [
  { id: "willow", name: "4A · Willow" },
  { id: "maple", name: "4B · Maple" },
  { id: "cedar", name: "5A · Cedar" },
];
export const phrases = [
  "Hi, everyone! 👋",
  "Your pet is adorable! 💚",
  "Let's learn together! 📚",
  "You did great! ✨",
];
export const defaultPet = (): PetState => ({
  name: "Mochi",
  stage: "Baby",
  hunger: 65,
  hygiene: 72,
  happiness: 80,
  energy: 60,
  bladder: 75,
  health: 90,
  color: "mint",
});
// Older device-local and Google pets predate the two additional needs.
export function normalizePet(pet: PetState): PetState {
  const valid = (value: number | undefined, fallback: number) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
      ? value
      : fallback;
  return {
    ...pet,
    bladder: valid(pet.bladder, 75),
    health: valid(pet.health, 90),
  };
}
export function applyCare(pet: PetState, action: CareAction): PetState {
  const next = normalizePet(pet);
  if (action === "feed") next.hunger += 20;
  if (action === "shower") next.hygiene += 25;
  if (action === "play") {
    next.happiness += 15;
    next.energy -= 8;
  }
  if (action === "sleep") next.energy += 25;
  if (action === "toilet") next.bladder += 30;
  if (action === "rest") next.health += 15;
  for (const k of [
    "hunger",
    "hygiene",
    "happiness",
    "energy",
    "bladder",
    "health",
  ] as const)
    next[k] = Math.max(0, Math.min(100, next[k]));
  return next;
}
export function seed(profile: StudentProfile): DemoState {
  return {
    version: 1,
    profile,
    pet: defaultPet(),
    mode: "both",
    teacher: false,
    muted: [],
    reports: [],
    messages: [
      {
        id: "welcome-1",
        classId: profile.classId,
        senderId: "bot-luna",
        name: "Luna",
        text: "Hi, everyone! Ready for a little adventure? 🌱",
        createdAt: Date.now() - 120000,
        kind: "text",
      },
      {
        id: "welcome-2",
        classId: profile.classId,
        senderId: "bot-kai",
        name: "Kai",
        text: "Mochi and I are hanging out by the fountain! ✨",
        createdAt: Date.now() - 60000,
        kind: "text",
      },
    ],
  };
}
export const demoKey = (p: StudentProfile) =>
  `mashroom:v1:${p.id}:${p.classId}`;
export function loadDemo(): DemoState | null {
  try {
    const p = JSON.parse(
      localStorage.getItem("mashroom:active") || "null",
    ) as StudentProfile | null;
    if (!p || !classes.some((c) => c.id === p.classId) || p.mode !== "demo")
      return null;
    const s = JSON.parse(localStorage.getItem(demoKey(p)) || "null");
    if (
      s?.version !== 1 ||
      s.profile.id !== p.id ||
      s.profile.classId !== p.classId ||
      !Array.isArray(s.messages) ||
      !s.pet ||
      !Array.isArray(s.muted) ||
      !Array.isArray(s.reports)
    )
      return seed(p);
    if (
      ![s.pet.hunger, s.pet.energy, s.pet.hygiene, s.pet.happiness].every(
        (n) => typeof n === "number" && n >= 0 && n <= 100,
      )
    )
      return seed(p);
    return {
      ...s,
      pet: normalizePet(s.pet),
      messages: s.messages
        .filter((m: { classId: string }) => m.classId === p.classId)
        .slice(-100),
    };
  } catch {
    return null;
  }
}
export function saveDemo(state: DemoState) {
  localStorage.setItem(
    demoKey(state.profile),
    JSON.stringify({ ...state, messages: state.messages.slice(-100) }),
  );
  localStorage.setItem("mashroom:active", JSON.stringify(state.profile));
}
