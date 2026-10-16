"use client";
import { useId } from "react";
import { assetHref } from "@/lib/asset";
import { faceWindows, walkingFaceTransform } from "@/lib/specs";
import { roomiePoseSizes, type RoomiePose } from "@/lib/wearables";
import { BlinkLayer } from "./blink-layer";
export function SpecsLayer({pose,wearing,colour="#b7b9b8",blinking=false}:{pose:RoomiePose;wearing:boolean;colour?:string;blinking?:boolean}) {
 const [width,height]=roomiePoseSizes[pose],window=faceWindows[pose],id=`specs-${useId().replace(/:/g,"")}`;
 return <g aria-hidden="true" data-specs-layer={wearing?"on":"off"}>
  <defs><filter id={`${id}-soft`} x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="7"/></filter><mask id={`${id}-face`} maskUnits="userSpaceOnUse" x={window.x} y={window.y} width={window.width} height={window.height}><rect x={window.x+12} y={window.y+12} width={window.width-24} height={window.height-24} fill="white" filter={`url(#${id}-soft)`}/></mask></defs>
  <image href={assetHref(`/accessories/roomie-specs/bare-${pose}.png`)} width={width} height={height} preserveAspectRatio="none" mask={`url(#${id}-face)`}/>
  <BlinkLayer pose={pose} active={blinking}/>
  {wearing&&<><defs><filter id={id}><feFlood floodColor={colour}/><feComposite in2="SourceGraphic" operator="in"/></filter></defs><image href={assetHref(`/accessories/roomie-specs/${pose}.svg`)} width={width} height={height} filter={colour.toLowerCase()==="#b7b9b8"?undefined:`url(#${id})`}/></>}
 </g>;
}
export function SpecsThumbnail({colour="#b7b9b8",label="Original Roomie specs"}:{colour?:string;label?:string}) {
 const id=`specs-thumb-${useId().replace(/:/g,"")}`;
 return <svg viewBox="210 455 520 170" style={{width:"100%",height:"100%"}} role="img" aria-label={label}><defs><filter id={id}><feFlood floodColor={colour}/><feComposite in2="SourceGraphic" operator="in"/></filter></defs><image href={assetHref("/accessories/roomie-specs/front.svg")} width={941} height={1671} filter={colour.toLowerCase()==="#b7b9b8"?undefined:`url(#${id})`}/></svg>;
}
export function WalkingSpecsLayer({pose,frame,wearing,colour,blinking=false}:{pose:"left"|"right";frame:number;wearing:boolean;colour:string;blinking?:boolean}) {
 const id=`walk-specs-${useId().replace(/:/g,"")}`,x=pose==="left"?88:180,y=195,w=pose==="left"?200:192,h=120;
 const cellX=frame%2*456,cellY=Math.floor(frame/2)*750,[width,height]=roomiePoseSizes[pose];
 return <g aria-hidden="true" data-specs-layer={wearing?"on":"off"}>
  <defs>
   <filter id={`${id}-soft`} x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
   <mask id={`${id}-face`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}><rect x={x+6} y={y+6} width={w-12} height={h-12} fill="white" filter={`url(#${id}-soft)`}/></mask>
   <mask id={`${id}-silhouette`} maskUnits="userSpaceOnUse" x="0" y="0" width="456" height="750" style={{maskType:"alpha"}}><image href={assetHref(`/rooms/roomie-walk-${pose}.png`)} x={-cellX} y={-cellY} width="912" height="1500"/></mask>
   <filter id={`${id}-tint`}><feFlood floodColor={colour}/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <g mask={`url(#${id}-silhouette)`}>
   <image href={assetHref(`/accessories/roomie-specs/bare-walk-${pose}.png`)} x={-cellX} y={-cellY} width="912" height="1500" preserveAspectRatio="none" mask={`url(#${id}-face)`}/>
   <BlinkLayer pose={pose} frame={frame} active={blinking}/>
   {wearing&&<g transform={walkingFaceTransform[pose]}><image href={assetHref(`/accessories/roomie-specs/${pose}.svg`)} width={width} height={height} filter={colour.toLowerCase()==="#b7b9b8"?undefined:`url(#${id}-tint)`}/></g>}
  </g>
 </g>;
}
