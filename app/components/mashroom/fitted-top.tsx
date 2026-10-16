"use client";
import { useId } from "react";
import { assetHref } from "@/lib/asset";
import { appearanceItemColour, type RoomieAppearance } from "@/lib/roomie";
import { idleTopRig, walkTopRig } from "@/lib/garment-rig";
import { roomiePoseSizes, type RoomiePose } from "@/lib/wearables";

export function fittedTop(appearance?:RoomieAppearance) {
  if(!appearance)return null;
  const index=appearance.selection.tops,colour=appearanceItemColour(appearance,"tops");
  return index!==0||colour.toLowerCase()!=="#303035"?{index,colour,id:index===6?"mashroom-logo-tee":`tops:${index}`}:null;
}

export function FittedTop({appearance,pose,frame}:{appearance:RoomieAppearance;pose:RoomiePose;frame?:number}) {
  const id=`fitted-${useId().replace(/:/g,"")}`,top=fittedTop(appearance);
  if(!top)return null;
  const rig=frame===undefined?idleTopRig[pose]:walkTopRig[pose][frame];
  const [width,height]=frame===undefined?roomiePoseSizes[pose]:[912,1500];
  const src=frame===undefined?`/rooms/${pose==="front"?"cd2bd":`roomie-${pose}`}.png`:`/rooms/roomie-walk-${pose}.png`;
  const x=frame===undefined?0:-(frame%2)*456,y=frame===undefined?0:-Math.floor(frame/2)*750;
  const rgb=[1,3,5].map(i=>parseInt(top.colour.slice(i,i+2),16)/255);
  const matrix=rgb.map(c=>`${.34016*c} ${1.14432*c} ${.11552*c} 0 ${.54*c}`).join(" ")+" 0 0 0 1 0";
  const [lx,ly,lw,lh]=rig.logo,unit=frame===undefined?1:.46;
  return <g aria-hidden="true" data-fitted-top={top.id} data-garment-pose={pose} data-garment-frame={frame??"idle"}>
    <defs>
      <clipPath id={`${id}-shape`}><path d={rig.boundary}/></clipPath>
      <filter id={`${id}-fabric`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={matrix}/></filter>
      <filter id={`${id}-dark`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2 -2 -2 0 2.6"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={frame===undefined?width:456} height={frame===undefined?height:750} style={{maskType:"alpha"}}><image href={assetHref(src)} x={x} y={y} width={width} height={height} filter={`url(#${id}-dark)`}/></mask>
      <linearGradient id={`${id}-collar`} x2=".2" y2="1"><stop stopColor={top.colour}/><stop offset="1" stopColor={top.colour}/></linearGradient>
      <linearGradient id={`${id}-skin`} x2="0" y2="1"><stop stopColor="#f7a76f"/><stop offset="1" stopColor="#ffc18b"/></linearGradient>
      <filter id={`${id}-print`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -5 -5 -5 0 13"/></filter>
    </defs>
    <g clipPath={`url(#${id}-shape)`}>
      <image href={assetHref(src)} x={x} y={y} width={width} height={height} filter={`url(#${id}-fabric)`} mask={`url(#${id}-mask)`}/>
      {/* Replace the baked high collar and mark with a body-registered crew neck. */}
      <path d={rig.collar} fill={`url(#${id}-collar)`}/>
      <path d={rig.neck} fill={`url(#${id}-skin)`}/>
      <path d={rig.neckline} fill="none" stroke={top.colour} strokeWidth={8*unit}/>
      <path d={rig.neckline} fill="none" stroke="#73645b" strokeOpacity=".25" strokeWidth={2*unit}/>
      {top.index===6&&<svg x={lx} y={ly} width={lw} height={lh} viewBox="455 710 270 190" preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href={assetHref("/clothing/mashroom-tee/reference.png")} width="1536" height="1024" filter={`url(#${id}-print)`}/></svg>}
      {top.index===2&&<path d={`M${lx} ${ly} h${lw} v${lh} q${-lw/2} ${lh/3} ${-lw} 0 Z`} fill="none" stroke="#ffffff" strokeOpacity=".5" strokeWidth={3*unit}/>}
      {top.index===3&&<g mask={`url(#${id}-mask)`}>{[0,1,2,3].map(i=><path key={i} d={`M0 ${ly+lh+i*18*unit} H${width}`} stroke="#ffffff" strokeOpacity=".38" strokeWidth={7*unit}/>)}</g>}
    </g>
  </g>;
}
