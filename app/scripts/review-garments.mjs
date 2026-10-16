// Generates a local-only visual QA fixture; never changes profile storage.
import { build } from "esbuild";
import { mkdir,writeFile } from "node:fs/promises";
await mkdir("work",{recursive:true});
await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {RoomieRenderer} from './components/mashroom/roomie-renderer';import {defaultAppearance} from './lib/roomie';
const colours=['#ffffff','#7cfeef'];
const groups=colours.map(colour=>{const a=defaultAppearance('QA');a.selection.tops=6;a.colors.tops=colour;a.itemColours['tops:6']=colour;return React.createElement('section',{},React.createElement('h2',{},colour),React.createElement('div',{className:'poses'},...['front','left','right'].flatMap(pose=>[undefined,0,1,2,3].map(frame=>React.createElement('article',{'data-review-frame':frame??'idle'},React.createElement('div',{className:'pose'},React.createElement(RoomieRenderer,{appearance:a,facing:pose,walking:frame!==undefined,label:pose+' '+(frame??'idle')})),React.createElement('p',{},pose+' '+(frame??'idle')))))))});
console.log(renderToStaticMarkup(React.createElement('main',{},...groups)));`,resolveDir:process.cwd(),loader:"tsx"},bundle:true,platform:"node",format:"esm",jsx:"automatic",external:["react","react-dom/server","react/jsx-runtime"],outfile:"work/garment-review.mjs",loader:{".css":"empty"},alias:{"@":process.cwd()},define:{"process.env.NEXT_PUBLIC_MASHROOM_PAGES":JSON.stringify("1")}});
const {spawnSync}=await import("node:child_process");
const rendered=spawnSync(process.execPath,["work/garment-review.mjs"],{encoding:"utf8"});
if(rendered.status)throw new Error(rendered.stderr);
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local garment pose review</title><style>body{margin:20px;background:#e8dcc9;color:#302d28;font:14px system-ui}.poses{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}article{background:#ffffff60;border-radius:20px;text-align:center}.pose{height:300px;width:175px;margin:auto}.pose>svg,.pose>img{width:100%;height:100%;object-fit:contain}[data-review-frame="1"] .pose>svg>svg>g{transform:translate(-456px,0)}[data-review-frame="2"] .pose>svg>svg>g{transform:translate(0,-750px)}[data-review-frame="3"] .pose>svg>svg>g{transform:translate(-456px,-750px)}</style></head><body>${rendered.stdout}</body></html>`;
await writeFile("dist/pages/qa-garments.html",html);
console.log("Local QA fixture: /MashRoom/qa-garments.html");
