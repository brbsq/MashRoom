"use client";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Archive, Search, SlidersHorizontal, Shirt, Footprints, Glasses } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { isMashroomTee, type RoomieAppearance } from "@/lib/roomie";
import { demoInventory, filterInventory, inventoryCategories, type InventoryCategory, type InventoryFilter } from "@/lib/inventory";
import { DecorArt } from "./decor-art";
import { TeeThumbnail } from "./tee-layer";
import { SpecsThumbnail } from "./specs-layer";
import { isOriginalSpecs } from "@/lib/specs";
import styles from "./storeroom.module.css";
import { useApp } from "./provider";
import { useWallet } from "./use-wallet";

export function Storeroom({ open, onOpenChange, appearance, onDecorate }: { open: boolean; onOpenChange: (open:boolean) => void; appearance: RoomieAppearance; onDecorate: () => void }) {
  const {state}=useApp();
  const {wallet}=useWallet(state?.profile);
  const [category,setCategory]=useState<InventoryCategory>("All");
  const [query,setQuery]=useState("");
  const [filterOpen,setFilterOpen]=useState(false);
  const [surface,setSurface]=useState<InventoryFilter>("all");
  const [sort,setSort]=useState<"default" | "az" | "za">("default");
  const items=demoInventory(appearance,wallet?.owned,wallet?.colours), shown=filterInventory(items,category,query,surface,sort);
  function clear(){setQuery("");setCategory("All");setSurface("all");setSort("default");}
  // Inline translate avoids the CSS minifier folding `translate: none` away
  // and revealing DialogContent's default -50% centred translation.
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className={styles.fullScreen} overlayClassName={styles.backdrop} style={{translate:"none","--tw-translate-x":"0px","--tw-translate-y":"0px"} as CSSProperties}>
    <header className={styles.header}><span className={styles.logo}><Archive size={28}/></span><div><DialogTitle className={styles.title}>Storeroom</DialogTitle><DialogDescription>Your little collection, all in one place.</DialogDescription></div><span className={styles.demo}>Device-local demo</span></header>
    <div className={styles.inventory}>
      <div className={styles.toolbar}><label className={styles.search}><Search size={20}/><input type="search" aria-label="Search Storeroom" placeholder="Search your collection…" value={query} onChange={e=>setQuery(e.target.value)}/></label><Button variant="outline" aria-expanded={filterOpen} aria-controls="storeroom-filters" onClick={()=>setFilterOpen(v=>!v)}><SlidersHorizontal size={18}/> Filters{surface!=="all" ? " · 1" : ""}</Button></div>
      <nav className={styles.categories} aria-label="Inventory categories">{inventoryCategories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}<span>{c==="All" ? items.length : items.filter(item=>item.category===c).length}</span></button>)}</nav>
      {filterOpen && <section className={styles.filters} id="storeroom-filters" aria-label="Inventory filters"><label>Placement<select aria-label="Filter by placement" value={surface} onChange={e=>setSurface(e.target.value as InventoryFilter)}><option value="all">All items</option><option value="floor">Floor items</option><option value="wall">Wall items</option><option value="worn">Wearing now</option></select></label><label>Sort<select aria-label="Sort inventory" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="default">Default order</option><option value="az">Name: A–Z</option><option value="za">Name: Z–A</option></select></label><Button variant="ghost" onClick={clear}>Reset filters</Button></section>}
      <div className={styles.summary}><h2>{category === "All" ? "Your collection" : category}</h2><span role="status">{shown.length} {shown.length === 1 ? "item" : "items"}</span></div>
      <div className={styles.scroll}><ul className={styles.items}>{shown.map(item=>{
        const ClothingIcon=item.slot==="shoes" ? Footprints : item.slot==="accessories" ? Glasses : Shirt;
return <li key={item.id}><span className={styles.picture}>{item.kind ? <DecorArt kind={item.kind}/> : item.slot&&isOriginalSpecs(item.slot,item.index??appearance.selection[item.slot])?<SpecsThumbnail label={item.name} colour={item.colour}/>:item.slot&&isMashroomTee(item.slot,item.index??appearance.selection[item.slot])?<TeeThumbnail label={item.name} colour={item.colour}/>:<ClothingIcon size={60} style={{color:item.colour}}/>}</span><strong>{item.name}</strong><small>{item.surface === "worn" ? `Current outfit · ${item.slot}` : item.surface==="stored"?"In your wardrobe":`${item.surface === "wall" ? "Wall" : "Floor"} · ${item.category}`}</small><span className={styles.tag}>{item.surface === "worn" ? "Wearing" : item.purchased?"In collection":"Free starter"}</span></li>;
      })}</ul>{!shown.length && <div className={styles.empty}><Archive size={44}/><h3>No matching items</h3><p>Try another search, category or placement.</p><Button variant="outline" onClick={clear}>Clear search & filters</Button></div>}</div>
      <footer className={styles.footer}><p>Starter items, saved outfit & Shop collection. Arcade wallet: {wallet?.tokens??0} tokens. Device-local demo.</p><div><Button variant="outline" onClick={onDecorate}>Decorate room</Button><Button variant="outline" asChild><Link href="/closet" onClick={()=>{try{sessionStorage.setItem("mashroom:return-room","1");}catch{}}}>Open Wardrobe</Link></Button></div></footer>
    </div>
  </DialogContent></Dialog>;
}
