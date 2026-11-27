/* Falta extra modes: team board (single phone) and rank-the-list. */
(function(){
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SH=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const N0=t=>String(t).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/[ىئ]/g,'ي').replace(/ؤ/g,'و').replace(/[^a-z0-9\u0621-\u064a ]/g,' ').replace(/\s+/g,' ').trim();
const N=t=>N0(t).replace(/(^| )ال(?=[\u0621-\u064a]{2})/g,'$1').replace(/ /g,'');
const lev=(a,b)=>{const m=a.length,n=b.length;if(Math.abs(m-n)>1)return 9;const d=[];for(let i=0;i<=m;i++){d[i]=[i];}for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];};
const sh=(h,o)=>window.shell(h,o||{});
const TK=(n,f)=>function(...a){return window.__trk?window.__trk(n,f).apply(this,a):f.apply(this,a);};
const TC=['#2f5486','#b8562a','#2c7a4b','#a8324e'];
const tapfx=()=>{try{window.__sfx&&window.__sfx.tap()}catch(e){}};

/* ---------------- Team board ---------------- */
let J=null;const TIERS=[[100,1],[200,1],[300,2],[400,2],[500,3],[600,3]];
const DEFLL=['dbl','hint','chg'];
const LLS=[['dbl','✖️2','دبلها','يضاعف نقط السؤال الجاي'],['two','🗣️','إجابتين','الفريق ياخد محاولتين'],['block','⛔','حظر','يمنع فريق من الإجابة'],['call','📞','اتصال بصديق','دقيقة للاتصال'],['chg','🔄','غيّر السؤال','سؤال جديد نفس الفئة'],['opts','🔢','اختيارات','4 اختيارات فيهم الصح'],['bomb','💣','القنبلة','الإجابة للفريق التاني'],['hint','💡','تلميح','من غير ما يكشف الإجابة']];
const cname=k=>(window.CATS&&window.CATS[k])||k;
const cemoji=k=>{const n=cname(k);const m=/^(\S+)\s+(.*)$/.exec(n);return m?[m[1],m[2]]:['',n];};
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function stopTm(){if(J&&J.tm){clearInterval(J.tm);J.tm=null;}if(J&&J.fr){clearInterval(J.fr);J.fr=null;}}
function jSetup_(){
  const st=J&&J.setup?J.setup:(J={setup:{names:['فريق 1','فريق 2'],cats:(window.__CFG&&window.__CFG.cats||[]).slice(0,6),time:90,tmOn:1,rnd:0,lls:[DEFLL.slice(),DEFLL.slice()]}}).setup;
  const chips=st.cats.length?st.cats.map(k=>`<span class="mdchip">${E(cname(k))}</span>`).join(''):'<span class="mdmut">لسه ما اخترتش فئات</span>';
  const n=st.names.length;if(!st.lls)st.lls=st.names.map(()=>DEFLL.slice());
  sh(`<div class="panel mdp"><h2>🎯 تحدي الفرق</h2>
  <div class="mdnames g">${st.names.map((v,i)=>`<div class="mdnm" style="--tc:${TC[i]}"><input class="mdin" id="jn${i}" maxlength="12" value="${E(v)}" placeholder="فريق ${i+1}">${n>2?`<button class="mdx" data-jx="trm" data-i="${i}">✕</button>`:''}</div>`).join('')}${n<4?'<button class="btn ghost mdadd" data-jx="tadd">+ فريق</button>':''}</div>
  <div class="mdlab">الفئات (لحد 6)</div><div class="mdchips">${chips}</div>
  <div class="mdrow"><button class="btn" data-jx="pick">🗂️ اختار الفئات</button><button class="btn" data-jx="rand">🎲 عشوائي</button></div>
  <div class="mdlab">وسائل المساعدة (3 لكل فريق)</div><div class="mdnames g">${st.names.map((v,i)=>`<button class="lpbox" style="--tc:${TC[i]}" data-jx="lpo" data-i="${i}"><small>${E(v)}</small><span>${st.lls[i].map(k=>(LLS.find(l=>l[0]===k)||['','?'])[1]).join(' ')}</span></button>`).join('')}</div>
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
  cats.forEach(c=>{const stash={};[1,2,3].forEach(d=>{stash[d]=window.__picker.pick([c],d,2);});cells[c]=TIERS.map((_,r)=>{const [pts,d]=st.rnd?tiers[n++]:TIERS[r];const it=stash[d].shift()||window.__picker.pick([c],d,1)[0];return {pts,d,it,done:0};});});
  const N=st.names.length;
  J={g:1,names:st.names.slice(),cats,cells,score:Array(N).fill(0),turn:0,setup:st,rnd:st.rnd,time:st.tmOn?st.time:0,ll:st.names.map(()=>({})),pick:st.lls.map(a=>a.slice()),armed:0};
  jBoard();
}
function teamBox(i){const on=J.turn===i;const nn=J.names.length;return `<div class="jt n${nn} ${on?'on':''}" style="--tc:${TC[i]}"><span>${E(J.names[i])}</span><b>${J.score[i]}</b>${on&&nn<4?'<small>دورهم</small>':''}</div>`;}
function teams(){return `<div class="jtop">${J.names.map((_,i)=>teamBox(i)).join('')}</div>`;}
function jBoard_(){
  stopTm();
  const left=J.cats.reduce((s,c)=>s+J.cells[c].filter(x=>!x.done).length,0);
  if(!left)return jEnd();
  const head=J.cats.map(c=>{const [e,n]=cemoji(c);return `<div class="jh"><b>${e}</b><span>${E(n)}</span></div>`}).join('');
  const rows=TIERS.map((_,r)=>J.cats.map((c,ci)=>{const x=J.cells[c][r];return x.done?`<button class="jc used" disabled>${x.done<9?`<i style="background:${TC[x.done-1]}"></i>`:'<u>✕</u>'}</button>`:`<button class="jc ${J.rnd?'blank':'t'+x.d}" data-jx="cell" data-c="${ci}" data-r="${r}">${J.rnd?'؟':x.pts}</button>`}).join('')).join('');
  const used=J.ll[J.turn].dbl;const hasD=J.pick[J.turn].includes('dbl');
  sh(`${teams()}<div class="jgrid" style="--n:${J.cats.length}">${head}${rows}</div>${hasD?`<button class="jdbl ${J.armed?'on':''}" data-jx="dbl" ${used||J.armed?'disabled':''}>${J.armed?'✖️2 مفعّلة على السؤال الجاي':'✖️2 دبلها (قبل اختيار السؤال)'}</button>`:''}`);
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
    const lb=LLS.filter(l=>J.pick[J.turn].includes(l[0])&&l[0]!=='dbl').map(([k,ic,nm])=>`<button class="jl" data-jx="ll" data-k="${k}" ${ll[k]?'disabled':''}><b>${ic}</b><span>${nm}</span></button>`).join('');
    const tips=[];
    if(cu.two)tips.push('🗣️ مسموح للفريق إجابتين');
    if(cu.blocked.length)tips.push('⛔ ممنوع من الإجابة: <b>'+cu.blocked.map(i=>E(J.names[i])).join('، ')+'</b>');
    if(cu.bomb!==null)tips.push('💣 السؤال عند <b>'+E(J.names[cu.bomb])+'</b>: لو غلط تتخصم '+pts);
    if(cu.shown)tips.push('🔢 '+cu.shown.map(t=>'<b>'+E(t)+'</b>').join(' • '));
    if(cu.hint)tips.push(''+E(cu.hint));
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
const LISTS=()=>window.RANK_LISTS||[];
let R=null;
const seenK='lo3ba_rkseen';
function pickList(){const all=LISTS();let seen=[];try{seen=JSON.parse(localStorage.getItem(seenK)||'[]')}catch(e){}
  const cd=all.map((l,i)=>i).filter(i=>!R||!R.cat||R.cat==='all'||RC[all[i].id]===R.cat);const cids=cd.map(i=>all[i].id);
  let free=cd.filter(i=>!seen.includes(all[i].id));if(!free.length){seen=seen.filter(x=>!cids.includes(x));free=cd;}
  const i=free[Math.floor(Math.random()*free.length)];seen.push(all[i].id);try{localStorage.setItem(seenK,JSON.stringify(seen))}catch(e){}return i;}
function rList_(){
  R=R||{n:2,names:['لاعب 1','لاعب 2','لاعب 3','لاعب 4']};
  sh(`<div class="panel mdp"><h2>🔟 رتّب القايمة</h2><p class="mdmut">هتطلعلكم قايمة عشوائية (من 5 لـ 20 عنصر). كل لاعب يكتب عنصر منها. كل ما العنصر ترتيبه أبعد في القايمة بياخد نقط أكتر، والأول بياخد نقطة واحدة. مفيش قلوب: اللعبة بتخلص لما القايمة تتكمل، ولو الكل غلط مرتين ورا بعض بيظهر تلميح.</p>
  <div class="mdlab">الفئة</div><div class="rcats">${RCATS.map(([k,n])=>`<button class="rcb ${(R.cat||'all')===k?'on':''}" data-jx="rcat" data-k="${k}">${n}</button>`).join('')}</div><div class="mdlab">عدد اللاعبين</div><div class="mdrow">${[1,2,3,4].map(n=>`<button class="btn ${R.n===n?'':'ghost'}" data-jx="rn" data-n="${n}">${n}</button>`).join('')}</div>
  <div class="mdnames">${[...Array(R.n).keys()].map(k=>`<input class="mdin rn" data-k="${k}" maxlength="12" value="${E(R.names[k])}">`).join('')}</div>
  <button class="btn big" data-jx="rgo">ابدأ</button></div>`);
}
function rSaveNames(){document.querySelectorAll('.rn').forEach(i=>{R.names[+i.dataset.k]=i.value.trim().slice(0,12)||('لاعب '+(+i.dataset.k+1));});}
function rGo(){
  rSaveNames();R.li=pickList();R.score=Array(R.n).fill(0);rReset('');rView();
}
const col=k=>TC[k%TC.length];
function rReset(msg){
  const L=LISTS()[R.li];
  R.found=Array(L.items.length).fill(0);R.own=Array(L.items.length).fill(-1);
  R.turn=0;R.over=false;R.fail=0;R.hint='';R.hinted=[];R.vote=null;R.mo=-1;R.msg=msg||'';
}
function rSwap(){
  const all=LISTS(),old=R.li;let cand=all.map((l,i)=>i).filter(i=>i!==old&&((R.cat||'all')==='all'||RC[all[i].id]===R.cat));
  if(!cand.length)cand=all.map((l,i)=>i).filter(i=>i!==old);if(!cand.length)return;
  R.li=cand[Math.floor(Math.random()*cand.length)];rReset('السؤال اتغير، كمّلوا القايمة الجديدة');
  try{const s=JSON.parse(localStorage.getItem(seenK)||'[]');s.push(LISTS()[R.li].id);localStorage.setItem(seenK,JSON.stringify(s))}catch(e){}
  rView();
}
function rHint(){
  const L=LISTS()[R.li];const miss=[];L.items.forEach((al,i)=>{if(!R.found[i])miss.push(i)});if(!miss.length)return;
  const cand=miss.filter(i=>!R.hinted.includes(i));const pool=cand.length?cand:miss;
  const p=pool[Math.floor(Math.random()*pool.length)];R.hinted.push(p);
  const d=String(L.disp[p]).replace(/^ال/,'');
  R.hint='تلميح: العنصر رقم '+(p+1)+' بيبدأ بحرف «'+d.charAt(0)+'» وطوله '+Array.from(d).length+' حروف';
  R.fail=0;rView();
}
function rVoteOpen(){if(R.over)return;R.vote={by:R.turn,v:{}};rView();}
function rVoteYes(k){if(!R.vote)return;R.vote.v[k]=1;if(Object.keys(R.vote.v).length>R.n/2)return rSwap();rView();}
function rVoteNo(){R.vote=null;R.msg='الاقتراح اتلغى، كمّلوا';rView();}
function rView_(){
  const L=LISTS()[R.li];const n=L.items.length;const nf=R.found.filter(Boolean).length;
  const slots=L.items.map((it,i)=>{const f=R.found[i];const ow=R.own[i]>=0?R.own[i]:-1;const nm=f||R.over?L.disp[i]:'؟';
    return `<div class="rs ${f?'f ow':''} ${R.over&&!f?'miss':''} ${nm.length>9?'ln':''}" style="--tc:${ow>=0?col(ow):'#1fa34a'}"><em>${i+1}</em><span class="${nm.length>12?'l3':nm.length>9?'l2':nm.length>6?'l1':''}">${E(nm)}</span><b class="rsw">${ow>=0?E(R.names[ow]):''}</b></div>`}).join('');
  const sb=R.names.slice(0,R.n).map((nm,k)=>`<div class="rp ${k===R.turn&&!R.over?'on':''}" style="--tc:${col(k)}"><span>${E(nm)}</span><b>${R.score[k]}</b></div>`).join('');
  const canHint=R.fail>=2*R.n&&!R.over;
  let foot;
  if(R.over)foot=`<div class="res good">خلصت القايمة${R.n>1?' - '+rWin():''}</div><button class="btn big" data-jx="rgo2">قايمة تانية</button>`;
  else if(R.vote){const y=Object.keys(R.vote.v).length;
    foot=`<div class="rvcard"><b>${E(R.names[R.vote.by])} عايز يغيّر السؤال</b><span>${y} من ${R.n} موافقين، ولازم أكتر من النص</span><div class="rvb">${R.names.slice(0,R.n).map((nm,k)=>R.vote.v[k]?`<span class="rvon" style="--tc:${col(k)}">${E(nm)} ✓</span>`:`<button class="btn" style="--tc:${col(k)}" data-jx="rvy" data-k="${k}">${E(nm)}</button>`).join('')}</div><button class="link" data-jx="rvx">إلغاء الاقتراح</button></div>`;
  }else{
    foot=`${R.hint?`<div class="rhint">${E(R.hint)}</div>`:''}<div class="rmsg"${R.mo>=0?` style="background:${col(R.mo)};color:#fff"`:''}>${R.msg||('دور '+E(R.names[R.turn]))}</div><div class="rin"><input class="mdin" id="rans" autocomplete="off" placeholder="اكتب اسم عنصر"><button class="btn" data-jx="rsend">تمام</button></div><div class="rsg" id="rsg"></div><div class="rlk"><button class="link" data-jx="rskip">تخطي</button>${canHint?'<button class="link" data-jx="rhint">تلميح</button>':''}<button class="link" data-jx="rvq">غيّر السؤال</button></div>`;
  }
  sh(`<div class="rsb n${R.n}">${sb}</div><div class="rhd"><div class="rt">${L.t}</div><div class="rc"><span class="rbar"><i style="width:${Math.round(100*nf/n)}%"></i></span><b>${nf}/${n}</b></div></div><div class="rgrid ${n>12?'dense':n>8?'mid':''}">${slots}</div>${foot}`);
  if(!R.over&&!R.vote){const el=document.getElementById('rans');if(el)setTimeout(()=>el.focus(),50);}
}
const TY={"area": "ctry", "pop": "ctry", "afr": "ctry", "eu": "ctry", "arb": "ctry", "gdp": "ctry", "gold": "ctry", "oil": "ctry", "gas": "ctry", "coal": "ctry", "elc": "ctry", "for": "ctry", "cst": "ctry", "car": "ctry", "rl": "ctry", "rice": "ctry", "wht": "ctry", "exp": "ctry", "ren": "ctry", "wtr": "ctry", "geu": "ctry", "gaa": "ctry", "gsa": "ctry", "gde": "ctry", "gsm": "ctry", "gpa": "ctry", "gpl": "ctry", "gap": "ctry", "gaq": "ctry", "gas2": "ctry", "bcf": "ctry", "bmt": "ctry", "bpo": "ctry", "bml": "ctry", "bst": "ctry", "btr": "ctry", "bwn": "ctry", "bbl": "ctry", "btm": "ctry", "bfr": "ctry", "bel": "ctry", "bfs": "ctry", "bcn": "ctry", "bag": "ctry", "bbr": "ctry", "bwp": "ctry", "bwg": "ctry", "gwc": "ctry", "gov": "egov", "gva": "egov", "gev": "egov", "gep": "egov", "ged": "egov", "egc": "city", "gac": "city", "prt": "city", "apt": "city", "mtn": "geo", "isl": "geo", "des": "geo", "lak": "geo", "riv": "geo", "grv": "geo", "tow": "bld", "gst": "bld", "gdm": "bld", "fst": "bld", "plz": "plan", "pld": "plan", "gsr": "plan", "con": "plan", "oce": "plan", "bar": "biz", "bco": "biz", "bfm": "biz", "pl": "ply", "fll": "ply", "flb": "ply", "fl1": "ply", "flu": "ply", "fpa": "ply", "fsa": "ply", "rma": "ply", "rmg": "ply", "bca": "ply", "bcg": "ply", "lvg": "ply", "arp": "ply", "chp": "ply", "mlp": "ply", "mlg": "ply", "tpp": "ply", "tpg": "ply", "psg": "ply", "bvp": "ply", "bvg": "ply", "jvp": "ply", "jvg": "ply", "inp": "ply", "ing": "ply", "mup": "ply", "gus": "pres", "gu2": "pres", "bcr": "club", "lng": "lng", "ust": "ust", "hem": "emp"};
const RC={"gac":"ge","pl": "fb", "fll": "fb", "flb": "fb", "fl1": "fb", "flu": "fb", "fpa": "fb", "fsa": "fb", "rma": "fb", "rmg": "fb", "bca": "fb", "bcg": "fb", "lvg": "fb", "arp": "fb", "chp": "fb", "mlp": "fb", "mlg": "fb", "tpp": "fb", "tpg": "fb", "psg": "fb", "bvp": "fb", "bvg": "fb", "jvp": "fb", "jvg": "fb", "inp": "fb", "ing": "fb", "mup": "fb", "gwc": "fb", "bwp": "fb", "bwg": "fb", "fst": "fb", "bcr": "fb", "gov": "eg", "gva": "eg", "gev": "eg", "gep": "eg", "ged": "eg", "egc": "eg", "gdp": "ec", "gold": "ec", "oil": "ec", "gas": "ec", "coal": "ec", "elc": "ec", "for": "ec", "car": "ec", "rl": "ec", "rice": "ec", "wht": "ec", "exp": "ec", "ren": "ec", "wtr": "ec", "bcf": "ec", "bmt": "ec", "bpo": "ec", "bml": "ec", "bst": "ec", "btr": "ec", "bwn": "ec", "bbl": "ec", "btm": "ec", "bfr": "ec", "bel": "ec", "bfs": "ec", "bcn": "ec", "bag": "ec", "bbr": "ec", "apt": "ec", "prt": "ec", "bar": "ec", "bco": "ec", "gus": "cu", "gu2": "cu", "hem": "cu", "lng": "cu", "bfm": "cu", "plz": "cu", "pld": "cu", "gsr": "cu", "area": "ge", "pop": "ge", "afr": "ge", "arb": "ge", "eu": "ge", "geu": "ge", "gaa": "ge", "gsa": "ge", "gde": "ge", "gsm": "ge", "gpa": "ge", "gpl": "ge", "gap": "ge", "gaq": "ge", "gas2": "ge", "cst": "ge", "con": "ge", "oce": "ge", "mtn": "ge", "isl": "ge", "des": "ge", "lak": "ge", "riv": "ge", "grv": "ge", "ust": "ge", "tow": "ge", "gst": "ge", "gdm": "ge"};const RCATS=[['all','🎲 عشوائي'],['fb','⚽ كورة'],['ge','🌍 جغرافيا'],['eg','☥ مصر'],['ec','💰 اقتصاد وإنتاج'],['cu','📚 ثقافة وعلوم']];
const POOLS={};
function pool(ty){if(POOLS[ty])return POOLS[ty];const m=new Map();LISTS().forEach(l=>{if((TY[l.id]||l.id)!==ty)return;l.disp.forEach(d=>{const k=N(d);if(k&&!m.has(k))m.set(k,{d,k,z:N0(d)});});});return POOLS[ty]=[...m.values()];}
function rSug(){const el=document.getElementById('rans'),bx=document.getElementById('rsg');if(!el||!bx)return;
  const raw=el.value,z=N0(raw).replace(/ /g,''),q=N(raw);if(!z){bx.innerHTML='';return;}
  const L=LISTS()[R.li];const done=new Set();L.items.forEach((al,i)=>{if(R.found[i])al.forEach(x=>done.add(N(x)));});
  const P=pool(TY[L.id]||L.id).filter(o=>!done.has(o.k));
  let a=P.filter(o=>o.k.startsWith(q)||o.z.replace(/ /g,'').startsWith(z));
  if(a.length<5&&q.length>=2)a=a.concat(P.filter(o=>!a.includes(o)&&o.k.includes(q)));
  a=a.filter(o=>o.k!==q).sort((x,y)=>x.d.length-y.d.length).slice(0,8);
  bx.innerHTML=a.map(o=>`<button class="rsgb" data-jx="rsug" data-t="${E(o.d)}">${E(o.d)}</button>`).join('');}
function rWin(){const m=Math.max(...R.score);const w=R.names.slice(0,R.n).filter((n,k)=>R.score[k]===m);return w.length>1?'تعادل':'🏆 '+E(w[0]);}
function rNext(){
  if(R.found.every(x=>x)){R.over=true;R.turn=0;return rView();}
  R.turn=(R.turn+1)%R.n;rView();
}
function rAns(txt,skip){
  const L=LISTS()[R.li];const a=N(txt);if(!skip&&!a)return;
  let hit=-1;
  if(!skip){L.items.forEach((al,i)=>{if(hit<0&&al.some(x=>N(x)===a))hit=i;});if(hit<0&&a.length>=6)L.items.forEach((al,i)=>{if(hit>=0)return;if(al.some(x=>{const y=N(x);return y.length>=6&&lev(a,y)<=1;}))hit=i;});}
  const k=R.turn;R.mo=-1;
  if(hit>=0&&!R.found[hit]){R.found[hit]=1;R.own[hit]=k;R.score[k]+=hit+1;R.msg=E(R.names[k])+' لقى '+E(L.disp[hit])+' ترتيبه '+(hit+1)+'، +'+(hit+1);R.mo=k;R.fail=0;R.hint='';}
  else{R.fail++;R.msg=E(R.names[k])+': '+(skip?'تخطي':hit>=0?'اتقالت قبل كده':'مش في القايمة');}
  R.vote=null;rNext();
}
function jLP_(){
  const st=J.setup,i=J.lpT||0,arr=st.lls[i];
  const tabs=st.names.map((n,k)=>`<button class="lptab ${k===i?'on':''}" style="--tc:${TC[k]}" data-jx="lpt" data-i="${k}">${E(n)}</button>`).join('');
  const cards=LLS.map(([k,ic,nm,ds])=>`<button class="lpc ${arr.includes(k)?'on':''}" data-jx="lpk" data-k="${k}"><b>${ic}</b><span>${nm}</span><small>${ds}</small></button>`).join('');
  sh(`<div class="panel mdp"><h2>وسائل المساعدة</h2><div class="lptabs">${tabs}</div><div class="mdlab center">${J.lpMsg?'الحد 3 وسائل، شيل واحدة الأول':'اختار 3 من 8 ('+arr.length+'/3)'}</div><div class="lpg">${cards}</div><button class="btn big" data-jx="lpd">تمام</button></div>`);J.lpMsg=0;
}
const jLP=TK('jlp',jLP_);
const jSetup=TK('js',jSetup_);
const jBoard=TK('jb',jBoard_);
const jQ=TK('jq',jQ_);
const rList=TK('rl',rList_);
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
  if(a==='tadd'){jSaveNames();if(J.setup.names.length<4){J.setup.names.push('فريق '+(J.setup.names.length+1));J.setup.lls.push(DEFLL.slice());}return jSetup();}
  if(a==='trm'){jSaveNames();if(J.setup.names.length>2){J.setup.names.splice(+t.dataset.i,1);J.setup.lls.splice(+t.dataset.i,1);}return jSetup();}
  if(a==='lpo'){jSaveNames();J.lpT=+t.dataset.i;return jLP();}
  if(a==='lpd')return window.__back();
  if(a==='lpt'){J.lpT=+t.dataset.i;return jLP();}
  if(a==='lpk'){const arr=J.setup.lls[J.lpT],k=t.dataset.k,ix=arr.indexOf(k);if(ix>=0)arr.splice(ix,1);else if(arr.length<3)arr.push(k);else J.lpMsg=1;return jLP();}
  if(a==='tgt')return jTgt(+t.dataset.i);
  if(a==='dbl'){if(!J.ll[J.turn].dbl&&!J.armed){J.ll[J.turn].dbl=1;J.armed=1;jBoard();}return;}
  if(a==='ll')return jLL(t.dataset.k);
  if(a==='rev'){stopTm();J.cur.stage=1;return jQ();}
  if(a==='nxt'){J.cur.stage=2;return jQ();}
  if(a==='aw'){const w=t.dataset.w;return jAw(/^\d+$/.test(w)?+w:w);}
  if(a==='again'){J.setup.names=J.names.slice();return jStart();}
  if(a==='home')return window.__lgHome();
  if(a==='rcat'){rSaveNames();R.cat=t.dataset.k;return rList();}
  if(a==='rn'){rSaveNames();R.n=+t.dataset.n;return rList();}
  if(a==='rgo')return rGo();
  if(a==='rgo2'){return rGo();}
  if(a==='rsend'){const el=document.getElementById('rans');return rAns(el?el.value:'');}
  if(a==='rsug'){const el=document.getElementById('rans');if(el){el.value=t.dataset.t;rSug();el.focus();}return;}
  if(a==='rskip')return rAns('',true);
  if(a==='rhint')return rHint();
  if(a==='rvq')return rVoteOpen();
  if(a==='rvy')return rVoteYes(+t.dataset.k);
  if(a==='rvx')return rVoteNo();
});
document.addEventListener('input',e=>{if(e.target.id==='rans')rSug();});
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.rsgb'))e.preventDefault();});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='rans'){e.preventDefault();rAns(e.target.value);}});
window.__rk={N,N0,lev,TY,RC,RCATS,lists:LISTS,sug:(id,raw,found)=>{const ty=TY[id]||id,z=N0(raw).replace(/ /g,''),q=N(raw);if(!z)return[];const done=new Set(found.map(N));const P=pool(ty).filter(o=>!done.has(o.k));
  let a=P.filter(o=>o.k.startsWith(q)||o.z.replace(/ /g,'').startsWith(z));if(a.length<5&&q.length>=2)a=a.concat(P.filter(o=>!a.includes(o)&&o.k.includes(q)));
  return a.filter(o=>o.k!==q).sort((x,y)=>x.d.length-y.d.length).slice(0,8).map(o=>o.d);}};
window.Modes={team:()=>{J=J&&J.setup&&!J.g?J:null;jSetup();},rank:()=>{R=null;rList();}};
})();
