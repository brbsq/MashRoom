"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { assetHref } from "@/lib/asset";
import { bgmStorageKey, defaultBgmPreferences, readBgmPreferences, type BgmPreferences } from "@/lib/bgm";
import styles from "./background-music.module.css";

const changeEvent = "mashroom:bgm-change";
function storedPreferences() {
  try { return readBgmPreferences(localStorage.getItem(bgmStorageKey)); }
  catch { return { ...defaultBgmPreferences }; }
}
function useBgmPreferences() {
  const [preferences, setPreferences] = useState<BgmPreferences>(defaultBgmPreferences);
  const [warning, setWarning] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => setPreferences(storedPreferences());
    const changed = (event: Event) => setPreferences((event as CustomEvent<BgmPreferences>).detail);
    const storageChanged = (event: StorageEvent) => { if (event.key === bgmStorageKey || event.key === null) refresh(); };
    refresh(); setReady(true); window.addEventListener(changeEvent, changed); window.addEventListener("storage", storageChanged);
    return () => { window.removeEventListener(changeEvent, changed); window.removeEventListener("storage", storageChanged); };
  }, []);
  function update(next: BgmPreferences) {
    setPreferences(next);
    try { localStorage.setItem(bgmStorageKey, JSON.stringify(next)); setWarning(""); }
    catch { setWarning("Volume works for this visit, but couldn't be saved on this device."); }
    window.dispatchEvent(new CustomEvent(changeEvent, { detail: next }));
  }
  return { preferences, update, warning, ready };
}

export function BgmControls() {
  const { preferences, update, warning } = useBgmPreferences();
  const percent = Math.round(preferences.volume * 100);
  return <section className={styles.controls} aria-label="Background music settings">
    <div className={styles.heading}><label htmlFor="bgm-volume">BGM volume</label><output htmlFor="bgm-volume">{percent}%</output></div>
    <div className={styles.row}>
      <input id="bgm-volume" aria-label="BGM volume" type="range" min="0" max="100" step="1" value={percent} onChange={event => update({ ...preferences, volume: Number(event.target.value) / 100 })} />
      <button type="button" aria-label={preferences.muted ? "Unmute background music" : "Mute background music"} aria-pressed={preferences.muted} onClick={() => update({ ...preferences, muted: !preferences.muted })}>
        {preferences.muted ? <VolumeX size={20}/> : <Volume2 size={20}/>} {preferences.muted ? "Unmute" : "Mute"}
      </button>
    </div>
    {warning && <p role="status">{warning}</p>}
  </section>;
}

export function BackgroundMusic({ track, title }: { track: string; title: string }) {
  const { preferences, ready } = useBgmPreferences();
  const audio = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<"starting" | "playing" | "blocked" | "error">("starting");
  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    let active = true;
    player.src = assetHref(track);
    const initial = storedPreferences(); player.volume = initial.volume; player.muted = initial.muted;
    setStatus("starting");
    const removeListeners = () => { window.removeEventListener("pointerdown", start); window.removeEventListener("keydown", start); };
    function start() {
      if (!active || !player) return;
      void player.play().then(() => { if (active) { setStatus("playing"); removeListeners(); } }).catch(error => {
        if (active) setStatus(error?.name === "NotAllowedError" ? "blocked" : "error");
      });
    }
    window.addEventListener("pointerdown", start); window.addEventListener("keydown", start);
    start();
    return () => { active = false; removeListeners(); player.pause(); player.removeAttribute("src"); player.load(); };
  }, [track]);
  useEffect(() => { if (ready && audio.current) { audio.current.volume = preferences.volume; audio.current.muted = preferences.muted; } }, [preferences, ready]);
  return <>
    <audio ref={audio} src={assetHref(track)} loop preload="auto" data-bgm={title} onError={() => setStatus("error")} />
    {status === "blocked" && <button className={styles.play} type="button" onClick={() => { void audio.current?.play().then(() => setStatus("playing")).catch(() => setStatus("error")); }}><Play size={16}/> Play music</button>}
    {status === "error" && <p className={styles.play} role="status">Music unavailable. You can keep editing.</p>}
  </>;
}
