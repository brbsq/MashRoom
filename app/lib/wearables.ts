import { appearanceItemColour, mashroomTeeIndex, type RoomieAppearance } from "./roomie";
export type RoomiePose = "front" | "left" | "right";
export type GarmentPlacement = { x:number;y:number;width:number;height:number };
export const teeArtwork = {
  front: { path:"/clothing/mashroom-tee/front.png", width:1477,height:1065, viewBox:"156 158 1164 777" },
  left: { path:"/clothing/mashroom-tee/left.png", width:1184,height:1328, viewBox:"344 219 676 932" },
  right: { path:"/clothing/mashroom-tee/right.png", width:1184,height:1328, viewBox:"246 166 733 1024" },
} as const;
export const roomiePoseSizes = { front:[941,1671],left:[977,1610],right:[977,1609] } as const;
export const teePlacement:Record<RoomiePose,GarmentPlacement> = {
  front:{x:240,y:696,width:482,height:340},
  left:{x:365,y:669,width:281,height:302},
  right:{x:327,y:673,width:301,height:302},
};
// Coordinates are registered to each existing walk cell; the original atlas
// and garment overlays advance together. Heads, legs and hands are untouched.
export const walkingTeePlacement:Record<RoomiePose,GarmentPlacement[]> = {
  front:[{x:110,y:315,width:226,height:151},{x:120,y:315,width:222,height:151},{x:114,y:315,width:228,height:151},{x:120,y:315,width:222,height:151}],
  left:[{x:161,y:319,width:146,height:136},{x:175,y:319,width:125,height:138},{x:162,y:322,width:152,height:130},{x:164,y:321,width:144,height:131}],
  right:[{x:136,y:309,width:159,height:138},{x:159,y:309,width:121,height:134},{x:139,y:309,width:156,height:132},{x:158,y:307,width:120,height:135}],
};
// Pose-specific seam underlays cover the old baked-in high collar/sleeves.
// They follow the original shirt outline, never the face, hands or trousers.
export const teeSeams = {
  left:"M418 696 L550 669 L562 715 Q608 754 634 859 L623 874 L543 903 L545 957 L402 963 L375 878 Q384 782 421 732 Z",
  right:"M430 675 L561 704 L556 742 Q590 787 616 875 L587 889 L589 954 L424 961 L343 871 Q369 787 427 720 Z",
};
export const walkingTeeSeams = {
  front:Array.from({length:4},(_,frame)=>frame===2
    ?"M205 319 L258 319 L264 328 Q307 326 328 358 L339 390 L298 407 L282 395 L282 441 L175 441 L175 395 L140 407 L115 385 L133 350 L200 331 Z"
    :"M205 319 L258 319 L264 331 L300 339 L317 365 L325 390 L298 407 L282 395 L282 441 L175 441 L175 395 L140 407 L115 385 L133 350 L200 331 Z"),
  left:["M191 332 L255 319 L261 349 Q286 369 302 400 L255 429 L264 449 L189 453 L180 422 L166 407 L191 352 Z","M192 332 L256 319 L263 347 Q285 369 294 411 L243 426 L244 453 L194 456 L180 412 L183 358 Z","M191 335 L255 322 L264 350 L308 395 L281 422 L279 449 L191 452 L168 407 L194 354 Z","M192 335 L256 321 L265 351 Q288 375 303 408 L259 429 L267 449 L195 453 L174 410 L195 356 Z"],
  right:["M198 310 L265 320 L257 343 L290 397 L276 411 L277 440 L180 442 L180 416 L142 386 L178 344 Z","M199 310 L264 320 L258 343 L273 373 L272 431 L182 434 L164 392 L171 351 Z","M198 310 L264 320 L256 341 L289 383 L275 412 L279 431 L177 432 L174 401 L142 376 L178 343 Z","M199 308 L264 320 L257 342 L276 382 L268 427 L179 431 L166 390 L173 349 Z"],
};
export function equippedTee(appearance?:RoomieAppearance) {
  return appearance?.selection.tops===mashroomTeeIndex ? {id:"mashroom-logo-tee",colour:appearanceItemColour(appearance,"tops")} : null;
}
