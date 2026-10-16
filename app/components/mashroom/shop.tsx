"use client";
import { useEffect, useRef, useState } from "react";
import { Armchair, ArrowLeft, ArrowUpRight, Check, Coins, Ticket, Gamepad2, Search, Shirt, SlidersHorizontal, Sparkles, Sprout, Star } from "lucide-react";
import { assetHref } from "@/lib/asset";
import { filterShop, readShopSaved, shopCatalogue, shopCategories, shopPreview, shopStorageKey, type ShopCategory, type ShopItem } from "@/lib/shop";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "./provider";
import { useRoomie } from "./use-roomie";
import { useSceneNavigation } from "./use-scene-navigation";
import { RoomieRenderer } from "./roomie-renderer";
import { DecorArt } from "./decor-art";
import { TeeThumbnail } from "./tee-layer";
import { SpecsThumbnail } from "./specs-layer";
import { ArcadeTokenArt } from "./arcade-token-art";
import { useWallet } from "./use-wallet";
import type { ShopReceipt } from "@/lib/wallet";
import styles from "./shop.module.css";

const categoryIcons = { All: Sparkles, Clothing: Shirt, Furniture: Armchair, Decorations: Sprout, "Arcade Tokens":Gamepad2, Saved: Star };
function ProductArt({ item, colour }: { item: ShopItem; colour?: string }) {
  return item.tokens?<ArcadeTokenArt count={item.tokens}/>:item.kind ? <svg viewBox="0 0 200 200" aria-hidden="true"><DecorArt kind={item.kind} /></svg> : item.slot === "tops" ? <TeeThumbnail label={item.name} colour={colour || item.colours?.[0]} /> : <SpecsThumbnail label={item.name} colour={colour || item.colours?.[0]} />;
}

