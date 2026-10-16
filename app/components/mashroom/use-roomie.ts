"use client";
import { useCallback, useEffect, useState } from "react";
import { appearanceStorageKey, defaultAppearance, readAppearance, normalizeAppearance, type RoomieAppearance } from "@/lib/roomie";
import type { StudentProfile } from "@/lib/types";
export function useRoomie(profile?: StudentProfile, name = "Mochi") {
  const [appearance, setAppearance] = useState(() => defaultAppearance(name));
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = profile ? appearanceStorageKey(profile) : "";
  useEffect(() => {
    const read = () => { try { setAppearance(readAppearance(key ? localStorage.getItem(key) : null, name)); } catch { setAppearance(defaultAppearance(name)); } setLoadedKey(key); };
    read(); window.addEventListener("mashroom:appearance", read); window.addEventListener("storage", read);
    return () => { window.removeEventListener("mashroom:appearance", read); window.removeEventListener("storage", read); };
  }, [key, name]);
  const save = useCallback((value: RoomieAppearance) => {
    if (!key) throw Error("Enter the demo before saving a Roomie.");
    const next = normalizeAppearance(value, name); localStorage.setItem(key, JSON.stringify(next));
    setAppearance(next); window.dispatchEvent(new Event("mashroom:appearance"));
  }, [key, name]);
  return { appearance, ready: Boolean(key) && loadedKey === key, save };
}
