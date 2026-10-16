export function ArcadeTokenArt({count=1}:{count?:number}) {
  return <svg viewBox="0 0 200 200" aria-hidden="true">
    <ellipse cx="100" cy="162" rx="66" ry="10" fill="#77533920"/>
    {count>1&&<><ellipse cx="125" cy="143" rx="45" ry="14" fill="#bd8a4c"/><path d="M80 125h90v18c0 18-90 18-90 0z" fill="#d7ac63"/><ellipse cx="125" cy="125" rx="45" ry="14" fill="#f3d893"/></>}
    {count>5&&<><path d="M83 107h84v16c0 17-84 17-84 0z" fill="#c39a60"/><ellipse cx="125" cy="107" rx="42" ry="13" fill="#ffe3a4"/></>}
    <ellipse cx="78" cy="111" rx="49" ry="50" fill="#bd9155"/>
    <ellipse cx="73" cy="107" rx="49" ry="50" fill="#f2d695" stroke="#e8c279" strokeWidth="3"/>
    <ellipse cx="73" cy="107" rx="37" ry="38" fill="#ffe9b4" stroke="#d9b775" strokeWidth="2"/>
    <path d="m73 80 8 17 19 3-14 13 3 19-16-9-16 9 3-19-14-13 19-3z" fill="#b59bc7" stroke="#9c87b3" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M43 83q6-10 16-13" fill="none" stroke="#fff6d6" strokeWidth="5" strokeLinecap="round"/>
    <path d="m151 48 3 8 8 3-8 3-3 8-3-8-8-3 8-3zm-111-9 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff1bd"/>
  </svg>;
}
