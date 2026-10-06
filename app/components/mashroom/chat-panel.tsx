"use client";
import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Flag,
  VolumeX,
  Trash2,
  Smile,
} from "lucide-react";
import { useApp } from "./provider";
import { phrases } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const { state, room, snapshot, update } = useApp();
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [snapshot.messages.length]);
  if (!state) return null;
  if (state.profile.mode !== "demo")
    return (
      <section className="glass empty-panel">
        <MessageCircle />
        <h2>Your class conversation</h2>
        <p>
          Live class chat will be available when the multiplayer service is
          connected. Try the demo from the login page to explore the experience.
        </p>
      </section>
    );
  const send = (value: string, kind: "text" | "phrase" | "emote") => {
    try {
      room.send(value, kind);
      setText("");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <section className={`glass chat-panel ${compact ? "compact" : ""}`}>
      <div className="chat-heading">
        <div>
          <MessageCircle size={18} />
          <strong>Class conversation</strong>
        </div>
        <span className="tiny-label">DEMO</span>
      </div>
      <div
        className="chat-messages"
        role="log"
        aria-label="Class messages"
        aria-live="polite"
      >
        {snapshot.messages
          .filter((m) => !state.muted.includes(m.senderId))
          .map((m) => (
            <article
              key={m.id}
              className={`message ${m.senderId === state.profile.id ? "own" : ""}`}
            >
              <div className="message-avatar">{m.name[0]}</div>
              <div className="message-body">
                <div className="message-meta">
                  <strong>
                    {m.name}
                    {m.senderId === state.profile.id ? " · you" : ""}
                  </strong>
                  <small>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
                <p className={m.removed ? "removed" : ""}>{m.text}</p>
                {!m.removed && (
                  <div className="message-tools">
                    {m.senderId !== state.profile.id && (
                      <>
                        <button
                          aria-label={`Report message from ${m.name}`}
                          onClick={() => {
                            update((s) => ({
                              ...s,
                              reports: [...new Set([...s.reports, m.id])],
                            }));
                            toast.success("Report saved for the demo teacher.");
                          }}
                        >
                          <Flag size={12} />
                          {state.reports.includes(m.id) ? "Reported" : "Report"}
                        </button>
                        <button
                          aria-label={`Mute ${m.name}`}
                          onClick={() => {
                            update((s) => ({
                              ...s,
                              muted: [...new Set([...s.muted, m.senderId])],
                            }));
                            toast.success(
                              `${m.name} is muted. Unmute in Settings.`,
                            );
                          }}
                        >
                          <VolumeX size={12} />
                          Mute
                        </button>
                      </>
                    )}
                    {state.teacher && (
                      <button
                        aria-label={`Remove message from ${m.name}`}
                        onClick={() => room.remove(m.id)}
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        <div ref={bottom} />
      </div>
      <div className="chat-compose">
        <div className="quick-phrases">
          {phrases.map((p) => (
            <button key={p} onClick={() => send(p, "phrase")}>
              {p}
            </button>
          ))}
        </div>
        <div className="emote-row">
          <span>
            <Smile size={14} /> Say it with a little feeling
          </span>
          {["👋", "💚", "✨"].map((e) => (
            <Button
              key={e}
              variant="ghost"
              size="icon"
              aria-label={`Send ${e} emote`}
              onClick={() => send(e, "emote")}
            >
              {e}
            </Button>
          ))}
        </div>
        {state.mode === "both" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text, "text");
            }}
          >
            <Input
              aria-label="Message your class"
              placeholder="A kind word for your class…"
              maxLength={200}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!text.trim()}
              aria-label="Send message"
            >
              <Send size={17} />
            </Button>
          </form>
        ) : (
          <p className="muted small">This class is using quick phrases only.</p>
        )}
        <small className="chat-note">
          Be kind. You’re sharing this little world.
        </small>
      </div>
    </section>
  );
}
