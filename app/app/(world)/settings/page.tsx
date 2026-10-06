"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Link2, Shield, RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/mashroom/provider";
import { AdoptPet } from "@/components/mashroom/google-controls";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export default function Settings() {
  const { state, google, update, reset, refreshGoogle } = useApp();
  const [sound, setSound] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void Promise.resolve().then(() =>
      setSound(localStorage.getItem("mashroom:sound") === "true"),
    );
    const status = new URLSearchParams(location.search).get("connection");
    if (status)
      toast.info(
        status === "cancelled"
          ? "Google connection cancelled. Nothing changed."
          : status === "wrong-account"
            ? "Please choose the same Google account you used to sign in."
            : status === "denied"
              ? "Classroom permissions were not granted. You can reconnect when ready."
              : "Connection updated.",
      );
  }, []);
  if (!state) return null;
  const connect = () => {
    if (!google?.configured) {
      toast.info(
        "Google setup is pending. See the project README to configure credentials.",
      );
      return;
    }
    location.assign(new URL("/api/auth/google/start", location.origin));
  };
  const disconnect = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/classroom/disconnect", { method: "POST" });
      const d = (await r.json()) as { error?: string };
      if (!r.ok) throw Error(d.error);
      await refreshGoogle();
      toast.success("Classroom access disconnected.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>The little details</h1>
          <p>Your profile, connections, and classroom preferences.</p>
        </div>
      </div>
      <AdoptPet />
      <div className="settings-grid">
        <section className="glass settings-card">
          <h2>
            <Link2 size={19} /> Google account
          </h2>
          <p>
            Quick access when you want it. Your demo works perfectly without it.
          </p>
          <span className="status-label">
            {google?.user
              ? `Connected as ${google.user.name}`
              : google?.configured
                ? "Ready to connect"
                : "Setup pending · demo available"}
          </span>
          {!google?.user && (
            <div className="config-actions">
              <Button
                variant="outline"
                className="google-button"
                onClick={connect}
              >
                <span className="google-g">G</span>Link Google account
              </Button>
            </div>
          )}
          <p className="inline-note">
            Existing Google profiles are kept when you sign in. New profiles can
            bring along a demo pet, without sample points or badges.
          </p>
        </section>
        <section className="glass settings-card">
          <h2>
            <BookOpen size={19} /> Google Classroom
          </h2>
          <p>
            Teachers can bring classes, students, and assignments into MashRoom.
          </p>
          <span className="status-label">
            {google?.classroom === "connected"
              ? "Classroom connected"
              : google?.classroom === "expired"
                ? "Access expired · reconnect needed"
                : "Not connected"}
          </span>
          <div className="config-actions">
            <Button asChild variant="outline">
              <Link href="/settings/classroom">Manage Classroom</Link>
            </Button>
            {google?.classroom !== "disconnected" && google?.user && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => void disconnect()}
              >
                {busy ? "Disconnecting…" : "Disconnect"}
              </Button>
            )}
          </div>
          <p className="inline-note">
            Disconnecting stops future Google imports. Existing imported class
            records remain available to verified members.
          </p>
        </section>
        <section className="glass settings-card">
          <h2>
            <Shield size={19} /> Demo teacher tools
          </h2>
          <p>
            Try the class controls with simulated students. These do not grant
            access to real classrooms.
          </p>
          {state.profile.mode === "demo" ? (
            <>
              <div className="setting-row">
                <label htmlFor="teacher-tools">
                  Teacher preview<small>Enable demo chat moderation</small>
                </label>
                <Switch
                  id="teacher-tools"
                  checked={state.teacher}
                  onCheckedChange={(teacher) =>
                    update((s) => ({ ...s, teacher }))
                  }
                />
              </div>
              {state.teacher && (
                <>
                  <label className="small" htmlFor="chat-mode">
                    Class chat mode
                  </label>
                  <Select
                    value={state.mode}
                    onValueChange={(mode) =>
                      update((s) => ({
                        ...s,
                        mode: mode as "phrases" | "both",
                      }))
                    }
                  >
                    <SelectTrigger id="chat-mode" className="form-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">
                        Quick phrases and typing
                      </SelectItem>
                      <SelectItem value="phrases">
                        Quick phrases only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="inline-note">
                    Remove messages from the class chat. Reports appear below.
                  </p>
                  <h3 className="small">
                    Reported messages ({state.reports.length})
                  </h3>
                  {state.reports.length ? (
                    state.messages
                      .filter((m) => state.reports.includes(m.id))
                      .map((m) => (
                        <div className="report-list" key={m.id}>
                          <strong>{m.name}</strong>: {m.text}
                        </div>
                      ))
                  ) : (
                    <p className="inline-note">
                      No reports. Let’s keep it kind.
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="inline-note">
              These tools are only available in the demo.
            </p>
          )}
        </section>
        <section className="glass settings-card">
          <h2>
            <Volume2 size={19} /> Your preferences
          </h2>
          <div className="setting-row">
            <label htmlFor="sound">
              Gentle sound effects<small>Off by default</small>
            </label>
            <Switch
              id="sound"
              checked={sound}
              onCheckedChange={(v) => {
                setSound(v);
                localStorage.setItem("mashroom:sound", String(v));
              }}
            />
          </div>
          <h3 className="small">Muted classmates</h3>
          {state.muted.length ? (
            state.muted.map((id) => (
              <div className="setting-row" key={id}>
                <span className="small">{id.replace("bot-", "")}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      muted: s.muted.filter((x) => x !== id),
                    }))
                  }
                >
                  Unmute
                </Button>
              </div>
            ))
          ) : (
            <p className="inline-note">No muted classmates.</p>
          )}
          {state.profile.mode === "demo" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw size={15} /> Reset this demo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>A fresh little start?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This resets your current demo pet, class messages, and
                    moderation settings on this device. Your display name stays
                    the same.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my progress</AlertDialogCancel>
                  <AlertDialogAction onClick={reset}>
                    Reset demo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </section>
      </div>
    </>
  );
}
