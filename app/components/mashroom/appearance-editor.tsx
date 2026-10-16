"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Star, Venus, Mars } from "lucide-react";
import { useSceneNavigation } from "./use-scene-navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useApp } from "./provider";
import { useRoomie } from "./use-roomie";
import { RoomieRenderer } from "./roomie-renderer";
import { TeeThumbnail } from "./tee-layer";
import { SpecsThumbnail } from "./specs-layer";
import { isOriginalSpecs } from "@/lib/specs";
import { assetHref } from "@/lib/asset";
import { bgmTracks } from "@/lib/bgm";
import { BackgroundMusic, BgmControls } from "./background-music";
import { ColourPicker } from "./colour-picker";
import { designScale, editorControlScale, editorControls, clothingPaletteScale } from "@/lib/figma-controls";
import { clothingSlots, options, skinTones, defaultAppearance, editHistory, undoHistory, redoHistory, appearanceItemColour, selectAppearanceItem, setAppearanceColour, isMashroomTee, roomieGenders, catalogueIndices, type AppearanceSlot, type EditHistory, type RoomieAppearance } from "@/lib/roomie";
import styles from "./appearance-editor.module.css";

const icons: Partial<Record<AppearanceSlot | "favourites", string>> = { favourites: "8a56e.svg", hair: "b1b02.svg", makeup: "dcc6d.svg", tops: "d13cf.svg", bottoms: "cdc70.svg", shoes: "d51a6.svg", accessories: "14c29.svg", body: "742c8.svg", head: "bbe7f.svg", eyes: "34f32.svg", brows: "1e3d2.svg", nose: "0d6ef.svg", mouth: "d992a.svg" };
const labels: Record<string,string> = { favourites: "Favourites", hair: "Hair", body: "Body and skin", head: "Head", eyes: "Eyes", brows: "Brows", nose: "Nose", mouth: "Mouth", makeup: "Makeup", tops: "Tops", bottoms: "Bottoms", shoes: "Shoes", accessories: "Accessories" };
export function FigmaIcon({ file, size = 60 }: { file: string; size?: number }) {
  const dimensions: Record<string, [number, number]> = { "d51a6.svg": [54, 34.0003], "742c8.svg": [37.6317, 50] };
  const [width,height] = dimensions[file] || [size,size];
  return <span className={styles.iconSlot} style={{ "--asset-size": `${Math.max(width,height)}px` } as CSSProperties}><img src={assetHref(`/creation/${file}`)} width={width} height={height} alt="" /></span>;
}

