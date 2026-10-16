"use client";
import { useEffect, useRef, useState } from "react";
import { appearanceStorageKey, readAppearance } from "@/lib/roomie";
import { commitWalletPurchase, readWallet, walletStorageKey, type DemoWallet } from "@/lib/wallet";
import type { StudentProfile } from "@/lib/types";

export function useWallet(profile?:StudentProfile) {
  const [wallet,setWallet]=useState<DemoWallet|null>(null),[error,setError]=useState("");
  const [loadedKey,setLoadedKey]=useState("");
  const busy=useRef(false),activeKey=useRef("");
  const key=profile?walletStorageKey(profile):"";
  activeKey.current=key;
  useEffect(()=>{
    const read=()=>{
      try {setWallet(profile?readWallet(localStorage.getItem(key),profile,readAppearance(localStorage.getItem(appearanceStorageKey(profile)))):null);setError("");}
      catch {setWallet(null);setError("Your local wallet is unavailable. No points were changed.");}
      setLoadedKey(key);
    };
    read();
    const storage=(event:StorageEvent)=>{if(event.key===key||event.key===null)read();};
    window.addEventListener("storage",storage);window.addEventListener("mashroom:wallet",read);
    return()=>{window.removeEventListener("storage",storage);window.removeEventListener("mashroom:wallet",read);};
  },[key,profile?.mode,profile?.id,profile?.classId]);
  async function purchase(itemId:string,requestId:string,revision:number,colour?:string) {
    if(!profile||loadedKey!==key)throw Error("Enter the demo before purchasing.");
    if(busy.current)throw Error("A purchase is already being saved.");
    if(!navigator.locks)throw Error("Purchases need a browser with safe local-wallet locking. Try a current browser.");
    busy.current=true;
    try {
      return await navigator.locks.request(key,()=>{
        if(activeKey.current!==key)throw Error("Your profile changed. Reopen the shop.");
        // One record stores debit + grant + receipt; storage failure commits nothing.
        const next=commitWalletPurchase(localStorage,profile,itemId,requestId,revision,Date.now(),colour);
        setWallet(next);window.dispatchEvent(new Event("mashroom:wallet"));
        return next.receipts.find(receipt=>receipt.id===requestId)!;
      });
    } catch(reason) {
      if(reason instanceof DOMException)throw Error("This browser could not save the purchase. No points were changed.");
      throw reason;
    } finally {busy.current=false;}
  }
  return {wallet:loadedKey===key?wallet:null,error,ready:loadedKey===key,purchase};
}
