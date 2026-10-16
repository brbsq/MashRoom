export type BgmPreferences = { volume: number; muted: boolean };
export const bgmStorageKey = "mashroom:bgm:v1";
export const defaultBgmPreferences: BgmPreferences = { volume: 0.2, muted: false };
export const bgmTracks = { closet: "/audio/closet.mp3", maker: "/audio/roomie-maker.mp3" } as const;

export function readBgmPreferences(raw: string | null): BgmPreferences {
  try {
    const data = JSON.parse(raw || "null");
    return {
      volume: typeof data?.volume === "number" && Number.isFinite(data.volume)
        ? Math.min(1, Math.max(0, data.volume)) : defaultBgmPreferences.volume,
      muted: data?.muted === true,
    };
  } catch { return { ...defaultBgmPreferences }; }
}
