export type MapStyle = "town" | "city";
export type MapMode = "full" | "overlay";
export type MapDestination = {
  id: string;
  name: string;
  description: string;
  category: "Home" | "Learn" | "Play" | "Shop";
  href?: string;
  positions: Record<MapStyle, [number, number]>;
};
export type MapDistrict = { id: string; name: string; available: boolean };
export const mapDistricts: MapDistrict[] = [
  { id: "roomie", name: "Roomie Quarter", available: true },
  { id: "garden", name: "Garden District", available: false },
  { id: "riverside", name: "Riverside District", available: false },
];
export const mapVariants = [
  { id: "H", name: "Town plan", style: "town", mode: "full", districts: false, note: "A walkable neighbourhood, with room to breathe." },
  { id: "I", name: "Town overlay", style: "town", mode: "overlay", districts: false, note: "Your neighbourhood, a little closer to home." },
  { id: "J", name: "Downtown", style: "city", mode: "full", districts: false, note: "City blocks, tram lines and a shared meeting place." },
  { id: "K", name: "City districts", style: "city", mode: "full", districts: true, note: "A growing city, one neighbourhood at a time." },
] as const;
export const mapDestinations: MapDestination[] = [
  { id: "home", name: "Home", description: "A familiar place to rest and care for your pet.", category: "Home", href: "/pet", positions: { town: [13, 28], city: [13, 25] } },
  { id: "plaza", name: "Student plaza", description: "Meet your classmates, share a hello and explore together.", category: "Play", href: "/plaza", positions: { town: [45, 51], city: [47, 49] } },
  { id: "school", name: "School", description: "Visit your classroom and find something new to learn.", category: "Learn", href: "/classroom", positions: { town: [62, 29], city: [27, 66] } },
  { id: "park", name: "Park", description: "A little fresh air and a green place to play. This destination is on its way.", category: "Play", positions: { town: [13, 71], city: [36, 25] } },
  { id: "store", name: "Store", description: "A future home for new finds and pet accessories.", category: "Shop", positions: { town: [41, 81], city: [60, 28] } },
  { id: "cafe", name: "Café", description: "A cosy corner for a break. Opening in a future update.", category: "Shop", positions: { town: [54, 81], city: [65, 55] } },
  { id: "gym", name: "Gym", description: "A place to get moving. Coming in a future update.", category: "Play", positions: { town: [76, 76], city: [70, 80] } },
];
