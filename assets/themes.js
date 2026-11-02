// Velune Letters · the eight designs and their generated artwork
export const THEMES={
 lace:{name:"Chantilly",tag:"Ivory lacework and soft gold, for timeless romance",v:{bg:"#EFE9E1",paper:"#FBF8F4",ink:"#3E3328",muted:"#8A7B6A",accent:"#A08660",seal:"#B39566",env:"#E7DED1"},display:'"Cormorant Garamond",Georgia,serif'},
 stained:{name:"Cathedral",tag:"A jewel-tone mosaic under a gothic arch",v:{bg:"#17131C",paper:"#221C29",ink:"#F2E9DA",muted:"#B9AFC2",accent:"#D8B86A",seal:"#7B2D43",env:"#2E2536"},display:'"Cinzel",Georgia,serif'},
 tuscany:{name:"Tuscany",tag:"Olive hills and cypress for Italian villas",v:{bg:"#EADBC6",paper:"#FAF3EA",ink:"#3F3A26",muted:"#7F7558",accent:"#B5652F",seal:"#9C4E25",env:"#E4D3BB"},display:'"Italiana",Georgia,serif'},
 midnight:{name:"Midnight",tag:"Gold stars for an evening ceremony",v:{bg:"#0B1028",paper:"#121A3A",ink:"#EEE8D6",muted:"#A9B0C8",accent:"#D9B76A",seal:"#C49A45",env:"#1C2550"},display:'"Bodoni Moda",Georgia,serif'},
 fjord:{name:"Fjord",tag:"Slate mountains and still water, made in Norway",v:{bg:"#DCE4E9",paper:"#F7F9FA",ink:"#22323E",muted:"#61727F",accent:"#3E6A86",seal:"#2F5068",env:"#CFDAE1"},display:'"Marcellus",Georgia,serif'},
 peony:{name:"Blush Peony",tag:"Watercolour peonies and a monogram wreath",v:{bg:"#F4E6E2",paper:"#FFFBF9",ink:"#4A3434",muted:"#9A7F7C",accent:"#C08A7E",seal:"#C9858A",env:"#F0DDD8"},display:'"Cormorant Garamond",Georgia,serif',wreath:true},
 meadow:{name:"Wildflower",tag:"A summer meadow of hand-painted blooms",v:{bg:"#EEF0E2",paper:"#FFFEF8",ink:"#3A3F2C",muted:"#7F846A",accent:"#8E9A5E",seal:"#B4925A",env:"#E6E8D6"},display:'"Italiana",Georgia,serif',meadow:true},
 carpathian:{name:"Carpathian",tag:"Romanian cross-stitch in red and black",v:{bg:"#EDEAE3",paper:"#FFFFFF",ink:"#1A1A1A",muted:"#6B6560",accent:"#B3202A",seal:"#B3202A",env:"#E9E4DA"},display:'"Cinzel",Georgia,serif'}
};

