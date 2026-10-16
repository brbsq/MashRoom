import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { env } from "./mock-env.mjs";
import { handle, collectPages } from "../lib/server/google.ts";
import {
  digest,
  seal,
  unseal,
  validatePet,
  pkce,
} from "../lib/server/security.ts";
import { applyCare, defaultPet, seed, normalizePet } from "../lib/demo.ts";
import {
  needTone,
  needs,
  needValue,
  boundRoomPosition,
  rooms,
} from "../lib/pet-room.ts";
import { LocalRoom } from "../lib/room.ts";
import { movementFacing } from "../lib/roomie-motion.ts";
import { appVersion, releaseLabel } from "../lib/build-version.ts";
import { publicBuildDefines } from "../build/app-version.ts";
import { catalogueIndices, roomieGenders } from "../lib/roomie.ts";
import { idleTopRig,walkTopRig } from "../lib/garment-rig.ts";
import { shopCatalogue, filterShop, shopPreview, readShopSaved, shopStorageKey } from "../lib/shop.ts";
import { initialWallet, readWallet, buyShopItem, commitWalletPurchase, walletStorageKey } from "../lib/wallet.ts";
import { createBlinkController, blinkDurationMs, nextBlinkDelay, idleEyeRig, walkEyeRig } from "../lib/roomie-blink.ts";
test("natural blinks vary their pauses and finish a single blink before rescheduling",()=>{
 assert.equal(nextBlinkDelay(()=>0),2600);assert.equal(nextBlinkDelay(()=>1),7000);
 const jobs=new Map(),states=[];let id=0;
 const clock={set:(run,ms)=>{jobs.set(++id,{run,ms});return id;},clear:key=>jobs.delete(key)};
 const step=()=>{const [key,job]=jobs.entries().next().value;jobs.delete(key);job.run();return job.ms;};
 const blink=createBlinkController(value=>states.push(value),()=>.8,clock);
 blink.start();blink.start();assert.equal(jobs.size,1);assert.equal(states.at(-1),false);
 assert.equal(step(),6120);assert.equal(states.at(-1),true);
 assert.equal(step(),blinkDurationMs);assert.equal(states.at(-1),false);
 assert.equal(jobs.size,1);blink.stop();assert.equal(jobs.size,0);assert.equal(states.at(-1),false);
 blink.start();assert.equal(jobs.size,1);assert.equal(states.at(-1),false);blink.stop();
});
test("occasional double blinks pause briefly but never become a rapid repeating loop",()=>{
 const jobs=new Map(),states=[];let id=0;
 const clock={set:(run,ms)=>{jobs.set(++id,{run,ms});return id;},clear:key=>jobs.delete(key)};
 const next=()=>{const [key,job]=jobs.entries().next().value;jobs.delete(key);job.run();return job.ms;};
 const blink=createBlinkController(value=>states.push(value),()=>0,clock);blink.start();
 assert.equal(next(),2600);assert.equal(states.at(-1),true);
 assert.equal(next(),210);assert.equal(states.at(-1),false);
 assert.equal(next(),140);assert.equal(states.at(-1),true);
 assert.equal(next(),210);assert.equal(states.at(-1),false);
 assert.equal(jobs.values().next().value.ms,2600);
 blink.stop();assert.equal(jobs.size,0);
});
test("eyelids cover every directional pose and side walking frame beneath spectacles",()=>{
 assert.equal(idleEyeRig.front.length,2);
 for(const pose of ["left","right"]){assert.equal(idleEyeRig[pose].length,1);assert.equal(walkEyeRig[pose].length,4);}
 for(const rigs of [...Object.values(idleEyeRig),...Object.values(walkEyeRig).flat()])for(const rig of rigs)assert.ok(rig.x>0&&rig.y>0&&rig.width>0&&rig.height>0);
 const specs=readFileSync("components/mashroom/specs-layer.tsx","utf8");
 assert.ok(specs.indexOf("<BlinkLayer")<specs.indexOf("{wearing&&"));
 const hook=readFileSync("components/mashroom/use-roomie-blink.ts","utf8");
 for(const guard of ["visibilitychange","prefers-reduced-motion","controller.stop()","removeEventListener"])assert.ok(hook.includes(guard));
 const css=readFileSync("components/mashroom/roomie-renderer.module.css","utf8");assert.match(css,/roomieBlink 210ms/);
});
const walletProfile={id:"wallet-test",name:"QA",classId:"test",mode:"demo"};
test("wallet starts once with demo points and preserves legacy outfit and free furniture",()=>{
 const appearance=selectAppearanceItem(defaultAppearance(),"tops",6);
 const wallet=initialWallet(walletProfile,appearance);
 assert.equal(wallet.points,250);assert.equal(wallet.tokens,0);
 assert.ok(wallet.owned.includes("logo-tee"));assert.ok(wallet.owned.includes("sofa"));assert.ok(!wallet.owned.includes("lamp"));
 const mint=setAppearanceColour(appearance,"tops","#7cfeef");
 assert.equal(initialWallet(walletProfile,mint).colours["logo-tee"],"#7cfeef");
 assert.equal(initialWallet({...walletProfile,mode:"google"}).points,0);
 const spent=buyShopItem(wallet,"lamp","lamp-first",0,100);
 assert.equal(readWallet(JSON.stringify(spent),walletProfile).points,190);
 assert.equal(readWallet(JSON.stringify(spent),walletProfile).receipts.length,1);
});
test("item purchase atomically debits, grants ownership and records receipt without mutating input",()=>{
 const wallet=initialWallet(walletProfile),before=JSON.stringify(wallet);
 const next=buyShopItem(wallet,"lamp","one",0,100);
 assert.equal(next.points,190);assert.equal(next.revision,1);assert.ok(next.owned.includes("lamp"));
 assert.deepEqual(next.receipts[0],{id:"one",itemId:"lamp",name:"Starlight lamp",cost:60,tokens:0,at:100,balance:190});
 assert.equal(JSON.stringify(wallet),before);
 assert.throws(()=>buyShopItem(next,"lamp","two",1,200),/already/);
 assert.equal(buyShopItem(next,"lamp","one",0,200),next);
 assert.throws(()=>buyShopItem(next,"tokens-5","one",1,200),/reopen/);
});
test("token packs can be bought again with distinct requests but never duplicate a request",()=>{
 let wallet=initialWallet(walletProfile);
 wallet=buyShopItem(wallet,"tokens-5","pack-one",0,100);
 assert.equal(wallet.points,205);assert.equal(wallet.tokens,5);assert.ok(!wallet.owned.includes("tokens-5"));
 assert.equal(buyShopItem(wallet,"tokens-5","pack-one",0,100),wallet);
 wallet=buyShopItem(wallet,"tokens-5","pack-two",1,200);
 assert.equal(wallet.points,160);assert.equal(wallet.tokens,10);
 assert.equal(wallet.receipts.length,2);
 assert.throws(()=>buyShopItem(wallet,"tokens-12","stale",0,300),/changed/);
 assert.throws(()=>buyShopItem({...wallet,points:0},"tokens-1","poor",2,300),/need 10/);
});
test("wallet refuses corrupt data instead of silently refilling points",()=>{
 for(const raw of ["oops","null","{}",JSON.stringify({...initialWallet(walletProfile),points:-1}),JSON.stringify({...initialWallet(walletProfile),tokens:1.5})])assert.throws(()=>readWallet(raw,walletProfile));
 assert.throws(()=>buyShopItem(initialWallet(walletProfile),"missing","x",0,100),/no longer/);
 assert.throws(()=>buyShopItem(initialWallet(walletProfile),"original-specs","x",0,100,"#bad"),/colour/);
 const next=buyShopItem(initialWallet(walletProfile),"original-specs","specs",0,100,"#66534c");
 assert.equal(next.colours["original-specs"],"#66534c");
 assert.equal(readWallet(JSON.stringify(next),walletProfile).receipts[0].colour,"#66534c");
 assert.notEqual(walletStorageKey(walletProfile),walletStorageKey({...walletProfile,classId:"other"}));
 assert.notEqual(walletStorageKey(walletProfile),walletStorageKey({...walletProfile,mode:"google"}));
});
test("storage failure cannot commit a partial purchase and storage transaction writes one record",()=>{
 const data=new Map(),writes=[];
 const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>{writes.push(key);data.set(key,value);}};
 const next=commitWalletPurchase(storage,walletProfile,"tokens-5","one",0,100);
 assert.deepEqual(writes,[walletStorageKey(walletProfile)]);
 assert.equal(next.points,205);assert.equal(next.tokens,5);
 commitWalletPurchase(storage,walletProfile,"tokens-5","one",0,200);
 assert.equal(writes.length,1);
 const before=data.get(walletStorageKey(walletProfile));
 const failed={...storage,setItem:()=>{throw Error("quota");}};
 assert.throws(()=>commitWalletPurchase(failed,walletProfile,"lamp","two",1,200),/quota/);
 assert.equal(data.get(walletStorageKey(walletProfile)),before);
});
test("purchased room collectibles appear in inventory while locked new art is absent",()=>{
 const appearance=defaultAppearance();
 assert.ok(!demoInventory(appearance).some(item=>item.kind==="lamp"));
 const bought=demoInventory(appearance,["lamp","original-specs"],{"original-specs":"#66534c"});
 assert.ok(bought.some(item=>item.kind==="lamp"&&item.purchased));
 assert.ok(bought.some(item=>item.id==="shop:original-specs"&&item.colour==="#66534c"&&item.surface==="stored"));
});
test("shop catalogue filters, searches and sorts without changing its featured order",()=>{
 const order=shopCatalogue.map(item=>item.id);
 assert.equal(new Set(order).size,shopCatalogue.length);
 assert.equal(filterShop("Clothing","",[],"featured").length,2);
 assert.equal(filterShop("Furniture","",[],"featured").length,4);
 assert.equal(filterShop("Decorations","",[],"featured").length,5);
 assert.equal(filterShop("Arcade Tokens","",[],"featured").length,3);
 assert.deepEqual(filterShop("All","  MOON  ",[],"featured").map(item=>item.id),["art"]);
 assert.deepEqual(filterShop("Saved","",["logo-tee","plant"],"featured").map(item=>item.id),["logo-tee","plant"]);
 assert.equal(filterShop("Saved","missing",["logo-tee"],"featured").length,0);
 const sorted=filterShop("All","",[],"az");
 assert.deepEqual(sorted.map(item=>item.name),[...sorted.map(item=>item.name)].sort((a,b)=>a.localeCompare(b)));
 assert.deepEqual(shopCatalogue.map(item=>item.id),order);
});
test("shop try-ons preserve the saved appearance and compose with its outfit",()=>{
 const original=defaultAppearance("Mochi"),before=JSON.stringify(original);
 const tee=shopCatalogue.find(item=>item.id==="logo-tee");
 const preview=shopPreview(original,tee,"#7cfeef");
 assert.equal(preview.selection.tops,6);
 assert.equal(appearanceItemColour(preview,"tops"),"#7cfeef");
 const glasses=shopPreview(preview,shopCatalogue.find(item=>item.id==="original-specs"),"#66534c");
 assert.equal(glasses.selection.accessories,6);
 assert.equal(appearanceItemColour(glasses,"accessories"),"#66534c");
 assert.equal(appearanceItemColour(glasses,"tops"),"#7cfeef");
 assert.equal(JSON.stringify(original),before);
 assert.equal(shopPreview(original,shopCatalogue.find(item=>item.id==="sofa")),original);
});
test("shop saved finds reject invalid data and isolate each identity and class",()=>{
 for(const raw of [null,"bad","null","{}",'{"id":"logo-tee"}'])assert.deepEqual(readShopSaved(raw),[]);
 assert.deepEqual(readShopSaved('["logo-tee","plant","logo-tee","unknown",4]'),["logo-tee","plant"]);
 const p={id:"a:b",name:"A",classId:"c:d",mode:"demo"};
 assert.notEqual(shopStorageKey(p),shopStorageKey({...p,id:"a",classId:"b:c:d"}));
 assert.notEqual(shopStorageKey(p),shopStorageKey({...p,mode:"google"}));
 assert.notEqual(shopStorageKey(p),shopStorageKey({...p,classId:"other"}));
});
test("shop route is connected to both builds and phone with a demo-only checkout",()=>{
 assert.equal(phoneAppPages.flat().find(app=>app.name==="Shop").href,"/shop");
 assert.match(readFileSync("pages/main.tsx","utf8"),/"\/shop": <Shop \/>/);
 assert.match(readFileSync("scripts/pages-routes.mjs","utf8"),/"shop"/);
 const component=readFileSync("components/mashroom/shop.tsx","utf8");
 assert.doesNotMatch(component,/\bsave\(preview\)|\bupdate\(|\bfetch\(/);
 assert.match(component,/no real money or classroom-earned points/);
});
test("catalogue puts removal first without renumbering saved accessories",()=>{
  assert.equal(catalogueIndices("accessories")[0],2);
  assert.equal(options.accessories[2],"No accessories");
  assert.equal(catalogueIndices("accessories")[1],6);
  assert.equal(catalogueIndices("tops")[0],6);
  assert.deepEqual([...catalogueIndices("accessories")].sort((a,b)=>a-b),[0,1,2,3,4,5,6]);
});
test("gender starts unselected and only Girl and Boy are offered",()=>{
  assert.equal(defaultAppearance().gender,"unspecified");
  assert.deepEqual(roomieGenders.map(g=>g.id),["girl","boy"]);
  // Removing an option from the UI does not rewrite old user data.
  assert.equal(normalizeAppearance({...defaultAppearance(),gender:"nonbinary"}).gender,"nonbinary");
});
test("fitted tops have torso and neck registrations for every idle and walking pose",()=>{
  for(const pose of ["front","left","right"]){
    assert.equal(walkTopRig[pose].length,4);
    for(const rig of [idleTopRig[pose],...walkTopRig[pose]]){
      for(const key of ["boundary","collar","neck","neckline"])assert.ok(rig[key].startsWith("M"));
      assert.ok(rig.logo.every(v=>Number.isFinite(v)&&v>0));
    }
  }
  const renderer=readFileSync("components/mashroom/roomie-renderer.tsx","utf8");
  assert.match(renderer,/FittedTop appearance=\{appearance\} pose=\{facing\} frame=\{index\}/);
  assert.doesNotMatch(renderer,/<TeeLayer/);
});
test("scene fades and temporary needs preserve reduced motion and accessible dismissal",()=>{
  const nav=readFileSync("components/mashroom/use-scene-navigation.ts","utf8");
  assert.match(nav,/sceneFadeMs = 800/);assert.match(nav,/prefers-reduced-motion/);assert.match(nav,/clearTimeout/);
  const needs=readFileSync("components/mashroom/need-ring.tsx","utf8");
  assert.match(needs,/setTimeout\(\(\)=>changeOpen\(false\),3000\)/);
  const room=readFileSync("components/mashroom/pet-room.tsx","utf8");
  assert.match(room,/<PopoverContent side="bottom" align="end"/);
  assert.doesNotMatch(room,/<div className=\{styles.roomCaption\}/);
});
test("welcome version follows package metadata and builds receive a timestamp", () => {
  const pkg=JSON.parse(readFileSync("package.json","utf8"));
  assert.equal(appVersion,pkg.version);
  assert.equal(releaseLabel,`alpha ${pkg.version}`);
  const timestamp=JSON.parse(publicBuildDefines()["process.env.NEXT_PUBLIC_MASHROOM_BUILD_TIME"]);
  assert.ok(Number.isFinite(Date.parse(timestamp)));
  for(const config of ["vite.config.ts","vite.pages.config.ts"]) assert.match(readFileSync(config,"utf8"),/publicBuildDefines\(\)/);
});
test("welcome and login retain requested copy, original logo and automatic introduction", () => {
  const welcome=readFileSync("app/page.tsx","utf8"),login=readFileSync("app/login/page.tsx","utf8");
  assert.doesNotMatch(welcome,/Skip intro/);
  assert.match(welcome,/setPhase\("ready"\)/);
  assert.match(login,/Hello, Roomie\./);
  assert.match(login,/\/landing\/logo\.png/);
  assert.doesNotMatch(login,/YOUR NEW CHAPTER|Your little buddy is ready|\/pet\.png|A little hello/);
  const css=readFileSync("app/welcome.module.css","utf8");
  assert.match(css,/-webkit-text-stroke:\s*0/);
  assert.match(css,/\.tagline\s*\{\s*opacity:\s*\.5/);
});
test("Roomie faces the viewer for downward travel and retains side walks for horizontal travel", () => {
  const from={x:50,y:85};
  assert.equal(movementFacing(from,{x:50,y:90},"left"),"front");
  assert.equal(movementFacing(from,{x:52,y:90},"right"),"front");
  assert.equal(movementFacing(from,{x:57,y:87},"front"),"right");
  assert.equal(movementFacing(from,{x:43,y:87},"front"),"left");
  assert.equal(movementFacing(from,{x:50,y:80},"left"),"left");
  assert.equal(movementFacing(from,from,"front"),"front");
  assert.equal(movementFacing(from,{x:50.01,y:85.01},"right"),"right");
});
import { designScale, editorControlScale, editorControls, clothingPaletteScale } from "../lib/figma-controls.ts";
import { formatPhoneClock,emptyPhoneSwipe,trackPhoneSwipe,swipePage } from "../lib/phone.ts";
import { specsMode,specsColour,originalSpecsIndex,faceWindows,walkingFaceTransform } from "../lib/specs.ts";
test("phone clock uses DD Month and dotted twelve-hour periods",()=>{
 assert.deepEqual(formatPhoneClock(new Date(2026,9,5,10,11)),{time:"10:11 a.m.",date:"05 October"});
 assert.equal(formatPhoneClock(new Date(2026,0,1,0,3)).time,"12:03 a.m.");
 assert.equal(formatPhoneClock(new Date(2026,9,15,23,7)).time,"11:07 p.m.");
});
test("phone gestures support four directions, wrap pages and lock momentum",()=>{
 let result=trackPhoneSwipe(emptyPhoneSwipe(),20,2,1000);assert.equal(result.direction,0);
 result=trackPhoneSwipe(result.state,30,3,1020);assert.equal(result.direction,1);
 result=trackPhoneSwipe(result.state,90,0,1050);assert.equal(result.direction,0);assert.equal(result.state.locked,true);
 result=trackPhoneSwipe(result.state,-60,2,1400);assert.equal(result.direction,-1);
 const vertical=trackPhoneSwipe(emptyPhoneSwipe(),4,70,1000);assert.equal(vertical.direction,1);assert.equal(vertical.state.locked,true);
 assert.equal(trackPhoneSwipe(vertical.state,90,0,1020).direction,0);
 assert.equal(trackPhoneSwipe(emptyPhoneSwipe(),1,1,1000).direction,0);
 assert.equal(trackPhoneSwipe(emptyPhoneSwipe(),0,-70,1000).direction,-1);
 assert.equal(trackPhoneSwipe(emptyPhoneSwipe(),-70,0,1000).direction,-1);
 assert.equal(swipePage(0,-1),1);assert.equal(swipePage(1,1),0);
});
test("phone swipe threshold, diagonal intent and quiet reset do not mutate prior state",()=>{
 const initial=emptyPhoneSwipe();
 let result=trackPhoneSwipe(initial,0,47,1000);
 assert.equal(result.direction,0);
 assert.deepEqual(initial,emptyPhoneSwipe());
 const partial={...result.state};
 result=trackPhoneSwipe(result.state,0,1,1010);
 assert.equal(result.direction,1);
 assert.deepEqual(partial,{x:0,y:47,lastAt:1000,locked:false});
 assert.equal(trackPhoneSwipe(emptyPhoneSwipe(),49,-60,1000).direction,-1);
 assert.equal(trackPhoneSwipe(emptyPhoneSwipe(),-60,49,1000).direction,-1);
 // A new gesture starts clean, not from an unfinished previous swipe.
 result=trackPhoneSwipe(partial,0,2,1300);
 assert.equal(result.direction,0);
 assert.equal(result.state.y,2);
});
test("phone handoff guards duplicate launches and cancels a pending route on reopen",()=>{
 const phone=readFileSync("components/mashroom/room-phone.tsx","utf8");
 const launch=phone.slice(phone.indexOf('const launch = (name: string)'));
 const launchGuard=launch.indexOf('if (handingOff.current) return;');
 assert.ok(launchGuard>=0&&launchGuard<launch.indexOf('if (name === "Settings")'));
 const hrefAction=phone.slice(phone.indexOf('if (href)'));
 const routeGuard=hrefAction.indexOf('if (handingOff.current) return;');
 assert.ok(routeGuard>=0&&routeGuard<hrefAction.indexOf('handingOff.current = true;'));
 const reopen=phone.slice(phone.indexOf('const changeOpen ='),phone.indexOf('const choose ='));
 assert.match(reopen,/if \(next\) \{[\s\S]*clearTimeout\(handoffTimer.current\)/);
 assert.match(reopen,/touchStart.current=null/);
 assert.match(reopen,/suppressClickUntil.current = 0/);
});
test("Roomie gender is optional draft data, validated, saved and undoable",()=>{
 const old=defaultAppearance();delete old.gender;
 assert.equal(normalizeAppearance(old).gender,"unspecified");
 for(const gender of ["girl","boy","nonbinary","unspecified"]){const value={...defaultAppearance(),gender};assert.equal(readAppearance(JSON.stringify(value)).gender,gender);}
 assert.equal(normalizeAppearance({...old,gender:"unexpected"}).gender,"unspecified");
 const initial=defaultAppearance(),edited={...initial,gender:"girl"};
 const h=editHistory({past:[],present:initial,future:[]},edited);
 assert.equal(undoHistory(h).present.gender,"unspecified");assert.equal(redoHistory(undoHistory(h)).present.gender,"girl");assert.equal(initial.gender,"unspecified");
});
test("original specs are a real optional accessory without reindexing old choices",()=>{
 const legacy=defaultAppearance();legacy.selection.accessories=3;
 assert.equal(options.accessories[3],"Square glasses");assert.equal(specsMode(legacy),"legacy");
 const equipped=selectAppearanceItem(legacy,"accessories",originalSpecsIndex);
 assert.equal(specsMode(equipped),"wearable");assert.equal(specsColour(equipped),"#b7b9b8");
 assert.equal(specsColour(setAppearanceColour(equipped,"accessories","#007dcc")),"#007dcc");
 const none=selectAppearanceItem(equipped,"accessories",2);assert.equal(specsMode(none),"none");
 assert.deepEqual(readAppearance(JSON.stringify(equipped)),equipped);assert.equal(isClothingFavourite("accessories:6"),true);
 for(const pose of ["front","left","right"]){assert.ok(readFileSync(`public/accessories/roomie-specs/${pose}.svg`).length);const bytes=readFileSync(`public/accessories/roomie-specs/bare-${pose}.png`);assert.ok(bytes.length>1000);const w=faceWindows[pose];assert.ok(w.x>0&&w.y>0&&w.width>0&&w.height>0);}
 assert.match(walkingFaceTransform.left,/scale/);assert.match(walkingFaceTransform.right,/scale/);
 for(const pose of ["left","right"]){const bytes=readFileSync(`public/accessories/roomie-specs/bare-walk-${pose}.png`);assert.ok(Math.abs(bytes.readUInt32BE(16)/bytes.readUInt32BE(20)-912/1500)<.01);}
});
test("Closet palette preserves Figma sizing and reserves phone screen margins", () => {
  assert.equal(clothingPaletteScale(1920,1080),1);
  assert.equal(clothingPaletteScale(1176,757),1176/1920);
  for(const width of [320,390,720]) assert.equal(602*clothingPaletteScale(width,844),width-32);
  const css=readFileSync("components/mashroom/appearance-editor.module.css","utf8");
  for(const selector of [".closet .catalogue", ".closet .categories", ".paletteCanvas"]) {
    const block=css.slice(css.indexOf(`${selector} {`)).split("}")[0];
    assert.ok(block.search(/(?:^|;)\s*backdrop-filter:/)>block.indexOf("-webkit-backdrop-filter:"));
  }
  for(const [asset,width,height] of [["ba553.svg",602,110],["42d9e.svg",58,3],["f1371.svg",1073,748]]){
    const root=readFileSync(`public/creation/${asset}`,"utf8").match(/<svg\b[^>]*>/)[0];
    assert.ok(root.includes(`width="${width}"`) && root.includes(`height="${height}"`));
  }
});
import { readBgmPreferences, bgmTracks } from "../lib/bgm.ts";
import { demoInventory, filterInventory } from "../lib/inventory.ts";
import { hsvToHex, hexToHsv } from "../lib/colour.ts";
test("colour picker preserves hex values and maps hue, saturation and brightness", () => {
  for (const hex of ["#56436d", "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#abcdef"]) assert.equal(hsvToHex(hexToHsv(hex)),hex);
  assert.equal(hsvToHex({h:270,s:1,v:1}),"#8000ff");
  assert.equal(hsvToHex({h:120,s:0,v:1}),"#ffffff");
  assert.equal(hsvToHex({h:120,s:1,v:0}),"#000000");
  assert.equal(hexToHsv("#oops"),null);
  assert.equal(hexToHsv("#123"),null);
});
test("Storeroom categories, search, placement and sorting compose without mutating inventory", () => {
  const inventory=demoInventory(defaultAppearance());
  assert.equal(inventory.length,10);
  assert.equal(filterInventory(inventory,"Furniture","","all","default").length,3);
  assert.equal(filterInventory(inventory,"Clothing","","worn","default").length,4);
  assert.deepEqual(filterInventory(inventory,"All"," MOON ","wall","default").map(i=>i.id),["art"]);
  assert.equal(filterInventory(inventory,"Furniture","","wall","default").length,0);
  assert.equal(filterInventory(inventory,"All","missing","all","default").length,0);
  const before=inventory.map(i=>i.id);
  const az=filterInventory(inventory,"All","","all","az");
  const za=filterInventory(inventory,"All","","all","za");
  assert.deepEqual(za.map(i=>i.id),az.map(i=>i.id).reverse());
  assert.deepEqual(inventory.map(i=>i.id),before);
});
test("BGM defaults to 20%, validates stored volume and keeps mute independent", () => {
  for (const raw of [null, "bad json", "null", "{}", '{"volume":"100"}']) {
    assert.deepEqual(readBgmPreferences(raw), { volume: .2, muted: false });
  }
  assert.deepEqual(readBgmPreferences('{"volume":0.25,"muted":true}'), { volume: .25, muted: true });
  assert.deepEqual(readBgmPreferences('{"volume":0,"muted":false}'), { volume: 0, muted: false });
  assert.deepEqual(readBgmPreferences('{"volume":2,"muted":"true"}'), { volume: 1, muted: false });
  assert.equal(readBgmPreferences('{"volume":-1}').volume, 0);
  assert.equal(readBgmPreferences('{"volume":1e999}').volume, .2);
});
test("each editor uses its supplied BGM file", () => {
  assert.equal(bgmTracks.closet, "/audio/closet.mp3");
  assert.equal(bgmTracks.maker, "/audio/roomie-maker.mp3");
  for (const path of Object.values(bgmTracks)) assert.ok(readFileSync(`public${path}`).length > 0);
});
test("Figma editor controls use exact circles, offsets and icon proportions", () => {
  assert.equal(editorControls.diameter,98);
  assert.equal(editorControls.width,582);
  assert.deepEqual(editorControls.offsets,[0,120,240,364,484]);
  assert.deepEqual(editorControls.gaps,[22,22,26,22]);
  assert.deepEqual(editorControls.iconSizes,{filter:65,undo:60,redo:60,cancel:70,save:60});
  assert.equal(editorControlScale(1920,1080),1);
  assert.equal(designScale(1280,720),2/3);
  assert.equal(editorControlScale(1024,768),1024/1920);
  assert.equal(editorControlScale(1920,800),800/1080);
  assert.equal(editorControlScale(844,390),44/98);
  for (const width of [320,390,557,720]) {
    const scale=editorControlScale(width,844);
    assert.ok(98*scale>=44 && 98*scale<=62);
    assert.ok(582*scale<=width-32+.0001);
  }
});
test("frosted needs CSS retains the standard blur after the Safari alias", () => {
  const css=readFileSync("components/mashroom/pet-room.module.css","utf8");
  const block=css.match(/\.needPopup\s*\{([\s\S]*?)\}/)[1];
  assert.match(block,/blur\(32px\)/);
  assert.ok(block.search(/(?:^|\n)\s*backdrop-filter:/)>block.indexOf("-webkit-backdrop-filter:"));
  const icon=css.match(/\.needIcon\s*\{([\s\S]*?)\}/)[1];
  assert.ok(icon.search(/(?:^|\n)\s*backdrop-filter:/)>icon.indexOf("-webkit-backdrop-filter:"));
  for (const need of needs) assert.ok(readFileSync(`public/rooms/${need.icon}`).length > 0);
});
import {
  phoneModels,
  phoneThemes,
  readPhonePreferences,
  phoneStorageKey,
  phoneAppPages,
} from "../lib/phone.ts";
test("phone apps use Wardrobe for Closet, Shop and Storeroom without Mirror", () => {
  const apps = phoneAppPages.flat();
  assert.equal(apps.filter(app => app.href === "/closet").length, 1);
  assert.equal(apps.find(app => app.href === "/closet").name, "Wardrobe");
  assert.ok(apps.some(app => app.name === "Shop"));
  assert.ok(apps.some(app => app.name === "Storeroom"));
  assert.ok(!apps.some(app => app.name === "Mirror" || app.name === "Store"));
  assert.ok(phoneAppPages.every(page => page.length <= 9));
  for (const app of apps) assert.ok(readFileSync(`public/rooms/${app.icon}`).length > 0);
});
test("phone preferences validate device and theme independently", () => {
  assert.deepEqual(readPhonePreferences(null), {
    model: "modern",
    theme: "meadow",
  });
  assert.deepEqual(readPhonePreferences("not json"), {
    model: "modern",
    theme: "meadow",
  });
  assert.deepEqual(readPhonePreferences("null"), {
    model: "modern",
    theme: "meadow",
  });
  assert.deepEqual(
    readPhonePreferences('{"model":"classic","theme":"unknown"}'),
    { model: "classic", theme: "meadow" },
  );
  for (const model of phoneModels)
    for (const theme of phoneThemes) {
      const value = { model: model.id, theme: theme.id };
      assert.deepEqual(readPhonePreferences(JSON.stringify(value)), value);
    }
});
test("phone appearance storage is separate for each identity and class", () => {
  const p = { mode: "demo", id: "one", classId: "willow" };
  assert.notEqual(phoneStorageKey(p), phoneStorageKey({ ...p, id: "two" }));
  assert.notEqual(
    phoneStorageKey(p),
    phoneStorageKey({ ...p, classId: "oak" }),
  );
  assert.notEqual(
    phoneStorageKey(p),
    phoneStorageKey({ ...p, mode: "google" }),
  );
});
import {
  decorCatalog,
  decorStorageKey,
  normalizeDecor,
  readLayouts,
  boundDecor,
  sceneLayers,
  surfaceBounds,
  orderDecor,
} from "../lib/room-decor.ts";
test("room decorations reject unknown items and bound all transforms", () => {
  const item = {
    id: "one",
    kind: "sofa",
    x: -10,
    y: 150,
    scale: 8,
    rotation: -999,
    foreground: true,
  };
  assert.deepEqual(
    normalizeDecor([item, item, { id: "two", kind: "unknown" }, null]),
    [{ ...item, x: 0, y: 100, scale: 2.5, rotation: -180, layer: "front", order: 0 }],
  );
  assert.equal(
    normalizeDecor(
      Array.from({ length: 45 }, (_, i) => ({ ...item, id: `${i}` })),
    ).length,
    40,
  );
  assert.equal(new Set(decorCatalog.map((c) => c.id)).size, 9);
  assert.equal(normalizeDecor([{ ...item, x: NaN, scale: Infinity }])[0].x, 50);
});
test("room layouts round-trip independently and isolate profiles and classes", () => {
  const item = {
    id: "one",
    kind: "plant",
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    foreground: false,
  };
  const layouts = readLayouts(
    JSON.stringify({
      living: [item],
      bedroom: [{ ...item, id: "bed", x: 60 }],
      unknown: [item],
    }),
  );
  assert.deepEqual(layouts.living, [{ ...item, layer: "behind", order: 0 }]);
  assert.equal(layouts.bedroom[0].x, 60);
  assert.equal(layouts.unknown, undefined);
  assert.deepEqual(readLayouts("invalid"), {});
  assert.deepEqual(readLayouts("null"), {});
  const profile = { id: "one", classId: "class:a", mode: "demo" };
  assert.notEqual(
    decorStorageKey(profile),
    decorStorageKey({ ...profile, classId: "class:b" }),
  );
  assert.notEqual(
    decorStorageKey(profile),
    decorStorageKey({ ...profile, id: "two" }),
  );
  assert.notEqual(
    decorStorageKey(profile),
    decorStorageKey({ ...profile, mode: "google" }),
  );
});
import { defaultAppearance, normalizeAppearance, readAppearance, appearanceStorageKey, editHistory, undoHistory, redoHistory, options, appearanceItemColour, selectAppearanceItem, setAppearanceColour, isClothingFavourite, mashroomTeeIndex } from "../lib/roomie.ts";
import { equippedTee, teeArtwork, teePlacement, walkingTeePlacement, roomiePoseSizes } from "../lib/wearables.ts";
test("real MashRoom tee appends without changing legacy outfits and keeps a separate colour",()=>{
  const old=defaultAppearance("Original");delete old.itemColours;old.selection.tops=1;old.colors.tops="#007dcc";
  const legacy=readAppearance(JSON.stringify(old));
  assert.equal(legacy.selection.tops,1);assert.equal(options.tops[1],"Roomie hoodie");
  assert.equal(equippedTee(legacy),null);
  const tee=selectAppearanceItem(legacy,"tops",mashroomTeeIndex);
  assert.equal(appearanceItemColour(tee,"tops"),"#ffffff");
  assert.equal(legacy.colors.tops,"#007dcc");assert.deepEqual(legacy.itemColours,{});
  const dyed=setAppearanceColour(tee,"tops","#ef9147");
  const reverted=selectAppearanceItem(dyed,"tops",1);
  assert.equal(appearanceItemColour(reverted,"tops"),"#007dcc");
  assert.equal(equippedTee(selectAppearanceItem(reverted,"tops",6)).colour,"#ef9147");
  const saved={...dyed,created:true,favourites:["tops:6"]};
  assert.deepEqual(readAppearance(JSON.stringify(saved)),saved);
  assert.equal(isClothingFavourite("tops:6"),true);assert.equal(isClothingFavourite("tops:7"),false);
  const invalid=normalizeAppearance({...saved,itemColours:{"tops:6":"#ef9147","hair:0":"#ffffff","tops:7":"#ffffff","tops:0":"bad"}});
  assert.deepEqual(invalid.itemColours,{"tops:6":"#ef9147"});
  const history=editHistory({past:[],present:legacy,future:[]},tee);
  assert.deepEqual(undoHistory(history).present,legacy);
  assert.deepEqual(redoHistory(undoHistory(history)).present,tee);
});
test("tee garments exist for idle poses and all four registered walk frames",()=>{
  for(const pose of ["front","left","right"]){
    const art=teeArtwork[pose],p=teePlacement[pose],size=roomiePoseSizes[pose];
    const bytes=readFileSync(`public${art.path}`);assert.equal(bytes.readUInt32BE(16),art.width);assert.equal(bytes.readUInt32BE(20),art.height);
    assert.ok(p.x>=0 && p.y>=0 && p.x+p.width<=size[0] && p.y+p.height<=size[1]);
  }
  for(const pose of ["front","left","right"]){assert.equal(walkingTeePlacement[pose].length,4);for(const p of walkingTeePlacement[pose])assert.ok(p.x>=0 && p.y>=0 && p.x+p.width<=456 && p.y+p.height<=750);}
});
import { neighbourhoods, readNeighbourhood, mapStorageKey } from "../lib/rooma-map.ts";
test("appearance validation keeps clothing-only favourites and safe swatches", () => {
  const d = defaultAppearance("Tester");
  const value = normalizeAppearance({ ...d, name: "  Roomie  ", selection: { ...d.selection, hair: 100, eyes: 2 }, colors: { ...d.colors, hair: "bad", eyes: "#123456" }, favourites: ["hair:0", "makeup:0", "tops:1", "tops:1", "shoes:6", "accessories:2"], swatches: ["bad", "#123456", "#123456"] });
  assert.deepEqual(value.favourites, ["tops:1", "accessories:2"]);
  assert.deepEqual(value.swatches, ["#123456"]);
  assert.equal(value.name, "Roomie");
  assert.equal(value.selection.hair, 0);
  assert.equal(value.selection.eyes, 2);
  assert.equal(value.colors.hair, d.colors.hair);
  assert.equal(value.colors.eyes, "#123456");
  assert.deepEqual(readAppearance("invalid", "Tester"), d);
  assert.deepEqual(readAppearance(JSON.stringify(value)), value);
});
test("appearance and map keys isolate profile, class and identity mode", () => {
  const p = { id: "test", classId: "one", mode: "demo" };
  for (const key of [appearanceStorageKey, mapStorageKey]) {
    assert.notEqual(key(p), key({ ...p, classId: "two" }));
    assert.notEqual(key(p), key({ ...p, id: "another" }));
    assert.notEqual(key(p), key({ ...p, mode: "google" }));
  }
  assert.equal(neighbourhoods.length, 5);
  assert.equal(readNeighbourhood("Pantai Walk"), "Pantai Walk");
  assert.equal(readNeighbourhood("Unknown place"), "City Square");
});
test("editor undo redo restores full draft and branching clears redo", () => {
  let h = { past: [], present: defaultAppearance(), future: [] };
  const initial = h.present;
  h = editHistory(h, { ...h.present, name: "New Roomie", favourites: ["tops:2"] });
  const edited = h.present;
  h = undoHistory(h);
  assert.deepEqual(h.present, initial);
  h = redoHistory(h);
  assert.deepEqual(h.present, edited);
  h = editHistory(undoHistory(h), { ...initial, swatches: ["#112233"] });
  assert.deepEqual(h.future, []);
  assert.deepEqual(redoHistory(h), h);
  for (let i=0;i<60;i++) h=editHistory(h,{...h.present,name:`Name ${i}`});
  assert.equal(h.past.length, 50);
});
test("furniture migration retains transforms and original layering intent", () => {
  for (const foreground of [true,false]) {
    const [item] = normalizeDecor([{ id: "legacy", kind: "plant", x: 33, y: 50, scale: 1.3, rotation: 25, foreground }]);
    assert.equal(item.layer,foreground?"front":"behind");
    assert.equal(item.scale,1.3);
    assert.equal(item.rotation,25);
    assert.ok(boundDecor(item).y>=83);
  }
});
test("furniture bounds fit rotated assets and floor or wall constraints", () => {
  for (const entry of decorCatalog) for (const aspect of [16/9,390/700]) for (const rotation of [0,45,90,-135,180]) {
    const item=boundDecor({id:entry.id,kind:entry.id,x:-50,y:150,scale:2.5,rotation,foreground:false,layer:"auto",order:0},"living",aspect, aspect<1?40:70.8333);
    assert.ok(item.x>0 && item.x<100);
    assert.ok(item.scale>=.25 && item.scale<=2.5);
    assert.ok(entry.surface==="floor"?item.y>=83&&item.y<=97:item.y>=15&&item.y<=77,JSON.stringify({kind:entry.id,aspect,rotation,item}));
    const h=entry.heightRatio*(aspect<1?40:70.8333)*item.scale,w=h*entry.aspect/aspect,angle=rotation*Math.PI/180;
    const top=entry.surface==="wall"?-h/2:-h,bottom=entry.surface==="wall"?h/2:0;
    for(const x of [-w/2,w/2]) for(const y of [top,bottom]) {
      const worldX=item.x+x*Math.cos(angle)-y/aspect*Math.sin(angle),worldY=item.y+x*aspect*Math.sin(angle)+y*Math.cos(angle);
      assert.ok(worldX>=4-.00001&&worldX<=96+.00001);
      assert.ok(worldY>=4-.00001&&worldY<=97+.00001);
    }
  }
  assert.deepEqual(surfaceBounds("ceiling"),[4,20]);
});
test("scene layers interleave character with floor objects and respect overrides", () => {
  const base={kind:"plant",x:50,scale:1,rotation:0,foreground:false,order:0,layer:"auto"};
  const items=[{...base,id:"near",y:96},{...base,id:"far",y:84},{...base,id:"behind",y:99,layer:"behind"},{...base,id:"front",y:80,layer:"front"},{...base,id:"rug",kind:"rug",y:95,layer:"front"}];
  const layers=sceneLayers(items,90);
  assert.ok(layers.rug<layers.behind && layers.behind<layers.far && layers.far<layers.__character && layers.__character<layers.near && layers.near<layers.front);
  const ordered=orderDecor(items,"far",1);
  assert.ok(sceneLayers(ordered,90).far>sceneLayers(ordered,90).near);
  assert.equal(ordered.find(i=>i.id==="far").layer,"auto");
});
let sqlite;
const originalFetch = globalThis.fetch;
class Statement {
  constructor(sql, args = []) {
    this.sql = sql;
    this.args = args;
  }
  bind(...args) {
    return new Statement(this.sql, args);
  }
  async first() {
    return sqlite.prepare(this.sql).get(...this.args) || null;
  }
  async all() {
    return { results: sqlite.prepare(this.sql).all(...this.args) };
  }
  async run() {
    return {
      meta: {
        changes: Number(sqlite.prepare(this.sql).run(...this.args).changes),
      },
    };
  }
}
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  for (const f of readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    sqlite.exec(readFileSync("drizzle/" + f, "utf8"));
  for (const k of Object.keys(env)) delete env[k];
  env.DB = {
    prepare: (sql) => new Statement(sql),
    batch: async (statements) => {
      sqlite.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) out.push(await s.run());
        sqlite.exec("COMMIT");
        return out;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  sqlite.close();
});
function configure() {
  Object.assign(env, {
    GOOGLE_CLIENT_ID: "test-id",
    GOOGLE_CLIENT_SECRET: "test-secret",
    APP_ORIGIN: "http://localhost:3000",
    TOKEN_ENCRYPTION_KEY: "ab".repeat(32),
  });
}
async function login(id = "u1", googleId = "teacher") {
  configure();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO users (id,google_id,name) VALUES (?,?,?)",
  )
    .bind(id, googleId, id)
    .run();
  await env.DB.prepare(
    "INSERT OR REPLACE INTO sessions (id,user_id,expires) VALUES (?,?,?)",
  )
    .bind(await digest(id), id, Date.now() + 100000)
    .run();
  return id;
}
function req(
  path,
  method = "GET",
  body,
  token = "u1",
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3000/api/" + path, {
    method,
    headers: {
      cookie: "mashroom_session=" + token,
      origin,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
async function connected() {
  await login();
  await env.DB.prepare(
    "INSERT INTO connections (user_id,access,refresh,expires,scope,status) VALUES (?,?,?,?,?,'connected')",
  )
    .bind(
      "u1",
      await seal("access", env.TOKEN_ENCRYPTION_KEY),
      await seal("refresh", env.TOKEN_ENCRYPTION_KEY),
      Date.now() + 3600000,
      "classroom",
    )
    .run();
}
function apiMock({ deny = false, fail = false, empty = false } = {}) {
  globalThis.fetch = async (input) => {
    const u = new URL(String(input));
    if (u.pathname.endsWith("/teachers/me"))
      return Response.json(deny ? { error: "denied" } : { userId: "teacher" }, {
        status: deny ? 403 : 200,
      });
    if (u.pathname.endsWith("/courseWork")) {
      if (fail) return Response.json({}, { status: 503 });
      return Response.json({
        courseWork: empty
          ? []
          : [
              {
                id: "work1",
                title: "Leaves",
                description: "Find a leaf",
                state: "PUBLISHED",
                alternateLink: "https://classroom.google.com/c/1/a/1",
                dueDate: { year: 2026, month: 10, day: 10 },
              },
              { id: "draft", title: "Not ready", state: "DRAFT" },
            ],
      });
    }
    if (u.pathname.endsWith("/students"))
      return Response.json({
        students: empty
          ? []
          : [{ userId: "student", profile: { name: { fullName: "Student" } } }],
      });
    if (u.pathname.endsWith("/teachers"))
      return Response.json({
        teachers: [
          { userId: "teacher", profile: { name: { fullName: "Teacher" } } },
        ],
      });
    return Response.json({ id: "course1", name: "Willow" });
  };
}
test("pet care changes relevant needs and clamps to 0..100", () => {
  let p = defaultPet();
  for (let i = 0; i < 20; i++) p = applyCare(p, "feed");
  assert.equal(p.hunger, 100);
  for (let i = 0; i < 20; i++) p = applyCare(p, "play");
  assert.equal(p.energy, 0);
  assert.equal(p.happiness, 100);
  assert.equal(applyCare(p, "shower").hygiene, 97);
  assert.equal(applyCare(p, "sleep").energy, 25);
});
test("need ring colors change at the exact requested boundaries", () => {
  for (const value of [0, 1, 24]) assert.equal(needTone(value), "red");
  for (const value of [25, 26, 49]) assert.equal(needTone(value), "yellow");
  for (const value of [50, 75, 100]) assert.equal(needTone(value), "green");
  assert.equal(needValue(-20), 0);
  assert.equal(needValue(120), 100);
  assert.equal(needValue(NaN), 0);
});
test("legacy pets receive new needs without losing their existing progress", () => {
  const { bladder, health, ...old } = {
    ...defaultPet(),
    hunger: 12,
    name: "Roomie",
  };
  const migrated = normalizePet(old);
  assert.equal(migrated.bladder, 75);
  assert.equal(migrated.health, 90);
  assert.equal(migrated.hunger, 12);
  assert.equal(migrated.name, "Roomie");
  assert.equal(applyCare(migrated, "toilet").bladder, 100);
  assert.equal(applyCare(migrated, "rest").health, 100);
  assert.equal(validatePet(old).bladder, 75);
  assert.throws(() => validatePet({ ...old, bladder: -1 }));
  assert.throws(() => validatePet({ ...old, health: NaN }));
  assert.throws(() => validatePet({ ...old, health: "90" }));
  assert.equal(validatePet({ ...old, bladder: 24, health: 49 }).health, 49);
});
test("room movement remains on the walkable floor and all destinations have hooks", () => {
  assert.deepEqual(boundRoomPosition({ x: -999, y: 1000 }), { x: 27, y: 97 });
  assert.deepEqual(boundRoomPosition({ x: 999, y: -1000 }), { x: 86, y: 83 });
  assert.deepEqual(boundRoomPosition({ x: 50, y: 90 }), { x: 50, y: 90 });
  assert.deepEqual(boundRoomPosition({ x: 100, y: 90 }, 29), { x: 71, y: 90 });
  assert.ok(Number.isFinite(boundRoomPosition({ x: NaN, y: Infinity }).x));
  assert.equal(new Set(rooms.map((r) => r.id)).size, 5);
  assert.ok(rooms.every((r) => Array.isArray(r.objects)));
});
test("room isolation, movement bounds, modes, and teacher permissions", () => {
  const profile = { id: "a", name: "A", classId: "willow", mode: "demo" },
    initial = seed(profile);
  let state;
  const room = new LocalRoom(() => {});
  room.subscribe((s) => (state = s));
  room.join(profile, [
    ...initial.messages,
    { ...initial.messages[0], id: "other", classId: "maple" },
  ]);
  assert.equal(state.messages.length, 2);
  room.move(1000, -99);
  assert.equal(state.participants[0].x, 88);
  assert.equal(state.participants[0].y, 50);
  room.configure("phrases", false);
  assert.throws(() => room.send("typed", "text"));
  assert.throws(() => room.send("fake preset", "phrase"));
  assert.throws(() => room.remove("welcome-1"));
  room.configure("both", true);
  room.send("Hello", "text");
  assert.equal(state.participants[0].bubble, "Hello");
  room.remove(state.messages.at(-1).id);
  assert.equal(state.participants[0].bubble, undefined);
  assert.equal(state.messages.at(-1).removed, true);
  room.leave();
  assert.equal(state.status, "disconnected");
});
test("Google-unconfigured mode returns an honest usable status", async () => {
  const r = await handle(req("auth/session"), "auth/session");
  assert.deepEqual(await r.json(), {
    configured: false,
    user: null,
    classroom: "disconnected",
    canAdopt: false,
  });
  assert.equal(
    (await handle(req("auth/google/start"), "auth/google/start")).headers.get(
      "Location",
    ),
    "/login?connection=unconfigured",
  );
});
test("encrypted tokens round-trip and never equal plaintext", async () => {
  configure();
  const ciphertext = await seal("very-secret", env.TOKEN_ENCRYPTION_KEY);
  assert(!ciphertext.includes("very-secret"));
  assert.equal(
    await unseal(ciphertext, env.TOKEN_ENCRYPTION_KEY),
    "very-secret",
  );
  assert.equal((await pkce("example")).length, 43);
});
test("server rejects malformed pet details", () => {
  assert.throws(() => validatePet({ ...defaultPet(), energy: 101 }));
  assert.throws(() => validatePet({ ...defaultPet(), name: "" }));
  assert.throws(() => validatePet({ ...defaultPet(), energy: NaN }));
});
test("protected routes require real sessions and same-origin mutations", async () => {
  configure();
  assert.equal(
    (await handle(req("classroom/content"), "classroom/content")).status,
    401,
  );
  await login();
  assert.equal(
    (
      await handle(
        req(
          "profile",
          "PATCH",
          { pet: defaultPet() },
          "u1",
          "https://evil.example",
        ),
        "profile",
      )
    ).status,
    403,
  );
});
test("OAuth rejects wrong state and consumes cancellation once", async () => {
  await login();
  const bad = await handle(
    req("auth/google/callback?state=bad"),
    "auth/google/callback",
  );
  assert.match(bad.headers.get("Location"), /failed/);
  await env.DB.prepare("INSERT INTO oauth_flows VALUES (?,?,?,?,?)")
    .bind(await digest("good"), "verify", "login", null, Date.now() + 10000)
    .run();
  const request = new Request(
    "http://localhost:3000/api/auth/google/callback?state=good&error=access_denied",
    { headers: { cookie: "mashroom_oauth=good" } },
  );
  assert.match(
    (await handle(request, "auth/google/callback")).headers.get("Location"),
    /cancelled/,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM oauth_flows").get().n, 0);
});
test("demo adoption is allowed once and cannot overwrite an existing pet", async () => {
  await login();
  const request = () =>
    req("profile", "PATCH", { pet: defaultPet(), adopt: true });
  assert.equal((await handle(request(), "profile")).status, 200);
  assert.equal((await handle(request(), "profile")).status, 409);
  const u = sqlite.prepare("SELECT * FROM users").get();
  assert.equal(u.adopted, 1);
  assert.equal(JSON.parse(u.pet).name, "Mochi");
  assert.equal(JSON.parse(u.pet).points, undefined);
});
test("Classroom teacher denial makes no database changes", async () => {
  await connected();
  apiMock({ deny: true });
  assert.equal(
    (
      await handle(
        req("classroom/import", "POST", { courseId: "course1" }),
        "classroom/import",
      )
    ).status,
    403,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM courses").get().n, 0);
});
test("Classroom imports published work, updates without duplicates, restricts rosters", async () => {
  await connected();
  apiMock();
  const call = () =>
    handle(
      req("classroom/import", "POST", { courseId: "course1" }),
      "classroom/import",
    );
  assert.equal((await call()).status, 200);
  assert.equal((await call()).status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM assignments").get().n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM members").get().n, 2);
  await login("u2", "student");
  const student = await (
    await handle(
      req("classroom/content", "GET", null, "u2"),
      "classroom/content",
    )
  ).json();
  assert.equal(student.assignments.length, 1);
  assert.equal(student.roster.length, 0);
  await login("u3", "outsider");
  const outsider = await (
    await handle(
      req("classroom/content", "GET", null, "u3"),
      "classroom/content",
    )
  ).json();
  assert.equal(outsider.assignments.length, 0);
  apiMock({ empty: true });
  assert.equal((await call()).status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM assignments").get().n, 0);
  assert.equal(
    (
      await (
        await handle(
          req("classroom/content", "GET", null, "u2"),
          "classroom/content",
        )
      ).json()
    ).courses.length,
    0,
  );
});
test("failed import keeps the last successful snapshot", async () => {
  await connected();
  apiMock();
  await handle(
    req("classroom/import", "POST", { courseId: "course1" }),
    "classroom/import",
  );
  apiMock({ fail: true });
  assert.equal(
    (
      await handle(
        req("classroom/import", "POST", { courseId: "course1" }),
        "classroom/import",
      )
    ).status,
    503,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM assignments").get().n, 1);
});
test("pagination retrieves later students and detects repeated tokens", async () => {
  const rows = await collectPages(
    async (path) =>
      path.includes("pageToken=next")
        ? { students: [2] }
        : { students: [1], nextPageToken: "next" },
    "students",
    "students",
  );
  assert.deepEqual(rows, [1, 2]);
  await assert.rejects(() =>
    collectPages(
      async () => ({ students: [], nextPageToken: "repeat" }),
      "students",
      "students",
    ),
  );
});
test("expired Google refresh marks the connection expired", async () => {
  await connected();
  sqlite.prepare("UPDATE connections SET expires=0").run();
  globalThis.fetch = async () =>
    Response.json({ error: "invalid_grant" }, { status: 400 });
  assert.equal(
    (await handle(req("classroom/courses"), "classroom/courses")).status,
    401,
  );
  assert.equal(
    sqlite.prepare("SELECT status FROM connections").get().status,
    "expired",
  );
});
test("logout invalidates server-side session", async () => {
  await login();
  assert.equal(
    (await handle(req("auth/logout", "POST"), "auth/logout")).status,
    204,
  );
  assert.equal(
    (await handle(req("classroom/content"), "classroom/content")).status,
    401,
  );
});
