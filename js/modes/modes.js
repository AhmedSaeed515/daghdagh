/* Falta extra modes: team board (single phone) and rank-the-list. */
(function(){
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SH=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const N=t=>String(t).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/[ىئ]/g,'ي').replace(/ؤ/g,'و').replace(/[^a-z0-9\u0621-\u064a ]/g,' ').replace(/\s+/g,' ').trim();
const lev=(a,b)=>{const m=a.length,n=b.length;if(Math.abs(m-n)>1)return 9;const d=[];for(let i=0;i<=m;i++){d[i]=[i];}for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];};
const sh=(h,o)=>window.shell(h,o||{});
const TC=['#2f5486','#b8562a'];
const tapfx=()=>{try{window.__sfx&&window.__sfx.tap()}catch(e){}};

/* ---------------- Team board ---------------- */
let J=null;const TIERS=[[100,1],[300,2],[500,3]];
const cname=k=>(window.CATS&&window.CATS[k])||k;
const cemoji=k=>{const n=cname(k);const m=/^(\S+)\s+(.*)$/.exec(n);return m?[m[1],m[2]]:['',n];};
function jSetup(){
  const st=J&&J.setup?J.setup:(J={setup:{names:['فريق 1','فريق 2'],cats:(window.__CFG&&window.__CFG.cats||[]).slice(0,6)}}).setup;
  const chips=st.cats.length?st.cats.map(k=>`<span class="mdchip">${E(cname(k))}</span>`).join(''):'<span class="mdmut">لسه ما اخترتش فئات</span>';
  sh(`<div class="panel mdp"><h2>🎯 تحدي الفرق</h2><p class="mdmut">فريقين على موبايل واحد. كل فريق بيختار مربع من اللوحة ويجاوب، والإجابة الصح بتجيب نقاط المربع (100 سهل، 300 متوسط، 500 صعب).</p>
  <div class="mdnames"><input class="mdin" id="jn0" maxlength="12" value="${E(st.names[0])}" placeholder="اسم الفريق الأول"><input class="mdin" id="jn1" maxlength="12" value="${E(st.names[1])}" placeholder="اسم الفريق التاني"></div>
  <div class="mdlab">الفئات (لحد 6)</div><div class="mdchips">${chips}</div>
  <div class="mdrow"><button class="btn" data-jx="pick">🗂️ اختار الفئات</button><button class="btn" data-jx="rand">🎲 عشوائي</button></div>
  <button class="btn big" data-jx="start" ${st.cats.length>=2?'':'disabled'}>ابدأ اللعب</button></div>`);
}
function jSaveNames(){const a=document.getElementById('jn0'),b=document.getElementById('jn1');if(J&&J.setup){if(a)J.setup.names[0]=a.value.trim().slice(0,12)||'فريق 1';if(b)J.setup.names[1]=b.value.trim().slice(0,12)||'فريق 2';}}
function jStart(){
  const st=J.setup;const cats=st.cats.slice(0,6);
  const cells={};
  cats.forEach(c=>{cells[c]=TIERS.map(([pts,d])=>{const it=window.__picker.pick([c],d,1)[0];return {pts,d,it,done:0};});});
  // avoid the same question twice across the board
  J={g:1,names:st.names.slice(),cats,cells,score:[0,0],turn:0,setup:st};
  jBoard();
}
function jBoard(){
  const left=J.cats.reduce((s,c)=>s+J.cells[c].filter(x=>!x.done).length,0);
  if(!left)return jEnd();
  const head=J.cats.map(c=>{const [e,n]=cemoji(c);return `<div class="jh"><b>${e}</b><span>${E(n)}</span></div>`}).join('');
  const rows=TIERS.map((t,r)=>J.cats.map((c,ci)=>{const x=J.cells[c][r];return x.done?`<button class="jc used" disabled><i style="background:${TC[x.done-1]}"></i></button>`:`<button class="jc t${r+1}" data-jx="cell" data-c="${ci}" data-r="${r}">${t[0]}</button>`}).join('')).join('');
  const team=i=>`<div class="jt ${J.turn===i?'on':''}" style="--tc:${TC[i]}"><span>${E(J.names[i])}</span><b>${J.score[i]}</b></div>`;
  sh(`<div class="jtop">${team(0)}<div class="jturn">دور<br>${E(J.names[J.turn])}</div>${team(1)}</div><div class="jgrid" style="--n:${J.cats.length}">${head}${rows}</div>`,{back:false});
}
function jAsk(ci,r){
  const c=J.cats[ci],x=J.cells[c][r];if(!x||x.done)return;
  J.cur={c,r,x,opts:SH([x.it.right,...x.it.wrong]),res:null};jQ();
}
function jQ(){
  const {x,opts,res,c}=J.cur;
  const o=opts.map((t,k)=>{let cls='opt';if(res){if(t===x.it.right)cls+=' right';else if(k===res.pick)cls+=' wrong';}return `<button class="${cls}" data-jx="ans" data-k="${k}" ${res?'disabled':''}>${E(t)}</button>`}).join('');
  sh(`<div class="jtop small"><div class="jt on" style="--tc:${TC[J.turn]}"><span>${E(J.names[J.turn])}</span><b>${J.score[J.turn]}</b></div></div><div class="qmeta"><span>${E(cname(c))}</span><span class="dp d${x.d}">${x.pts} نقطة</span></div>${window.qbox(x.it.text)}<div class="opts">${o}</div>${res?`<div class="res ${res.ok?'good':'bad'}">${res.ok?'✅ صح! +'+x.pts:'❌ غلط. الإجابة: '+E(x.it.right)}</div><button class="btn big" data-jx="back">رجوع للوحة</button>`:''}`,{back:false});
}
function jAns(k){
  if(J.cur.res)return;const {x,opts}=J.cur;const ok=opts[k]===x.it.right;
  J.cur.res={pick:k,ok};x.done=J.turn+1;if(ok)J.score[J.turn]+=x.pts;
  try{ok?window.__sfx&&window.__sfx.ok&&window.__sfx.ok():window.__sfx&&window.__sfx.bad&&window.__sfx.bad()}catch(e){}
  jQ();
}
function jEnd(){
  const [a,b]=J.score;const w=a===b?'تعادل 🤝':'🏆 فاز '+E(J.names[a>b?0:1]);
  sh(`<div class="panel center"><div class="big-emoji">🏁</div><h2>${w}</h2><div class="jtop"><div class="jt on" style="--tc:${TC[0]}"><span>${E(J.names[0])}</span><b>${a}</b></div><div></div><div class="jt on" style="--tc:${TC[1]}"><span>${E(J.names[1])}</span><b>${b}</b></div></div><button class="btn big" data-jx="again">العب تاني بنفس الفئات</button><button class="btn big" data-jx="home">الرئيسية</button></div>`,{back:false});
}

