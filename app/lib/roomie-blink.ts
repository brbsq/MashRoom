import type { RoomiePose } from "./wearables";
export const blinkDurationMs=210;
export const nextBlinkDelay=(random:()=>number=Math.random)=>2600+Math.floor(Math.max(0,Math.min(1,random()))*4400);
type Clock={set:(run:()=>void,ms:number)=>ReturnType<typeof setTimeout>;clear:(id:ReturnType<typeof setTimeout>)=>void};
export function createBlinkController(onBlink:(closed:boolean)=>void,random:()=>number=Math.random,clock:Clock={set:(run,ms)=>globalThis.setTimeout(run,ms),clear:id=>globalThis.clearTimeout(id)}) {
  let timer:ReturnType<typeof setTimeout>|null=null,running=false;
  function later(run:()=>void,delay:number){timer=clock.set(()=>{timer=null;if(running)run();},delay);}
  function plan(){later(()=>blink(false),nextBlinkDelay(random));}
  function blink(second:boolean){
    onBlink(true);
    later(()=>{onBlink(false);if(!second&&random()<.14)later(()=>blink(true),140+Math.floor(random()*80));else plan();},blinkDurationMs);
  }
  return {
    start(){if(running)return;running=true;onBlink(false);plan();},
    stop(){running=false;if(timer!==null)clock.clear(timer);timer=null;onBlink(false);},
  };
}
export type EyeRig={x:number;y:number;width:number;height:number;top:string;bottom:string};
const front=(x:number,y:number):EyeRig=>({x,y,width:138,height:120,top:"#ffcc99",bottom:"#ffc99a"});
export const idleEyeRig:Record<RoomiePose,EyeRig[]>={
  front:[front(287,465),front(519,457)],
  left:[{x:290,y:440,width:111,height:128,top:"#ffca95",bottom:"#ffc58f"}],
  right:[{x:583,y:450,width:110,height:124,top:"#ffca96",bottom:"#ffc691"}],
};
// Registered to the bare walking atlas, not the different idle head proportions.
export const walkEyeRig:Record<"left"|"right",EyeRig[][]>={
  left:[214,215,219,218].map(y=>[{x:135,y,width:56,height:67,top:"#ffcb98",bottom:"#ffc48d"}]),
  right:[205,203,201,198].map(y=>[{x:256,y,width:57,height:66,top:"#ffca97",bottom:"#ffc38e"}]),
};
