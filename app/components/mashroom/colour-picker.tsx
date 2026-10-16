"use client";
import { useEffect, useState, type PointerEvent, type CSSProperties } from "react";
import { hexToHsv, hsvToHex, type HsvColour } from "@/lib/colour";
import styles from "./colour-picker.module.css";

export function ColourPicker({value,onChange}:{value:string;onChange:(hex:string)=>void}) {
  const [hsv,setHsv]=useState<HsvColour>(()=>hexToHsv(value)||{h:270,s:.5,v:.5});
  useEffect(()=>{const next=hexToHsv(value);if(next && hsvToHex(hsv).toLowerCase()!==value.toLowerCase())setHsv(previous=>({...next,h:next.s?next.h:previous.h}));},[value,hsv]);
  function update(next:HsvColour){setHsv(next);onChange(hsvToHex(next));}
  function point(event:PointerEvent<HTMLDivElement>){const rect=event.currentTarget.getBoundingClientRect();update({...hsv,s:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),v:1-Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))});}
  const valid=/^#[0-9a-f]{6}$/i.test(value),hex=hsvToHex(hsv);
  return <div className={styles.picker}>
    <div className={styles.square} role="slider" tabIndex={0} aria-label="Saturation and brightness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsv.s*100)} aria-valuetext={`${Math.round(hsv.s*100)}% saturation, ${Math.round(hsv.v*100)}% brightness. Arrow keys adjust; Shift makes larger steps.`} style={{backgroundColor:`hsl(${hsv.h} 100% 50%)`}} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);point(event);}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))point(event);}} onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onKeyDown={event=>{const step=event.shiftKey?.1:.01;if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;event.preventDefault();update({...hsv,s:Math.max(0,Math.min(1,hsv.s+(event.key==="ArrowRight"?step:event.key==="ArrowLeft"?-step:0))),v:Math.max(0,Math.min(1,hsv.v+(event.key==="ArrowUp"?step:event.key==="ArrowDown"?-step:0)))});}}><span className={styles.selection} style={{left:`${hsv.s*100}%`,top:`${(1-hsv.v)*100}%`}}/></div>
    <input className={styles.hue} type="range" aria-label="Hue" min={0} max={360} step={1} value={Math.round(hsv.h)} style={{"--hue-colour":`hsl(${hsv.h} 100% 50%)`} as CSSProperties} onChange={event=>update({...hsv,h:Number(event.target.value)})}/>
    <div className={styles.values}><span className={styles.preview} style={{backgroundColor:hex}} aria-label={`Colour preview ${hex}`}/><input aria-label="Hex colour" value={value.toUpperCase()} maxLength={7} spellCheck={false} aria-invalid={!valid} onChange={event=>{const text=event.target.value;onChange(text.startsWith("#")?text:`#${text}`);}}/></div>
    {!valid && <p className={styles.error} role="status">Enter a six-digit hex colour, such as #56436D.</p>}
  </div>;
}
