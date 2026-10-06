import type { StudentProfile } from "./types";

export const phoneModels = [
  {
    id: "classic",
    name: "iPhone 6s style",
    description: "Silver frame · home button",
  },
  {
    id: "modern",
    name: "iPhone 18 Pro style",
    description: "Modern concept · edge-to-edge",
  },
] as const;
export const phoneThemes = [
  { id: "meadow", name: "Meadow" },
  { id: "lavender", name: "Lavender" },
  { id: "sunset", name: "Sunset" },
  { id: "midnight", name: "Midnight" },
] as const;
export type PhonePreferences = {
  model: (typeof phoneModels)[number]["id"];
  theme: (typeof phoneThemes)[number]["id"];
};
export const defaultPhone: PhonePreferences = {
  model: "modern",
  theme: "meadow",
};
export const phoneStorageKey = (profile: StudentProfile) =>
  `mashroom:phone:v1:${profile.mode}:${encodeURIComponent(profile.id)}:${encodeURIComponent(profile.classId)}`;
export function readPhonePreferences(raw: string | null): PhonePreferences {
  try {
    const value = JSON.parse(raw || "{}");
    return {
      model: phoneModels.some((m) => m.id === value?.model)
        ? value.model
        : defaultPhone.model,
      theme: phoneThemes.some((t) => t.id === value?.theme)
        ? value.theme
        : defaultPhone.theme,
    };
  } catch {
    return { ...defaultPhone };
  }
}
