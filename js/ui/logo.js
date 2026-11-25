// The animated controller logo on the home page: markup plus the animation loop.
const homeLogoImpl=(()=>{
const LOGOANIM=`<svg id="hlogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="184" height="202" role="img" aria-label="دغدغ"><defs><clipPath id="hcl"><path d="M-400-200H-6L8-48L-8-26L8-4L-8 18L8 40L-4 70V200H-400Z"/></clipPath><clipPath id="hcr"><path d="M400-200H-6L8-48L-8-26L8-4L-8 18L8 40L-4 70V200H400Z"/></clipPath></defs>
<g id="hroot" transform="translate(200,250) scale(.9)">
<g id="hgL"><g clip-path="url(#hcl)"><g>
<path d="M-110-48H110A40 40 0 0 1 150-8V4A46 46 0 0 1 104 50H96A46 46 0 0 1 58 26H-58A46 46 0 0 1 -96 50H-104A46 46 0 0 1 -150 4V-8A40 40 0 0 1 -110-48Z" fill="#c9c4b5" transform="translate(0,9)" stroke="#151515" stroke-width="5" stroke-linejoin="round"/>
<path d="M-110-48H110A40 40 0 0 1 150-8V4A46 46 0 0 1 104 50H96A46 46 0 0 1 58 26H-58A46 46 0 0 1 -96 50H-104A46 46 0 0 1 -150 4V-8A40 40 0 0 1 -110-48Z" fill="#fff" stroke="#151515" stroke-width="5" stroke-linejoin="round"/>
<circle cx="-92" cy="-6" r="30" fill="#d9d5c8" stroke="#151515" stroke-width="4"/>
<path d="M-92-22v32M-108-6h32" stroke="#151515" stroke-width="13" stroke-linecap="round"/>
<path d="M-22-4l12-8M-2-4l12-8" stroke="#151515" stroke-width="6" stroke-linecap="round" transform="translate(0,4)"/>
<circle cx="92" cy="-4" r="38" fill="#d9d5c8" stroke="#151515" stroke-width="4"/>
<circle cx="92" cy="-24" r="10" fill="#151515"/><circle cx="92" cy="16" r="10" fill="#fff" stroke="#151515" stroke-width="3"/>
<circle cx="72" cy="-4" r="10" fill="#b52a1c" stroke="#151515" stroke-width="3"/><circle cx="112" cy="-4" r="10" fill="#ff4a36" stroke="#151515" stroke-width="3"/>
</g></g><path class="hz" d="M-6-70L8-48L-8-26L8-4L-8 18L8 40L-4 70" fill="none" stroke="#151515" stroke-width="5" stroke-linejoin="round"/></g>
<g id="hgR"><g clip-path="url(#hcr)"><g>
<path d="M-110-48H110A40 40 0 0 1 150-8V4A46 46 0 0 1 104 50H96A46 46 0 0 1 58 26H-58A46 46 0 0 1 -96 50H-104A46 46 0 0 1 -150 4V-8A40 40 0 0 1 -110-48Z" fill="#c9c4b5" transform="translate(0,9)" stroke="#151515" stroke-width="5" stroke-linejoin="round"/>
<path d="M-110-48H110A40 40 0 0 1 150-8V4A46 46 0 0 1 104 50H96A46 46 0 0 1 58 26H-58A46 46 0 0 1 -96 50H-104A46 46 0 0 1 -150 4V-8A40 40 0 0 1 -110-48Z" fill="#fff" stroke="#151515" stroke-width="5" stroke-linejoin="round"/>
<circle cx="-92" cy="-6" r="30" fill="#d9d5c8" stroke="#151515" stroke-width="4"/>
<path d="M-92-22v32M-108-6h32" stroke="#151515" stroke-width="13" stroke-linecap="round"/>
<path d="M-22-4l12-8M-2-4l12-8" stroke="#151515" stroke-width="6" stroke-linecap="round" transform="translate(0,4)"/>
<circle cx="92" cy="-4" r="38" fill="#d9d5c8" stroke="#151515" stroke-width="4"/>
<circle cx="92" cy="-24" r="10" fill="#151515"/><circle cx="92" cy="16" r="10" fill="#fff" stroke="#151515" stroke-width="3"/>
<circle cx="72" cy="-4" r="10" fill="#b52a1c" stroke="#151515" stroke-width="3"/><circle cx="112" cy="-4" r="10" fill="#ff4a36" stroke="#151515" stroke-width="3"/>
</g></g><path class="hz" d="M-6-70L8-48L-8-26L8-4L-8 18L8 40L-4 70" fill="none" stroke="#151515" stroke-width="5" stroke-linejoin="round"/></g></g>
<g id="hburst"><g transform="translate(0,0) scale(1)" fill="#ffd9d3" stroke="#151515" stroke-width="4" stroke-linejoin="round"><path d="M0-46L10-18L38-30L22-6L50 2L22 12L36 38L8 22L0 50L-8 22L-36 38L-22 12L-50 2L-22-6L-38-30L-10-18z"/></g></g><g id="hfist"><g transform="translate(0,0) rotate(0) scale(0.9)" stroke="#151515" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect x="-32" y="-124" width="64" height="54" rx="4" fill="#ff4a36"/><rect x="-32" y="-124" width="64" height="12" rx="4" fill="#b52a1c"/><path d="M-32-84h64" fill="none" stroke-width="3"/>
<path d="M-40-70h80v34q0 6-4 10v10q0 18-18 18h-36q-18 0-18-18v-10q-4-4-4-10z" fill="#fff"/>
<path d="M-20-24q0 -10 0-22M0-24q0-10 0-22M20-24q0-10 0-22" fill="none" stroke-width="4"/>
<path d="M-30-8q10 6 20 0M-10-8q10 6 20 0M10-8q10 6 20 0" fill="none" stroke-width="3"/>
<path d="M-40-52q-20 2-20 22t26 12" fill="#fff"/><path d="M-50-34q6 4 14 4" fill="none" stroke-width="3"/>
<path d="M30-62l12-8M34-50l14-4" stroke="#d9d5c8" stroke-width="3" fill="none"/></g></g>
<g fill="#ff4a36" stroke="#151515" stroke-width="3"><path class="hb" d="M0-9l8 6-6 10z"/><path class="hb" d="M0-9l8 6-6 10z"/><path class="hb" d="M0-9l8 6-6 10z"/><path class="hb" d="M0-9l8 6-6 10z"/><path class="hb" d="M0-9l8 6-6 10z"/><path class="hb" d="M0-9l8 6-6 10z"/></g>
<g stroke="#151515" stroke-width="5" stroke-linecap="round"><path class="hs" d="M-9 0h18M0-9v18"/><path class="hs" d="M-9 0h18M0-9v18"/><path class="hs" d="M-9 0h18M0-9v18"/></g><path d="M143.4 -10.7H167.5Q166.5 -14.4 165.2 -17.2Q163.9 -20 162.5 -22Q160.8 -24.4 157.7 -26.9Q154.6 -29.3 150.1 -31.5L157 -42.9Q163.9 -40.2 168.7 -35.7Q173.4 -31.2 176.5 -24.9Q179.6 -18.6 181.4 -10.3V0H143.4ZM120 -41.5Q117.4 -41.5 115.8 -43.2Q114.3 -44.9 114.3 -47.7Q114.3 -50.5 115.7 -52.2Q117.2 -53.8 120 -53.8Q122.5 -53.8 124.1 -52.2Q125.6 -50.6 125.6 -47.7Q125.6 -44.8 124 -43.2Q122.5 -41.5 120 -41.5ZM96.4 0Q96 0 96 -0.4V-10.4Q96 -10.7 96.4 -10.7H106.3Q105.1 -11.1 103.9 -12.5Q102.7 -13.9 102 -15.9Q101.2 -17.9 101.2 -20.3Q101.2 -25.3 103.8 -29.1Q106.3 -32.8 111.2 -35Q116.1 -37.2 122.9 -37.2Q126.6 -37.2 130.3 -36.3Q134 -35.5 136.4 -34.3L132.6 -23.8Q130.1 -25.1 127.7 -25.8Q125.4 -26.5 122.9 -26.5Q119.4 -26.5 117.1 -24.4Q114.9 -22.3 114.9 -18.9Q114.9 -15.6 117.4 -13.1Q119.8 -10.7 124.6 -10.7H136.9V0ZM48.7 -10.7H72.9Q71.9 -14.4 70.6 -17.2Q69.3 -20 67.9 -22Q66.2 -24.4 63.1 -26.9Q60 -29.3 55.5 -31.5L62.3 -42.9Q69.4 -40.2 74.2 -35.5Q79.1 -30.7 82.1 -24.4Q85.1 -18.1 86.8 -10.7H97.1Q97.5 -10.7 97.5 -10.4V-0.4Q97.5 0 97.1 0H48.7ZM24.8 -41.5Q22.2 -41.5 20.7 -43.2Q19.2 -44.9 19.2 -47.7Q19.2 -50.5 20.6 -52.2Q22.1 -53.8 24.8 -53.8Q27.4 -53.8 28.9 -52.2Q30.5 -50.6 30.5 -47.7Q30.5 -44.8 28.9 -43.2Q27.4 -41.5 24.8 -41.5ZM22.5 26Q16.8 26 12.6 23.8Q8.4 21.7 6 18Q3.7 14.3 3.7 9.8Q3.7 7.1 4.6 4.1Q5.5 1 7.5 -1.8Q9.6 -4.7 13 -6.6Q10.7 -9 9 -12.5Q7.2 -15.9 7.2 -19.4Q7.2 -27.6 12.6 -32.4Q18.1 -37.2 28.3 -37.2Q30.7 -37.2 33.4 -36.8Q36 -36.4 38.3 -35.8Q40.6 -35.2 42 -34.8L38.2 -24.3Q35.6 -25.1 33.4 -25.6Q31.2 -26.1 28.9 -26.1Q25.2 -26.1 22.6 -23.9Q19.9 -21.8 19.9 -18.4Q19.9 -17.2 20.6 -15.4Q21.2 -13.5 22.2 -11.4Q25.5 -12.7 28.7 -13.8Q31.9 -14.8 35 -15.7L37.7 -6.1Q30.7 -4.2 27.1 -2.8Q23.5 -1.4 21.7 -0.2Q18.6 1.8 17.7 4Q16.8 6.2 16.8 8Q16.9 11.3 19.4 13.2Q22 15 25.8 15Q27.1 15 28.4 15Q29.7 14.9 31.9 14.7Q34.1 14.4 38.2 14L39.7 23.9Q33.6 25.1 29.6 25.6Q25.6 26 22.5 26Z" transform="translate(106.5,398)" fill="#151515"/></svg>`;
function logoAnim(){const E=id=>document.getElementById(id);if(!E('hroot'))return;
const cl=x=>Math.max(0,Math.min(1,x)),seg=(t,a,b)=>cl((t-a)/(b-a));
const oB=x=>{const c=1.9,d=c+1;return 1+d*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const iQ=x=>x*x,ioC=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const T=3.8,H=document.querySelectorAll.bind(document);
function pose(t,fin){const pop=t<.55?oB(seg(t,0,.55)):1;
let k=t<2.7?oB(seg(t,.9,1.3)):1-ioC(seg(t,2.7,3.3));if(t<.9||t>=3.3)k=0;if(fin)k=1;
const sink=(t>.85&&t<1)?6*Math.sin(seg(t,.85,1)*Math.PI):0,wob=Math.sin(t*5)*1.2*(k>.9?1:0);
E('hroot').setAttribute('transform',`translate(200,${250+sink}) scale(${.9*pop})`);
E('hgL').setAttribute('transform',`translate(${-26*k},${16*k+wob}) rotate(${-9*k})`);
E('hgR').setAttribute('transform',`translate(${26*k},${20*k-wob}) rotate(${9*k})`);
H('.hz').forEach(e=>e.style.opacity=k>.02?1:0);
let fy=-80,fv=0,fr=0;if(!fin&&t>.45&&t<1.9){fv=1;if(t<.9){fy=-80+280*iQ(seg(t,.45,.9));fr=seg(t,.45,.9)*-4}else{const u=seg(t,.9,1.9);fy=200-310*ioC(u);fr=-4+u*10}}
E('hfist').setAttribute('transform',`translate(200,${fy}) rotate(${fr})`);E('hfist').style.opacity=fv;
const bu=seg(t,.88,1.35),bs=!fin&&bu>0&&bu<1?(bu<.35?oB(bu/.35):1-ioC((bu-.35)/.65)):0;
E('hburst').setAttribute('transform',`translate(200,208) scale(${.9*bs})`);
H('.hb').forEach((e,i)=>{const a=(-160+i*64)*Math.PI/180,u=fin?0:seg(t,.9,1.9),d=20+120*ioC(u);e.setAttribute('transform',`translate(${200+Math.cos(a)*d},${215+Math.sin(a)*d*.8+u*u*40}) rotate(${i*60+u*240}) scale(${u>0&&u<1?1-u*.6:0})`)});
H('.hs').forEach((e,i)=>{const u=fin?0:seg(t,.15+i*.1,.75+i*.1),P=[[72,130],[330,150],[310,330]][i];e.setAttribute('transform',`translate(${P[0]},${P[1]}) scale(${u>0&&u<1?Math.sin(u*Math.PI)*1.2:0}) rotate(${u*90})`)})}
if(matchMedia('(prefers-reduced-motion:reduce)').matches){pose(2,true);return}
const s=performance.now();(function f(n){if(!E('hroot'))return;const t=(n-s)/1000;if(t>=T*2){pose(2,true);return}pose(t%T);requestAnimationFrame(f)})(s)}

  return {markup:LOGOANIM,animate:logoAnim};
})();
class HomeLogo {
  static get markup(){return homeLogoImpl.markup;}
  static animate(){return homeLogoImpl.animate();}
}
