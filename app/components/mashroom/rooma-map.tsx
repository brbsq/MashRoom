"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { useSceneNavigation } from "./use-scene-navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "./provider";
import { FigmaIcon } from "./appearance-editor";
import { assetHref } from "@/lib/asset";
import { mapLocations, locationImages, neighbourhoods, mapStorageKey, readNeighbourhood, type Neighbourhood } from "@/lib/rooma-map";
import styles from "./rooma-map.module.css";
export function RoomaMap() {
  const { state } = useApp();
  const {leaving,navigate}=useSceneNavigation();
  const [stage,setStage]=useState(0),[neighbourhood,setNeighbourhood]=useState<Neighbourhood>("City Square");
  const [selected,setSelected]=useState("boutique"),[dialog,setDialog]=useState<"info"|"metro"|"locations"|null>(null),[station,setStation]=useState<Neighbourhood>("City Square"),[notice,setNotice]=useState("");
  const [uiScale,setUiScale]=useState(1);
  const location=mapLocations.find(l=>l.id===selected)!;
  const key=mapStorageKey(state?.profile);
  useEffect(()=>{try{setNeighbourhood(readNeighbourhood(localStorage.getItem(key)));}catch{setNotice("Neighbourhood changes are available for this visit.");}},[key]);
  useEffect(()=>{
    const resize=()=>setUiScale(Math.max(.5,Math.min(window.innerWidth/1920,window.innerHeight/1080)));resize();window.addEventListener("resize",resize);
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){setStage(2);return()=>window.removeEventListener("resize",resize);}
    const timers=[setTimeout(()=>setStage(1),400),setTimeout(()=>setStage(2),1800)];
    return()=>{timers.forEach(clearTimeout);window.removeEventListener("resize",resize);};
  },[]);
  function go(){ if(location.metro){setStation(neighbourhood);setDialog("metro");}else if(location.href){if(location.href==="/pet")sessionStorage.setItem("mashroom:return-room","1");navigate(location.href);}else setNotice("This boutique is a UI preview. Shopping will be added later."); }
  function travel(){setNeighbourhood(station);try{localStorage.setItem(key,station);}catch{setNotice("Changed for this visit only; couldn't save the neighbourhood.");}setSelected("metro");setDialog(null);}
  function leave(){try{sessionStorage.setItem("mashroom:return-room","1");}catch{}navigate("/pet");}
  return <main className={styles.map} data-leaving={leaving} inert={leaving} style={{"--ui-scale":uiScale} as CSSProperties} aria-label="Rooma Maps">
    <section className={styles.loading} data-hidden={stage===2} aria-hidden={stage===2} aria-label={stage<2?"Opening Rooma Maps":undefined} style={{backgroundImage:`url(${assetHref("/creation/map-refraction.png")})`}}><div data-visible={stage===1}><img src={assetHref("/creation/6f910.png")} alt=""/><h1><strong>Rooma</strong> Maps</h1></div></section>
    {stage===2&&<section className={styles.scene} style={{backgroundImage:`url(${assetHref("/creation/b9961.png")})`}}>
      <header className={styles.header}><img src={assetHref("/creation/6f910.png")} alt=""/><h1>{neighbourhood}</h1><button aria-label="Select map location" aria-expanded={dialog==="locations"} onClick={()=>setDialog("locations")}><img src={assetHref("/creation/9ff62.svg")} alt=""/></button><button aria-label="Close map" onClick={leave}><img src={assetHref("/creation/b6307.png")} alt=""/></button></header>
      <div className={styles.locations} aria-label="Map destinations">{mapLocations.map((item,i)=><button key={item.id} style={{left:`${46+(i%3)*17}%`,top:`${27+Math.floor(i/3)*26}%`}} aria-pressed={selected===item.id} onClick={()=>setSelected(item.id)}>{item.name}</button>)}</div>
      <section className={styles.locationCard} aria-live="polite"><img className={styles.locationImage} src={assetHref(locationImages[location.id])} alt=""/><div><h2>{location.name}</h2><p>{location.category}</p><p>{location.address}<br/>{neighbourhood.toUpperCase()}</p><strong className={styles.open} data-open={location.open}>{location.open?"OPEN":"CLOSED"}</strong><p>operation hours : {location.hours}</p></div></section>
      <div className={styles.actions}><button onClick={go}>GO</button><button aria-label="Location information" onClick={()=>setDialog("info")}><FigmaIcon file="7bee7.svg" size={70}/></button></div><p className={styles.notice} role="status">{notice}</p><small className={styles.sample}>Demo locations · no purchases or point awards</small>
    </section>}
    <Dialog open={dialog!==null} onOpenChange={v=>!v&&setDialog(null)}><DialogContent className={dialog==="metro"?styles.metro:styles.dialog}>
      <DialogTitle>{dialog==="metro"?<><span>Mashville</span> <em>Metro</em></>:dialog==="info"?location.name:"Select a location"}</DialogTitle><DialogDescription>{dialog==="metro"?"Select your destination.":dialog==="info"?location.description:"Explore a sample place in your neighbourhood."}</DialogDescription>
      {dialog==="locations"&&<div className={styles.locationList}>{mapLocations.map(item=><Button variant="ghost" key={item.id} onClick={()=>{setSelected(item.id);setDialog(null);}}>{item.name}<small>{item.category}</small></Button>)}</div>}
      {dialog==="info"&&<div className={styles.info}><img src={assetHref(locationImages[location.id])} alt=""/><div><p className={styles.offer}>{location.id==="boutique"?"limited discounts":"Demo destination"}</p><p>{location.description}</p><strong className={styles.open} data-open={location.open}>{location.open?"OPEN":"CLOSED"}</strong><p>operation hours : {location.hours}</p></div></div>}
      {dialog==="metro"&&<><div className={styles.stations} role="group" aria-label="Metro stations"><img src={assetHref("/creation/313a3.svg")} alt=""/>{neighbourhoods.map(n=><button key={n} aria-pressed={station===n} onClick={()=>setStation(n)}><span/><strong>{n}</strong></button>)}</div><div className={styles.metroActions}><Button onClick={travel}>GO</Button><Button onClick={()=>setDialog(null)}>BACK</Button></div></>}
    </DialogContent></Dialog>
  </main>;
}
