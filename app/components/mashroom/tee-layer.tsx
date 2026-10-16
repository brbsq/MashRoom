"use client";
import { useId } from "react";
import { assetHref } from "@/lib/asset";
import { teeArtwork, type GarmentPlacement, type RoomiePose } from "@/lib/wearables";

export function TeeLayer({pose,placement,filterId}:{pose:RoomiePose;placement:GarmentPlacement;filterId?:string}) {
  const art=teeArtwork[pose];
  return <svg {...placement} viewBox={art.viewBox} preserveAspectRatio="none" overflow="hidden" aria-hidden="true" data-garment-pose={pose}><image href={assetHref(art.path)} width={art.width} height={art.height} filter={filterId?`url(#${filterId})`:undefined}/></svg>;
}

export function TeeTint({id,colour}:{id:string;colour:string}) {
  return <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray"/>
    <feBlend in="SourceGraphic" in2="gray" mode="difference" result="chroma"/>
    <feColorMatrix in="chroma" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 4 4 0 0" result="chromaMask"/>
    <feComponentTransfer in="chromaMask" result="printMask"><feFuncA type="discrete" tableValues="0 0 1 1"/></feComponentTransfer>
    <feFlood floodColor={colour} result="dye"/>
    <feBlend in="SourceGraphic" in2="dye" mode="multiply" result="tinted"/>
    <feComposite in="tinted" in2="SourceGraphic" operator="in" result="tintedShape"/>
    <feComposite in="tintedShape" in2="printMask" operator="out" result="fabric"/>
    <feComposite in="SourceGraphic" in2="printMask" operator="in" result="print"/>
    <feMerge><feMergeNode in="fabric"/><feMergeNode in="print"/></feMerge>
  </filter>;
}

export function TeeThumbnail({label,colour="#ffffff"}:{label:string;colour?:string}) {
  const filterId=`tee-thumbnail-${useId().replace(/:/g,"")}`,tinted=colour.toLowerCase()!=="#ffffff";
  return <svg viewBox="0 60 540 530" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label} style={{width:"100%",height:"100%"}}>{tinted&&<defs><TeeTint id={filterId} colour={colour}/></defs>}<svg width={540} height={590} overflow="hidden"><image href={assetHref("/clothing/mashroom-tee/reference.png")} width={1536} height={1024} filter={tinted?`url(#${filterId})`:undefined}/></svg></svg>;
}
