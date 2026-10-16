import { isStarterDecor } from "./room-decor";
import { shopCatalogue } from "./shop";
import { appearanceItemColour, appearanceStorageKey, readAppearance, type RoomieAppearance } from "./roomie";
import type { StudentProfile } from "./types";

// Device-local demo ledger, never an authoritative classroom/account balance.
export type ShopReceipt = { id:string; itemId:string; name:string; cost:number; tokens:number; at:number; balance:number; colour?:string };
export type DemoWallet = { version:1; revision:number; points:number; tokens:number; owned:string[]; colours:Record<string,string>; receipts:ShopReceipt[] };
export const walletStorageKey = (p:StudentProfile) => `mashroom:wallet:v1:${p.mode}:${encodeURIComponent(p.id)}:${encodeURIComponent(p.classId)}`;
export function initialWallet(profile:StudentProfile, appearance?:RoomieAppearance):DemoWallet {
  const owned=shopCatalogue.filter(item=>item.kind&&isStarterDecor(item.kind) || item.slot&&appearance?.selection[item.slot]===item.index).map(item=>item.id);
  const colours=Object.fromEntries(shopCatalogue.filter(item=>item.slot&&owned.includes(item.id)&&appearance).map(item=>[item.id,appearanceItemColour(appearance!,item.slot!)]));
  return {version:1,revision:0,points:profile.mode==="demo"?250:0,tokens:0,owned,colours,receipts:[]};
}
const whole=(v:unknown,max=1_000_000_000):v is number=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0&&v<=max;
export function readWallet(raw:string|null,profile:StudentProfile,appearance?:RoomieAppearance):DemoWallet {
  if(raw===null)return initialWallet(profile,appearance);
  // Corrupt data must never silently refill an already-spent wallet.
  const v=JSON.parse(raw);
  if(!v||v.version!==1||!whole(v.revision)||!whole(v.points)||!whole(v.tokens,1_000_000)||!Array.isArray(v.owned)||!Array.isArray(v.receipts)||v.receipts.length>1000)throw Error("Your local wallet could not be read. No points were changed.");
  const receipts:ShopReceipt[]=v.receipts.map((r:ShopReceipt)=>{
    if(!r||typeof r.id!=="string"||r.id.length>100||!shopCatalogue.some(i=>i.id===r.itemId)||typeof r.name!=="string"||!whole(r.cost)||!whole(r.tokens)||!whole(r.at,Number.MAX_SAFE_INTEGER)||!whole(r.balance))throw Error("Your local purchase history could not be read.");
    return {id:r.id,itemId:r.itemId,name:r.name,cost:r.cost,tokens:r.tokens,at:r.at,balance:r.balance,...(typeof r.colour==="string"&&/^#[0-9a-f]{6}$/i.test(r.colour)?{colour:r.colour}:{})};
  });
  const owned=[...new Set<string>(v.owned.filter((id:unknown)=>typeof id==="string"&&shopCatalogue.some(item=>item.id===id&&!item.tokens)))];
  for(const item of shopCatalogue)if(item.kind&&isStarterDecor(item.kind)&&!owned.includes(item.id))owned.push(item.id);
  const colours=Object.fromEntries(Object.entries(v.colours||{}).filter(([id,colour])=>owned.includes(id)&&typeof colour==="string"&&/^#[0-9a-f]{6}$/i.test(colour)));
  return {version:1,revision:v.revision,points:v.points,tokens:v.tokens,owned,colours:colours as Record<string,string>,receipts};
}
export function buyShopItem(wallet:DemoWallet,itemId:string,requestId:string,revision:number,at:number,colour?:string):DemoWallet {
  const existing=wallet.receipts.find(receipt=>receipt.id===requestId);
  if(existing){if(existing.itemId!==itemId)throw Error("Please reopen the purchase confirmation.");return wallet;}
  if(!requestId||requestId.length>100||!whole(at,Number.MAX_SAFE_INTEGER))throw Error("Please reopen the purchase confirmation.");
  const item=shopCatalogue.find(value=>value.id===itemId);
  if(!item)throw Error("That find is no longer available.");
  if(wallet.revision!==revision)throw Error("Your wallet changed in another tab. Review the new balance and try again.");
  if(!item.tokens&&wallet.owned.includes(itemId))throw Error("This find is already in your collection.");
  if(wallet.points<item.price)throw Error(`You need ${item.price-wallet.points} more demo points.`);
  if(wallet.receipts.length>=1000)throw Error("Your local history is full. No points were changed.");
  if(!whole(wallet.tokens+(item.tokens||0),1_000_000))throw Error("Your token wallet is full. No points were changed.");
  if(colour&&!item.colours?.includes(colour))throw Error("Choose an available colour first.");
  const points=wallet.points-item.price;
  return {...wallet,revision:wallet.revision+1,points,tokens:wallet.tokens+(item.tokens||0),owned:item.tokens?wallet.owned:[...wallet.owned,item.id],
    colours:colour?{...wallet.colours,[item.id]:colour}:wallet.colours,
    receipts:[...wallet.receipts,{id:requestId,itemId:item.id,name:item.name,cost:item.price,tokens:item.tokens||0,at,balance:points,...(colour?{colour}:{})}]};
}
export function commitWalletPurchase(storage:Pick<Storage,"getItem"|"setItem">,profile:StudentProfile,itemId:string,requestId:string,revision:number,at:number,colour?:string) {
  const key=walletStorageKey(profile);
  const current=readWallet(storage.getItem(key),profile,readAppearance(storage.getItem(appearanceStorageKey(profile))));
  const next=buyShopItem(current,itemId,requestId,revision,at,colour);
  if(next!==current)storage.setItem(key,JSON.stringify(next));
  return next;
}
