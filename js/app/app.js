// Game shell: views, classic and bluff modes, navigation, events.
let booted=false;
function boot(){
if(booted){home();return;}
booted=true;



// ---------- state ----------
const CFG={mode:'classic',players:['لاعب 1'],cats:(store.get('cats',[])||[]).filter(k=>CATS[k]),diff:0,rounds:10};const MINCATS=6;
let G=null,timer=null;
function clearTimer(){if(timer){clearInterval(timer);timer=null}}

// ---------- question picking ----------
function pickQuestions(n){
  const seen=new Set(store.get('seen',[]));
  const pool=Q.map((q,i)=>({q,i})).filter(({q})=>CFG.cats.includes(q[0])&&(CFG.diff===0||q[1]===CFG.diff));
  let fresh=pool.filter(p=>!seen.has(p.i));
  if(fresh.length<n){ // reset seen for this pool
    const ids=new Set(pool.map(p=>p.i));store.set('seen',[...seen].filter(i=>!ids.has(i)));fresh=pool;
  }
  // Balanced pick: rotate through the chosen categories, never repeat the same
  // question text, and limit how many questions of one template family a game gets.
  const stripped=t=>t.replace(/^\u00a7[A-Z]:[^\u00a7]*\u00a7\s*/,'');
  const media=t=>/^\u00a7[A-Z]:/.test(t);
  const famOf=q=>q[0]+'|'+norm(stripped(q[2])).split(' ').slice(0,3).join(' ');
  const byCat={};shuffle(fresh).forEach(p=>{(byCat[p.q[0]]=byCat[p.q[0]]||[]).push(p)});
  let picked=[];const texts=new Set(),fams={};
  for(const cap of [2,4,1e9]){
    let progress=true;
    while(picked.length<n&&progress){
      progress=false;
      for(const c of shuffle(Object.keys(byCat))){
        if(picked.length>=n)break;
        const list=byCat[c];
        const k=list.findIndex(p=>{const t=stripped(p.q[2]);return (media(p.q[2])||!texts.has(t))&&(media(p.q[2])||(fams[famOf(p.q)]||0)<cap);});
        if(k<0)continue;
        const [p]=list.splice(k,1);picked.push(p);texts.add(stripped(p.q[2]));fams[famOf(p.q)]=(fams[famOf(p.q)]||0)+1;progress=true;
      }
    }
  }
  if(picked.length<n){const rest=shuffle(Q.map((q,i)=>({q,i})).filter(p=>!picked.some(x=>x.i===p.i)));picked.push(...rest.slice(0,n-picked.length));}
  picked=shuffle(picked);
  store.set('seen',[...new Set([...store.get('seen',[]),...picked.map(p=>p.i)])]);
  return picked.map(p=>{const q=p.q;return {cat:q[0],diff:q[1],text:q[2],right:q[3],wrong:q.slice(4)}});
}
// ---------- views ----------
let TAB='home';
function tabsHtml(){
  const I={home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',cats:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',online:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5"/>'};
  const t=(k,l)=>`<button class="tab ${TAB===k?'on':''}" data-tab="${k}"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg><span>${l}</span></button>`;
  return `<div class="tabs">${t('home','الرئيسية')}${t('cats','الفئات')}${t('online','أونلاين')}${t('me','حسابي')}</div>`;
}

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

let LASTSCR=null;function shell(inner,{back=true,nav=false,title=''}={}){const _a=app(),_k=title+'|'+nav;if(_k!==LASTSCR){LASTSCR=_k;_a.classList.remove('enter');void _a.offsetWidth;_a.classList.add('enter');}_a.innerHTML=`<div class="top">${back?'<button class="icon" data-act="back" aria-label="رجوع">→</button>':'<span></span>'}${title?`<div class="tlt">${title}</div>`:`<div class="logo"><img src="assets/logo.svg" alt="" width="34" height="34" style="vertical-align:middle;margin-inline-end:8px"><b>دغدغ</b></div>`}<button class="icon" data-act="sound">${store.get('sound',true)?'🔊':'🔇'}</button></div>${inner}${nav?tabsHtml():''}`;}
const AVS=Object.keys(window.AVSVG||{});
const avOK=a=>AVS.includes(a)?a:AVS[[...String(a||'x')].reduce((q,c)=>q+c.codePointAt(0),0)%AVS.length];
const avh=(a,c)=>`<span class="av ${c||''}" role="img" aria-label="${(window.AVNAME||{})[avOK(a)]||''}">${window.AVSVG[avOK(a)]}</span>`;
(()=>{const a=store.get('myav','');if(a&&!AVS.includes(a))store.set('myav',avOK(a));})();
let PF=null;
const pfValid=()=>!!(PF&&PF.name&&PF.av);
function profileOk(){return !!(store.get('myname','')&&store.get('myav',''));}
function profileForm(first){
  clearTimer();if(typeof ONL!=='undefined'&&ONL)ONL.leave();
  if(!PF||PF.first!==first)PF={first,name:String(store.get('myname','')),av:store.get('myav','')};
  TAB=first?'':'me';
  const inp=document.getElementById('pfname');if(inp)PF.name=inp.value.trim().slice(0,14);
  const extra=first?'':`<div class="cards">
   <button class="mode" data-act="install"><span class="ic">📲</span><span class="tx"><b>ثبّت اللعبة</b><small>ضيفها على الشاشة الرئيسية زي أي تطبيق.</small></span><span class="ch">‹</span></button>
   <button class="mode" data-act="howto"><span class="ic">❓</span><span class="tx"><b>إزاي ألعب؟</b><small>قواعد اللعب.</small></span><span class="ch">‹</span></button>
   <button class="mode" data-act="sound"><span class="ic">${store.get('sound',true)?'🔊':'🔇'}</span><span class="tx"><b>الصوت</b><small>${store.get('sound',true)?'شغال - دوس للكتم':'مكتوم - دوس للتشغيل'}</small></span><span class="ch">‹</span></button></div>`;
  shell(`<div class="panel pf center">${first?'<h2>أهلاً بيك في دغدغ!</h2><p>اعمل بروفايلك الأول. بيتحفظ على موبايلك بس.</p>':`<div class="big-av">${avh(PF.av,'avxl')}</div><h2>بروفايلي</h2>`}
  <h3>اسمك</h3><input id="pfname" maxlength="14" value="${esc(PF.name)}" placeholder="اكتب اسمك" autocomplete="off">
  <h3>اختار أفاتار</h3><div class="avgrid">${AVS.map(a=>`<button class="avb ${PF.av===a?'on':''}" data-pf="av" data-v="${a}" aria-label="${window.AVNAME[a]}">${window.AVSVG[a]}</button>`).join('')}</div>
  <button class="btn big" id="pfsave" data-pf="save" ${pfValid()?'':'disabled'}>${first?'يلا نبدأ':'حفظ'}</button>
  <p style="color:var(--mut);font-size:13px">من غير حساب ولا جوجل. الاسم والأفاتار بس بيتحفظوا، والنقط بتخلص بمجرد ما اللعبة تخلص.</p></div>${extra}`,first?{back:false,title:'بروفايل'}:{title:'حسابي',nav:true,back:false});
}
function pfClick(t){
  const inp=document.getElementById('pfname');if(inp)PF.name=inp.value.trim().slice(0,14);
  const k=t.dataset.pf,v=t.dataset.v;
  if(k==='g'){PF.g=v;return profileForm(PF.first);}
  if(k==='av'){PF.av=v;return profileForm(PF.first);}
  if(k==='save'&&pfValid()){store.set('myname',PF.name);store.set('myav',PF.av);PF=null;return home();}
}
const SLOGAN='العب، اتحدّى، دغدغ';
const JR=(()=>{const m=/[?&]r=([1-3][A-Za-z2-9]{4})(?![A-Za-z0-9])/.exec(location.search);return m?m[1].toUpperCase():''})();
function linkJoin(){
  try{history.replaceState(null,'',location.pathname)}catch(e){}
  if(profileOk()){ONL.joinCode(JR);return;}
  shell(`<div class="panel center"><div class="big-emoji">🎮</div><h2>اتدعيت للعب!</h2><p>اكتب اسمك بس وادخل الغرفة ${esc(JR)}.</p><input id="ljname" maxlength="14" placeholder="اسمك" autocomplete="off"><button class="btn big" data-act="lj">ادخل الغرفة</button><button class="btn ghost" data-act="back2home">لأ، رجوع</button></div>`,{back:false,title:'دعوة'});
}
function home(){
  clearTimer();G=null;if(typeof ONL!=='undefined'&&ONL)ONL.leave();
  TAB='home';
  const nc=Object.keys(CATS).length;
  shell(`<div class="hero center">${LOGOANIM}<h1>دغدغ</h1><p class="slg">${SLOGAN}</p><div class="pill who">${avh(store.get('myav',''))}أهلاً ${esc(store.get('myname',''))}</div></div>
  <button class="cta" data-act="online">🎉 اعمل غرفة أو ادخل بكود</button>
  <div class="sec"><span>أنواع اللعب</span><span>${Q.length} سؤال • ${nc} فئة</span></div>
  <div class="cards duo">
   <button class="mode c-classic" data-act="online"><span class="ic">🎯</span><span class="tx"><b>سباق إجابات</b><small>4 اختيارات و20 ثانية. الأسرع والأدق يكسب.</small></span></button>
   <button class="mode c-bluff" data-act="online"><span class="ic">🎭</span><span class="tx"><b>بلوف</b><small>اكتب إجابة مزيفة تخدع بيها صحابك.</small></span></button>
  </div>
  <div class="foot"><button class="link" data-act="howto">إزاي ألعب؟</button> · <button class="link" data-act="install">ثبّتها كتطبيق 📲</button></div>`,{back:false,nav:true});logoAnim();
}
function howto(){shell(`<div class="panel"><h2>إزاي ألعب؟</h2>
<p><b>🌐 أونلاين:</b> واحد يعمل غرفة ويبعت الكود لصحابه، وكل واحد يدخل بموبايله. صاحب الغرفة يختار النوع والفئات (6 على الأقل) وعدد الأسئلة من 10 لـ 30. صاحب الغرفة لازم يسيب شاشته مفتوحة.</p>
<p><b>🎯 سباق إجابات:</b> كل سؤال ليه 4 اختيارات و20 ثانية. الأسئلة سهلة ومتوسطة وصعبة بالعشوائي: سهل 5 نقط، متوسط 10، صعب 20.</p>
<p><b>🎭 بلوف:</b> بيظهر سؤال من غير إجابات. كل لاعب يكتب إجابة مزيفة مقنعة، وبعدها الكل يختار الإجابة اللي شايفها صح. اللي يختار الصح ياخد نقط، واللي إجابته المزيفة تخدع حد ياخد نقط عن كل واحد خدعه.</p>
<p>النقط بتفضل طول اللعبة بس. أول ما تقفل اللعبة بتتمسح، ومفيش حاجة بتتحفظ غير اسمك وأفاتارك.</p><button class="btn" data-act="home">تمام</button></div>`)}
function installView(){
  const ua=navigator.userAgent||'';const ios=/iPhone|iPad|iPod/.test(ua);
  shell(`<div class="panel"><h2>📲 ثبّت اللعبة على موبايلك</h2>
  <p>اللعبة موقع شغال من غير تحميل ولا مساحة، وتقدر تضيفها للشاشة الرئيسية فتفتح بضغطة واحدة زي أي تطبيق:</p>
  ${ios?`<p><b>على الآيفون:</b><br>1. افتح اللينك في متصفح <b>سفاري</b><br>2. دوس على زرار المشاركة (المربع اللي فيه سهم فوق)<br>3. اختار <b>"إضافة إلى الشاشة الرئيسية"</b><br>4. دوس "إضافة" وهتلاقي أيقونة اللعبة على الشاشة.</p>
  <p><b>على أندرويد:</b><br>1. افتح اللينك في <b>كروم</b><br>2. دوس على قائمة ⋮ فوق<br>3. اختار <b>"إضافة إلى الشاشة الرئيسية"</b>.</p>`
  :`<p><b>على أندرويد (كروم):</b><br>1. افتح اللينك في <b>كروم</b><br>2. دوس على قائمة ⋮ فوق<br>3. اختار <b>"إضافة إلى الشاشة الرئيسية"</b> أو "تثبيت التطبيق"، وهتلاقي الأيقونة على الشاشة.</p>
  <p><b>على الآيفون (سفاري):</b><br>1. افتح اللينك في <b>سفاري</b><br>2. زرار المشاركة (مربع فيه سهم)<br>3. <b>"إضافة إلى الشاشة الرئيسية"</b> ثم "إضافة".</p>`}
  <p>⚠️ اللعبة محتاجة نت عشان تفتح، ومفيش نسخة على متاجر التطبيقات لسه.</p>
  <button class="btn big" data-act="home">تمام</button></div>`);
}
function setup(){return openOnline();}

// ---------- category browser ----------
let catBr=null,catQ='',catF='all',catG='';
function catsBrowser(o){catBr=o;catQ='';catF='all';catG='';catsView();}
function catGroupsList(){const used=new Set();const g=CAT_GROUPS.map(x=>({...x,keys:x.keys.filter(k=>CATS[k]&&!used.has(k)&&used.add(k))}));const rest=Object.keys(CATS).filter(k=>!used.has(k));if(rest.length)g.push({id:'ot',name:'أخرى',keys:rest});return g.filter(x=>x.keys.length);}
function catsSync(){if(!catBr)return;const sel=catBr.get();const all=Object.keys(CATS);const allOn=sel.length>=all.length;
document.querySelectorAll('.catc').forEach(c=>{const on=sel.includes(c.dataset.catt);c.classList.toggle('on',on);c.style.animation='none';if(catF==='sel'&&!on)c.remove();});
document.querySelectorAll('.catsec').forEach(s=>{if(!s.querySelector('.catc'))s.remove();});
const cs=document.querySelector('[data-catf="sel"]');if(cs)cs.textContent='المختارة ('+sel.length+')';
const an=document.querySelector('[data-act="catsall2"]');if(an)an.textContent=allOn?'إلغاء الكل':'اختيار الكل ✓';
const sc=document.getElementById('catcount');if(sc)sc.textContent=sel.length+' مختارة';
const d=document.querySelector('[data-act="catsdone"]');if(d){d.disabled=sel.length<MINCATS;d.textContent=sel.length<MINCATS?`اختار ${MINCATS-sel.length} فئات كمان (${sel.length}/${MINCATS})`:`اعتمد ${sel.length} فئة`;}}
function catsView(){
  if(!catBr)return;TAB=catBr.tab||'';
  const sel=catBr.get();const allOn=sel.length>=Object.keys(CATS).length;
  const counts={};Q.forEach(q=>{counts[q[0]]=(counts[q[0]]||0)+1});
  const normq=norm(catQ);const groups=catGroupsList();
  const card=k=>{const v=CATS[k],em=v.split(' ')[0],nm=v.slice(em.length).trim();return `<button class="catc ${sel.includes(k)?'on':''}" data-catt="${k}"><span class="ck">✓</span><span class="em">${em}</span><b>${nm}</b><small>${counts[k]||0} سؤال</small></button>`;};
  const secs=groups.filter(g=>!catG||g.id===catG).map(g=>{
    let ks=g.keys;
    if(catF==='sel')ks=ks.filter(k=>sel.includes(k));
    if(normq)ks=ks.filter(k=>norm(CATS[k]).includes(normq)||norm(g.name).includes(normq));
    if(!ks.length)return '';
    const n=g.keys.filter(k=>sel.includes(k)).length;
    return `<section class="catsec"><div class="cathd"><h3>${g.name}</h3><span>${n}/${g.keys.length}</span></div><div class="catgrid">${ks.map(card).join('')}</div></section>`;}).join('');
  const opts=`<option value="">كل المجموعات</option>`+groups.map(g=>`<option value="${g.id}"${catG===g.id?' selected':''}>${g.name}</option>`).join('');
  shell(`<div class="search"><input id="catq" placeholder="ابحث عن فئة..." value="${esc(catQ)}" autocomplete="off"></div>
  <div class="chips"><button class="chip ${catF==='all'?'on':''}" data-catf="all">تصفح (${Object.keys(CATS).length})</button><button class="chip ${catF==='sel'?'on':''}" data-catf="sel">المختارة (${sel.length})</button><select id="catg" class="catsel" aria-label="المجموعة">${opts}</select><button class="chip alln" data-act="catsall2">${allOn?'إلغاء الكل':'اختيار الكل ✓'}</button></div>
  <div class="catlist">${secs||'<p class="center" style="color:var(--mut);margin-top:24px">مفيش فئات مطابقة</p>'}</div>
  <div class="footbar catbar"${catBr.tab?' style="bottom:66px"':''}><div class="catinfo"><b id="catcount">${sel.length} مختارة</b><button class="catrev" data-catf="sel">راجع اختياراتك</button></div><button class="btn big" data-act="catsdone" ${sel.length<MINCATS?'disabled':''}>${sel.length<MINCATS?`اختار ${MINCATS-sel.length} فئات كمان (${sel.length}/${MINCATS})`:`اعتمد ${sel.length} فئة`}</button></div>`,{title:'الفئات',nav:!!catBr.tab});
}

// ---------- profile ----------
function profileView(){PF=null;profileForm(false);}
function startGame(){return openOnline();}
function scoreboard(){return `<div class="sb">${G.players.map((p,i)=>`<div class="sp ${i===G.turn&&G.mode!=='bluff'?'cur':''}"><span class="who">${avh(store.get('myav',''))}${esc(p.name)}</span><b>${p.score}</b></div>`).join('')}</div>`;}
function next(){
  if(G.i>=G.n)return finish();
  G.turn=G.i%G.players.length;
  const p=G.players[G.turn];
  if(G.players.length>1){
    shell(`<div class="panel center"><div class="big-emoji">📱</div><h2>دور ${esc(p.name)}</h2><p>ادّي الموبايل لـ ${esc(p.name)} واضغط جاهز.</p><button class="btn big" data-act="ready">جاهز</button></div>${scoreboard()}`);
  } else ready();
}
function ready(){classicView();}

// ---- classic ----
function classicView(){
  const it=G.items[G.i],p=G.players[G.turn];
  it.opts=shuffle([it.right,...it.wrong]);it.locked=false;it.removed=[];
  it.t0=Date.now();it.limit=20;
  renderClassic();
  clearTimer();timer=setInterval(tickClassic,100);
}
function renderClassic(res){
  const it=G.items[G.i],p=G.players[G.turn];
  const L=p.lifes;
  const opts=it.opts.map((o,k)=>{let cls='opt';if(it.removed.includes(k))cls+=' gone';if(res){if(o===it.right)cls+=' right';else if(k===res.pick)cls+=' wrong';}return `<button class="${cls}" data-pick="${k}" ${res||it.removed.includes(k)?'disabled':''}>${esc(o)}</button>`}).join('');
  shell(`${scoreboard()}<div class="qmeta"><span>${CATS[it.cat]}</span><span>${'⭐'.repeat(it.diff)} +${PTS[it.diff]||10}</span><span>${G.i+1}/${G.n}</span></div><div class="bar"><i id="bar"></i></div>
  ${qbox(it.text)}<div class="opts">${opts}</div>
  ${res?`<div class="res ${res.ok?'good':'bad'}">${res.msg}</div><button class="btn big" data-act="nextq">${G.i+1>=G.n?'النتيجة':'السؤال الجاي'}</button>`:`<div class="row life"><button class="btn sm ghost" data-life="half" ${L.half?'':'disabled'}>✂️ 50/50</button><button class="btn sm ghost" data-life="skip" ${L.skip?'':'disabled'}>⏭️ تخطي</button><button class="btn sm ghost" data-life="time" ${L.time?'':'disabled'}>⏱️ +10ث</button></div>`}`);
  updateBar();
}
function remaining(){const it=G.items[G.i];return Math.max(0,it.limit-(Date.now()-it.t0)/1000);}
function updateBar(){const b=$('#bar');if(!b)return;const it=G.items[G.i];const r=remaining();b.style.width=(r/it.limit*100)+'%';b.className=r<6?'low':'';b.setAttribute('data-s',Math.ceil(r));}
function tickClassic(){const it=G.items[G.i];if(!it||it.locked){clearTimer();return;}updateBar();const r=remaining();if(r<=5&&Math.abs(r-Math.round(r))<0.06&&r>0.2)sfx.tick();if(r<=0){answerClassic(-1);}}
function answerClassic(k){
  const it=G.items[G.i];if(it.locked)return;it.locked=true;clearTimer();
  const p=G.players[G.turn];const ok=k>=0&&it.opts[k]===it.right;let msg;
  if(ok){const left=remaining();p.streak++;p.best=Math.max(p.best,p.streak);p.right++;const speed=Math.round(50*left/it.limit);const sb=0;const pts=PTS[it.diff]||10;p.score+=pts;msg=`صح! +${pts} نقطة${sb?` (ستريك ${p.streak} 🔥)`:''}`;sfx.ok();}
  else{p.streak=0;msg=k<0?`الوقت خلص. الإجابة: ${esc(it.right)}`:`غلط. الإجابة الصح: ${esc(it.right)}`;sfx.bad();}
  G.log.push({q:it.text,ok});
  renderClassic({pick:k,ok,msg});
}
function useLife(l){
  const it=G.items[G.i],p=G.players[G.turn];if(it.locked||!p.lifes[l])return;
  if(l==='half'){const wrongIdx=it.opts.map((o,k)=>k).filter(k=>it.opts[k]!==it.right&&!it.removed.includes(k));it.removed=it.removed.concat(shuffle(wrongIdx).slice(0,2));}
  if(l==='time'){it.limit+=10;}
  p.lifes[l]--;
  if(l==='skip'){it.locked=true;clearTimer();G.i++;return next();}
  renderClassic();
}

// ---- bluff ----
function bluffRound(){
  if(G.i>=G.n)return finish();
  const it=G.items[G.i];it.fakes=[];it.votes=[];it.who=0;
  bluffPass();
}
function bluffPass(){
  const it=G.items[G.i],p=G.players[it.who];
  shell(`<div class="panel center"><div class="big-emoji">🤫</div><h2>${esc(p.name)}</h2><p>جولة ${G.i+1}/${G.n}. ادّي الموبايل لـ ${esc(p.name)} من غير ما حد يبص.</p><button class="btn big" data-act="bwrite">جاهز</button></div>${scoreboard()}`);
}
function bluffWrite(msg){
  const it=G.items[G.i],p=G.players[it.who];
  shell(`${scoreboard()}<div class="qmeta"><span>${CATS[it.cat]}</span><span>جولة ${G.i+1}/${G.n}</span></div>${qbox(it.text)}<p class="center">اكتب إجابة مزيفة تخلّي غيرك يصدّقها، يا ${esc(p.name)}</p>
  <div class="ans"><input id="fake" maxlength="40" placeholder="إجابتك المزيفة" autocomplete="off" aria-label="إجابة مزيفة"><button class="btn" data-act="bsend">تمام</button></div><div id="msg" class="warn">${msg||''}</div>`);
  $('#fake').focus();
}
function bluffSend(){
  const it=G.items[G.i],v=$('#fake').value.trim();if(!v)return;
  if(norm(v)===norm(it.right))return bluffWrite('😅 دي الإجابة الصح فعلًا! اكتب حاجة تانية.');
  if(it.fakes.some(f=>norm(f.text)===norm(v)))return bluffWrite('حد كتب نفس الإجابة دي. غيّرها شوية.');
  it.fakes.push({text:v,by:it.who});it.who++;
  if(it.who>=G.players.length){it.who=0;it.options=shuffle([{text:it.right,by:-1},...it.fakes,...shuffle(it.wrong).slice(0,2).map(t=>({text:t,by:-2}))]);return bluffVotePass();}
  bluffPass();
}
function bluffVotePass(){
  const it=G.items[G.i],p=G.players[it.who];
  shell(`<div class="panel center"><div class="big-emoji">🗳️</div><h2>التصويت: ${esc(p.name)}</h2><p>اختار الإجابة اللي شايفها صح.</p><button class="btn big" data-act="bvote">جاهز</button></div>${scoreboard()}`);
}
function bluffVote(){
  const it=G.items[G.i],p=G.players[it.who];
  shell(`${scoreboard()}${qbox(it.text)}<p class="center">${esc(p.name)}، أي إجابة هي الصح؟ (إجابتك المزيفة متقفلة)</p><div class="opts">${it.options.map((o,k)=>`<button class="opt" data-bv="${k}" ${o.by===it.who?'disabled':''}>${esc(o.text)}</button>`).join('')}</div>`);
}
function bluffPick(k){
  const it=G.items[G.i];it.votes.push({voter:it.who,opt:k});it.who++;
  if(it.who>=G.players.length)return bluffReveal();
  bluffVotePass();
}
function bluffReveal(){
  const it=G.items[G.i];const gains=G.players.map(()=>0);
  it.votes.forEach(v=>{const o=it.options[v.opt];if(o.by===-1){gains[v.voter]+=2;G.players[v.voter].right++;}else if(o.by>=0){gains[o.by]+=1;}});
  G.players.forEach((p,i)=>p.score+=gains[i]);
  const rows=it.options.map((o,k)=>{const voters=it.votes.filter(v=>v.opt===k).map(v=>esc(G.players[v.voter].name));const author=o.by===-1?'✅ الإجابة الصح':o.by===-2?'🏠 إجابة البيت':'✍️ '+esc(G.players[o.by].name);return `<div class="opt ${o.by===-1?'right':''}" style="cursor:default"><b>${esc(o.text)}</b><small>${author}${voters.length?' | اختارها: '+voters.join('، '):''}</small></div>`}).join('');
  shell(`${scoreboard()}${qbox(it.text)}<div class="opts">${rows}</div><div class="res good">${G.players.map((p,i)=>`${esc(p.name)} +${gains[i]}`).join(' • ')}</div><button class="btn big" data-act="bnext">${G.i+1>=G.n?'النتيجة':'الجولة الجاية'}</button>`);
  sfx.ok();
}

// ---- results ----
function finish(){
  clearTimer();
  const sorted=G.players.map((p,i)=>({...p,i})).sort((a,b)=>b.score-a.score);
  const top=sorted[0];const tie=sorted.length>1&&sorted[1].score===top.score;
  const maxPts=G.mode==='bluff'?'':'';
  sfx.win();shell(`<div class="panel center"><div class="big-emoji trophy">${tie?'🤝':'🏆'}</div><h2>${tie?'تعادل!':'الفائز: '+esc(top.name)}</h2>
  <div class="rank">${sorted.map((p,k)=>`<div class="rk"><span class="who">${k+1}. ${avh(store.get('myav',''))}${esc(p.name)}</span><span>${p.score} نقطة • ${p.right} صح${G.mode==='classic'?` • أطول ستريك ${p.best}`:''}</span></div>`).join('')}</div>
  <button class="btn big" data-act="again">العب تاني</button><button class="btn ghost" data-act="home">القائمة</button></div>`);
  window.__last={mode:G.mode,scores:G.players.map(p=>p.score)};setTimeout(()=>window.burst&&window.burst(40),250);
}

// ---------- navigation history ----------
var openOnline=function(){return openOnline();};let VH=[],CURV=null,NAVING=false;
function goBack(){catBr=null;const p=VH.pop();if(!p)return home();NAVING=true;try{p.f();}finally{NAVING=false;}}
function trk(n,fn,reset){return function(...a){if(n!=='cats')catBr=null;if(reset){VH=[];CURV=null;}else if(!NAVING){if(CURV&&CURV.n!==n){VH.push(CURV);try{history.pushState({v:1},'')}catch(e){}}}CURV={n,f:()=>fn.apply(null,a)};return fn.apply(this,a);}}
home=trk('home',home,true);setup=trk('setup',setup);catsBrowser=trk('cats',catsBrowser);profileView=trk('me',profileView);installView=trk('inst',installView);howto=trk('how',howto);
CURV={n:'home',f:()=>home()};const _ool=()=>ONL.open();openOnline=trk('onl',_ool);
window.addEventListener('popstate',()=>{if(VH.length)goBack();});

// ---------- events ----------
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(!t.dataset.pick&&!t.dataset.bv&&!t.dataset.o)sfx.tap();
  if(t.dataset.pf)return pfClick(t);
  if(t.dataset.tab){const k=t.dataset.tab;if(k==='home')return home();if(k==='cats')return catsBrowser({get:()=>CFG.cats,set:c=>{CFG.cats=c;store.set('cats',c);},onDone:()=>home(),tab:'cats'});if(k==='online')return openOnline();if(k==='me')return profileView();return;}
  if(t.dataset.catf!==undefined){catF=t.dataset.catf;return catsView();}
  if(t.dataset.catt){const c=t.dataset.catt,sel=catBr.get();const i=sel.indexOf(c);if(i>=0){sel.splice(i,1);}else sel.push(c);catBr.set(sel);return catsSync();}
  if(t.dataset.mode)return setup(t.dataset.mode);
  if(t.dataset.cat){const c=t.dataset.cat;const i=CFG.cats.indexOf(c);if(i>=0){if(CFG.cats.length>1)CFG.cats.splice(i,1);}else CFG.cats.push(c);return setup(CFG.mode);}
  if(t.dataset.diff!==undefined){CFG.diff=+t.dataset.diff;return setup(CFG.mode);}
  if(t.dataset.rounds){CFG.rounds=+t.dataset.rounds;return setup(CFG.mode);}
  if(t.dataset.pick!==undefined)return answerClassic(+t.dataset.pick);
  if(t.dataset.life)return useLife(t.dataset.life);
  if(t.dataset.bv!==undefined)return bluffPick(+t.dataset.bv);
  switch(t.dataset.act){
    case 'online':return openOnline();
    case 'me':return profileView();
    case 'install':return installView();
    case 'catsall2':{const sel=catBr.get();const all=Object.keys(CATS);const on=sel.length>=all.length;sel.length=0;if(!on)all.forEach(k=>sel.push(k));catBr.set(sel);return catsSync();}
    case 'catsall':CFG.cats=Object.keys(CATS);return setup(CFG.mode);
    case 'catsnone':CFG.cats=[];return setup(CFG.mode);
    case 'catsedit':return catsBrowser({get:()=>CFG.cats,set:c=>{CFG.cats=c;store.set('cats',c);},onDone:()=>setup(CFG.mode)});
    case 'catsdone':{const o=catBr;catBr=null;if(o&&o.onDone)return o.onDone();return home();}
    case 'rminus':case 'rplus':{const st=RSTEP[CFG.mode];let i=st.indexOf(CFG.rounds);i+=t.dataset.act==='rplus'?1:-1;i=Math.max(0,Math.min(st.length-1,i));CFG.rounds=st[i];return setup(CFG.mode);}
    case 'back':return goBack();case 'home':return home();case 'howto':return howto();
    case 'lj':{const el=document.getElementById('ljname');const nm=el?el.value.trim().slice(0,14):'';if(!nm){if(el)el.focus();return;}store.set('myname',nm);if(!store.get('myav',''))store.set('myav',AVS[Math.floor(Math.random()*AVS.length)]);return ONL.joinCode(JR);}
    case 'back2home':return home();
    case 'sound':store.set('sound',!store.get('sound',true));if(TAB==='me')return profileView();t.textContent=store.get('sound',true)?'🔊':'🔇';return;
    case 'padd':CFG.players.push('لاعب '+(CFG.players.length+1));return setup(CFG.mode);
    case 'pdel':CFG.players.pop();return setup(CFG.mode);
    case 'start':return startGame();
    case 'again':return startGame();
    case 'ready':return ready();
    case 'nextq':G.i++;return next();
    case 'bwrite':return bluffWrite();
    case 'bsend':return bluffSend();
    case 'bvote':return bluffVote();
    case 'bnext':G.i++;return bluffRound();
  }
});
document.addEventListener('change',e=>{if(e.target.id==='catg'){catG=e.target.value;catsView();}});
document.addEventListener('input',e=>{
  if(e.target.classList.contains('pn'))CFG.players[+e.target.dataset.i]=e.target.value;
  if(e.target.id==='catq'){catQ=e.target.value;catsView();const el=document.getElementById('catq');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}}
  if(e.target.id==='rng'){CFG.rounds=+e.target.value;const r=document.getElementById('rv');if(r)r.textContent=CFG.rounds;}
  if(e.target.id==='orng'){const r=document.getElementById('orv');if(r)r.textContent=e.target.value;}
  if(e.target.id==='pfname'&&PF){PF.name=e.target.value.trim().slice(0,14);const b=document.getElementById('pfsave');if(b)b.disabled=!pfValid();}
});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(e.target.id==='fake')bluffSend();});

const ONL=initOnline({app,esc,shuffle,norm,Q,CATS,shell,sfx,home,store,catsBrowser,avh,avOK,setTab:k=>{TAB=k},catsOpen:()=>!!catBr});
window.__ONL=ONL;window.__lgHome=home;
JR?linkJoin():(profileOk()?home():profileForm(true));
}
