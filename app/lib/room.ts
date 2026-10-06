import type {
  ChatMessage,
  ChatMode,
  RoomParticipant,
  StudentProfile,
} from "./types";
import { phrases } from "./demo";
export type RoomSnapshot = {
  status: "disconnected" | "connected";
  participants: RoomParticipant[];
  messages: ChatMessage[];
};
export interface RoomTransport {
  join(profile: StudentProfile, messages: ChatMessage[]): void;
  leave(): void;
  subscribe(listener: (state: RoomSnapshot) => void): () => void;
  move(x: number, y: number): void;
  emote(text: string): void;
  send(text: string, kind: ChatMessage["kind"]): void;
  remove(id: string): void;
  configure(mode: ChatMode, teacher: boolean): void;
}
export class LocalRoom implements RoomTransport {
  private state: RoomSnapshot = {
    status: "disconnected",
    participants: [],
    messages: [],
  };
  private listeners = new Set<(s: RoomSnapshot) => void>();
  private profile: StudentProfile | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private ticker: ReturnType<typeof setInterval> | null = null;
  private mode: ChatMode = "both";
  private teacher = false;
  private lastSent = 0;
  constructor(private persist: (messages: ChatMessage[]) => void) {}
  setPersistence(persist: (messages: ChatMessage[]) => void) {
    this.persist = persist;
  }
  subscribe(fn: (s: RoomSnapshot) => void) {
    this.listeners.add(fn);
    fn(this.state);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.state = {
      ...this.state,
      participants: [...this.state.participants],
      messages: [...this.state.messages],
    };
    this.listeners.forEach((fn) => fn(this.state));
  }
  join(profile: StudentProfile, messages: ChatMessage[]) {
    this.leave();
    this.profile = profile;
    this.lastSent = 0;
    this.state = {
      status: "connected",
      messages: messages.filter((m) => m.classId === profile.classId),
      participants: [
        {
          id: profile.id,
          name: profile.name,
          x: 50,
          y: 70,
          hue: 0,
          simulated: false,
        },
        {
          id: "bot-luna",
          name: "Luna",
          x: 31,
          y: 64,
          hue: 75,
          simulated: true,
        },
        { id: "bot-kai", name: "Kai", x: 70, y: 58, hue: 175, simulated: true },
        {
          id: "bot-aria",
          name: "Aria",
          x: 65,
          y: 82,
          hue: 300,
          simulated: true,
        },
      ],
    };
    this.emit();
    this.ticker = setInterval(() => {
      this.state.participants = this.state.participants.map((p) =>
        p.simulated
          ? {
              ...p,
              x: Math.max(20, Math.min(80, p.x + (Math.random() - 0.5) * 8)),
              y: Math.max(52, Math.min(84, p.y + (Math.random() - 0.5) * 6)),
            }
          : p,
      );
      this.emit();
    }, 6500);
  }
  leave() {
    if (this.ticker) clearInterval(this.ticker);
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.profile = null;
    this.state = { status: "disconnected", participants: [], messages: [] };
    this.emit();
  }
  configure(mode: ChatMode, teacher: boolean) {
    this.mode = mode;
    this.teacher = teacher;
  }
  move(x: number, y: number) {
    if (!this.profile || !Number.isFinite(x) || !Number.isFinite(y)) return;
    this.state.participants = this.state.participants.map((p) =>
      p.id === this.profile!.id
        ? {
            ...p,
            x: Math.max(12, Math.min(88, x)),
            y: Math.max(50, Math.min(88, y)),
          }
        : p,
    );
    this.emit();
  }
  private bubble(id: string, text: string) {
    this.state.participants = this.state.participants.map((p) =>
      p.id === id ? { ...p, bubble: text } : p,
    );
    const timer = setTimeout(() => {
      this.state.participants = this.state.participants.map((p) =>
        p.id === id && p.bubble === text ? { ...p, bubble: undefined } : p,
      );
      this.emit();
      this.timers = this.timers.filter((t) => t !== timer);
    }, 5000);
    this.timers.push(timer);
  }
  private append(message: ChatMessage) {
    this.state.messages = [...this.state.messages, message].slice(-100);
    this.bubble(message.senderId, message.text);
    this.persist(this.state.messages);
    this.emit();
  }
  send(text: string, kind: ChatMessage["kind"] = "text") {
    if (!this.profile) throw Error("Enter the demo first.");
    text = text.trim();
    if (!text || text.length > 200)
      throw Error("Write a message between 1 and 200 characters.");
    if (kind === "phrase" && !phrases.includes(text))
      throw Error("Choose a quick phrase.");
    if (kind === "emote" && !["👋", "💚", "✨"].includes(text))
      throw Error("Choose an emote.");
    if (this.mode === "phrases" && kind === "text")
      throw Error("Your class is using quick phrases only.");
    if (Date.now() - this.lastSent < 800)
      throw Error("One moment before the next message.");
    this.lastSent = Date.now();
    this.append({
      id: crypto.randomUUID(),
      classId: this.profile.classId,
      senderId: this.profile.id,
      name: this.profile.name,
      text,
      kind,
      createdAt: Date.now(),
    });
    const roomId = this.profile.classId;
    const timer = setTimeout(() => {
      if (this.profile?.classId !== roomId) return;
      this.append({
        id: crypto.randomUUID(),
        classId: roomId,
        senderId: "bot-luna",
        name: "Luna",
        text:
          kind === "emote"
            ? "💚"
            : "So happy you're here! Let's explore together. 🌱",
        kind: kind === "emote" ? "emote" : "text",
        createdAt: Date.now(),
      });
      this.timers = this.timers.filter((t) => t !== timer);
    }, 1600);
    this.timers.push(timer);
  }
  emote(text: string) {
    this.send(text, "emote");
  }
  remove(id: string) {
    if (!this.teacher)
      throw Error("Enable demo teacher tools to remove a message.");
    const message = this.state.messages.find((m) => m.id === id);
    this.state.messages = this.state.messages.map((m) =>
      m.id === id
        ? { ...m, removed: true, text: "Message removed by demo teacher" }
        : m,
    );
    if (message)
      this.state.participants = this.state.participants.map((p) =>
        p.id === message.senderId ? { ...p, bubble: undefined } : p,
      );
    this.persist(this.state.messages);
    this.emit();
  }
}