/* ---------------- Rank the list ---------------- */
const LISTS=[
 {id:'area',t:'🌍 أكبر 10 دول في العالم بالمساحة',src:'ويكيبيديا (المساحة الكلية)',items:[['روسيا'],['كندا'],['الصين'],['امريكا','الولايات المتحدة','الولايات المتحدة الامريكية','usa'],['البرازيل'],['استراليا'],['الهند'],['الارجنتين'],['كازاخستان'],['الجزائر']]},
 {id:'pop',t:'👥 أكتر 10 دول في عدد السكان',src:'ويكيبيديا (تقديرات 2026)',items:[['الهند'],['الصين'],['امريكا','الولايات المتحدة','الولايات المتحدة الامريكية'],['اندونيسيا'],['باكستان'],['نيجيريا'],['البرازيل'],['بنجلاديش','بنغلاديش'],['روسيا'],['المكسيك']]},
 {id:'afr',t:'🌍 أكبر 10 دول أفريقية بالمساحة',src:'ويكيبيديا',items:[['الجزائر'],['الكونغو الديمقراطيه','الكونجو الديمقراطيه','الكونغو','الكونجو','جمهوريه الكونغو الديمقراطيه'],['السودان'],['ليبيا'],['تشاد'],['النيجر'],['انغولا','انجولا'],['مالي'],['جنوب افريقيا','جنوب افريقية'],['اثيوبيا']]},
 {id:'mtn',t:'⛰️ أعلى 10 قمم جبال في العالم',src:'ويكيبيديا',items:[['افرست','ايفرست','إفرست','everest'],['k2','كي تو','كيتو','ك2'],['كانشينجونجا','كانشينجونغا','كانغشنجونغا','كانجينجونجا','كانشنجنجا'],['لوتسي','لوتس'],['ماكالو','ماكالوا'],['تشو اويو','تشو أويو','شو اويو'],['داولاجيري','داولاغيري','داولاجيرى'],['مانسلو','مناسلو'],['نانجا باربات','نانغا باربات','نانجا باربت'],['انابورنا','أنابورنا','انابورنا 1']]},
 {id:'gov',t:'🇪🇬 أكتر 10 محافظات مصرية في عدد السكان',src:'ويكيبيديا (تقدير نوفمبر 2023)',items:[['القاهره'],['الجيزه'],['الشرقيه'],['الدقهليه'],['البحيره'],['المنيا'],['القليوبيه'],['سوهاج'],['الاسكندريه','اسكندريه'],['الغربيه']]},
 {id:'pl',t:'⚽ أكتر 10 هدافين في تاريخ الدوري الإنجليزي',src:'ويكيبيديا (حتى 2026)',items:[['شيرر','الان شيرر'],['هاري كين','كين'],['واين روني','روني'],['محمد صلاح','صلاح','مو صلاح'],['اندي كول','كول'],['اجويرو','سيرجيو اجويرو','كون اجويرو','اغويرو'],['لامبارد','فرانك لامبارد'],['هنري','تيري هنري','تييري هنري'],['فاولر','روبي فاولر'],['ديفو','جيرمين ديفو','جيرماين ديفو']]},
];
const DISP={area:['روسيا','كندا','الصين','الولايات المتحدة','البرازيل','أستراليا','الهند','الأرجنتين','كازاخستان','الجزائر'],pop:['الهند','الصين','الولايات المتحدة','إندونيسيا','باكستان','نيجيريا','البرازيل','بنجلاديش','روسيا','المكسيك'],afr:['الجزائر','الكونغو الديمقراطية','السودان','ليبيا','تشاد','النيجر','أنجولا','مالي','جنوب أفريقيا','إثيوبيا'],mtn:['إيفرست','كي تو (K2)','كانشينجونجا','لوتسي','ماكالو','تشو أويو','داولاجيري','مانسلو','نانجا باربات','أنابورنا 1'],gov:['القاهرة','الجيزة','الشرقية','الدقهلية','البحيرة','المنيا','القليوبية','سوهاج','الإسكندرية','الغربية'],pl:['آلان شيرر','هاري كين','واين روني','محمد صلاح','آندي كول','سيرجيو أغويرو','فرانك لامبارد','تيري هنري','روبي فاولر','جيرمين ديفو']};
let R=null;
function rList(){
  sh(`<div class="panel mdp"><h2>🔟 رتّب القايمة</h2><p class="mdmut">اختار قايمة. كل لاعب بيكتب عنصر من العشرة. كل ما العنصر يبقى ترتيبه أبعد في القايمة (العاشر) بياخد نقط أكتر، والأول بياخد نقطة واحدة بس. كل لاعب معاه 3 غلطات.</p>
  ${LISTS.map((l,i)=>`<button class="mode" data-jx="rl" data-i="${i}" style="width:100%;margin-top:8px"><span class="tx"><b>${l.t}</b><small>المصدر: ${l.src}</small></span><span class="ch">‹</span></button>`).join('')}</div>`);
}
function rSetup(i){
  R={li:i,n:R&&R.n||2,names:R&&R.names||['لاعب 1','لاعب 2','لاعب 3','لاعب 4']};
  sh(`<div class="panel mdp"><h2>${LISTS[i].t}</h2><div class="mdlab">عدد اللاعبين</div><div class="mdrow">${[1,2,3,4].map(n=>`<button class="btn ${R.n===n?'':'ghost'}" data-jx="rn" data-n="${n}">${n}</button>`).join('')}</div>
  <div class="mdnames">${[...Array(R.n).keys()].map(k=>`<input class="mdin rn" data-k="${k}" maxlength="12" value="${E(R.names[k])}">`).join('')}</div>
  <button class="btn big" data-jx="rgo">ابدأ</button></div>`);
}
function rGo(){
  R.found=Array(10).fill(0);R.score=Array(R.n).fill(0);R.lives=Array(R.n).fill(3);R.turn=0;R.msg='';R.over=false;rView();
}
function rAlive(){return R.lives.some(l=>l>0);}
function rView(){
  const L=LISTS[R.li];
  const slots=L.items.map((it,i)=>{const f=R.found[i];return `<div class="rs ${f?'f':''}"><em>${i+1}</em><span>${f||R.over?E(DISP[L.id][i]):'؟'}</span><b>${i+1} ن</b></div>`}).join('');
  const sb=R.names.slice(0,R.n).map((n,k)=>`<div class="rp ${k===R.turn&&!R.over?'on':''} ${R.lives[k]<=0?'out':''}"><span>${E(n)}</span><b>${R.score[k]}</b><i>${'❤'.repeat(Math.max(0,R.lives[k]))}</i></div>`).join('');
  sh(`<div class="rsb">${sb}</div><div class="qmeta"><span>${L.t}</span></div><div class="rgrid">${slots}</div>${R.over?`<div class="res good">خلصت اللعبة${R.n>1?' - '+rWin():''}</div><button class="btn big" data-jx="rl" data-i="${R.li}">العب تاني</button><button class="btn big" data-jx="rlist">قايمة تانية</button>`:`<div class="rmsg">${R.msg||('دور '+E(R.names[R.turn]))}</div><div class="rin"><input class="mdin" id="rans" autocomplete="off" placeholder="اكتب اسم عنصر"><button class="btn" data-jx="rsend">تمام</button></div><button class="link" data-jx="rskip">تخطي (غلطة)</button>`}`,{back:false});
  if(!R.over){const el=document.getElementById('rans');if(el)setTimeout(()=>el.focus(),50);}
}
function rWin(){const m=Math.max(...R.score);const w=R.names.slice(0,R.n).filter((n,k)=>R.score[k]===m);return w.length>1?'تعادل':'🏆 '+E(w[0]);}
function rNext(){
  if(R.found.every(x=>x)||!rAlive()){R.over=true;return rView();}
  let k=R.turn;for(let i=0;i<R.n;i++){k=(k+1)%R.n;if(R.lives[k]>0)break;}R.turn=k;rView();
}
function rAns(txt,skip){
  const L=LISTS[R.li];const a=N(txt);if(!skip&&!a)return;
  let hit=-1;
  if(!skip){L.items.forEach((al,i)=>{if(hit>=0)return;if(al.some(x=>{const y=N(x);return y===a||(a.length>=5&&lev(a,y)<=1);}))hit=i;});}
  const k=R.turn;
  if(hit>=0&&!R.found[hit]){R.found[hit]=1;R.score[k]+=hit+1;R.msg='✅ '+E(DISP[L.id][hit])+' ترتيبه '+(hit+1)+'، +'+(hit+1);}
  else if(hit>=0){R.lives[k]--;R.msg='اتقال قبل كده! -1 ❤';}
  else{R.lives[k]--;R.msg=skip?'تخطي: -1 ❤':'مش في القايمة: -1 ❤';}
  rNext();
}

