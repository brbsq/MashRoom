export type StudentProfile = {
  id: string;
  name: string;
  classId: string;
  mode: "demo" | "google";
};
export type PetState = {
  name: string;
  stage: "Baby";
  hunger: number;
  hygiene: number;
  happiness: number;
  energy: number;
  bladder: number;
  health: number;
  color: string;
};
export type Classroom = {
  id: string;
  name: string;
  section?: string;
  imported?: boolean;
};
export type RoomParticipant = {
  id: string;
  name: string;
  x: number;
  y: number;
  hue: number;
  simulated: boolean;
  bubble?: string;
};
export type ChatMessage = {
  id: string;
  classId: string;
  senderId: string;
  name: string;
  text: string;
  createdAt: number;
  kind: "text" | "phrase" | "emote";
  removed?: boolean;
};
export type GoogleConnection = {
  configured: boolean;
  user: { id: string; name: string; pet: PetState | null } | null;
  classroom: "disconnected" | "connected" | "expired";
  canAdopt: boolean;
};
export type CareAction =
  | "feed"
  | "shower"
  | "play"
  | "sleep"
  | "toilet"
  | "rest";
export type ChatMode = "phrases" | "both";
export type DemoState = {
  version: 1;
  profile: StudentProfile;
  pet: PetState;
  messages: ChatMessage[];
  mode: ChatMode;
  teacher: boolean;
  muted: string[];
  reports: string[];
};
export type Assignment = {
  id: string;
  title: string;
  description: string;
  due: string | null;
  url: string;
  courseName: string;
};
