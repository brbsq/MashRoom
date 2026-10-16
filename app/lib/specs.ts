import { appearanceItemColour, type RoomieAppearance } from "./roomie";
import type { RoomiePose } from "./wearables";
export const originalSpecsIndex=6;
export const isOriginalSpecs=(slot:string,index:number)=>slot==="accessories"&&index===originalSpecsIndex;
export function specsMode(appearance?:RoomieAppearance) {return appearance?.selection.accessories===originalSpecsIndex?"wearable":appearance?.selection.accessories===2?"none":"legacy";}
export const specsColour=(appearance:RoomieAppearance)=>appearanceItemColour(appearance,"accessories");
export const faceWindows:Record<RoomiePose,{x:number;y:number;width:number;height:number}>={
 front:{x:212,y:460,width:518,height:161},left:{x:195,y:434,width:370,height:178},right:{x:416,y:438,width:369,height:181},
};
export const walkingFaceTransform={left:"translate(-1 9) scale(.46)",right:"translate(-3 0) scale(.46)"};