/* ---------------- events ---------------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||!t.dataset.jx)return;
  const a=t.dataset.jx;
  if(a==='ot')return window.Modes.team();
  if(a==='or')return window.Modes.rank();
  if(a==='pick'){jSaveNames();const st=J.setup;return window.__catsBrowser({get:()=>st.cats,set:c=>{st.cats=c.slice(0,6);},onDone:()=>jSetup(),tab:'home'});}
  if(a==='rand'){jSaveNames();J.setup.cats=SH(Object.keys(window.CATS)).slice(0,6);return jSetup();}
  if(a==='start'){jSaveNames();return jStart();}
  if(a==='cell')return jAsk(+t.dataset.c,+t.dataset.r);
  if(a==='ans')return jAns(+t.dataset.k);
  if(a==='back'){J.turn=1-J.turn;return jBoard();}
  if(a==='again'){J.setup.names=J.names.slice();return jStart();}
  if(a==='home')return window.__lgHome();
  if(a==='rl'){return rSetup(+t.dataset.i);}
  if(a==='rlist')return rList();
  if(a==='rn'){R.n=+t.dataset.n;return rSetup(R.li);}
  if(a==='rgo'){document.querySelectorAll('.rn').forEach(i=>{R.names[+i.dataset.k]=i.value.trim().slice(0,12)||('لاعب '+(+i.dataset.k+1));});return rGo();}
  if(a==='rsend'){const el=document.getElementById('rans');return rAns(el?el.value:'');}
  if(a==='rskip')return rAns('',true);
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='rans'){e.preventDefault();rAns(e.target.value);}});
window.Modes={team:()=>{J=J&&J.setup&&!J.g?J:null;jSetup();},rank:()=>{R=null;rList();}};
})();
