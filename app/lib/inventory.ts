import { decorCatalog, isStarterDecor, type DecorKind } from "./room-decor";
import { shopCatalogue } from "./shop";
import { clothingSlots, options, appearanceItemColour, type AppearanceSlot, type RoomieAppearance } from "./roomie";

export const inventoryCategories = ["All", "Furniture", "Decorations", "Clothing"] as const;
export type InventoryCategory = typeof inventoryCategories[number];
export type InventoryItem = { id: string; name: string; category: Exclude<InventoryCategory,"All">; surface: "floor" | "wall" | "worn" | "stored"; kind?: DecorKind; slot?: AppearanceSlot; index?:number; colour?: string; purchased?:boolean };
export type InventoryFilter = "all" | "floor" | "wall" | "worn";
export function demoInventory(appearance: RoomieAppearance, owned:readonly string[]=[], colours:Record<string,string>={}): InventoryItem[] {
  return [
    ...decorCatalog.filter(item=>isStarterDecor(item.id)||owned.includes(item.id)).map(item => ({ id:item.id, name:item.name, category:item.category, surface:item.surface, kind:item.id, purchased:!isStarterDecor(item.id) })),
    ...shopCatalogue.filter(item=>item.slot&&owned.includes(item.id)).map(item=>({id:`shop:${item.id}`,name:item.name,category:"Clothing" as const,surface:"stored" as const,slot:item.slot,index:item.index,colour:colours[item.id]||item.colours?.[0],purchased:true})),
    ...clothingSlots.map(slot => ({ id:`outfit:${slot}`, name:options[slot][appearance.selection[slot]], category:"Clothing" as const, surface:"worn" as const, slot, colour:appearanceItemColour(appearance,slot) })),
  ];
}
export function filterInventory(items: InventoryItem[], category: InventoryCategory, query: string, surface: InventoryFilter, sort: "default" | "az" | "za") {
  const needle=query.trim().toLowerCase();
  const result=items.filter(item => (category === "All" || item.category === category) && (surface === "all" || item.surface === surface) && `${item.name} ${item.category} ${item.slot || ""}`.toLowerCase().includes(needle));
  return sort === "default" ? result : result.sort((a,b) => a.name.localeCompare(b.name)*(sort === "az" ? 1 : -1));
}
