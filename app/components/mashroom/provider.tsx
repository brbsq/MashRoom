"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { applyCare, loadDemo, saveDemo, seed, normalizePet } from "@/lib/demo";
import { LocalRoom, type RoomSnapshot } from "@/lib/room";
import type { CareAction, DemoState, GoogleConnection } from "@/lib/types";
import { toast, Toaster } from "sonner";
import { chime } from "@/lib/sound";
import { decorStorageKey } from "@/lib/room-decor";
const staticDemo = process.env.NEXT_PUBLIC_MASHROOM_PAGES === "1";
type ContextValue = {
  state: DemoState | null;
  ready: boolean;
  room: LocalRoom;
  snapshot: RoomSnapshot;
  google: GoogleConnection | null;
  refreshGoogle: () => Promise<void>;
  start: (name: string, classId: string) => void;
  update: (fn: (s: DemoState) => DemoState) => void;
  care: (a: CareAction) => void;
  reset: () => void;
  logout: () => Promise<void>;
};
const Context = createContext<ContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null),
    [ready, setReady] = useState(false),
    [google, setGoogle] = useState<GoogleConnection | null>(null);
  const ref = useRef<DemoState | null>(null),
    saveQueue = useRef(Promise.resolve());
  const commit = useCallback((s: DemoState) => {
    ref.current = s;
    setState(s);
    if (s.profile.mode === "demo")
      try {
        saveDemo(s);
      } catch {
        toast.error(
          "This browser couldn't save your progress. Keep this tab open.",
        );
      }
  }, []);
  const [room] = useState(() => new LocalRoom(() => {}));
  useEffect(() => {
    room.setPersistence((messages) => {
      if (ref.current?.profile.mode === "demo")
        commit({ ...ref.current, messages });
    });
  }, [room, commit]);
  const [snapshot, setSnapshot] = useState<RoomSnapshot>({
    status: "disconnected",
    participants: [],
    messages: [],
  });
  const refreshGoogle = useCallback(async () => {
    if (staticDemo) {
      setGoogle({ configured: false, user: null, classroom: "disconnected", canAdopt: false });
      return;
    }
    try {
      const r = await fetch("/api/auth/session");
      if (!r.ok) throw Error();
      const g = (await r.json()) as GoogleConnection;
      setGoogle(g);
      if (g.user) {
        const s = seed({
          id: g.user.id,
          name: g.user.name,
          classId: "live",
          mode: "google",
        });
        if (g.user.pet) s.pet = normalizePet(g.user.pet);
        ref.current = s;
        setState(s);
      } else if (ref.current?.profile.mode === "google") {
        const s = loadDemo();
        ref.current = s;
        setState(s);
      }
    } catch {
      toast.error("Account connection is unavailable. The demo still works.");
    }
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      const s = loadDemo();
      ref.current = s;
      setState(s);
      await refreshGoogle();
      if (active) setReady(true);
    });
    return () => {
      active = false;
      room.leave();
    };
  }, [refreshGoogle, room]);
  useEffect(() => room.subscribe(setSnapshot), [room]);
  const id = state?.profile.id,
    classId = state?.profile.classId,
    mode = state?.mode,
    teacher = state?.teacher;
  useEffect(() => {
    const s = ref.current;
    if (s?.profile.mode === "demo") room.join(s.profile, s.messages);
    else room.leave();
    return () => room.leave();
  }, [id, classId, room]);
  useEffect(() => {
    if (mode !== undefined && teacher !== undefined)
      room.configure(mode, teacher);
  }, [mode, teacher, room]);
  const update = (fn: (s: DemoState) => DemoState) => {
    if (!ref.current) return;
    const old = ref.current,
      next = fn(old);
    commit(next);
    if (
      next.profile.mode === "google" &&
      JSON.stringify(next.pet) !== JSON.stringify(old.pet)
    ) {
      saveQueue.current = saveQueue.current
        .then(async () => {
          const r = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pet: next.pet }),
          });
          if (!r.ok) throw Error();
        })
        .catch(() => {
          toast.error(
            "Pet changes could not be saved to your account. Please retry.",
          );
        });
    }
  };
  return (
    <Context.Provider
      value={{
        state,
        ready,
        room,
        snapshot,
        google,
        refreshGoogle,
        update,
        start: (name, classId) => {
          const previous = loadDemo();
          const profile =
            previous?.profile.name === name &&
            previous.profile.classId === classId
              ? previous.profile
              : {
                  id: crypto.randomUUID(),
                  name,
                  classId,
                  mode: "demo" as const,
                };
          commit(
            previous?.profile.id === profile.id ? previous : seed(profile),
          );
        },
        care: (a) => {
          update((s) => ({ ...s, pet: applyCare(s.pet, a) }));
          chime();
        },
        reset: () => {
          if (ref.current?.profile.mode !== "demo") return;
          const s = seed(ref.current.profile);
          try {
            localStorage.removeItem(decorStorageKey(s.profile));
          } catch {
            toast.error("Could not clear room decorations from this device.");
          }
          commit(s);
          room.join(s.profile, s.messages);
          toast.success("Your demo has a fresh start.");
        },
        logout: async () => {
          if (ref.current?.profile.mode === "google") {
            const r = await fetch("/api/auth/logout", { method: "POST" });
            if (!r.ok) {
              toast.error("Could not sign out. Try again.");
              return;
            }
          }
          localStorage.removeItem("mashroom:active");
          ref.current = null;
          setState(null);
          setGoogle(null);
          room.leave();
          window.location.assign(`${staticDemo ? "/MashRoom" : ""}/login/`);
        },
      }}
    >
      {children}
      <Toaster position="bottom-right" richColors />
    </Context.Provider>
  );
}
export function useApp() {
  const v = useContext(Context);
  if (!v) throw Error("Missing app provider");
  return v;
}
