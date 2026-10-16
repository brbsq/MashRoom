"use client";
import { useId } from "react";
import { idleEyeRig, walkEyeRig } from "@/lib/roomie-blink";
import type { RoomiePose } from "@/lib/wearables";
import styles from "./roomie-renderer.module.css";

// A local eyelid reveal; glasses stay above this layer and never squash with eyes.
export function BlinkLayer({pose,active=false,frame}:{pose:RoomiePose;active?:boolean;frame?:number}) {
  const id=`blink-${useId().replace(/:/g,"")}`;
  const eyes=frame!==undefined&&pose!=="front"?walkEyeRig[pose][frame]:idleEyeRig[pose];
  return <g aria-hidden="true" data-eyelids={pose}>{eyes.map((eye,index)=>{
    const key=`${id}-${index}`,w=eye.width,h=eye.height,unit=w/138;
    return <g key={index} transform={`translate(${eye.x} ${eye.y})`}>
      <defs>
        <linearGradient id={`${key}-skin`} x2=".15" y2="1"><stop stopColor={eye.top}/><stop offset="1" stopColor={eye.bottom}/></linearGradient>
        <filter id={`${key}-soft`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={2.5*unit}/></filter>
        <mask id={`${key}-edge`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}><rect x={3*unit} y={3*unit} width={w-6*unit} height={h-6*unit} rx={w*.26} fill="white" filter={`url(#${key}-soft)`}/></mask>
        <clipPath id={`${key}-reveal`}><rect width={w} height={h} className={styles.blinkClip} data-blink-clip="" data-active={active}/></clipPath>
      </defs>
      <g mask={`url(#${key}-edge)`} clipPath={`url(#${key}-reveal)`}>
        <rect width={w} height={h} fill={`url(#${key}-skin)`}/>
        <path d={`M${w*.12} ${h*.6} Q${w*.5} ${h*.83} ${w*.88} ${h*.59}`} fill="none" stroke="#754737" strokeWidth={5.2*unit} strokeLinecap="round"/>
        <path d={`M${w*.22} ${h*.57} Q${w*.5} ${h*.72} ${w*.78} ${h*.56}`} fill="none" stroke="#d59b78" strokeOpacity=".6" strokeWidth={2*unit} strokeLinecap="round"/>
      </g>
    </g>;
  })}</g>;
}