export function Shop() {
  const { state, ready } = useApp();
  const { appearance } = useRoomie(state?.profile, state?.pet.name);
  const {wallet,error:walletError,purchase}=useWallet(state?.profile);
  const { leaving, navigate } = useSceneNavigation();
  const [category, setCategory] = useState<ShopCategory>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "az">("featured");
  const [selectedId, setSelectedId] = useState("lamp");
  const [colours, setColours] = useState<Record<string,string>>({});
  const [facing, setFacing] = useState<"front" | "left" | "right">("front");
  const [saved, setSaved] = useState<string[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [order,setOrder]=useState<{itemId:string;colour?:string;revision:number;requestId:string}|null>(null);
  const [buying,setBuying]=useState(false),[purchaseError,setPurchaseError]=useState("");
  const [receipt,setReceipt]=useState<ShopReceipt|null>(null),[walletOpen,setWalletOpen]=useState(false);
  const canvas = useRef<HTMLElement>(null);
  const storageKey = state ? shopStorageKey(state.profile) : null;
  useEffect(() => {
    try { setSaved(readShopSaved(storageKey ? localStorage.getItem(storageKey) : null)); }
    catch { setSaved([]); setNotice("Your saved finds are available for this visit only."); }
    setLoadedKey(storageKey);
  }, [storageKey]);
  const selected = shopCatalogue.find(item => item.id === selectedId)!;
  const colour = colours[selected.id] || selected.colours?.[0];
  const preview = shopPreview(appearance, selected, colour);
  const shown = filterShop(category, query, saved, sort);
  const starred = saved.includes(selected.id);
  const owned=Boolean(wallet?.owned.includes(selected.id));
  const canAfford=Boolean(wallet&&wallet.points>=selected.price);
  const orderItem=order?shopCatalogue.find(item=>item.id===order.itemId):null;
  function beginPurchase() {
    if(!state){go("/login");return;}
    if(!wallet)return;
    setPurchaseError("");setReceipt(null);
    setOrder({itemId:selected.id,colour,revision:wallet.revision,requestId:crypto.randomUUID()});
  }
  async function confirmPurchase() {
    if(!order||buying)return;
    setBuying(true);setPurchaseError("");
    try {const result=await purchase(order.itemId,order.requestId,order.revision,order.colour);setReceipt(result);setOrder(null);setNotice(`${result.name} added. ${result.balance} demo points remaining.`);}
    catch(reason){setPurchaseError(reason instanceof Error?reason.message:"Could not save this purchase. No points were changed.");}
    finally{setBuying(false);}
  }
  function toggleSaved(id: string) {
    if (loadedKey !== storageKey) return;
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
    setSaved(next);
    try {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      setNotice(next.includes(id) ? `Saved ${shopCatalogue.find(item => item.id === id)!.name}${storageKey ? " on this device" : " for this visit"}.` : "Removed from saved finds.");
    } catch { setNotice("Kept for this visit only; this browser could not save your finds."); }
  }
  function go(href: string) {
    try { sessionStorage.setItem("mashroom:return-room", "1"); } catch {}
    navigate(href);
  }
  function resetFilters() { setQuery(""); setCategory("All"); setSort("featured"); }
  function selectItem(item: ShopItem) {
    setSelectedId(item.id); setFacing("front");
    setNotice(`Previewing ${item.name}. Your saved outfit is unchanged.`);
    // On phones the preview is above the catalogue, so bring it back into view.
    if (matchMedia("(max-width:720px)").matches) canvas.current?.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "instant" : "smooth" });
  }
  if (!ready) return <main className="center-page">Opening the little shop…</main>;
  return <main ref={canvas} className={styles.shop} data-leaving={leaving} inert={leaving} aria-label="MashRoom Shop" style={{ backgroundImage: `url(${assetHref("/creation/233ad.png")})` }}>
    <header className={styles.header}>
      <div className={styles.brand}><img src={assetHref("/creation/cbbb1.png")} alt="MashRoom" /><h1>SHOP</h1><button className={styles.wallet} aria-label="Open demo wallet and receipts" onClick={()=>setWalletOpen(true)}><span><Coins size={16}/>{wallet?.points??"—"}<small>points</small></span><span><Ticket size={16}/>{wallet?.tokens??0}<small>tokens</small></span></button></div>
      <nav className={styles.categories} aria-label="Shop categories">{shopCategories.map(value => {
        const Icon = categoryIcons[value];
        return <button type="button" key={value} aria-pressed={category === value} onClick={() => {setCategory(value);if(value==="Arcade Tokens")selectItem(shopCatalogue.find(item=>item.id==="tokens-5")!);}}><Icon size={23} aria-hidden="true" /><span>{value}</span>{value === "Saved" && saved.length > 0 && <small>{saved.length}</small>}</button>;
      })}</nav>
    </header>
    <section className={styles.preview} aria-label="Selected item preview">
      <div className={styles.previewHeading}><span className={styles.eyebrow}>{selected.tokens?"A pocketful of play":selected.kind ? "A little room refresh" : "Made for your Roomie"}</span><span className={styles.previewPill}>{selected.tokens?`${wallet?.tokens??0} tokens in wallet`:selected.kind ? "Item preview" : "Try it on"}</span></div>
      <div className={styles.stage} data-decor={Boolean(selected.kind)}>
        {selected.kind||selected.tokens ? <div className={styles.decorPreview}><ProductArt item={selected} /></div> : <RoomieRenderer appearance={preview} facing={facing} label="Shop Roomie preview" />}
        <span className={styles.stageShadow} />
        {!selected.kind&&!selected.tokens && <div className={styles.angles} aria-label="Preview direction">{(["left", "front", "right"] as const).map(pose => <button key={pose} aria-label={`Preview ${pose}`} aria-pressed={facing === pose} onClick={() => setFacing(pose)}>{pose === "front" ? "Front" : pose === "left" ? "Left" : "Right"}</button>)}</div>}
      </div>
      <div className={styles.detail}>
        <span className={styles.eyebrow}>{selected.brand}</span><h2>{selected.name}</h2><p>{selected.description}</p>
        {selected.colours && <div className={styles.colours} aria-label="Preview colours">{selected.colours.map(value => <button key={value} aria-label={`Preview colour ${value}`} aria-pressed={colour === value} style={{ backgroundColor: value }} onClick={() => setColours(previous => ({...previous, [selected.id]: value}))}>{colour === value && <Check size={15} aria-hidden="true" />}</button>)}<span>Just trying things on</span></div>}
        <div className={styles.detailActions}><button className={styles.primary} disabled={Boolean(state&&!owned&&(!wallet||!canAfford))} onClick={()=>owned?go(selected.kind?"/pet?inventory=1":"/closet"):beginPurchase()}>{owned?(selected.kind?"Open Storeroom":"Open Wardrobe"):!state?"Enter demo to buy":`Buy · ${selected.price} points`}{owned?<ArrowUpRight size={18} aria-hidden="true"/>:<Coins size={17} aria-hidden="true"/>}</button><button className={styles.savePreview} aria-label={starred ? "Unsave selected item" : "Save selected item"} aria-pressed={starred} onClick={() => toggleSaved(selected.id)}><Star size={21} aria-hidden="true" /></button></div>
        <p className={styles.purchaseNote}>{walletError||(!state?"Enter the demo to use a local wallet.":owned?"In your collection · no need to buy again":!wallet?"Opening your local wallet…":!canAfford?`You need ${selected.price-wallet.points} more demo points.`:selected.tokens?"Points only · no real money · game redemption coming later":"One-time purchase · added to your Storeroom")}</p>
      </div>
    </section>
    <section className={styles.catalogue} aria-label="Shop catalogue">
      <div className={styles.collectionHeading}><div><span className={styles.eyebrow}>{category==="Arcade Tokens"?"A little more play":"The little collection"}</span><h2>{category === "All" ? "Find your next favourite" : category === "Saved" ? "Your saved finds" : category}</h2></div><span className={styles.count} role="status">{shown.length} {shown.length === 1 ? "find" : "finds"}</span></div>
      {category==="Arcade Tokens"&&<p className={styles.arcadeNote}>Trade demo points for tokens. Packs can be bought again; arcade games aren’t connected yet.</p>}
      <div className={styles.toolbar}><label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" aria-label="Search shop" placeholder="A little something in mind?" value={query} onChange={event => setQuery(event.target.value)} /></label><button aria-label="Filter shop" className={styles.filter} onClick={() => setFilterOpen(true)}><SlidersHorizontal size={19} aria-hidden="true" />{sort !== "featured" && <span className={styles.filterDot} />}</button></div>
      <div className={styles.scroll}><div className={styles.cards}>{shown.map(item => <article key={item.id} className={styles.card} data-selected={selected.id === item.id}>
        <img className={styles.cardSurface} src={assetHref("/creation/6d690.svg")} alt="" />
        <button className={styles.product} aria-label={`Preview ${item.name}`} aria-pressed={selected.id === item.id} onClick={() => selectItem(item)}><span className={styles.productArt}><ProductArt item={item} colour={colours[item.id]} /></span><span className={styles.productBrand}>{item.brand}</span><strong>{item.name}</strong><span className={styles.tag}>{wallet?.owned.includes(item.id)?"✓ In collection":`${item.price} points · ${item.tag}`}</span></button>
        <button className={styles.star} aria-label={`${saved.includes(item.id) ? "Unsave" : "Save"} ${item.name}`} aria-pressed={saved.includes(item.id)} onClick={() => toggleSaved(item.id)}><Star size={19} aria-hidden="true" /></button>
      </article>)}</div>{shown.length === 0 && <div className={styles.empty}>{category === "Saved" ? <Star size={34} /> : <Search size={34} />}<h3>{category === "Saved" && !query ? "A home for your favourites" : "No little finds here yet"}</h3><p>{category === "Saved" && !query ? "Tap a star on anything you love. We'll keep it here." : "Try another word or take a look at all the finds."}</p><button onClick={resetFilters}>Browse all finds</button></div>}</div>
      <footer className={styles.catalogueFooter}><Sparkles size={15} aria-hidden="true" /><p>Try-ons are free. Purchases use demo points.</p><span>Device-local shop</span></footer>
    </section>
    <footer className={styles.footer}><button className={styles.back} onClick={() => go(state ? "/pet" : "/")}><ArrowLeft size={18} aria-hidden="true" /><span>Back to {state ? "room" : "welcome"}</span></button><p>Demo wallet · provisional prices · no real money or classroom-earned points.</p></footer>
    <p className="sr-only" role="status">{notice}</p>
    <Dialog open={Boolean(order||receipt)} onOpenChange={open=>{if(!open&&!buying){setOrder(null);setReceipt(null);setPurchaseError("");}}}>
      <DialogContent className={styles.purchaseDialog} overlayClassName={styles.backdrop} showCloseButton={!buying}>
        <DialogTitle>{receipt?"A little find, all yours!":"Make it yours?"}</DialogTitle>
        <DialogDescription>{receipt?"Saved to your device-local wallet, collection and purchase history.":"Review your demo-point purchase. No real money is involved."}</DialogDescription>
        <div className={styles.receiptArt}>{(orderItem||receipt)&&<ProductArt item={orderItem||shopCatalogue.find(item=>item.id===receipt!.itemId)!} colour={order?.colour||receipt?.colour}/>}</div>
        <h3>{receipt?.name||orderItem?.name}</h3>
        <dl className={styles.orderSummary}>
          <div><dt>{receipt?"Points spent":"Cost"}</dt><dd>{receipt?.cost??orderItem?.price} points</dd></div>
          <div><dt>{receipt?"Points remaining":"Balance after purchase"}</dt><dd>{receipt?.balance??Math.max(0,(wallet?.points??0)-(orderItem?.price??0))}</dd></div>
          {(receipt?.tokens||orderItem?.tokens)&&<div><dt>Tokens added</dt><dd>+{receipt?.tokens||orderItem?.tokens}</dd></div>}
        </dl>
        {purchaseError&&<p role="alert" className={styles.purchaseError}>{purchaseError}</p>}
        {order&&wallet&&order.revision!==wallet.revision&&<p role="alert">Your wallet changed. Close this dialog and review again.</p>}
        {receipt?<button className={styles.primary} onClick={()=>setReceipt(null)}>Lovely, thank you</button>:<div className={styles.confirmActions}>
          <button className={styles.clear} disabled={buying} onClick={()=>setOrder(null)}>Not now</button>
          <button className={styles.primary} disabled={buying||!wallet||!orderItem||wallet.points<orderItem.price||wallet.revision!==order?.revision} onClick={()=>void confirmPurchase()}>{buying?"Saving…":"Confirm purchase"}</button>
        </div>}
      </DialogContent>
    </Dialog>
    <Dialog open={walletOpen} onOpenChange={setWalletOpen}><DialogContent className={styles.purchaseDialog} overlayClassName={styles.backdrop}><DialogTitle>Your little wallet</DialogTitle><DialogDescription>Device-local demo points and arcade tokens. Not a classroom rewards ledger.</DialogDescription><div className={styles.balances}><span><Coins/> {wallet?.points??"—"} points</span><span><Ticket/> {wallet?.tokens??0} tokens</span></div><p className={styles.arcadeNote}>Demo profiles start with 250 points once. Purchases persist on this device. Arcade games and real earned rewards are not connected.</p>{walletError&&<p role="alert">{walletError}</p>}<h3>Purchase history</h3><ol className={styles.receipts}>{wallet?.receipts.length?wallet.receipts.slice().reverse().map(entry=><li key={entry.id}><div><strong>{entry.name}</strong><small>{new Date(entry.at).toLocaleString()} · {entry.balance} points left</small></div><span>−{entry.cost} pts{entry.tokens?` · +${entry.tokens} tokens`:""}</span></li>):<li>No purchases yet. A little look around is always free.</li>}</ol></DialogContent></Dialog>
    <Dialog open={filterOpen} onOpenChange={setFilterOpen}><DialogContent className={styles.filterDialog} overlayClassName={styles.backdrop}><DialogTitle>Filter</DialogTitle><DialogDescription>Make a little room for what you love.</DialogDescription><label>Sort finds<select aria-label="Sort shop" value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="featured">Featured collection</option><option value="az">Name: A–Z</option></select></label><button className={styles.primary} onClick={() => setFilterOpen(false)}>Show {shown.length} {shown.length === 1 ? "find" : "finds"}</button><button className={styles.clear} onClick={resetFilters}>Reset filters</button></DialogContent></Dialog>
  </main>;
}
