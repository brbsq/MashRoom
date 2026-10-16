import type { StudentProfile } from "./types";

export function formatPhoneClock(now:Date) {
  const time=`${String(now.getHours()%12||12).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")} ${now.getHours()<12?"a.m.":"p.m."}`;
  const date=`${String(now.getDate()).padStart(2,"0")} ${now.toLocaleDateString("en-GB",{month:"long"})}`;
  return {time,date};
}
export type PhoneSwipe = { x:number;y:number;lastAt:number;locked:boolean };
export const emptyPhoneSwipe = ():PhoneSwipe=>({x:0,y:0,lastAt:0,locked:false});
export function trackPhoneSwipe(previous:PhoneSwipe,dx:number,dy:number,now:number) {
  const state=now-previous.lastAt>220?emptyPhoneSwipe():{...previous};
  state.lastAt=now;
  if(state.locked)return {state,direction:0};
  state.x+=dx;state.y+=dy;
  const dominant=Math.abs(state.x)>=Math.abs(state.y)?state.x:state.y;
  if(Math.abs(dominant)>=48){state.locked=true;return {state,direction:Math.sign(dominant)};}
  return {state,direction:0};
}
export const swipePage=(page:number,direction:number,count=phoneAppPages.length)=>(page+direction+count)%count;

type PhoneApp = { name: string; icon: string; href?: string };
export const phoneAppPages: PhoneApp[][] = [
  [
    { name: "Study", icon: "92859.svg", href: "/classroom" },
    { name: "Notes", icon: "6fb50.svg" },
    { name: "History", icon: "8027d.svg" },
    { name: "Food", icon: "dccd9.svg" },
    { name: "Map", icon: "c03f8.svg", href: "/map" },
    { name: "Shop", icon: "c7e81.svg", href: "/shop" },
    { name: "Bank", icon: "31c32.svg" },
    { name: "Wallet", icon: "42289.svg" },
    { name: "Wardrobe", icon: "54242.svg", href: "/closet" },
  ],
  [
    { name: "Storeroom", icon: "storeroom.svg" },
    { name: "Maker", icon: "maker.svg", href: "/roomie-maker" },
  ],
];

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
