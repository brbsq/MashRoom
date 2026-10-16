import type { StudentProfile } from "./types";
export const neighbourhoods = ["Mashville Park", "Academy Heights", "City Square", "Cinnamon Cove", "Pantai Walk"] as const;
export type Neighbourhood = typeof neighbourhoods[number];
export type MapLocation = { id: string; name: string; category: string; description: string; address: string; hours: string; href?: string; metro?: boolean; open?: boolean };
export const mapLocations: MapLocation[] = [
  { id: "boutique", name: "Adadas", category: "boutique", description: "Your one-stop paradise for sports apparel.", address: "20, Magnolia Avenue", hours: "10 a.m. - 10 p.m.", open: false },
  { id: "metro", name: "Metro station", category: "transport", description: "Take the Mashville Metro to your next neighbourhood.", address: "Magnolia Avenue Station", hours: "Demo service · always available", metro: true, open: true },
  { id: "home", name: "Home", category: "your room", description: "A familiar place to rest and care for your Roomie.", address: "Roomie Lane", hours: "Always available", href: "/pet", open: true },
  { id: "plaza", name: "Student plaza", category: "class space", description: "Meet simulated classmates and share a hello.", address: "Community Square", hours: "Always available", href: "/plaza", open: true },
  { id: "school", name: "School", category: "learning", description: "Explore your sample class activities.", address: "Academy Road", hours: "Always available", href: "/classroom", open: true },
];
export const locationImages: Record<string,string> = { boutique: "/creation/aeb51.png", metro: "/creation/6f910.png", home: "/rooms/3551a.png", plaza: "/plaza.png", school: "/rooms/92859.svg" };
export const mapStorageKey = (p?: StudentProfile) => `mashroom:map:v1:${p ? `${p.mode}:${encodeURIComponent(p.id)}:${encodeURIComponent(p.classId)}` : "guest"}`;
export function readNeighbourhood(value: string | null): Neighbourhood { return neighbourhoods.includes(value as Neighbourhood) ? value as Neighbourhood : "City Square"; }
