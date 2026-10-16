"use client";
import { useEffect, useState } from "react";
import { createBlinkController } from "@/lib/roomie-blink";

export function useRoomieBlink(enabled=true) {
  const [blinking,setBlinking]=useState(false);
  useEffect(()=>{
    if(!enabled)return;
    let live=true;
    const controller=createBlinkController(value=>{if(live)setBlinking(value);});
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>{if(document.visibilityState!=="visible"||motion.matches)controller.stop();else controller.start();};
    motion.addEventListener("change",sync);document.addEventListener("visibilitychange",sync);sync();
    return()=>{live=false;controller.stop();motion.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync);};
  },[enabled]);
  return enabled&&blinking;
}
