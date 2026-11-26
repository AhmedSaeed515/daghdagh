const dpill=d=>`<span class="dp d${d}">${['','سهل','متوسط','صعب'][d]||''} <i>+${(window.PTS||{})[d]||10}</i></span>`;
// Game shell: views, classic and bluff modes, navigation, events.
let booted=false;
function boot(){
if(booted){home();return;}
booted=true;



// ---------- state ----------
const CFG={mode:'classic',players:['لاعب 1'],cats:(store.get('cats',[])||[]).filter(k=>CATS[k]).slice(0,6),diff:0,rounds:10};const MINCATS=1,MAXCATS=6;
let G=null,timer=null;
function clearTimer(){if(timer){clearInterval(timer);timer=null}}

// ---------- question picking ----------
const picker=new QuestionPicker({Q,store,norm,shuffle});
function pickQuestions(n){return picker.pick(CFG.cats,CFG.diff,n);}
// ---------- views ----------
let TAB='home';
function tabsHtml(){
  const I={home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',cats:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',online:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',friends:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.2-5.8 6.5-5.8s5.7 1.8 6.5 5.8"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14.5c2.6 0 4.2 1.5 4.7 4.5"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5"/>'};
  const t=(k,l)=>`<button class="tab ${TAB===k?'on':''}" data-tab="${k}"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg><span>${l}</span></button>`;
  return `<div class="tabs">${t('home','الرئيسية')}${t('friends','صحابي')}${t('me','حسابي')}</div>`;
}

let LASTSCR=null;function shell(inner,{back=true,nav=false,title=''}={}){const _a=app(),_k=title+'|'+nav;const _o=document.getElementById('scr'),_st=(_k===LASTSCR&&_o)?_o.scrollTop:0;if(_k!==LASTSCR){LASTSCR=_k;_a.classList.remove('enter');void _a.offsetWidth;_a.classList.add('enter');}_a.innerHTML=`<div class="top">${back?'<button class="icon" data-act="back" aria-label="رجوع">→</button>':'<span></span>'}${title?`<div class="tlt">${title}</div>`:`<div class="logo"><img src="assets/logo.svg" alt="" width="34" height="34" style="vertical-align:middle;margin-inline-end:8px"><b>دغدغ</b></div>`}<button class="icon" data-act="sound">${store.get('sound',true)?'🔊':'🔇'}</button></div><div class="scr${nav?' hasnav':''}" id="scr"><div class="scin" id="scin">${inner}</div></div>${nav?tabsHtml():''}`;if(_st){const _n=document.getElementById('scr');if(_n)_n.scrollTop=_st;}requestAnimationFrame(()=>{fitScr();if(_st){const _n=document.getElementById('scr');if(_n)_n.scrollTop=_st;}});}
function fitScr(){const s=document.getElementById('scr'),n=document.getElementById('scin');if(!s||!n)return;n.style.zoom='';s.classList.remove('fit');if(n.querySelector('.search,.catsec,.avgrid,.sbox')){s.classList.add('free');return;}s.classList.remove('free');const cs=getComputedStyle(s),av=s.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom),h=n.getBoundingClientRect().height;if(h>av+1){const z=av/h;if(z<.78){s.classList.add('free');return;}s.classList.add('fit');n.style.zoom=z.toFixed(3);}}
addEventListener('resize',()=>requestAnimationFrame(fitScr));
const AVS=Object.keys(window.AVSVG||{});
const avOK=a=>AVS.includes(a)?a:AVS[[...String(a||'x')].reduce((q,c)=>q+c.codePointAt(0),0)%AVS.length];
const avh=(a,c)=>`<span class="av ${c||''}" role="img" aria-label="${(window.AVNAME||{})[avOK(a)]||''}">${window.AVSVG[avOK(a)]}</span>`;
(()=>{const a=store.get('myav','');if(a&&!AVS.includes(a))store.set('myav',avOK(a));})();
let PF=null;
const pfValid=()=>!!(PF&&PF.name&&PF.av);
function profileOk(){return !!(store.get('myname','')&&store.get('myav',''));}
function statsBox(){const st=store.get('stats',{gp:0,w:0,l:0,d:0,vs:{}});const vs=Object.entries(st.vs||{}).sort((x,y)=>(y[1].w+y[1].l+y[1].d)-(x[1].w+x[1].l+x[1].d)).slice(0,30);
return `<div class="sbox"><h3>📊 سجل نتايجي</h3><div class="sg"><div><b>${st.gp}</b><small>لعبت</small></div><div class="w"><b>${st.w}</b><small>فزت</small></div><div class="l"><b>${st.l}</b><small>خسرت</small></div><div><b>${st.d||0}</b><small>تعادل</small></div></div>${vs.length?`<div class="svs">${vs.map(([n,v])=>`<div class="rk"><span class="who">${esc(n)}</span><span>فزت ${v.w} • خسرت ${v.l}${v.d?' • تعادل '+v.d:''}</span></div>`).join('')}</div>`:'<p style="color:var(--mut);font-size:13px">العب أونلاين مع صحابك وهتظهر هنا نتايجك ضد كل واحد. بتتحفظ على جهازك بس.</p>'}</div>`;}
function profileForm(first){
  clearTimer();if(typeof ONL!=='undefined'&&ONL)ONL.leave();
  if(!PF||PF.first!==first)PF={first,name:String(store.get('myname','')),av:store.get('myav','')};
  TAB=first?'':'me';
  const inp=document.getElementById('pfname');if(inp)PF.name=inp.value.trim().slice(0,14);
  const extra=first?'':`<div class="cards">
   <button class="mode" data-act="friends"><span class="ic">👥</span><span class="tx"><b>صحابي</b><small>ضيف أصحابك بالكود وادعيهم للعب.</small></span><span class="ch">‹</span></button>
   <button class="mode" data-act="install"><span class="ic">📲</span><span class="tx"><b>ثبّت اللعبة</b><small>ضيفها على الشاشة الرئيسية زي أي تطبيق.</small></span><span class="ch">‹</span></button>
   ${QuestionReport.card()}
   <button class="mode" data-act="howto"><span class="ic">❓</span><span class="tx"><b>إزاي ألعب؟</b><small>قواعد اللعب.</small></span><span class="ch">‹</span></button>
   <button class="mode" data-act="theme"><span class="ic">${store.get('dark',false)?'☀️':'🌙'}</span><span class="tx"><b>${store.get('dark',false)?'الوضع الفاتح':'الوضع الداكن'}</b><small>بدّل بين الفاتح والداكن.</small></span><span class="ch">‹</span></button>
   <button class="mode" data-act="sound"><span class="ic">${store.get('sound',true)?'🔊':'🔇'}</span><span class="tx"><b>الصوت</b><small>${store.get('sound',true)?'شغال - دوس للكتم':'مكتوم - دوس للتشغيل'}</small></span><span class="ch">‹</span></button></div>`;
  shell(`<div class="panel pf center">${first?'<h2>أهلاً بيك في دغدغ!</h2><p>اعمل بروفايلك الأول. بيتحفظ على موبايلك بس.</p>':`<div class="big-av">${avh(PF.av,'avxl')}</div><h2>بروفايلي</h2>`}
  <h3>اسمك</h3><input id="pfname" maxlength="14" value="${esc(PF.name)}" placeholder="اكتب اسمك" autocomplete="off">
  <h3>اختار أفاتار</h3><div class="avgrid">${AVS.map(a=>`<button class="avb ${PF.av===a?'on':''}" data-pf="av" data-v="${a}" aria-label="${window.AVNAME[a]}">${window.AVSVG[a]}</button>`).join('')}</div>
  <button class="btn big" id="pfsave" data-pf="save" ${pfValid()?'':'disabled'}>${first?'يلا نبدأ':'حفظ'}</button>
  ${first?'':statsBox()}${first?'':'<p style="color:var(--mut);font-size:12px">بعض الأسئلة مقتبسة ومترجمة من <a href="https://opentdb.com" target="_blank" rel="noopener">Open Trivia DB</a> بترخيص <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. البيانات: data/opentdb-derived.json</p>'}${first?'':'<div style="color:var(--mut);font-size:12px;margin:8px 0"><a href="https://www.themoviedb.org" target="_blank" rel="noopener"><img src="assets/tmdb.svg" alt="TMDB" style="height:12px;display:block;margin-bottom:4px"></a>صور وبيانات الأفلام من TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</div>'}<p style="color:var(--mut);font-size:13px">من غير حساب ولا جوجل. الاسم والأفاتار بس بيتحفظوا، والنقط بتخلص بمجرد ما اللعبة تخلص.</p></div>${extra}`,first?{back:false,title:'بروفايل'}:{title:'حسابي',nav:true,back:false});
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
  shell(`<div class="hero center">${HomeLogo.markup}<h1>دغدغ</h1><p class="slg">${SLOGAN}</p><div class="pill who">${avh(store.get('myav',''))}أهلاً ${esc(store.get('myname',''))}</div></div>
  <button class="cta" data-act="online">🎉 اعمل غرفة أو ادخل بكود</button>
  <button class="mode" data-jx="ot" style="width:100%"><span class="ic">🎯</span><span class="tx"><b>تحدي الفرق (جهاز واحد)</b><small>فريقين، لوحة فئات ونقاط 100 و300 و500.</small></span><span class="ch">‹</span></button>
  <button class="mode" data-jx="or" style="width:100%"><span class="ic">🔟</span><span class="tx"><b>رتّب القايمة</b><small>أكبر 10 دول، أعلى 10 جبال... كل ما العنصر أبعد نقطه أكتر.</small></span><span class="ch">‹</span></button>
  <button class="mode" data-act="catsopen" style="width:100%"><span class="ic">🗂️</span><span class="tx"><b>الفئات</b><small>شوف كل الفئات واختار اللي تعجبك.</small></span><span class="ch">‹</span></button>
  <p class="slg" style="text-align:center;color:var(--mut);font-size:13px">${Q.length} سؤال • ${nc} فئة • سباق إجابات وبلوف مع صحابك أونلاين</p>
  <div class="foot"><button class="link" data-act="howto">إزاي ألعب؟</button> · <button class="link" data-act="install">ثبّتها كتطبيق 📲</button></div>`,{back:false,nav:true});HomeLogo.animate();
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
document.querySelectorAll('.catsec').forEach(s=>{if(!s.querySelector('.catc')){s.remove();return;}const g=catGroupsList().find(x=>x.name===s.querySelector('h3').textContent);const n=s.querySelector('.cathd span');if(g&&n)n.textContent=g.keys.filter(k=>sel.includes(k)).length+'/'+g.keys.length;});
const cs=document.querySelector('[data-catf="sel"]');if(cs)cs.textContent='المختارة ('+sel.length+')';
const an=document.querySelector('[data-act="catsall2"]');if(an)an.textContent=sel.length?'إلغاء الكل':'🎲 اختار 6 عشوائي';
const sc=document.getElementById('catcount');if(sc)sc.textContent=sel.length+' / '+MAXCATS+' مختارة';
const d=document.querySelector('[data-act="catsdone"]');if(d){d.disabled=sel.length<MINCATS;d.textContent=sel.length<MINCATS?'اختار فئة واحدة على الأقل':`اعتمد ${sel.length} فئة`;}}
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
  <div class="chips"><button class="chip ${catF==='all'?'on':''}" data-catf="all">تصفح (${Object.keys(CATS).length})</button><button class="chip ${catF==='sel'?'on':''}" data-catf="sel">المختارة (${sel.length})</button><select id="catg" class="catsel" aria-label="المجموعة">${opts}</select><button class="chip alln" data-act="catsall2">${sel.length?'إلغاء الكل':'🎲 اختار 6 عشوائي'}</button></div>
  <div class="catlist">${secs||'<p class="center" style="color:var(--mut);margin-top:24px">مفيش فئات مطابقة</p>'}</div>
  <div class="footbar catbar"${catBr.tab?' style="bottom:66px"':''}><div class="catinfo"><b id="catcount">${sel.length} / ${MAXCATS} مختارة</b><button class="catrev" data-catf="sel">راجع اختياراتك</button></div><button class="btn big" data-act="catsdone" ${sel.length<MINCATS?'disabled':''}>${sel.length<MINCATS?'اختار فئة واحدة على الأقل':`اعتمد ${sel.length} فئة`}</button></div>`,{title:'الفئات',nav:!!catBr.tab});
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
  shell(`${scoreboard()}<div class="qmeta"><span>${CATS[it.cat]}</span>${dpill(it.diff)}<span>${G.i+1}/${G.n}</span></div><div class="bar"><i id="bar"></i></div>
  ${qbox(it.text)}<div class="opts">${opts}</div>
  ${res?`<div class="res ${res.ok?'good':'bad'}">${res.msg}</div><button class="btn big" data-act="nextq">${G.i+1>=G.n?'النتيجة':'السؤال الجاي'}</button>`:`<div class="llbox"><div class="llt">🛟 وسائل مساعدة</div><div class="llr"><button class="ll" data-life="half" ${L.half?'':'disabled'}><b class="llc">${L.half?1:0}</b>✂️ 50/50</button><button class="ll" data-life="skip" ${L.skip?'':'disabled'}><b class="llc">${L.skip?1:0}</b>⏭️ تخطي</button><button class="ll" data-life="time" ${L.time?'':'disabled'}><b class="llc">${L.time?1:0}</b>⏱️ +10ث</button></div></div>`}`);
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
  if(t.dataset.tab){const k=t.dataset.tab;if(k==='home')return home();if(k==='cats')return catsBrowser({get:()=>CFG.cats,set:c=>{CFG.cats=c;store.set('cats',c);},onDone:()=>home(),tab:'cats'});if(k==='online')return openOnline();if(k==='friends')return FR.open();if(k==='me')return profileView();return;}
  if(t.dataset.catf!==undefined){catF=t.dataset.catf;return catsView();}
  if(t.dataset.catt){const c=t.dataset.catt,sel=catBr.get();const i=sel.indexOf(c);if(i>=0){sel.splice(i,1);}else{if(sel.length>=MAXCATS){const sc=document.getElementById('catcount');if(sc){sc.textContent='الحد الأقصى '+MAXCATS+' فئات';setTimeout(()=>catsSync(),1400);}return;}sel.push(c);}catBr.set(sel);return catsSync();}
  if(t.dataset.mode)return setup(t.dataset.mode);
  if(t.dataset.cat){const c=t.dataset.cat;const i=CFG.cats.indexOf(c);if(i>=0){if(CFG.cats.length>1)CFG.cats.splice(i,1);}else CFG.cats.push(c);return setup(CFG.mode);}
  if(t.dataset.diff!==undefined){CFG.diff=+t.dataset.diff;return setup(CFG.mode);}
  if(t.dataset.rounds){CFG.rounds=+t.dataset.rounds;return setup(CFG.mode);}
  if(t.dataset.pick!==undefined)return answerClassic(+t.dataset.pick);
  if(t.dataset.life)return useLife(t.dataset.life);
  if(t.dataset.fr&&window.FR)return FR.act(t);
  if(t.dataset.bv!==undefined)return bluffPick(+t.dataset.bv);
  switch(t.dataset.act){
    case 'online':return openOnline();
    case 'friends':return FR.open();
    case 'catsopen':return catsBrowser({get:()=>CFG.cats,set:c=>{CFG.cats=c;store.set('cats',c);},onDone:()=>home(),tab:'home'});
    case 'me':return profileView();
    case 'install':return installView();
    case 'catsall2':{const sel=catBr.get();const had=sel.length>0;sel.length=0;if(!had)shuffle(Object.keys(CATS)).slice(0,MAXCATS).forEach(k=>sel.push(k));catBr.set(sel);return catsSync();}
    case 'catsall':CFG.cats=Object.keys(CATS);return setup(CFG.mode);
    case 'catsnone':CFG.cats=[];return setup(CFG.mode);
    case 'catsedit':return catsBrowser({get:()=>CFG.cats,set:c=>{CFG.cats=c;store.set('cats',c);},onDone:()=>setup(CFG.mode)});
    case 'catsdone':{const o=catBr;catBr=null;if(o&&o.onDone)return o.onDone();return home();}
    case 'rminus':case 'rplus':{const st=RSTEP[CFG.mode];let i=st.indexOf(CFG.rounds);i+=t.dataset.act==='rplus'?1:-1;i=Math.max(0,Math.min(st.length-1,i));CFG.rounds=st[i];return setup(CFG.mode);}
    case 'back':return goBack();case 'home':return home();case 'howto':return howto();
    case 'lj':{const el=document.getElementById('ljname');const nm=el?el.value.trim().slice(0,14):'';if(!nm){if(el)el.focus();return;}store.set('myname',nm);if(!store.get('myav',''))store.set('myav',AVS[Math.floor(Math.random()*AVS.length)]);return ONL.joinCode(JR);}
    case 'back2home':return home();
    case 'theme':{const d=!store.get('dark',false);store.set('dark',d);document.documentElement.classList.toggle('dk',d);const m=document.querySelector('meta[name=theme-color]');if(m)m.content=d?'#14141a':'#efece3';return profileView();}
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

const ONL=initOnline({picker,app,esc,shuffle,norm,Q,CATS,shell,sfx,home,store,catsBrowser,avh,avOK,setTab:k=>{TAB=k},catsOpen:()=>!!catBr});
window.__picker=picker;window.__catsBrowser=catsBrowser;window.__CFG=CFG;window.__sfx=sfx;window.__ONL=ONL;window.__lgHome=home;window.shell=shell;window.CATS=CATS;
JR?linkJoin():(profileOk()?home():profileForm(true));
}