export function AppearanceEditor({ kind }: { kind: "closet" | "maker" }) {
  const maker = kind === "maker";
  const {leaving,navigate}=useSceneNavigation();
  const { state, ready: appReady, update } = useApp();
  const { appearance, ready, save } = useRoomie(state?.profile, state?.pet.name);
  const [history, setHistory] = useState<EditHistory<RoomieAppearance>>({ past: [], present: defaultAppearance(), future: [] });
  const [baseline, setBaseline] = useState("");
  const [category, setCategory] = useState<AppearanceSlot | "favourites">(maker ? "hair" : "favourites");
  const [dialog, setDialog] = useState<"saved" | "exit" | "filter" | "colour" | "options" | null>(null);
  const [paletteTarget, setPaletteTarget] = useState<{slot:AppearanceSlot;index:number} | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [colour, setColour] = useState("#40312c");
  const [slot, setSlot] = useState<AppearanceSlot>("hair");
  const [scale, setScale] = useState(1);
  const [controlScale, setControlScale] = useState(1);
  const [paletteScale, setPaletteScale] = useState(1);
  const canvas = useRef<HTMLElement>(null);
  const initialized = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const [nameOverflow,setNameOverflow] = useState(false);
  useEffect(()=>{const el=nameInput.current;if(!el)return;const measure=()=>setNameOverflow(el.scrollWidth>el.clientWidth+2);measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();},[history.present.name,appReady,state?.profile.id]);
  useEffect(() => { if (!ready || !state || initialized.current) return; initialized.current = true; setHistory({ past: [], present: appearance, future: [] }); setBaseline(JSON.stringify(appearance)); }, [ready, state, appearance]);
  useEffect(() => {
    const el=canvas.current;if(!el)return;
    const observer=new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;
      setScale(Math.max(.32,designScale(width,height)));
      setControlScale(editorControlScale(width,height));
      setPaletteScale(clothingPaletteScale(width,height));
    });
    observer.observe(el);return()=>observer.disconnect();
  }, [appReady,state?.profile.id]);
  const draft = history.present;
  const dirty = JSON.stringify(draft) !== baseline;
  const edit = (next: RoomieAppearance) => setHistory(h => editHistory(h, next));
  const categories: (AppearanceSlot | "favourites")[] = maker ? ["hair", "body", "head", "eyes", "brows", "nose", "mouth"] : ["favourites", "hair", "makeup", "tops", "bottoms", "shoes", "accessories"];
  const entries = category === "favourites" ? draft.favourites.map(id => { const [s,i]=id.split(":");return { s: s as AppearanceSlot, i:Number(i) }; }) : catalogueIndices(category).map(i=>({s:category,i}));
  const shown = entries.filter(({s,i}) => options[s][i].toLowerCase().includes(search.toLowerCase()) && (!selectedOnly || draft.selection[s] === i));
  useEffect(()=>{if(dialog !== null)setPaletteOpen(false);},[dialog]);
  function select(s: AppearanceSlot, i: number) { edit(selectAppearanceItem(draft,s,i)); setSlot(s); setNotice("");setNoticeError(false); if(!maker&&clothingSlots.includes(s)){setPaletteTarget({slot:s,index:i});setPaletteOpen(true);}else{setPaletteTarget(null);setPaletteOpen(false);} }
  function favourite(s: AppearanceSlot, i:number) { if(!clothingSlots.includes(s))return;const id=`${s}:${i}`;edit({...draft,favourites:draft.favourites.includes(id)?draft.favourites.filter(f=>f!==id):[...draft.favourites,id]}); }
  function rememberReturn() { if(!state)return;try{if(sessionStorage.getItem(`mashroom:room-view:v1:${state.profile.mode}:${state.profile.id}:${state.profile.classId}`))sessionStorage.setItem("mashroom:return-room","1");}catch{} }
  function leave() { rememberReturn();setDialog(null);navigate("/pet"); }
  function saveDraft() {
    if (!draft.name.trim()) { setNotice("Give your Roomie a name before saving.");setNoticeError(true);return; }
    try { const next={...draft,name:draft.name.trim(),created:true};save(next);update(s=>({...s,pet:{...s.pet,name:next.name}}));setHistory({past:[],present:next,future:[]});setBaseline(JSON.stringify(next));setDialog("saved");setNotice("");setNoticeError(false); } catch { setNotice("Couldn't save on this device. Your draft is still here; free browser space and try again.");setNoticeError(true); }
  }
  function openColour() { const s=category === "favourites" ? slot : category;setSlot(s);setColour(appearanceItemColour(draft,s==="head"?"body":s));setDialog("colour"); }
  function clothingPalette(s:AppearanceSlot,i:number){const starred=draft.favourites.includes(`${s}:${i}`);return <div className={styles.paletteCanvas} style={{"--ui-scale":1} as CSSProperties}>
    <img className={styles.paletteSurface} src={assetHref("/creation/ba553.svg")} width={602} height={110} alt=""/>
    <button className={styles.paletteFavourite} aria-label="Favourite selected clothing" aria-pressed={starred} onClick={()=>favourite(s,i)}><FigmaIcon file="8a56e.svg" size={50}/></button>
    <button className={styles.paletteWheel} aria-label="Open colour wheel" onClick={()=>{setSlot(s);setColour(appearanceItemColour(draft,s));setDialog("colour");}}><FigmaIcon file="1d118.svg" size={60}/></button>
    <span className={styles.paletteDivider}><img src={assetHref("/creation/42d9e.svg")} width={58} height={3} alt=""/></span>
    <div className={styles.paletteSwatches} aria-label="Clothing colour swatches">{draft.swatches.map(c=><button key={c} aria-label={`Use colour ${c}`} aria-pressed={appearanceItemColour(draft,s).toLowerCase()===c.toLowerCase()} style={{background:c}} onClick={()=>edit(setAppearanceColour(draft,s,c))}/>)}</div>
  </div>;}
  if (!appReady) return <main className="center-page">Opening your Roomie…</main>;
  if (!state) return <main className="center-page"><h1>Make yourself at home.</h1><Link href="/login">Enter the demo to create your Roomie</Link></main>;
  return <main ref={canvas} data-leaving={leaving} inert={leaving} onClickCapture={event=>{if(!dirty&&(event.target as Element).closest("a"))rememberReturn();}} className={`${styles.editor} ${maker?styles.maker:styles.closet}`} style={{ "--ui-scale": scale, "--control-scale":controlScale, backgroundImage:`url(${assetHref(`/creation/${maker?"37094":"233ad"}.png`)})` } as CSSProperties} aria-label={maker?"Roomie Maker":"Closet"}>
    <BackgroundMusic track={bgmTracks[kind]} title={maker ? "Zen Universe (Slower & Dreamier)" : "Closet BGM"} />
    <header className={styles.header}><button className={styles.logoButton} aria-label={maker?"Roomie Maker options":"Closet options"} onClick={()=>setDialog("options")}><img src={assetHref("/creation/cbbb1.png")} alt="MashRoom" /></button>{maker?<><strong>Hello! I am..</strong><div className={styles.nameField} data-overflow={nameOverflow}><input ref={nameInput} aria-label="Roomie name" value={draft.name} maxLength={60} onChange={e=>edit({...draft,name:e.target.value})} /><span className={styles.rollingName} aria-hidden="true"><span>{draft.name} · {draft.name}</span></span></div></>:<><strong>CLOSET</strong><em>{labels[category]}</em></>}</header>
    <nav className={styles.categories} aria-label={maker?"Roomie features":"Closet categories"}>{categories.map(s=><button key={s} aria-label={labels[s]} title={labels[s]} aria-pressed={category===s} onClick={()=>{setCategory(s);setSearch("");setSelectedOnly(false);setPaletteOpen(false);setPaletteTarget(null);if(s!=="favourites")setSlot(s);}}><FigmaIcon file={icons[s]!} size={s==="hair"||s==="favourites"||s==="nose"?50:s==="eyes"||s==="accessories"?55:s==="bottoms"?65:60}/></button>)}</nav>
    <div className={styles.character}><RoomieRenderer appearance={draft} label={`${draft.name || "Your Roomie"} preview`} /></div>
    <section className={styles.catalogue} aria-label={`${labels[category]} catalogue`}>
      <img className={styles.catalogueSurface} src={assetHref("/creation/f1371.svg")} alt="" />
      <div className={styles.scroll}><div className={styles.cards}>{shown.map(({s,i})=>{
        const id=`${s}:${i}`,imageOnly=maker||s==="hair"||s==="makeup";
        const preview=selectAppearanceItem(draft,s,i);
        const activePalette=paletteTarget?.slot===s&&paletteTarget.index===i;
        const card=<article className={styles.card} data-item-id={id} data-image-only={imageOnly} data-selected={draft.customized&&draft.selection[s]===i}>
          <img className={styles.cardSurface} src={assetHref(`/creation/${maker?"6d1ea":"6d690"}.svg`)} alt="" />
<button className={styles.itemButton} aria-pressed={draft.customized&&draft.selection[s]===i} aria-label={`Select ${options[s][i]}`} onClick={()=>select(s,i)}><span className={styles.itemPicture}>{isOriginalSpecs(s,i)?<SpecsThumbnail colour={appearanceItemColour(preview,s)}/>:isMashroomTee(s,i)?<TeeThumbnail label={options[s][i]} colour={appearanceItemColour(preview,s)}/>:<RoomieRenderer appearance={preview} label={options[s][i]} blink={false} />}</span>{!imageOnly&&<span className={styles.itemCaption}><small>{isMashroomTee(s,i)||isOriginalSpecs(s,i)?"MashRoom":s==="accessories"&&i===2?"Remove eyewear":"Roomie Studio · sample"}</small><span>{options[s][i]}</span></span>}</button>
          {clothingSlots.includes(s)&&<button className={styles.star} aria-label={`${draft.favourites.includes(id)?"Remove":"Add"} ${options[s][i]} ${draft.favourites.includes(id)?"from":"to"} favourites`} aria-pressed={draft.favourites.includes(id)} onClick={()=>favourite(s,i)}><Star size={19} /></button>}
        </article>;
        return !maker&&clothingSlots.includes(s)?<Popover key={id} open={activePalette&&paletteOpen} onOpenChange={open=>{if(activePalette)setPaletteOpen(open);}}><PopoverAnchor asChild>{card}</PopoverAnchor><PopoverContent side="bottom" align="center" sideOffset={10} collisionPadding={16} className={styles.clothingPalette} aria-label="Selected clothing colour controls" style={{"--palette-scale":paletteScale} as CSSProperties} onOpenAutoFocus={event=>event.preventDefault()} onCloseAutoFocus={event=>event.preventDefault()} onInteractOutside={event=>{if((event.target as Element).closest("[data-item-id]")?.getAttribute("data-item-id")===id)event.preventDefault();}}>{clothingPalette(s,i)}</PopoverContent></Popover>:<div key={id} className={styles.cardWrapper}>{card}</div>;
      })}</div>{!shown.length&&<div className={styles.empty}><Star size={32}/><h2>{category==="favourites"?"Your favourites live here":"No matching items"}</h2><p>{category==="favourites"?"Choose clothes, then tap their star to keep them close.":"Try another filter."}</p></div>}</div>
    </section>
{maker&&category!=="favourites"&&<div className={styles.colourBar}><img src={assetHref("/creation/b38a9.svg")} alt="" /><button aria-label="Open colour wheel" onClick={openColour}><FigmaIcon file="1d118.svg"/></button><div className={styles.swatches}>{(category==="body"?skinTones:draft.swatches).map(c=><button key={c} aria-label={`Use colour ${c}`} style={{background:c}} onClick={()=>edit(setAppearanceColour(draft,category,c))} />)}</div></div>}
    <div className={styles.controls} aria-label="Editing controls">{[{id:"filter",file:"4e79b.svg",label:"Filter",run:()=>setDialog("filter"),disabled:false},{id:"undo",file:"8a810.svg",label:"Undo",run:()=>setHistory(undoHistory),disabled:!history.past.length},{id:"redo",file:"c9a14.svg",label:"Redo",run:()=>setHistory(redoHistory),disabled:!history.future.length},{id:"cancel",file:"96c72.svg",label:"Exit",run:()=>dirty?setDialog("exit"):leave(),disabled:false},{id:"save",file:"5964e.svg",label:"Save",run:saveDraft,disabled:false}].map(b=><button key={b.id} aria-label={b.label} title={b.label} data-action={b.id} disabled={b.disabled} onClick={b.run}><FigmaIcon file={b.file} size={editorControls.iconSizes[b.id as keyof typeof editorControls.iconSizes]}/></button>)}</div>
    {notice&&<p className={noticeError?styles.notice:"sr-only"} role={noticeError?"alert":"status"}>{notice}</p>}
    <p className={styles.artworkNote}>Original Roomie artwork. The logo tee and Original Roomie specs are wearable; other styles are previews.</p>
    <Dialog open={dialog!==null} onOpenChange={v=>!v&&setDialog(null)}><DialogContent className={`${styles.dialog} ${dialog==="colour"||dialog==="options"||dialog==="filter"?styles.liquidDialog:""} ${dialog==="filter"?styles.filterDialog:""}`} overlayClassName={styles.liquidBackdrop} showCloseButton={dialog==="colour"||dialog==="filter"||dialog==="options"} style={{backgroundImage:dialog==="saved"||dialog==="exit"?`url(${assetHref(`/creation/${dialog==="saved"?"0444a":"5aa14"}.svg`)})`:undefined}}>
      <DialogTitle>{dialog===null?"":dialog==="saved"?maker?"Roomie saved. Proceed now?":"Outfit saved. Leave closet now?":dialog==="exit"?maker?"Exit now? Unsaved progress will be lost.":"Exit closet now? Unsaved progress will be lost.":dialog==="colour"?"Choose a colour":dialog==="options"?"Options":"Filter"}</DialogTitle>
      <DialogDescription className="sr-only">{dialog==="saved"?"Your changes are saved on this device.":dialog==="exit"?"Leave without saving, or stay to continue.":"Adjust your selection below."}</DialogDescription>
      {(dialog==="saved"||dialog==="exit")&&<div className={styles.dialogActions}><Button onClick={leave}>LEAVE</Button><Button onClick={()=>setDialog(null)}>STAY</Button></div>}
      {dialog==="options"&&<><BgmControls/>{maker&&<fieldset className={styles.genderOptions}><legend>Roomie gender · optional</legend><div>{roomieGenders.map(g=><button type="button" key={g.id} aria-pressed={draft.gender===g.id} onClick={()=>edit({...draft,gender:draft.gender===g.id?"unspecified":g.id})}>{g.id==="girl"?<Venus aria-hidden="true"/>:<Mars aria-hidden="true"/>}<span>{g.label}</span></button>)}</div><button type="button" className={styles.clearGender} onClick={()=>edit({...draft,gender:"unspecified"})}>Clear selection</button><p>No gender is selected by default. Use Save to keep your choice.</p></fieldset>}</>}
      {dialog==="filter"&&<><label>Search items<input aria-label="Search catalogue" value={search} onChange={e=>setSearch(e.target.value)}/></label><label><input type="checkbox" checked={selectedOnly} onChange={e=>setSelectedOnly(e.target.checked)}/> Selected items only</label><Button onClick={()=>setDialog(null)}>Apply filter</Button><Button variant="ghost" onClick={()=>{setSearch("");setSelectedOnly(false);}}>Clear filter</Button></>}
      {dialog==="colour"&&<><ColourPicker value={colour} onChange={setColour}/><div className={styles.dialogSwatches} aria-label="Saved colour swatches">{draft.swatches.map(c=><button key={c} aria-label={`Select swatch ${c}`} style={{background:c}} onClick={()=>setColour(c)}/>)}</div><div className={styles.colourActions}><Button variant="outline" disabled={!/^#[0-9a-f]{6}$/i.test(colour)} onClick={()=>{const swatch=colour.toLowerCase();if(!draft.swatches.some(c=>c.toLowerCase()===swatch))edit({...draft,swatches:[...draft.swatches,swatch].slice(-30)});setNotice("Swatch added to your draft.");}}>Save to swatches</Button><Button disabled={!/^#[0-9a-f]{6}$/i.test(colour)} onClick={()=>{edit(setAppearanceColour(draft,slot,colour.toLowerCase()));setDialog(null);}}>Apply colour</Button></div></>}
    </DialogContent></Dialog>
  </main>;
}
