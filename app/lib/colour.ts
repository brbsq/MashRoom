export type HsvColour = { h:number; s:number; v:number };
const clamp = (value:number) => Math.max(0,Math.min(1,value));
export function hsvToHex({h,s,v}:HsvColour) {
  h=((h%360)+360)%360/60;s=clamp(s);v=clamp(v);
  const c=v*s,x=c*(1-Math.abs(h%2-1)),m=v-c;
  const rgb=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];
  return "#"+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,"0")).join("");
}
export function hexToHsv(hex:string):HsvColour | null {
  if(!/^#[0-9a-f]{6}$/i.test(hex))return null;
  const [r,g,b]=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  const h=!delta?0:max===r?60*(((g-b)/delta)%6):max===g?60*((b-r)/delta+2):60*((r-g)/delta+4);
  return {h:(h+360)%360,s:max?delta/max:0,v:max};
}