export function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function draw(c,id){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=c.clientWidth||300, h=c.clientHeight||240;
  c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
  const x=c.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0);
  const v=THEMES[id].v, r=rng(7+id.length*13);
  x.fillStyle=v.paper; x.fillRect(0,0,w,h);
  ART[id](x,w,h,v,r);
}
const wash=(x,w,h,r,cols)=>{for(let i=0;i<14;i++){const cx=r()*w,cy=r()*h*.9,R=40+r()*110,g=x.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,cols[i%cols.length]);g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,w,h)}};
const ART={
 peony(x,w,h,v,r){
  wash(x,w,h,r,["rgba(239,169,170,.22)","rgba(252,227,224,.5)","rgba(185,199,168,.2)","rgba(231,185,166,.18)"]);
  const f=x.createLinearGradient(0,h*.75,0,h);f.addColorStop(0,"rgba(255,251,249,0)");f.addColorStop(1,v.paper);x.fillStyle=f;x.fillRect(0,h*.75,w,h*.25);
 },
 meadow(x,w,h,v,r){
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#E6EEF0");g.addColorStop(.6,"#FBF6E6");g.addColorStop(1,v.paper);x.fillStyle=g;x.fillRect(0,0,w,h);
  x.beginPath();x.arc(w*.74,h*.3,h*.12,0,7);const s=x.createRadialGradient(w*.74,h*.3,0,w*.74,h*.3,h*.3);s.addColorStop(0,"rgba(242,198,91,.75)");s.addColorStop(1,"rgba(242,198,91,0)");x.fillStyle=s;x.fillRect(0,0,w,h);
  wash(x,w,h*.6,r,["rgba(185,166,217,.12)","rgba(255,244,214,.4)"]);
 },
 lace(x,w,h,v,r){
  x.strokeStyle="rgba(160,134,96,.18)";x.lineWidth=1;
  for(let i=-h;i<w;i+=14){x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();x.beginPath();x.moveTo(i+h,0);x.lineTo(i,h);x.stroke()}
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(251,248,244,0)");g.addColorStop(1,v.paper);x.fillStyle=g;x.fillRect(0,0,w,h);
  x.strokeStyle="#C2AE8E";x.fillStyle=v.paper;
  for(let i=0;i<w+28;i+=28){x.beginPath();x.arc(i,h-14,14,Math.PI,0);x.stroke();x.beginPath();x.arc(i,h-14,4,0,7);x.stroke()}
  const cx=w/2, cy=h*.46;
  for(let ring=0;ring<3;ring++){const n=12+ring*6, R=22+ring*24;
    for(let k=0;k<n;k++){const a=k/n*Math.PI*2;x.save();x.translate(cx+Math.cos(a)*R,cy+Math.sin(a)*R);x.rotate(a);x.beginPath();x.ellipse(0,0,9-ring*1.5,4,0,0,7);x.strokeStyle="rgba(160,134,96,"+(.75-ring*.18)+")";x.stroke();x.restore()}}
  x.beginPath();x.arc(cx,cy,10,0,7);x.fillStyle="#C9B48F";x.fill();
 },
 stained(x,w,h,v,r){
  const pad=16, R=Math.min(w/2-pad,(h-pad)*.62), cy=pad+R, cx=w/2;
  x.save();x.beginPath();x.moveTo(cx-R,h);x.lineTo(cx-R,cy);x.arc(cx,cy,R,Math.PI,0);x.lineTo(cx+R,h);x.closePath();x.clip();
  const pal=["#7B2D43","#2E5E7E","#C9963B","#3F6E4E","#5B3A7A","#A8473A","#D8B86A","#1F4A6B"];
  const s=30, cols=Math.ceil(w/s)+2, rows=Math.ceil(h/s)+2, P=[];
  for(let i=0;i<cols;i++){P[i]=[];for(let j=0;j<rows;j++)P[i][j]=[i*s+(r()-.5)*s*.7,j*s+(r()-.5)*s*.7]}
  x.lineJoin="round";
  for(let i=0;i<cols-1;i++)for(let j=0;j<rows-1;j++){
    const a=P[i][j],b=P[i+1][j],c=P[i+1][j+1],d=P[i][j+1];
    [[a,b,c],[a,c,d]].forEach(t=>{x.beginPath();x.moveTo(t[0][0],t[0][1]);x.lineTo(t[1][0],t[1][1]);x.lineTo(t[2][0],t[2][1]);x.closePath();x.fillStyle=pal[Math.floor(r()*pal.length)];x.globalAlpha=.75+r()*.25;x.fill();x.globalAlpha=1;x.strokeStyle="#120E16";x.lineWidth=2.4;x.stroke()})}
  const gl=x.createRadialGradient(cx,pad,10,cx,cy,R*1.4);gl.addColorStop(0,"rgba(255,240,200,.45)");gl.addColorStop(1,"rgba(0,0,0,.25)");x.fillStyle=gl;x.fillRect(0,0,w,h);
  x.restore();
  x.beginPath();x.moveTo(cx-R,h);x.lineTo(cx-R,cy);x.arc(cx,cy,R,Math.PI,0);x.lineTo(cx+R,h);x.strokeStyle=v.accent;x.lineWidth=3;x.stroke();
 },
 tuscany(x,w,h,v,r){
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#F1D3A6");g.addColorStop(.7,"#F8EBDA");g.addColorStop(1,v.paper);x.fillStyle=g;x.fillRect(0,0,w,h);
  x.beginPath();x.arc(w*.7,h*.4,h*.17,0,7);x.fillStyle="#E9A25A";x.fill();
  const hill=(base,amp,f,ph,col)=>{x.beginPath();x.moveTo(0,h);for(let i=0;i<=w;i+=4)x.lineTo(i,base+Math.sin(i/w*Math.PI*f+ph)*amp);x.lineTo(w,h);x.closePath();x.fillStyle=col;x.fill()};
  hill(h*.62,h*.06,2.2,.5,"#B8B985");hill(h*.72,h*.07,1.6,2,"#8F9A5E");
  for(let k=0;k<7;k++){const px=w*(.08+k*.135)+(r()-.5)*14, base=h*.74+Math.sin(px/w*Math.PI*1.6+2)*h*.07, th=h*(.16+r()*.12);
    x.beginPath();x.ellipse(px,base-th/2,5+r()*3,th/2,0,0,7);x.fillStyle="#3B4A2A";x.fill()}
  hill(h*.86,h*.04,1.2,1,"#6E7A44");
  const f=x.createLinearGradient(0,h*.85,0,h);f.addColorStop(0,"rgba(250,243,234,0)");f.addColorStop(1,v.paper);x.fillStyle=f;x.fillRect(0,h*.85,w,h*.15);
 },
 midnight(x,w,h,v,r){
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#070B1E");g.addColorStop(1,v.paper);x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<180;i++){x.beginPath();x.arc(r()*w,r()*h,r()*1.1+.2,0,7);x.fillStyle="rgba(255,255,255,"+(.3+r()*.6)+")";x.fill()}
  const spark=(sx,sy,s)=>{x.beginPath();x.moveTo(sx,sy-s);x.quadraticCurveTo(sx,sy,sx+s,sy);x.quadraticCurveTo(sx,sy,sx,sy+s);x.quadraticCurveTo(sx,sy,sx-s,sy);x.quadraticCurveTo(sx,sy,sx,sy-s);x.fillStyle=v.accent;x.fill()};
  for(let i=0;i<9;i++)spark(r()*w,r()*h*.85,3+r()*6);
  const mx=w*.5,my=h*.45,mr=h*.16;x.beginPath();x.arc(mx,my,mr,0,7);x.fillStyle=v.accent;x.shadowColor=v.accent;x.shadowBlur=30;x.fill();x.shadowBlur=0;
  x.beginPath();x.arc(mx+mr*.42,my-mr*.18,mr*.88,0,7);x.fillStyle="#0C1330";x.fill();
 },
 fjord(x,w,h,v,r){
  const g=x.createLinearGradient(0,0,0,h*.7);g.addColorStop(0,"#C9D7E0");g.addColorStop(1,"#EEF2F5");x.fillStyle=g;x.fillRect(0,0,w,h);
  const water=h*.7;
  const ridge=(base,amp,col,seed)=>{const rr=rng(seed);const pts=[];let px=0;while(px<=w+20){pts.push([px,base-rr()*amp]);px+=18+rr()*30}
    x.beginPath();x.moveTo(0,water);pts.forEach(p=>x.lineTo(p[0],p[1]));x.lineTo(w,water);x.closePath();x.fillStyle=col;x.fill();
    x.save();x.globalAlpha=.28;x.beginPath();x.moveTo(0,water);pts.forEach(p=>x.lineTo(p[0],water+(water-p[1])*.6));x.lineTo(w,water);x.closePath();x.fillStyle=col;x.fill();x.restore()};
  ridge(water-h*.18,h*.32,"#8FA4B3",3);ridge(water-h*.08,h*.26,"#5F7788",9);ridge(water,h*.14,"#3A5163",21);
  x.strokeStyle="rgba(255,255,255,.5)";x.lineWidth=1;for(let i=0;i<10;i++){const yy=water+6+i*7,xx=r()*w;x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+30+r()*60,yy);x.stroke()}
  const f=x.createLinearGradient(0,h*.82,0,h);f.addColorStop(0,"rgba(247,249,250,0)");f.addColorStop(1,v.paper);x.fillStyle=f;x.fillRect(0,h*.8,w,h*.2);
 },
 carpathian(x,w,h,v,r){
  const s=Math.max(4,Math.round(w/70));
  const band=(y0)=>{const cols=Math.ceil(w/s);for(let c=0;c<cols;c++)for(let rr=0;rr<11;rr++){const u=(c%12)-6,vv=rr-5,d=Math.abs(u)+Math.abs(vv);let col=null;
    if(d===5)col="#B3202A";else if(d===2)col="#1A1A1A";else if(d===0)col="#B3202A";else if(rr===0||rr===10)col=(c%2?"#B3202A":null);
    if(col){x.fillStyle=col;x.fillRect(c*s+.5,y0+rr*s+.5,s-1,s-1)}}};
  band(10);
  const cx=w/2,cy=h*.62,n=8;
  for(let k=0;k<n;k++){const a=k/n*Math.PI*2;for(let t=1;t<=4;t++){x.fillStyle=t%2?"#B3202A":"#1A1A1A";x.fillRect(Math.round(cx+Math.cos(a)*t*s*1.2-s/2),Math.round(cy+Math.sin(a)*t*s*1.2-s/2),s-1,s-1)}}
  x.fillStyle="#B3202A";x.fillRect(cx-s/2,cy-s/2,s-1,s-1);
 }
};
