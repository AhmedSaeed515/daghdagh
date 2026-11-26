/* Falta extra modes: team board (single phone) and rank-the-list. */
(function(){
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SH=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const N=t=>String(t).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/[ىئ]/g,'ي').replace(/ؤ/g,'و').replace(/[^a-z0-9\u0621-\u064a ]/g,' ').replace(/\s+/g,' ').trim();
const lev=(a,b)=>{const m=a.length,n=b.length;if(Math.abs(m-n)>1)return 9;const d=[];for(let i=0;i<=m;i++){d[i]=[i];}for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];};
const sh=(h,o)=>window.shell(h,o||{});
const TK=(n,f)=>function(...a){return window.__trk?window.__trk(n,f).apply(this,a):f.apply(this,a);};
const TC=['#2f5486','#b8562a','#2c7a4b','#7a3c8c'];
const tapfx=()=>{try{window.__sfx&&window.__sfx.tap()}catch(e){}};

/* ---------------- Team board ---------------- */
let J=null;const TIERS=[[100,1],[300,2],[500,3]];
const LLS=[['two','🗣️','إجابتين','الفريق ياخد محاولتين'],['block','⛔','حظر','يمنع فريق من الإجابة'],['call','📞','اتصال بصديق','دقيقة للاتصال'],['chg','🔄','غيّر السؤال','سؤال جديد نفس الفئة'],['opts','🔢','اختيارات','4 اختيارات فيهم الصح'],['bomb','💣','القنبلة','الإجابة للفريق التاني'],['hint','💡','تلميح','من غير ما يكشف الإجابة']];
const cname=k=>(window.CATS&&window.CATS[k])||k;
const cemoji=k=>{const n=cname(k);const m=/^(\S+)\s+(.*)$/.exec(n);return m?[m[1],m[2]]:['',n];};
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function stopTm(){if(J&&J.tm){clearInterval(J.tm);J.tm=null;}if(J&&J.fr){clearInterval(J.fr);J.fr=null;}}
function jSetup_(){
  const st=J&&J.setup?J.setup:(J={setup:{names:['فريق 1','فريق 2'],cats:(window.__CFG&&window.__CFG.cats||[]).slice(0,6),time:90,tmOn:1,rnd:0}}).setup;
  const chips=st.cats.length?st.cats.map(k=>`<span class="mdchip">${E(cname(k))}</span>`).join(''):'<span class="mdmut">لسه ما اخترتش فئات</span>';
  const n=st.names.length;
  sh(`<div class="panel mdp"><h2>🎯 تحدي الفرق</h2>
  <div class="mdnames g">${st.names.map((v,i)=>`<div class="mdnm" style="--tc:${TC[i]}"><input class="mdin" id="jn${i}" maxlength="12" value="${E(v)}" placeholder="فريق ${i+1}">${n>2?`<button class="mdx" data-jx="trm" data-i="${i}">✕</button>`:''}</div>`).join('')}${n<4?'<button class="btn ghost mdadd" data-jx="tadd">+ فريق</button>':''}</div>
  <div class="mdlab">الفئات (لحد 6)</div><div class="mdchips">${chips}</div>
  <div class="mdrow"><button class="btn" data-jx="pick">🗂️ اختار الفئات</button><button class="btn" data-jx="rand">🎲 عشوائي</button></div>
  <button class="mdtog ${st.rnd?'on':''}" data-jx="bm"><i></i><span>إخفاء مستوى السؤال قبل الاختيار</span></button>
  <button class="mdtog ${st.tmOn?'on':''}" data-jx="ton"><i></i><span>مؤقت للأسئلة</span></button>
  ${st.tmOn?`<div class="mdrow tmrow"><button class="btn" data-jx="tm" data-d="15">+</button><b class="tmv">${fmt(st.time)}</b><button class="btn" data-jx="tm" data-d="-15">−</button></div>`:''}
  <button class="btn big" data-jx="start" ${st.cats.length>=2?'':'disabled'}>ابدأ اللعب</button></div>`);
}
function jSaveNames(){if(!J||!J.setup)return;J.setup.names=J.setup.names.map((v,i)=>{const a=document.getElementById('jn'+i);return a?(a.value.trim().slice(0,12)||'فريق '+(i+1)):v;});}
function jStart(){
  stopTm();
  const st=J.setup;const cats=st.cats.slice(0,6);
  let tiers=[];cats.forEach(()=>TIERS.forEach(t=>tiers.push(t)));
  if(st.rnd)tiers=SH(tiers);
  const cells={};let n=0;
  cats.forEach(c=>{cells[c]=[0,1,2].map(r=>{const [pts,d]=st.rnd?tiers[n++]:TIERS[r];const it=window.__picker.pick([c],d,1)[0];return {pts,d,it,done:0};});});
  const N=st.names.length;
  J={g:1,names:st.names.slice(),cats,cells,score:Array(N).fill(0),turn:0,setup:st,rnd:st.rnd,time:st.tmOn?st.time:0,ll:st.names.map(()=>({})),armed:0};
  jBoard();
}
function teamBox(i){const on=J.turn===i;const nn=J.names.length;return `<div class="jt n${nn} ${on?'on':''}" style="--tc:${TC[i]}"><span>${E(J.names[i])}</span><b>${J.score[i]}</b>${on&&nn<4?'<small>دورهم</small>':''}</div>`;}
function teams(){return `<div class="jtop">${J.names.map((_,i)=>teamBox(i)).join('')}</div>`;}
function jBoard_(){
  stopTm();
  const left=J.cats.reduce((s,c)=>s+J.cells[c].filter(x=>!x.done).length,0);
  if(!left)return jEnd();
  const head=J.cats.map(c=>{const [e,n]=cemoji(c);return `<div class="jh"><b>${e}</b><span>${E(n)}</span></div>`}).join('');
  const rows=[0,1,2].map(r=>J.cats.map((c,ci)=>{const x=J.cells[c][r];return x.done?`<button class="jc used" disabled>${x.done<9?`<i style="background:${TC[x.done-1]}"></i>`:'<u>✕</u>'}</button>`:`<button class="jc ${J.rnd?'blank':'t'+x.d}" data-jx="cell" data-c="${ci}" data-r="${r}">${J.rnd?'؟':x.pts}</button>`}).join('')).join('');
  const used=J.ll[J.turn].dbl;
  sh(`${teams()}<div class="jgrid" style="--n:${J.cats.length}">${head}${rows}</div><button class="jdbl ${J.armed?'on':''}" data-jx="dbl" ${used||J.armed?'disabled':''}>${J.armed?'✖️2 مفعّلة على السؤال الجاي':'✖️2 دبلها (قبل اختيار السؤال)'}</button>`);
}
function jAsk(ci,r){
  const c=J.cats[ci],x=J.cells[c][r];if(!x||x.done)return;
  J.cur={c,r,x,stage:0,left:J.time,mult:J.armed?2:1,shown:null,hint:0,two:0,blocked:[],bomb:null,call:0,pend:null};J.armed=0;jQ();
  stopTm();if(J.time)J.tm=setInterval(()=>{if(!J||!J.cur||J.cur.stage)return stopTm();J.cur.left=Math.max(0,J.cur.left-1);const el=document.getElementById('jtm');if(el){el.textContent=fmt(J.cur.left);if(J.cur.left<=10)el.classList.add('low');if(J.cur.left)el.classList.remove('end');else el.classList.add('end');}if(!J.cur.left){clearInterval(J.tm);J.tm=null;try{window.__sfx&&window.__sfx.bad&&window.__sfx.bad()}catch(e){}}},1000);
}
function tgtBtns(k){return J.names.map((n,i)=>i===J.turn?'':`<button class="btn" style="--tc:${TC[i]}" data-jx="tgt" data-i="${i}">${E(n)}</button>`).join('');}
function jQ_(){
  const cu=J.cur,{x,c,stage}=cu;const ll=J.ll[J.turn];const pts=x.pts*cu.mult;
  let mid='';
  if(stage===0){
    const lb=LLS.map(([k,ic,nm])=>`<button class="jl" data-jx="ll" data-k="${k}" ${ll[k]?'disabled':''}><b>${ic}</b><span>${nm}</span></button>`).join('');
    const tips=[];
    if(cu.two)tips.push('🗣️ مسموح للفريق إجابتين');
    if(cu.blocked.length)tips.push('⛔ ممنوع من الإجابة: <b>'+cu.blocked.map(i=>E(J.names[i])).join('، ')+'</b>');
    if(cu.bomb!==null)tips.push('💣 السؤال عند <b>'+E(J.names[cu.bomb])+'</b>: لو غلط تتخصم '+pts);
    if(cu.shown)tips.push('🔢 '+cu.shown.map(t=>'<b>'+E(t)+'</b>').join(' • '));
    if(cu.hint)tips.push('💡 '+E(cu.hint));
    if(cu.call)tips.push('📞 <b id="jfr">1:00</b>');
    mid=`<div class="jlls">${lb}</div>${cu.pend?`<div class="jtip">اختار الفريق:<div class="jaw">${tgtBtns(cu.pend)}</div></div>`:''}${tips.map(t=>`<div class="jtip">${t}</div>`).join('')}<button class="btn big" data-jx="rev">👁 كشف الإجابة</button>`;
  }
  else if(stage===1)mid=`<div class="jans">✅ الإجابة: <b>${E(x.it.right)}</b></div><button class="btn big" data-jx="nxt">التالي ⬅</button>`;
  else if(cu.bomb!==null)mid=`<div class="mdlab center">${E(J.names[cu.bomb])} جاوب؟ (${pts})</div><div class="jaw"><button class="btn" style="--tc:#2c7a4b" data-jx="aw" data-w="bok">✅ صح +${pts}</button><button class="btn" style="--tc:#a33" data-jx="aw" data-w="bno">❌ غلط -${pts}</button></div>`;
  else mid=`<div class="mdlab center">مين خد النقط (${pts})؟</div><div class="jaw">${J.names.map((n,i)=>`<button class="btn" style="--tc:${TC[i]}" data-jx="aw" data-w="${i+1}" ${cu.blocked.includes(i)?'disabled':''}>${E(n)}</button>`).join('')}</div><button class="btn big ghost" data-jx="aw" data-w="9">ولا حد</button>`;
  sh(`${teams()}<div class="qmeta"><span>${E(cname(c))}</span><span class="dp d${x.d}">${pts} نقطة${cu.mult>1?' ✖️2':''}</span></div>${window.qbox(x.it.text)}${stage===0&&J.time?`<div class="jtm ${cu.left<=10?'low':''} ${cu.left?'':'end'}" id="jtm">${fmt(cu.left)}</div>`:''}${mid}`);
}
function jLL(k){
  const cu=J.cur;if(!cu||cu.stage||J.ll[J.turn][k])return;
  const N=J.names.length;
  if(k==='block'||k==='bomb'){J.ll[J.turn][k]=1;if(N===2){const o=1-J.turn;if(k==='block')cu.blocked=[o];else cu.bomb=o;}else cu.pend=k;return jQ();}
  J.ll[J.turn][k]=1;
  if(k==='two')cu.two=1;
  if(k==='opts'){const w=SH(cu.x.it.wrong).slice(0,3);cu.shown=SH([cu.x.it.right,...w]);}
  if(k==='hint'){const a=String(cu.x.it.right).trim();const wc=a.split(/\s+/).length;cu.hint='بتبدأ بحرف «'+a.charAt(0)+'»، '+(wc>1?wc+' كلمات':'كلمة واحدة')+'، وعدد حروفها '+a.replace(/\s/g,'').length;}
  if(k==='chg'){let it=cu.x.it;for(let n=0;n<6&&it.text===cu.x.it.text;n++){it=window.__picker.pick([cu.c],cu.x.d,1)[0];}cu.x.it=it;cu.shown=null;cu.hint=0;}
  if(k==='call'){cu.call=1;const el0=Date.now();if(J.fr)clearInterval(J.fr);J.fr=setInterval(()=>{const s=Math.max(0,60-Math.floor((Date.now()-el0)/1000));const el=document.getElementById('jfr');if(el)el.textContent=fmt(s);if(!s){clearInterval(J.fr);J.fr=null;try{window.__sfx&&window.__sfx.bad&&window.__sfx.bad()}catch(e){}}},500);}
  jQ();
}
function jTgt(i){const cu=J.cur;if(!cu||!cu.pend)return;if(cu.pend==='block')cu.blocked=[i];else cu.bomb=i;cu.pend=null;jQ();}
function jAw(w){
  const cu=J.cur;if(!cu||cu.stage!==2)return;const pts=cu.x.pts*cu.mult;
  if(w==='bok'){J.score[cu.bomb]+=pts;cu.x.done=cu.bomb+1;}
  else if(w==='bno'){J.score[cu.bomb]-=pts;cu.x.done=cu.bomb+1;}
  else{cu.x.done=w;if(w>=1&&w<=4)J.score[w-1]+=pts;}
  J.turn=(J.turn+1)%J.names.length;J.cur=null;if(window.__navPopSilent)window.__navPopSilent();jBoard();
}
function jEnd(){
  const m=Math.max(...J.score);const ws=J.names.filter((n,i)=>J.score[i]===m);const w=ws.length>1?'تعادل 🤝':'🏆 فاز '+E(ws[0]);
  sh(`<div class="panel center"><div class="big-emoji">🏁</div><h2>${w}</h2>${teams().replace(/ on"/g,' on"').replace('class="jtop"','class="jtop" style="margin:8px 0"')}<button class="btn big" data-jx="again">العب تاني بنفس الفئات</button><button class="btn big" data-jx="home">الرئيسية</button></div>`);
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
function rList_(){
  sh(`<div class="panel mdp"><h2>🔟 رتّب القايمة</h2><p class="mdmut">اختار قايمة. كل لاعب بيكتب عنصر من العشرة. كل ما العنصر يبقى ترتيبه أبعد في القايمة (العاشر) بياخد نقط أكتر، والأول بياخد نقطة واحدة بس. كل لاعب معاه 3 غلطات.</p>
  ${LISTS.map((l,i)=>`<button class="mode" data-jx="rl" data-i="${i}" style="width:100%;margin-top:8px"><span class="tx"><b>${l.t}</b><small>المصدر: ${l.src}</small></span><span class="ch">‹</span></button>`).join('')}</div>`);
}
function rSetup_(i){
  R={li:i,n:R&&R.n||2,names:R&&R.names||['لاعب 1','لاعب 2','لاعب 3','لاعب 4']};
  sh(`<div class="panel mdp"><h2>${LISTS[i].t}</h2><div class="mdlab">عدد اللاعبين</div><div class="mdrow">${[1,2,3,4].map(n=>`<button class="btn ${R.n===n?'':'ghost'}" data-jx="rn" data-n="${n}">${n}</button>`).join('')}</div>
  <div class="mdnames">${[...Array(R.n).keys()].map(k=>`<input class="mdin rn" data-k="${k}" maxlength="12" value="${E(R.names[k])}">`).join('')}</div>
  <button class="btn big" data-jx="rgo">ابدأ</button></div>`);
}
function rGo(){
  R.found=Array(10).fill(0);R.score=Array(R.n).fill(0);R.lives=Array(R.n).fill(3);R.turn=0;R.msg='';R.over=false;rView();
}
function rAlive(){return R.lives.some(l=>l>0);}
function rView_(){
  const L=LISTS[R.li];
  const slots=L.items.map((it,i)=>{const f=R.found[i];return `<div class="rs ${f?'f':''}"><em>${i+1}</em><span>${f||R.over?E(DISP[L.id][i]):'؟'}</span><b>${i+1} ن</b></div>`}).join('');
  const sb=R.names.slice(0,R.n).map((n,k)=>`<div class="rp ${k===R.turn&&!R.over?'on':''} ${R.lives[k]<=0?'out':''}"><span>${E(n)}</span><b>${R.score[k]}</b><i>${'❤'.repeat(Math.max(0,R.lives[k]))}</i></div>`).join('');
  sh(`<div class="rsb">${sb}</div><div class="qmeta"><span>${L.t}</span></div><div class="rgrid">${slots}</div>${R.over?`<div class="res good">خلصت اللعبة${R.n>1?' - '+rWin():''}</div><button class="btn big" data-jx="rl" data-i="${R.li}">العب تاني</button><button class="btn big" data-jx="rlist">قايمة تانية</button>`:`<div class="rmsg">${R.msg||('دور '+E(R.names[R.turn]))}</div><div class="rin"><input class="mdin" id="rans" autocomplete="off" placeholder="اكتب اسم عنصر"><button class="btn" data-jx="rsend">تمام</button></div><button class="link" data-jx="rskip">تخطي (غلطة)</button>`}`);
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

const jSetup=TK('js',jSetup_);
const jBoard=TK('jb',jBoard_);
const jQ=TK('jq',jQ_);
const rList=TK('rl',rList_);
const rSetup=TK('rs',rSetup_);
const rView=TK('rv',rView_);
/* ---------------- events ---------------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||!t.dataset.jx)return;
  const a=t.dataset.jx;
  if(a==='ot')return window.Modes.team();
  if(a==='or')return window.Modes.rank();
  if(a==='pick'){jSaveNames();const st=J.setup;return window.__catsBrowser({get:()=>st.cats,set:c=>{st.cats=c.slice(0,6);},onDone:()=>window.__back(),tab:'home'});}
  if(a==='rand'){jSaveNames();J.setup.cats=SH(Object.keys(window.CATS)).slice(0,6);return jSetup();}
  if(a==='start'){jSaveNames();return jStart();}
  if(a==='cell')return jAsk(+t.dataset.c,+t.dataset.r);
  if(a==='tm'){jSaveNames();J.setup.time=Math.min(300,Math.max(60,J.setup.time+ +t.dataset.d));return jSetup();}
  if(a==='bm'){jSaveNames();J.setup.rnd=J.setup.rnd?0:1;return jSetup();}
  if(a==='ton'){jSaveNames();J.setup.tmOn=J.setup.tmOn?0:1;return jSetup();}
  if(a==='tadd'){jSaveNames();if(J.setup.names.length<4)J.setup.names.push('فريق '+(J.setup.names.length+1));return jSetup();}
  if(a==='trm'){jSaveNames();if(J.setup.names.length>2)J.setup.names.splice(+t.dataset.i,1);return jSetup();}
  if(a==='tgt')return jTgt(+t.dataset.i);
  if(a==='dbl'){if(!J.ll[J.turn].dbl&&!J.armed){J.ll[J.turn].dbl=1;J.armed=1;jBoard();}return;}
  if(a==='ll')return jLL(t.dataset.k);
  if(a==='rev'){stopTm();J.cur.stage=1;return jQ();}
  if(a==='nxt'){J.cur.stage=2;return jQ();}
  if(a==='aw'){const w=t.dataset.w;return jAw(/^\d+$/.test(w)?+w:w);}
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
