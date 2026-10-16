"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export const sceneFadeMs = 800;
export function useSceneNavigation() {
  const router=useRouter(),[leaving,setLeaving]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function navigate(href:string) {
    if(timer.current)return;
    setLeaving(true);
    timer.current=setTimeout(()=>router.push(href),matchMedia("(prefers-reduced-motion: reduce)").matches?0:sceneFadeMs);
  }
  return {leaving,navigate};
}
