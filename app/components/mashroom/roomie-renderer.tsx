"use client";
import { assetHref } from "@/lib/asset";
import { useEffect, useId } from "react";
import type { RoomieAppearance } from "@/lib/roomie";
import styles from "./roomie-renderer.module.css";
import { roomiePoseSizes } from "@/lib/wearables";
import { FittedTop, fittedTop } from "./fitted-top";
import { SpecsLayer, WalkingSpecsLayer } from "./specs-layer";
import { specsMode, specsColour } from "@/lib/specs";
import { frontWalkRegistration } from "@/lib/roomie-motion";
import { useRoomieBlink } from "./use-roomie-blink";

// The supplied front sprite stays unchanged; side poses match its identity.
// The MashRoom tee is a real garment layer; other choices remain preview data.
export const originalRoomieArtwork = {
  front: "/rooms/cd2bd.png",
  left: "/rooms/roomie-left.png",
  right: "/rooms/roomie-right.png",
} as const;

export const roomieWalkArtwork = {
  front: "/rooms/roomie-walk-front.png",
  left: "/rooms/roomie-walk-left.png",
  right: "/rooms/roomie-walk-right.png",
} as const;
export const roomieArtworkSources = [
  ...Object.values(originalRoomieArtwork), ...Object.values(roomieWalkArtwork),
];

let posesPreloaded = false;

export function RoomieRenderer({
  appearance, facing = "front", walking = false, label = "Roomie", className = "", blink = true,
}: {
  appearance?: RoomieAppearance;
  facing?: "front" | "left" | "right";
  walking?: boolean;
  label?: string;
  className?: string;
  blink?: boolean;
}) {
  const tee=fittedTop(appearance), filterId=`tee-${useId().replace(/:/g,"")}`;
  const blinking=useRoomieBlink(blink);
  const eyewear=specsMode(appearance),eyewearColour=appearance?specsColour(appearance):"#b7b9b8";
  const wearingSpecs=eyewear!=="none",frameColour=eyewear==="wearable"?eyewearColour:"#b7b9b8";
  useEffect(()=>{["front","left","right"].forEach(pose=>{for(const name of [`bare-${pose}.png`,`${pose}.svg`,...(pose==="front"?[]:[`bare-walk-${pose}.png`])]){const image=new window.Image();image.src=assetHref(`/accessories/roomie-specs/${name}`);void image.decode().catch(()=>{});}});},[]);
  useEffect(() => {
    // Warm both directions before the first step, including in the plaza.
    // Catalogue previews share this preload rather than duplicating it.
    if (posesPreloaded) return;
    posesPreloaded = true;
    roomieArtworkSources.forEach(src => {
      const image = new window.Image();
      image.src = assetHref(src);
      void image.decode().catch(() => {});
    });
  }, []);

  if (walking) return <svg
    className={`${styles.original} ${className}`}
    viewBox="0 0 456 750"
    preserveAspectRatio="xMidYMax meet"
    role="img"
    aria-label={label || undefined}
    aria-hidden={!label || undefined}
    data-pose={facing}
    data-blinking={blinking}
    data-facing={facing}
    data-walking={walking}
    data-animation="walk-cycle"
    data-appearance-version={appearance?.version || 1}
    data-equipped-item={tee?.id || "original"}
    data-specs-mode={eyewear}
    data-item-colour={tee?.colour}
  >
    {facing==="front"&&<defs>
      <clipPath id={`${filterId}-head`}><rect width="456" height={frontWalkRegistration.headBottom}/></clipPath>
      <clipPath id={`${filterId}-body`}>{[0,1,2,3].map(index=><rect key={index} x={index%2*456} y={Math.floor(index/2)*750+frontWalkRegistration.headBottom} width="456" height={750-frontWalkRegistration.headBottom}/>)}</clipPath>
    </defs>}
    <svg width="456" height="750" overflow="hidden" aria-hidden="true">
      <g className={styles.walkAtlas}><image href={assetHref(roomieWalkArtwork[facing])} width="912" height="1500" clipPath={facing==="front"?`url(#${filterId}-body)`:undefined}/>
      {facing==="front"?[0,1,2,3].map(index=><g key={`head-${index}`} transform={`translate(${index%2*456} ${Math.floor(index/2)*750})`}><g clipPath={`url(#${filterId}-head)`}><g transform={frontWalkRegistration.headTransform}>
        <image href={assetHref(originalRoomieArtwork.front)} width="941" height="1671"/>
        <SpecsLayer pose="front" wearing={wearingSpecs} colour={frameColour} blinking={blinking}/>
      </g></g></g>):[0,1,2,3].map(index=><g key={`specs-${index}`} transform={`translate(${index%2*456} ${Math.floor(index/2)*750})`}><WalkingSpecsLayer pose={facing} frame={index} wearing={wearingSpecs} colour={frameColour} blinking={blinking}/></g>)}
      {tee&&appearance&&[0,1,2,3].map(index=><svg key={index} x={index%2*456} y={Math.floor(index/2)*750} width={456} height={750} viewBox="0 0 456 750" overflow="hidden"><FittedTop appearance={appearance} pose={facing} frame={index}/></svg>)}
      </g>
    </svg>
  </svg>;
  const [width,height]=roomiePoseSizes[facing];return <svg className={`${styles.original} ${className}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMax meet" role="img" aria-label={label||undefined} aria-hidden={!label||undefined} data-pose={facing} data-blinking={blinking} data-facing={facing} data-walking={walking} data-equipped-item={tee?.id||"original"} data-specs-mode={eyewear} data-item-colour={tee?.colour} data-appearance-version={appearance?.version||1}>
    <image href={assetHref(originalRoomieArtwork[facing])} width={width} height={height}/>
    <SpecsLayer pose={facing} wearing={wearingSpecs} colour={frameColour} blinking={blinking}/>
    {tee&&appearance&&<FittedTop appearance={appearance} pose={facing}/>}
  </svg>;
}
