const dpO=d=>`<span class="dp d${d}">${['','سهل','متوسط','صعب'][d]||''} <i>+${(window.PTS||{})[d]||10}</i></span>`;
// @ts-nocheck
// Online rooms: each player on their own phone. The room owner's phone runs the game
// and relays messages through a public ntfy topic (plain HTTPS, works inside the hosted viewer).
function initOnline(X){
const {esc,shuffle,norm,Q,CATS,shell,sfx,app,avh,avOK}=X;
const SERVERS=['ntfy.envs.net','ntfy.adminforge.de','ntfy.sh'];
const ALPH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const rid=n=>Array.from({length:n},()=>ALPH[Math.floor(Math.random()*ALPH.length)]).join('');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ME={id:rid(8),name:'',av:'',g:''};
const LIM={q:20,wr:45,vt:30,rv:7};
let NET=null,S=null,H=null,room=null,off=0,uiTimer=null,hostTimer=null,mine={},msg='',lobbyCfg={mode:'classic',cats:(JSON.parse(localStorage.getItem('lo3ba_cats')||'[]')||[]).filter(k=>CATS[k]).slice(0,6),diff:0,n:10,maxP:8,appr:false};
let IW=null;let joinTries=0,joinT=null,lastSt=0,qrOn=false;

// ---------- transport ----------
function openNet(srv,topic,onmsg){
  const base='https://'+srv+'/'+topic;
  let stop=false,last='all',ctrl=null,fails=0,poll=false;const seen=new Set();
  function line(l){if(!l.trim())return;let j;try{j=JSON.parse(l)}catch(e){return}if(j.id)last=j.id;if(j.event!=='message'||seen.has(j.id))return;seen.add(j.id);let m;try{m=JSON.parse(j.message)}catch(e){return}try{onmsg(m)}catch(e){console.error(e)}}
  async function loop(){
    while(!stop){
      const t0=Date.now();
      try{
        if(poll){const r=await fetch(base+'/json?poll=1&since='+last);const tx=await r.text();tx.split('\n').forEach(line);await sleep(1800);continue;}
        ctrl=new AbortController();
        const r=await fetch(base+'/json?since='+last,{signal:ctrl.signal});
        if(!r.ok||!r.body)throw new Error('no stream');
        const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
        while(!stop){const {value,done}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;while((i=buf.indexOf('\n'))>=0){line(buf.slice(0,i));buf=buf.slice(i+1);}}
      }catch(e){}
      if(stop)return;
      fails=(Date.now()-t0<3000)?fails+1:0;
      if(fails>=4)poll=true;
      await sleep(fails?1200:150);
    }
  }
  loop();
  return {
    async send(m){for(let a=0;a<4;a++){try{const r=await fetch(base,{method:'POST',body:JSON.stringify(m)});if(r.ok)return true;if(r.status===429)await sleep(2000);}catch(e){}await sleep(600);}return false;},
    close(){stop=true;try{ctrl&&ctrl.abort()}catch(e){}}
  };
}
async function probe(srv){try{const c=new AbortController();const t=setTimeout(()=>c.abort(),4500);const r=await fetch('https://'+srv+'/lgz-probe-'+rid(6),{method:'POST',body:'{"t":"ping"}',signal:c.signal});clearTimeout(t);return r.ok;}catch(e){return false}}
function connect(code){const i=+code[0]-1;const srv=SERVERS[i];return openNet(srv,'lgz-'+code,onNet);}

// ---------- entry ----------
function open(){leave(true);msg='';lobbyView();}
function leave(quiet){
  if(NET){NET.close();NET=null}
  clearInterval(uiTimer);clearInterval(hostTimer);clearTimeout(joinT);uiTimer=hostTimer=joinT=null;
  S=null;H=null;room=null;mine={};
}
function lobbyView(){
  X.setTab&&X.setTab('online');
  shell(`<div class="panel center"><div class="big-emoji">🌐</div><h2>لعب أونلاين</h2><p>كل واحد بموبايله. واحد يعمل غرفة ويدّي الكود لصحابه، وهما يدخلوا بنفس الكود.</p>
  <div class="pcard">${avh(X.store.get('myav',''),'avl')}<b>${esc(X.store.get('myname',''))}</b><button class="btn sm ghost" data-act="me">تعديل</button></div>
  <div id="omsg" class="warn">${esc(msg)}</div>
  <button class="btn big" data-o="create">🎮 اعمل غرفة جديدة</button>
  <h3>أو ادخل غرفة صاحبك</h3><input id="ocode" maxlength="5" placeholder="كود الغرفة" style="text-align:center;letter-spacing:6px;text-transform:uppercase">
  <button class="btn ghost" data-o="join">ادخل الغرفة</button></div>`,{title:'أونلاين',nav:true});
}
function joinUrl(){return location.origin+location.pathname+'?r='+S.code;}
function readName(){ME.name=String(X.store.get('myname','')).trim().slice(0,14);ME.av=avOK(X.store.get('myav',''));ME.g=X.store.get('mygender','');return ME.name;}
function warn(t){msg=t;const e=document.getElementById('omsg');if(e)e.textContent=t;}

async function create(){
  if(!readName())return warn('اكتب اسمك الأول');if(window.lgzBad&&window.lgzBad(ME.name))return warn('الاسم ده مش مناسب، غيّره.');
  warn('بجهّز الغرفة...');
  let idx=-1;for(let i=0;i<SERVERS.length;i++){if(await probe(SERVERS[i])){idx=i;break}}
  if(idx<0)return warn('معرفتش أوصل لخدمة الاتصال دلوقتي. جرّب تاني بعد شوية.');
  const code=(idx+1)+rid(4);
  room={code,host:true};
  H={players:[{id:ME.id,name:ME.name,av:ME.av,score:0,right:0}],pending:[],cfg:{...lobbyCfg,cats:lobbyCfg.cats.slice()},r:0,ph:'lobby',seq:0,items:[],ans:{},fakes:{},votes:{},opts:[],owners:[],right:-1,ends:0};
  NET=connect(code);
  hostTimer=setInterval(hostTick,300);
  hostBroadcast();
}
function join(){
  const code=((document.getElementById('ocode')||{}).value||'').trim().toUpperCase();
  return joinCode(code);
}
function joinCode(code){
  if(!readName())return warn('اكتب اسمك الأول');if(window.lgzBad&&window.lgzBad(ME.name))return warn('الاسم ده مش مناسب، غيّره.');
  code=String(code||'').trim().toUpperCase();
  if(!/^[1-3][A-Z2-9]{4}$/.test(code))return warn('الكود لازم يكون 5 حروف وأرقام زي 1K7QZ');
  leave(true);room={code,host:false};NET=connect(code);joinTries=0;lastSt=0;
  shell(`<div class="panel center"><div class="big-emoji">⏳</div><h2>بدخّلك الغرفة ${esc(code)}...</h2><p>لو اتأخر، يمكن صاحب الغرفة بيراجع طلبات الانضمام، أو اتأكد من الكود وإنه فاتح اللعبة.</p><button class="btn ghost" data-o="leave">رجوع</button></div>`);
  sendJoin();
}
function sendJoin(){
  if(!room||room.host||S)return;
  if(joinTries++>=15){leave();msg='الغرفة مردتش. اتأكد من الكود وإن صاحبها لسه فاتح اللعبة.';return lobbyView();}
  NET.send({t:'join',id:ME.id,name:ME.name,av:ME.av});
  joinT=setTimeout(sendJoin,4000);
}

// ---------- incoming ----------
function onNet(m){
  if(!m||!m.t)return;
  if(room.host){
    if(m.t==='join')return hostJoin(m);
    if(m.t==='ans')return hostAns(m.id,m.r,m.k);
    if(m.t==='fk')return hostFake(m.id,m.r,m.x);
    if(m.t==='vt')return hostVote(m.id,m.r,m.k);
    if(m.t==='bye')return hostBye(m.id);
    if(m.t==='bot')return hostAddBot(m.id);
    if(m.t==='botx')return hostDelBot(m.v,m.id);
    if(m.t==='rp')return hostRep(m.r);
    if(m.t==='iv')return impVote(m.id,m.r,m.k);
    if(m.t==='ra')return rkAns(m.id,m.r,m.x,m.sk);
    if(m.t==='rv')return rkVoteStart(m.id);
    if(m.t==='rvv')return rkVote(m.id,m.k);
    if(m.t==='rh')return rkHintReq(m.id);
    if(m.t==='tv')return hostBroadcast();
    if(m.t==='hp')return hostHelp(m.id,m.r,m.k);
    return;
  }
  if(m.t==='st'){if(S&&m.seq<=S.seq)return;applyState(m.s,m.now,m.seq);}
  if(m.t==='iw'&&m.to===ME.id){IW={r:m.r,th:m.th,w:m.w};view();}
  if(m.t==='fh'&&m.to===ME.id&&S&&m.r===S.r){mine.hide=m.hide;view();}
  if(m.t==='rj'&&m.to===ME.id&&S&&m.r===S.r){mine.rej=true;if(S.ph==='wr'){mine.fk=null;view();}}
  if(m.t==='kick'&&m.to===ME.id){leave();msg=m.why||'خرجت من الغرفة';lobbyView();}
}
function applyState(s,now,seq){
  const prev=S;S=s;S.seq=seq;off=now-Date.now();lastSt=Date.now();clearTimeout(joinT);
  if(!prev||prev.r!==s.r||(prev.q&&s.q&&prev.q.t!==s.q.t))mine={};else if(prev.ph!==s.ph)mine={fk:mine.fk};
  if(!s.rk||!s.rk.v)mine.vv=0;
  if(room&&room.tv){clearInterval(tvT);view();startUi();return;}
  if(!s.pl.some(p=>p.i===ME.id)){ // not accepted (game already started?)
    if(s.ph!=='lobby'){leave();msg='اللعبة بدأت بالفعل في الغرفة دي.';return lobbyView();}
  }
  if(prev&&s.ph==='rv'&&prev.ph!=='rv'){setTimeout(()=>sfx.round(),900);const k=s.pl.findIndex(p=>p.i===ME.id);if(s.pt&&s.pt[k]>0)sfx.ok();else sfx.bad();}
  view();startUi();
}

// ---------- host engine ----------
function pubState(extra){
  const h=H;
  const s={code:room.code,mp:h.cfg.maxP,ph:h.ph,r:h.r,n:(h.ph!=='lobby'&&h.items&&h.items.length?h.items.length:h.cfg.n),mode:h.cfg.mode,cats:h.cfg.cats,diff:h.cfg.diff,tn:h.cfg.teams|0,pl:h.players.map(p=>({i:p.id,b:p.bot?1:0,o:p.own||'',n:(p.bot?'🤖 ':'')+p.name,s:p.score,a:p.av||'',h:hpMask(p),tm:p.tm})),ends:h.ends,lim:h.lim||0};
  if(h.cfg.mode==='imp'){s.th=h.iw?h.iw.theme:'';s.rn=h.rounds;if(h.ph==='ir'){s.imp=h.players.findIndex(p=>p.id===h.iw.imp);s.word=h.iw.word;s.iv=h.players.map(p=>{const k=h.iv[p.id];return k===undefined?-1:k});s.gain=h.gain;}return Object.assign(s,extra||{});}
  if(h.cfg.mode==='rk'&&h.rk){const k=h.rk,L=rkL();s.rt=h.cfg.rt||30;s.rc=h.cfg.rc||'all';
    s.rk={id:L.id,t:L.t,n:L.items.length,f:L.items.map((_,i)=>(k.found[i]||k.over)?L.disp[i]:''),x:k.found.slice(),o:k.own.slice(),tu:k.turn,m:k.msg,mk:k.mk,mo:k.mo||-1,ov:k.over?1:0,h:k.hint||'',hb:(!k.over&&k.fail>=2*h.players.length)?1:0,v:k.vote?{by:(h.players[k.vote.by]||{}).name||'',y:Object.values(k.vote.v).filter(x=>x).length}:null};return Object.assign(s,extra||{});}
  if(h.ph==='q'||h.ph==='rv'||h.ph==='wr'||h.ph==='vt'){const it=h.items[h.r];s.q={c:it.cat,d:it.diff,t:it.text};}
  if(h.ph==='q'||h.ph==='vt'||h.ph==='rv')s.o=h.opts;
  if(h.ph==='rv'){s.right=h.right;s.pk=h.picks;s.pt=h.pts;s.rs=h.rscore;s.sk=h.sk;s.dx=h.players.map(p=>!!(h.hel[p.id]||{}).x);if(h.mode==='bluff'||h.cfg.mode==='bluff')s.by=h.owners.map(a=>a.map(pid=>h.players.findIndex(p=>p.id===pid)));}
  return Object.assign(s,extra||{});
}
const TM=[['الأحمر','#d9442e'],['الأزرق','#2f6fd0'],['الأخضر','#2e9b5a'],['الأصفر','#d9a21f']];
function tmAssign(){const h=H,n=h.cfg.teams|0;h.players.forEach((p,i)=>{p.tm=n?i%n:undefined});}
function tmPlace(p){const h=H,n=h.cfg.teams|0;if(!n){p.tm=undefined;return;}const c=Array(n).fill(0);h.players.forEach(x=>{if(x!==p&&x.tm!==undefined)c[x.tm]++});p.tm=c.indexOf(Math.min(...c));}
function tmTotals(pl,n){const t=Array(n).fill(0);pl.forEach(p=>{if(p.tm!==undefined&&p.tm<n)t[p.tm]+=p.s!==undefined?p.s:p.score});return t;}
function hpMask(p){const x=p.hp||{f:1,s:1,x:1};return (x.f?1:0)|(x.s?2:0)|(x.x?4:0);}
function hpReset(){H.players.forEach(p=>p.hp={f:1,s:1,x:1});}
function hostHelp(id,r,k){
  const h=H;if(h.ph!=='q'||r!==h.r||h.ans[id])return;const p=h.players.find(x=>x.id===id);if(!p)return;
  p.hp=p.hp||{f:1,s:1,x:1};if(!p.hp[k])return;
  h.hel=h.hel||{};h.hel[id]=h.hel[id]||{};if(h.hel[id][k])return;
  if(k==='f'){const bad=h.opts.map((o,i)=>i).filter(i=>i!==h.right);const hide=shuffle(bad).slice(0,2);p.hp.f=0;h.hel[id].f=1;if(id===ME.id){mine.hide=hide;}else NET.send({t:'fh',to:id,r:h.r,hide});}
  else if(k==='x'){p.hp.x=0;h.hel[id].x=1;}
  else if(k==='s'){p.hp.s=0;h.hel[id].s=1;h.ans[id]={k:-1,left:0,skip:true};if(h.players.every(q=>h.ans[q.id])){hostReveal();return;}}
  hostBroadcast();
}
function hostBroadcast(){
  const h=H;h.seq++;try{botPlan()}catch(e){}const s=pubState();if(h.cfg.mode==='imp'&&h.ph==='id')impSendWords();
  const now=Date.now();
  if(NET)NET.send({t:'st',seq:h.seq,s,now});
  const prev=S;S=s;S.seq=h.seq;off=0;lastSt=now;
  if(!prev||prev.r!==s.r||(prev.q&&s.q&&prev.q.t!==s.q.t))mine={};else if(prev.ph!==s.ph)mine={fk:mine.fk};
  if(!s.rk||!s.rk.v)mine.vv=0;
  if(prev&&s.ph==='rv'&&prev.ph!=='rv'){setTimeout(()=>sfx.round(),900);const k=0;if(s.pt&&s.pt[k]>0)sfx.ok();else sfx.bad();}
  view();startUi();
}
function hostJoin(m){
  const h=H;if(!m.id||!m.name)return;
  let p=h.players.find(x=>x.id===m.id);
  if(p){hostBroadcast();return;}
  if(h.ph!=='lobby'){NET.send({t:'kick',to:m.id,why:'اللعبة بدأت بالفعل في الغرفة دي.'});return;}
  if(h.players.length>=h.cfg.maxP){NET.send({t:'kick',to:m.id,why:'الغرفة مليانة ('+h.cfg.maxP+' لاعبين).'});return;}
  if(h.cfg.appr){if(!h.pending.some(x=>x.id===m.id)){h.pending.push({id:m.id,name:(window.lgzBad&&window.lgzBad(String(m.name))?'لاعب '+(h.players.length+h.pending.length+1):String(m.name).slice(0,14)),av:avOK(m.av)});view();}return;}
  let nm=String(m.name).slice(0,14);if(window.lgzBad&&window.lgzBad(nm))nm='لاعب '+(h.players.length+1);let k=2;while(h.players.some(x=>x.name===nm))nm=String(m.name).slice(0,12)+' '+k++;
  const np={id:m.id,name:nm,av:avOK(m.av),score:0,right:0};h.players.push(np);tmPlace(np);
  hostBroadcast();
}

// ---------- bots (host only): added from the lobby, play like players ----------
const BOTN=['بوت حودة','بوت زيزو','بوت سمسم','بوت فهمي','بوت نونو','بوت كوكو','بوت ميمي','بوت بيبو'];
let botKey='';
function hostAddBot(own){
  const h=H;if(!h||h.ph!=='lobby'||h.cfg.mode==='imp'||h.cfg.mode==='rk'||h.players.length>=h.cfg.maxP)return;
  if(h.players.filter(p=>p.bot&&p.own===own).length>=2)return;
  const nm=BOTN.find(n=>!h.players.some(p=>p.name===n))||'بوت '+rid(2);
  const np={id:'bot-'+rid(6),name:nm,av:'',score:0,right:0,bot:true,own:own};h.players.push(np);tmPlace(np);hostBroadcast();
}
function hostDelBot(id,by){
  const h=H;if(!h||h.ph!=='lobby')return;const i=h.players.findIndex(p=>p.id===id&&p.bot);if(i<0)return;
  if(by!==ME.id&&h.players[i].own!==by)return;h.players.splice(i,1);hostBroadcast();
}
function botPlan(){
  const h=H;if(!h||h.cfg.mode==='imp'||h.cfg.mode==='rk')return;const key=h.ph+'|'+h.r;if(key===botKey)return;botKey=key;
  if(!['q','wr','vt'].includes(h.ph))return;const bots=h.players.filter(p=>p.bot);if(!bots.length)return;
  const r=h.r,ph=h.ph,lim=h.lim||15;
  bots.forEach(b=>{
    const d=(1.6+Math.random()*Math.max(1,lim*0.6-1.6))*1000;
    setTimeout(()=>{
      if(!H||H!==h||h.r!==r||h.ph!==ph||!h.players.includes(b))return;const it=h.items[r];if(!it)return;
      if(ph==='q'){const sk=({1:.8,2:.6,3:.4})[it.diff]||.6;let k=h.right;if(Math.random()>=sk){const o=[0,1,2,3].filter(x=>x!==h.right);k=o[Math.floor(Math.random()*o.length)];}hostAns(b.id,r,k);}
      else if(ph==='wr'){const w=it.wrong[Math.floor(Math.random()*it.wrong.length)];hostFake(b.id,r,w);}
      else{const c=h.opts.map((_,i)=>i).filter(i=>!h.owners[i].includes(b.id));if(!c.length)return;const k=(Math.random()<.5&&c.includes(h.right))?h.right:c[Math.floor(Math.random()*c.length)];hostVote(b.id,r,k);}
    },d);
  });
}
function hostBye(id){const h=H;if(h.ph!=='lobby')return;const i=h.players.findIndex(p=>p.id===id);if(i>0){h.players.splice(i,1);hostBroadcast();}}
function pickItems(cfg){return X.picker.pick(cfg.cats,cfg.diff,cfg.n);}
function hostStart(){
  const h=H;if(h.cfg.mode==='rk'){h.players=h.players.filter(p=>!p.bot);if(h.players.length<2){hostBroadcast();return;}return rkStart();}
  if(h.cfg.mode==='imp'){h.players=h.players.filter(p=>!p.bot);if(h.players.length<3){hostBroadcast();return;}return impStart();}
  if(h.players.length<2||h.cfg.cats.length<1){return;}if((h.cfg.teams|0)&&new Set(h.players.map(p=>p.tm)).size<2){return;}
  h.items=pickItems(h.cfg);h.r=-1;h.players.forEach(p=>{p.score=0;p.right=0});hpReset();
  hostNext();
}
function hostNext(){
  const h=H;h.r++;
  if(h.r>=h.items.length){h.ph='fin';h.ends=0;return hostBroadcast();}
  const it=h.items[h.r];h.ans={};h.fakes={};h.votes={};h.picks=null;h.pts=null;h.owners=[];h.hel={};
  if(h.cfg.mode==='classic'){
    h.opts=shuffle([it.right,...it.wrong]);h.right=h.opts.indexOf(it.right);h.ph='q';h.lim=LIM.q;
  }else{h.ph='wr';h.opts=[];h.lim=LIM.wr;}
  h.ends=Date.now()+h.lim*1000;hostBroadcast();
}
// A player starred the current question: swap it for a fresh one in the same round (before answers are revealed).
function hostRep(r){
  const h=H;if(!h||r!==h.r||(h.ph!=='q'&&h.ph!=='wr'))return;
  const used=new Set(h.items.map(i=>i.text));
  let pool=Q.filter(q=>!QuestionReport.isHidden(q)&&h.cfg.cats.includes(q[0])&&!used.has(q[2]));
  if(!pool.length)return;
  const q=shuffle(pool)[0];h.items[h.r]={cat:q[0],diff:q[1],text:q[2],right:q[3],wrong:q.slice(4)};
  h.r--;hostNext();
}
document.addEventListener('qreport',e=>{
  if(typeof room==='undefined'||!room||!S||!S.q||S.q.t!==e.detail||(S.ph!=='q'&&S.ph!=='wr'))return;
  if(room.host)hostRep(S.r);else NET.send({t:'rp',id:ME.id,r:S.r});
});
function hostAns(id,r,k){
  const h=H;if(h.ph!=='q'||r!==h.r||h.ans[id]||!h.players.some(p=>p.id===id)||!(k>=0&&k<4))return;
  h.ans[id]={k,left:Math.max(0,(h.ends-Date.now())/1000)};
  if(h.players.every(p=>h.ans[p.id]))hostReveal();
}
function hostFake(id,r,x){
  const h=H;if(h.ph!=='wr'||r!==h.r||!h.players.some(p=>p.id===id))return;
  x=String(x||'').trim().slice(0,40);const it=h.items[h.r];
  if(!x||norm(x)===norm(it.right)||(window.lgzBad&&window.lgzBad(x))){NET.send({t:'rj',to:id,r:h.r});if(id===ME.id){mine.rej=true;mine.fk=null;view();}return;}
  h.fakes[id]=x;
  if(h.players.every(p=>h.fakes[p.id]))hostVoteStart();
}
function hostVoteStart(){
  const h=H,it=h.items[h.r];
  const list=[{t:it.right,o:[],real:true}];
  for(const p of h.players){const x=h.fakes[p.id];if(!x)continue;const e=list.find(l=>norm(l.t)===norm(x));if(e)e.o.push(p.id);else list.push({t:x,o:[p.id],real:false});}
  const need=Math.max(0,4-list.length);const houses=shuffle(it.wrong).filter(w=>!list.some(l=>norm(l.t)===norm(w)));
  houses.slice(0,Math.max(need,1)).forEach(w=>list.push({t:w,o:[],real:false}));
  const sh=shuffle(list);h.opts=sh.map(l=>l.t);h.owners=sh.map(l=>l.o);h.right=sh.findIndex(l=>l.real);
  h.ph='vt';h.lim=LIM.vt;h.ends=Date.now()+h.lim*1000;hostBroadcast();
}
function hostVote(id,r,k){
  const h=H;if(h.ph!=='vt'||r!==h.r||h.votes[id]!==undefined||!h.players.some(p=>p.id===id))return;
  if(!(k>=0&&k<h.opts.length)||h.owners[k].includes(id))return;
  h.votes[id]=k;
  if(h.players.every(p=>h.votes[p.id]!==undefined))hostReveal();
}
function hostReveal(){
  const h=H;const n=h.players.length;h.picks=new Array(n).fill(-1);h.pts=new Array(n).fill(0);
  if(h.cfg.mode==='classic'){
    h.players.forEach((p,i)=>{const a=h.ans[p.id];if(!a)return;h.picks[i]=a.k;if(a.k===h.right){h.pts[i]=(PTS[(h.items[h.r]||{}).diff]||10)*((h.hel[p.id]||{}).x?2:1);p.right++;}});
  }else{
    h.players.forEach((p,i)=>{const k=h.votes[p.id];if(k===undefined)return;h.picks[i]=k;if(k===h.right){h.pts[i]+=200;p.right++;}else h.owners[k].forEach(pid=>{const j=h.players.findIndex(x=>x.id===pid);if(j>=0)h.pts[j]+=100;});});
  }
  h.players.forEach((p,i)=>p.score+=h.pts[i]);
  h.sk=h.players.map(p=>!!(h.ans[p.id]&&h.ans[p.id].skip));h.rscore=null;h.ph='rv';h.lim=LIM.rv+(h.cfg.mode==='bluff'?3:0);h.ends=Date.now()+h.lim*1000;hostBroadcast();
}
function hostTick(){
  const h=H;if(!h)return;const now=Date.now();
  if(h.ph==='q'&&now>=h.ends+800)hostReveal();
  else if(h.ph==='wr'&&now>=h.ends+800){if(Object.keys(h.fakes).length)hostVoteStart();else{h.ph='vt';h.fakes={};hostVoteStart();}}
  else if(h.ph==='vt'&&now>=h.ends+800)hostReveal();
  else if(h.ph==='rv'&&now>=h.ends)hostNext();
  else if(h.ph==='rk'&&h.rk&&h.rk.vote&&now>=h.rk.vote.end)rkVoteEnd(1);
  else if(h.ph==='rk'&&h.rk&&!h.rk.over&&now>=h.ends+600)rkAns(h.players[h.rk.turn].id,h.r,'',1,1);
  else if(h.ph==='id'&&now>=h.ends)impVoteStart();
  else if(h.ph==='iv'&&now>=h.ends+800)impReveal();
  else if(h.ph==='ir'&&now>=h.ends)impNext();
}

// ---------- rank-the-list mode ----------
const RKC=['#2f5486','#b8562a','#2c7a4b','#a8324e','#2a7d86','#8a6d1f','#546b2f','#6b4a2a'];
const RKSEEN='lo3ba_rkseen';let rkLast='';try{rkLast=localStorage.getItem('lo3ba_rklast')||''}catch(e){}
function rkL(){const id=H?H.rk.li:S.rk.id;return (window.RANK_LISTS||[]).find(l=>l.id===id);}
function rkStart(){
  const h=H,all=window.RANK_LISTS||[];if(!all.length)return;
  h.usedL=h.usedL||[];const RK=window.__rk,rc=h.cfg.rc||'all';
  let cand=all.filter(l=>rc==='all'||!RK||RK.RC[l.id]===rc);if(!cand.length)cand=all.slice();
  let seen=[];try{seen=JSON.parse(localStorage.getItem(RKSEEN)||'[]')}catch(e){}
  let free=cand.filter(l=>!h.usedL.includes(l.id)&&!seen.includes(l.id)&&l.id!==rkLast);
  if(!free.length)free=cand.filter(l=>!h.usedL.includes(l.id)&&l.id!==rkLast);
  if(!free.length)free=cand.filter(l=>l.id!==rkLast);
  if(!free.length){h.usedL=[];free=cand.slice();}
  const L=shuffle(free)[0];h.usedL.push(L.id);rkLast=L.id;
  try{const s2=JSON.parse(localStorage.getItem(RKSEEN)||'[]');s2.push(L.id);while(s2.length>Math.max(5,all.length-5))s2.shift();localStorage.setItem(RKSEEN,JSON.stringify(s2));localStorage.setItem('lo3ba_rklast',L.id)}catch(e){}
  h.players.forEach(p=>{p.score=0;p.right=0});
  h.rk={li:L.id,found:Array(L.items.length).fill(0),own:Array(L.items.length).fill(-1),turn:0,msg:'',mk:0,mo:-1,over:false,fail:0,hint:'',hinted:[],vote:null};h.r=0;h.ph='rk';
  h.lim=h.cfg.rt||30;h.ends=Date.now()+h.lim*1000;hostBroadcast();
}
function rkAns(id,r,x,sk,timeout){
  const h=H;if(!h||h.ph!=='rk'||!h.rk||h.rk.over||r!==h.r)return;const k=h.rk,pl=h.players[k.turn];if(!pl||pl.id!==id)return;
  const R=window.__rk,L=rkL(),a=R.N(x||'');if(!sk&&!a)return;let hit=-1;
  if(!sk){L.items.forEach((al,i)=>{if(hit<0&&al.some(y=>R.N(y)===a))hit=i;});if(hit<0&&a.length>=6)L.items.forEach((al,i)=>{if(hit>=0)return;if(al.some(y=>{const z=R.N(y);return z.length>=6&&R.lev(a,z)<=1;}))hit=i;});}
  const nm=pl.name;k.vote=null;k.mo=-1;
  if(hit>=0&&!k.found[hit]){k.found[hit]=1;k.own[hit]=k.turn;pl.score+=hit+1;k.msg=nm+' لقى '+L.disp[hit]+' ترتيبه '+(hit+1)+'، +'+(hit+1);k.mk=1;k.mo=k.turn;k.fail=0;k.hint='';}
  else{k.fail++;k.mk=0;k.msg=nm+': '+(timeout?'خلص الوقت':hit>=0?'اتقالت قبل كده':sk?'تخطّى':'مش في القايمة');}
  if(k.found.every(v=>v)){k.over=true;h.ends=0;h.lim=0;h.r++;return hostBroadcast();}
  k.turn=(k.turn+1)%h.players.length;h.r++;h.lim=h.cfg.rt||30;h.ends=Date.now()+h.lim*1000;hostBroadcast();
}
function rkVoteStart(id){
  const h=H;if(!h||h.ph!=='rk'||!h.rk||h.rk.over||h.rk.vote)return;
  const i=h.players.findIndex(p=>p.id===id);if(i<0)return;
  h.rk.vote={by:i,v:{[id]:1},end:Date.now()+25000};h.rk.msg='';hostBroadcast();
}
function rkVote(id,k){
  const h=H;if(!h||!h.rk||!h.rk.vote||h.rk.vote.v[id]!==undefined)return;
  if(!h.players.some(p=>p.id===id))return;
  h.rk.vote.v[id]=k?1:0;
  if(h.players.every(p=>h.rk.vote.v[p.id]!==undefined))rkVoteEnd(1);else hostBroadcast();
}
function rkVoteEnd(force){
  const h=H,k=h.rk;if(!k||!k.vote)return;
  const total=h.players.length,y=Object.values(k.vote.v).filter(x=>x).length;
  if(!force&&Object.keys(k.vote.v).length<total)return hostBroadcast();
  k.vote=null;
  if(y>total/2){rkSwap();k.msg='الأغلبية وافقت، السؤال اتغير';return hostBroadcast();}
  k.msg='الاقتراح ماوافقش عليهش أغلبية';hostBroadcast();
}
function rkSwap(){
  const h=H,k=h.rk;const all=window.RANK_LISTS||[];const RK=window.__rk,rc=h.cfg.rc||'all';
  let cand=all.filter(l=>l.id!==k.li&&(rc==='all'||!RK||RK.RC[l.id]===rc));if(!cand.length)cand=all.filter(l=>l.id!==k.li);
  const L=(cand.length?shuffle(cand):all)[0]||rkL();
  h.usedL=h.usedL||[];h.usedL.push(L.id);rkLast=L.id;
  try{const s2=JSON.parse(localStorage.getItem(RKSEEN)||'[]');s2.push(L.id);localStorage.setItem(RKSEEN,JSON.stringify(s2))}catch(e){}
  k.li=L.id;k.found=Array(L.items.length).fill(0);k.own=Array(L.items.length).fill(-1);k.turn=0;k.fail=0;k.hint='';k.hinted=[];k.mk=0;k.mo=-1;
  h.r++;h.lim=h.cfg.rt||30;h.ends=Date.now()+h.lim*1000;
}
function rkHintReq(id){
  const h=H,k=h.rk;if(!h||h.ph!=='rk'||!k||k.over)return;
  if(k.fail<2*h.players.length)return;if(!h.players.some(p=>p.id===id))return;
  const L=rkL();const miss=[];L.items.forEach((al,i)=>{if(!k.found[i])miss.push(i)});if(!miss.length)return;
  const cand=miss.filter(i=>!k.hinted.includes(i));const pool=cand.length?cand:miss;
  const p=pool[Math.floor(Math.random()*pool.length)];k.hinted.push(p);
  const d=String(L.disp[p]).replace(/^ال/,'');
  k.hint='تلميح: العنصر رقم '+(p+1)+' بيبدأ بحرف «'+d.charAt(0)+'» وطوله '+Array.from(d).length+' حروف';
  k.fail=0;hostBroadcast();
}
function rkSend(x,sk){
  if(!S||S.ph!=='rk'||!S.rk||S.rk.ov||myIndex()!==S.rk.tu||mine.sent===S.r)return;if(!sk&&!String(x).trim())return;
  mine.sent=S.r;if(room.host)rkAns(ME.id,S.r,x,sk?1:0);else NET.send({t:'ra',id:ME.id,r:S.r,x,sk:sk?1:0});
}
function rkSug(){
  const el=document.getElementById('orans'),bx=document.getElementById('orsg');if(!el||!bx||!S||!S.rk)return;
  const a=window.__rk.sug(S.rk.id,el.value,S.rk.f.filter((v,i)=>v&&S.rk.x[i]));
  bx.innerHTML=a.map(d=>`<button class="rsgb" data-o="rsug" data-t="${esc(d)}">${esc(d)}</button>`).join('');
}
function rkView(host,tv){
  const k=S.rk,my=myIndex(),meT=!tv&&k.tu===my,over=!!k.ov,n=k.n,nf=k.x.filter(Boolean).length;
  const pc=i=>RKC[i%RKC.length];
  const cards=S.pl.map((p,i)=>`<div class="rp ${i===k.tu&&!over?'on':''}" style="--tc:${pc(i)}"><span>${esc(p.n)}</span><b>${p.s}</b></div>`).join('');
  const cnt=S.pl.length;const cls=cnt>4?'many':'n'+cnt;
  const slots=k.f.map((f,i)=>{const ow=k.o&&k.o[i]>=0?k.o[i]:-1;const nm=f||'؟';const on=ow>=0&&S.pl[ow];
    return `<div class="rs ${k.x[i]?'f ow':''} ${over&&!k.x[i]?'miss':''} ${nm.length>9?'ln':''}" style="--tc:${on?pc(ow):'#1fa34a'}"><em>${i+1}</em><span class="${nm.length>12?'l3':nm.length>9?'l2':nm.length>6?'l1':''}">${esc(nm)}</span><b class="rsw">${on?esc(S.pl[ow].n):''}</b></div>`}).join('');
  const links=`<div class="rlk">${k.hb&&!over?'<button class="link" data-o="rh">تلميح</button>':''}<button class="link" data-o="rvq">غيّر السؤال</button>${meT?'<button class="link" data-o="rsk">تخطي</button>':''}</div>`;
  let foot='';
  if(over)foot=`<div class="res good">خلصت القايمة</div>${host?'<button class="btn big" data-o="rkfin">شوف النتيجة</button>':'<p class="warn">مستني صاحب الغرفة...</p>'}`;
  else if(k.v)foot=`<div class="rvcard"><b>${esc(k.v.by)} عايز يغيّر السؤال</b><span>${k.v.y} من ${cnt} موافقين، ولازم أكتر من النص</span>${mine.vv?'<span>صوتك اتسجل، مستنيين الباقي</span>':'<div class="rvb"><button class="btn" data-o="rvy" data-v="1">موافق ✓</button><button class="btn ghost" data-o="rvy" data-v="0">لا ✗</button></div>'}</div>`;
  else if(meT)foot=`${k.h?`<div class="rhint">${esc(k.h)}</div>`:''}<div class="rmsg"${k.mo>=0?` style="background:${pc(k.mo)};color:#fff"`:''}>${esc(k.m||'دورك!')}</div><div class="rin"><input class="mdin" id="orans" autocomplete="off" placeholder="اكتب اسم عنصر"><button class="btn" data-o="rans">تمام</button></div><div class="rsg" id="orsg"></div>${links}`;
  else foot=`${k.h?`<div class="rhint">${esc(k.h)}</div>`:''}<div class="rmsg"${k.mo>=0?` style="background:${pc(k.mo)};color:#fff"`:''}>${esc(k.m||'')}</div><div class="res wait">دور ${esc(S.pl[k.tu].n)}...</div>${links}`;
  shell(`${over?'':'<div class="bar"><i id="obar"></i></div>'}<div class="rsb ${cls}">${cards}</div><div class="rhd"><div class="rt">${esc(k.t)}</div><div class="rc"><span class="rbar"><i style="width:${Math.round(100*nf/n)}%"></i></span><b>${nf}/${n}</b></div></div><div class="rgrid ${n>12?'dense':n>8?'mid':''}">${slots}</div>${foot}`);
  if(meT&&!over&&!k.v){const el=document.getElementById('orans');if(el)setTimeout(()=>{try{el.focus()}catch(e){}},50);}
  const on=document.querySelector('.rsb .rp.on');if(on&&cnt>4&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}
}
// ---------- imposter mode ----------
function impSendWords(){const h=H;if(!h.iw)return;h.players.forEach(p=>{const w=p.id===h.iw.imp?null:h.iw.word;if(p.id===ME.id)IW={r:h.r,th:h.iw.theme,w};else NET.send({t:'iw',to:p.id,r:h.r,th:h.iw.theme,w});});}
function impStart(){
  const h=H;h.rounds=Math.min(8,Math.max(3,Math.round(h.cfg.n/3)));h.r=-1;h.usedW=[];
  h.players.forEach(p=>{p.score=0;p.right=0});hpReset();impNext();
}
function impNext(){
  const h=H;h.r++;
  if(h.r>=h.rounds){h.ph='fin';h.ends=0;h.iw=null;return hostBroadcast();}
  const T=window.IMPW||[];const pool=[];T.forEach(t=>t.w.forEach(w=>{if(!h.usedW.includes(w))pool.push({theme:t.n,word:w})}));
  const pick=shuffle(pool)[0]||{theme:T[0].n,word:T[0].w[0]};h.usedW.push(pick.word);
  h.iw={theme:pick.theme,word:pick.word,imp:shuffle(h.players)[0].id};h.iv={};h.gain=h.players.map(()=>0);
  h.ph='id';h.lim=90;h.ends=Date.now()+h.lim*1000;hostBroadcast();
}
function impVoteStart(){const h=H;h.ph='iv';h.lim=40;h.ends=Date.now()+h.lim*1000;hostBroadcast();}
function impVote(id,r,k){
  const h=H;if(!h||h.ph!=='iv'||r!==h.r||h.iv[id]!==undefined)return;
  const me=h.players.findIndex(p=>p.id===id);if(me<0||k<0||k>=h.players.length||k===me)return;
  h.iv[id]=k;if(h.players.every(p=>h.iv[p.id]!==undefined))impReveal();else hostBroadcast();
}
function impReveal(){
  const h=H;if(h.ph!=='iv')return;
  const imp=h.players.findIndex(p=>p.id===h.iw.imp);const cnt=h.players.map(()=>0);
  h.players.forEach(p=>{const k=h.iv[p.id];if(k!==undefined)cnt[k]++;});
  const top=Math.max(...cnt);const caught=cnt[imp]===top&&top>0&&cnt.filter(c=>c===top).length===1;
  h.gain=h.players.map(()=>0);
  if(caught)h.players.forEach((p,i)=>{if(h.iv[p.id]===imp){h.gain[i]=2;}});else h.gain[imp]=3;
  h.players.forEach((p,i)=>p.score+=h.gain[i]);h.caught=caught;
  h.ph='ir';h.lim=9;h.ends=Date.now()+h.lim*1000;hostBroadcast();
}


// ---------- actions from my own screen ----------
function myIndex(){return S?S.pl.findIndex(p=>p.i===ME.id):-1;}
function doAnswer(k){if(mine.k!==undefined)return;mine.k=k;if(room.host)hostAns(ME.id,S.r,k);else NET.send({t:'ans',id:ME.id,r:S.r,k});view();}
function doHelp(k){if(!S||S.ph!=='q'||mine.k!==undefined)return;const i=myIndex();if(i<0||!((S.pl[i].h||0)&({f:1,s:2,x:4}[k])))return;if(mine.used&&mine.used[k])return;mine.used=Object.assign(mine.used||{},{[k]:1});if(k==='x')mine.x=true;if(k==='s')mine.k=-1;if(room.host)hostHelp(ME.id,S.r,k);else NET.send({t:'hp',id:ME.id,r:S.r,k});view();}
function doFake(){const el=document.getElementById('ofake');const x=el?el.value.trim():'';if(!x){return;}mine.fk=x;mine.rej=false;if(room.host)hostFake(ME.id,S.r,x);else NET.send({t:'fk',id:ME.id,r:S.r,x});view();}
function doVote(k){if(mine.k!==undefined)return;mine.k=k;if(room.host)hostVote(ME.id,S.r,k);else NET.send({t:'vt',id:ME.id,r:S.r,k});view();}

// ---------- views ----------
function remain(){if(!S||!S.ends)return 0;return Math.max(0,(S.ends-(Date.now()+off))/1000);}
function tmBar(){if(!S.tn)return '';const t=tmTotals(S.pl,S.tn);return `<div class="tmbar">${t.map((v,k)=>`<span class="tmc" style="background:${TM[k][1]}">${TM[k][0]} <b>${v}</b></span>`).join('')}</div>`;}
function sbHtml(){const my=myIndex();const all=S.pl.map((p,i)=>({p,i}));const top=S.pl.length>8?all.slice().sort((a,b)=>b.p.s-a.p.s).slice(0,5):all;const extra=S.pl.length>8&&my>=0&&!top.some(x=>x.i===my)?`<div class="sp cur"><span class="who">إنت: المركز ${all.slice().sort((a,b)=>b.p.s-a.p.s).findIndex(x=>x.i===my)+1} من ${S.pl.length}</span><b>${S.pl[my].s}</b></div>`:'';return tmBar()+`<div class="sb">${top.map(x=>x.p).map(p=>`<div class="sp ${p.i===ME.id?'cur':''}"><span class="who">${avh(p.a)}${esc(p.n)}</span><b>${p.s}</b></div>`).join('')}${extra}</div>`;}
function view(){
  if(!S||!room)return;
  const host=room.host;
  if(room.tv)return (S.mode==='rk'&&S.ph==='rk')?rkView(false,true):tvView();
  if(X.catsOpen&&X.catsOpen())return;
  if(S.ph==='lobby')return lobbyRoom(host);
  if(S.ph==='fin')return finView();
  if(S.mode==='imp')return impView(host);
  if(S.mode==='rk')return rkView(host);
  const q=S.q,cat=CATS[q.c]||'';
  const meta=`<div class="qmeta"><span>${cat}</span>${dpO(q.d)}<span>${S.r+1}/${S.n}</span></div>`;
  const bar=(S.ph==='rv')?'':`<div class="bar"><i id="obar"></i></div>`;
  let body='';
  if(S.ph==='q'){
    const my0=myIndex(),hm=my0>=0?(S.pl[my0].h||0):0,hd=mine.hide||[],U=mine.used||{};
    const hbar=mine.k===undefined?`<div class="llbox"><div class="llt">🛟 وسائل مساعدة</div><div class="llr"><button class="ll" data-o="help" data-v="f" ${(hm&1)&&!U.f?'':'disabled'}><b class="llc">${(hm&1)&&!U.f?1:0}</b>🎯 ٥٠/٥٠</button><button class="ll" data-o="help" data-v="s" ${(hm&2)&&!U.s?'':'disabled'}><b class="llc">${(hm&2)&&!U.s?1:0}</b>⏭️ تخطي</button><button class="ll ${mine.x?'on':''}" data-o="help" data-v="x" ${(hm&4)&&!U.x?'':'disabled'}><b class="llc">×٢</b>✖️ نقط مضاعفة</button></div></div>`:'';
    body=`${qbox(q.t)}<div class="opts">${S.o.map((o,k)=>`<button class="opt ${mine.k===k?'picked':''} ${hd.includes(k)?'gone':''}" data-o="ans" data-k="${k}" ${mine.k!==undefined||hd.includes(k)?'disabled':''}>${esc(o)}</button>`).join('')}</div>${hbar}${mine.k!==undefined?'<div class="res wait">اتسجلت إجابتك. مستني الباقي...</div>':''}`;
  }else if(S.ph==='wr'){
    body=`${qbox(q.t)}${mine.fk?`<div class="res wait">إجابتك المضروبة: <b>${esc(mine.fk)}</b><br>مستني الباقي...</div>`:`<div class="panel center"><p>اكتب إجابة مزيفة مقنعة. الباقي هيشوفوها وسط الإجابة الصح.</p><div class="ans"><input id="ofake" maxlength="40" placeholder="إجابتك المضروبة" autocomplete="off"><button class="btn" data-o="fake">ابعت</button></div><div class="warn">${mine.rej?'دي قريبة أوي من الإجابة الصح أو فاضية. اكتب حاجة تانية.':''}</div></div>`}`;
  }else if(S.ph==='vt'){
    const own=mine.fk||'';
    body=`${qbox(q.t)}<p class="center" style="color:var(--mut)">اختار الإجابة اللي شايفها صح</p><div class="opts">${S.o.map((o,k)=>{const isMine=own&&norm(o)===norm(own);return `<button class="opt ${mine.k===k?'picked':''}" data-o="vote" data-k="${k}" ${(mine.k!==undefined||isMine)?'disabled':''}>${esc(o)}${isMine?'<small>(إجابتك)</small>':''}</button>`}).join('')}</div>${mine.k!==undefined?'<div class="res wait">اتسجل اختيارك. مستني الباقي...</div>':''}`;
  }else if(S.ph==='rv'){
    const my=myIndex();
    const rows=S.pl.map((p,i)=>({p,i,pt:S.pt[i],pk:S.pk[i]})).sort((a,b)=>b.pt-a.pt);
    const opts=S.o.map((o,k)=>{let cls='opt';if(k===S.right)cls+=' right';else if(S.pk[my]===k)cls+=' wrong';const by=S.by&&S.by[k]&&S.by[k].length?`<small>كتبها: ${S.by[k].map(j=>esc(S.pl[j].n)).join('، ')}</small>`:(S.by&&k!==S.right?'<small>إجابة جاهزة من اللعبة</small>':'');const vs=S.pl.filter((p,i)=>S.pk[i]===k).map(p=>esc(p.n));return `<div class="${cls}" style="cursor:default">${esc(o)}${by}${vs.length?`<small>اختارها: ${vs.join('، ')}</small>`:''}</div>`}).join('');
    const ok=S.pt[my]>0;
    body=`${qbox(q.t)}<div class="opts">${opts}</div><div class="res ${ok?'good':'bad'}">${S.pk[my]<0?(S.sk&&S.sk[my]?'استخدمت تخطي. ':'ملحقتش تجاوب. '):''}${ok?`صح! +${S.pt[my]} نقطة${S.dx&&S.dx[my]?' (×٢)':''}`:'مفيش نقط الجولة دي'}</div>
    <div class="rank">${rows.map(x=>`<div class="rk"><span class="who">${avh(x.p.a)}${esc(x.p.n)}</span><span>+${x.pt}</span></div>`).join('')}</div>${room.host?'<button class="btn big" data-o="skip">التالي ⏭️</button>':'<div class="center" style="color:var(--mut)">الجولة الجاية بعد ثواني...</div>'}`;
  }
  const hb=host?hostBoard():'';
  shell(`${sbHtml()}${meta}${bar}${body}${hb}`);
  updateBar();
}
function hostBoard(){
  if(!mine.hb)return `<div class="hbw"><button class="btn sm ghost" data-o="hb">🎛️ لوحة المضيف</button></div>`;
  return `<div class="hbw hbo"><button class="btn sm ghost" data-o="hb">إخفاء اللوحة ▲</button><div class="hbr"><button class="btn sm" data-o="hskip">⏭️ تخطي السؤال</button><button class="btn sm ghost" data-o="hend">🛑 إنهاء اللعبة</button></div>${S.pl.slice(1).map(p=>`<div class="rk"><span class="who">${avh(p.a)}${esc(p.n)}</span><button class="btn sm ghost" data-o="kick" data-v="${p.i}">طرد ✖</button></div>`).join('')||'<small>مفيش لاعبين تانيين</small>'}</div>`;
}
function hostKick(id){const h=H,i=h.players.findIndex(p=>p.id===id);if(i<=0)return;h.players.splice(i,1);delete h.ans[id];NET.send({t:'kick',to:id,why:'صاحب الغرفة طردك.'});
  if(h.ph==='q'&&h.players.length&&h.players.every(p=>h.ans[p.id]))return hostReveal();
  if(h.ph==='wr'&&h.players.length&&h.players.every(p=>h.fakes[p.id]))return hostVoteStart();
  if(h.ph==='vt'&&h.players.length&&h.players.every(p=>h.votes[p.id]!==undefined))return hostReveal();
  hostBroadcast();}
function lobbyRoom(host){
  const c=lobbyCfg,hc=H?H.cfg:c;
  const cfgHtml=host?`<h3 id="rsettings">نوع اللعب</h3><div class="chips"><button class="chip ${hc.mode==='classic'?'on':''}" data-o="mode" data-v="classic">🎯 سباق إجابات</button><button class="chip ${hc.mode==='bluff'?'on':''}" data-o="mode" data-v="bluff">🎭 بلوف</button><button class="chip ${hc.mode==='imp'?'on':''}" data-o="mode" data-v="imp">🕵️ برا السرب</button><button class="chip ${hc.mode==='rk'?'on':''}" data-o="mode" data-v="rk">🔟 رتّب القايمة</button></div>
  ${hc.mode==='rk'?`<h3>الفئة</h3><div class="chips">${((window.__rk||{}).RCATS||[]).map(([k,n])=>`<button class="chip ${(hc.rc||'all')===k?'on':''}" data-o="rkc" data-v="${k}">${n}</button>`).join('')}</div><h3>وقت دور كل لاعب</h3><div class="chips">${[15,30,45,60,90].map(t=>`<button class="chip ${(hc.rt||30)===t?'on':''}" data-o="rkt" data-v="${t}">${t} ثانية</button>`).join('')}</div><p class="center" style="color:var(--mut);font-size:13px">قايمة عشوائية، كل لاعب بالدور يكتب عنصر. الترتيب الأبعد بياخد نقط أكتر. مفيش قلوب، واللعبة بتخلص لما القايمة تتكمل.</p>`:`<h3>وضع الجمهور 👥</h3><div class="seg" style="width:100%"><button class="${hc.crowd?'':'on'}" data-o="crowd" data-v="0" style="flex:1">عادي (لحد 16)</button><button class="${hc.crowd?'on':''}" data-o="crowd" data-v="1" style="flex:1">جمهور (لحد 20 + شاشة)</button></div>
  <h3>فرق</h3><div class="chips">${[0,2,3,4].map(n=>`<button class="chip ${(hc.teams|0)===n?'on':''}" data-o="teams" data-v="${n}">${n?n+' فرق':'فردي'}</button>`).join('')}</div>
  <h3>الفئات</h3><div class="srow"><span class="lb"><span class="e">🗂️</span>${hc.cats.length?hc.cats.length+'/6 فئات مختارة':'ماختارتش فئات لسه'}</span><button class="btn sm ghost" data-o="cats">${hc.cats.length?'تعديل':'اختار'}</button></div>
  <h3>عدد الأسئلة</h3><div class="srow slider"><span class="lb"><span class="e">🔁</span>عدد الأسئلة</span><b id="orv" class="rv">${hc.n}</b></div><input type="range" id="orng" min="10" max="30" step="1" value="${hc.n}" class="rng"><div class="rngl"><span>١٠</span><span>٣٠</span></div>
  `}<div class="srow"><span class="lb"><span class="e">👥</span>الحد الأقصى للاعبين</span><span class="stepper"><button data-o="mp" data-v="-1">−</button><b>${hc.maxP}</b><button data-o="mp" data-v="1">+</button></span></div>
  <h3>مين يقدر ينضم؟</h3><div class="seg" style="width:100%"><button class="${hc.appr?'':'on'}" data-o="appr" data-v="0" style="flex:1">أي حد معاه الكود</button><button class="${hc.appr?'on':''}" data-o="appr" data-v="1" style="flex:1">بموافقتي 🔒</button></div>`
  :`<p class="center">${S.mode==='rk'?'🔟 رتّب القايمة • '+((((window.__rk||{}).RCATS||[]).find(c=>c[0]===(S.rc||'all'))||[0,''])[1])+' • '+(S.rt||30)+' ثانية للدور':(S.mode==='imp'?'🕵️ برا السرب':S.mode==='bluff'?'🎭 بلوف':'🎯 سباق إجابات')+' • '+S.n+' سؤال • '+S.cats.length+' فئة'+(S.tn?' • '+S.tn+' فرق':'')}</p>`;
  const mp=S.mp||16;const seats=Math.max(0,mp-S.pl.length);
  shell(`<div class="roomc"><small>كود الغرفة</small><div class="code">${esc(S.code)}</div>${qrOn?`<div class="qr"><img alt="QR" width="168" height="168" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(joinUrl())}"><small>صوّر الكود بالكاميرا عشان تدخل</small></div>`:''}<div class="rb3"><button class="rbb" data-o="invite"><span>📨</span><b>دعوة</b></button><button class="rbb" data-o="qr"><span>📷</span><b>${qrOn?'إخفاء QR':'QR'}</b></button>${host?'<button class="rbb" data-o="tosettings"><span>⚙️</span><b>إعدادات</b></button>':''}</div></div>
  <div class="panel center"><h3 class="hrow">اللاعبين <i>${S.pl.length} / ${mp}</i></h3><div class="plist">${S.pl.map((p,i)=>`<div class="pl" style="--i:${i}">${avh(p.a,'avl')}<b>${esc(p.n)}</b>${S.tn&&p.tm!==undefined?`<button class="tmb" style="background:${TM[p.tm][1]}" ${host?`data-o="tm" data-v="${p.i}"`:''}>${TM[p.tm][0]}</button>`:''}${i===0?'<em>👑 صاحب الغرفة</em>':p.b?'<em class="rd">بوت</em>':p.i===ME.id?'<em class="you">إنت</em>':'<em class="rd">✅ جاهز</em>'}${host&&i>0?`<button class="kx" data-o="kick" data-v="${p.i}" aria-label="طرد">✖</button>`:(p.b&&p.o===ME.id?`<button class="kx" data-o="botx" data-v="${p.i}" aria-label="شيل البوت">✖</button>`:'')}</div>`).join('')}${seats>0?`<div class="empty">+ ${seats} أماكن فاضية</div>`:''}</div>
  ${S.mode!=='imp'&&S.mode!=='rk'&&S.pl.filter(p=>p.b&&p.o===ME.id).length<2&&S.pl.length<mp?`<div class="srow"><span class="lb"><span class="e">🤖</span>بوتات للتجربة (لحد 2)</span><button class="btn sm ghost" data-o="addbot">➕ ضيف بوت</button></div>`:''}
  ${host&&H.pending.length?`<h3>طلبات انضمام 🙋</h3><div class="rank">${H.pending.map(p=>`<div class="rk pend"><span class="who">${avh(p.av)}${esc(p.name)}</span><span style="display:flex;gap:6px"><button class="btn sm" data-o="ok" data-v="${p.id}">قبول</button><button class="btn sm ghost" data-o="no" data-v="${p.id}">رفض</button></span></div>`).join('')}</div>`:''}
  ${cfgHtml}
  ${host?`<div class="warn">${S.mode==='imp'&&S.pl.length<3?'اللعبة دي محتاجة 3 لاعبين على الأقل':S.pl.length<2?'استنى لاعب واحد على الأقل يدخل':S.tn&&new Set(S.pl.map(p=>p.tm)).size<2?'لازم فريقين فيهم لاعبين':S.mode!=='imp'&&S.mode!=='rk'&&S.cats.length<1?'اختار فئة واحدة على الأقل':''}</div><button class="btn big" data-o="start" ${S.pl.length<2||(S.mode==='imp'&&S.pl.length<3)||(S.mode!=='imp'&&S.mode!=='rk'&&S.cats.length<1)||(S.tn&&new Set(S.pl.map(p=>p.tm)).size<2)?'disabled':''}>ابدأ اللعبة</button><p style="color:var(--mut);font-size:13px">خلّي شاشتك مفتوحة طول اللعبة، لأن موبايلك هو اللي بيدير الغرفة.</p>`:'<p class="warn">مستني صاحب الغرفة يبدأ...</p>'}
  <button class="btn ghost" data-o="leave">خروج</button></div>`);
}
let tvT=null;
function tvCode(code){
  code=String(code||'').trim().toUpperCase();if(!/^[1-3][A-Z2-9]{4}$/.test(code))return false;
  leave(true);room={code,host:false,tv:true};S=null;NET=connect(code);
  shell(`<div class="panel center"><div class="big-emoji">📺</div><h2>شاشة التلفزيون</h2><p>بدور على الغرفة ${esc(code)}...</p></div>`,);
  const ask=()=>{if(S||!room||!room.tv)return;NET.send({t:'tv'});};ask();clearInterval(tvT);tvT=setInterval(ask,3000);return true;
}
function tvView(){
  const sb=`<div class="sb">${S.pl.slice().sort((a,b)=>b.s-a.s).slice(0,8).map(p=>`<div class="sp"><span class="who">${avh(p.a)}${esc(p.n)}</span><b>${p.s}</b></div>`).join('')}</div>`;
  const tmb=S.tn?tmBar():'';
  if(S.ph==='lobby'){return shell(`<div class="panel center tv"><h2>ادخل من موبايلك</h2><div class="roomc"><small>كود الغرفة</small><div class="code">${esc(S.code)}</div><div class="qr"><img alt="QR" width="220" height="220" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(location.origin+location.pathname+'?r='+S.code)}"></div></div><div class="plist">${S.pl.map((p,i)=>`<div class="pl">${avh(p.a,'avl')}<b>${esc(p.n)}</b></div>`).join('')}</div></div>`,);}
  if(S.ph==='fin'){const rows=S.pl.map(p=>p).sort((a,b)=>b.s-a.s);return shell(`<div class="panel center tv"><div class="big-emoji trophy">🏆</div><h2>الفائز: ${esc(rows[0].n)}</h2><div class="rank">${rows.map((p,k)=>`<div class="rk"><span class="who">${k+1}. ${avh(p.a)}${esc(p.n)}</span><span>${p.s} نقطة</span></div>`).join('')}</div></div>`,);}
  const bar=`<div class="bar"><i id="obar"></i></div>`;
  if(S.mode==='imp'){
    const inner=S.ph==='id'?`<div class="qbox big">الموضوع: ${esc(S.th)}</div><p class="center">كل واحد يلمّح بكلمة واحدة بالدور... وبعدين التصويت</p>`:S.ph==='iv'?`<div class="qbox big">صوّتوا من موبايلاتكم: مين برا السرب؟</div>`:`<div class="qbox big">الكلمة كانت: <b>${esc(S.word)}</b></div><div class="res">${esc(S.pl[S.imp].n)} كان برا السرب! 🕵️</div>`;
    return shell(`${S.ph==='ir'?'':bar}${tmb}${sb}${inner}`,);
  }
  const q=S.q;if(!q)return;
  const meta=`<div class="qmeta"><span>${CATS[q.c]||''}</span>${dpO(q.d)}<span>${S.r+1}/${S.n}</span></div>`;
  let opts='';
  if(S.o&&S.ph!=='wr')opts=`<div class="opts">${S.o.map((o,k)=>`<div class="opt ${S.ph==='rv'&&k===S.right?'right':''}" style="cursor:default">${esc(o)}</div>`).join('')}</div>`;
  else opts='<p class="center">اللاعبين بيكتبوا إجابات مزيفة...</p>';
  shell(`${S.ph==='rv'?'':bar}${tmb}${sb}${meta}${qbox(q.t)}${opts}`,);
}
function impView(host){
  const my=myIndex(),isI=IW&&IW.r===S.r;const bar=`<div class="bar"><i id="obar"></i></div>`;
  const meta=`<div class="qmeta"><span>🕵️ برا السرب</span><span>${S.th||''}</span><span>${S.r+1}/${S.rn}</span></div>`;
  let body='';
  if(S.ph==='id'){
    const w=isI?(IW.w?`<div class="qbox big">الكلمة السرية: <b>${esc(IW.w)}</b></div><p class="center">قول كلمة تلمّح بيها من غير ما تقولها صريح. خلّي بالك لا حد برا السرب يعرفها.</p>`:`<div class="qbox big">إنت اللي برا السرب! 🕵️</div><p class="center">مش عارف الكلمة. اعرف الموضوع (${esc(IW.th||S.th)}) وحاول تتخفى بينهم.</p>`):'<p class="center">بيوصلك دورك...</p>';
    body=`${w}<p class="center" style="color:var(--mut)">كل واحد يلمّح بكلمة واحدة بالدور (بصوت عالي)، وبعدين صوّتوا مين برا السرب.</p>${host?'<button class="btn big" data-o="ivs">ابدأ التصويت ⏭️</button>':''}`;
  }else if(S.ph==='iv'){
    const done=S.iv?S.iv:[];const mine1=mine.k;
    body=`<p class="center">مين برا السرب في رأيك؟</p><div class="opts">${S.pl.map((p,k)=>`<button class="opt ${mine1===k?'picked':''}" data-o="ivote" data-k="${k}" ${mine1!==undefined||k===my?'disabled':''}>${avh(p.a)}${esc(p.n)}</button>`).join('')}</div>${mine1!==undefined?'<div class="res wait">مستني الباقي...</div>':''}`;
  }else{
    const imp=S.pl[S.imp];const caught=S.iv.filter(k=>k===S.imp).length;
    body=`<div class="qbox big">الكلمة كانت: <b>${esc(S.word)}</b></div><div class="res ${S.gain[S.imp]>0?'bad':'good'}">${esc(imp.n)} كان برا السرب! ${S.gain[S.imp]>0?'ونجح يتخفى 😎':'واتكشف 🎯'}</div><div class="rank">${S.pl.map((p,i)=>`<div class="rk"><span class="who">${avh(p.a)}${esc(p.n)}${i===S.imp?' 🕵️':''}${S.iv[i]>=0?' ← '+esc(S.pl[S.iv[i]].n):''}</span><span>+${S.gain[i]}</span></div>`).join('')}</div>${host?'<button class="btn big" data-o="inx">التالي ⏭️</button>':''}`;
  }
  shell(`${S.ph==='ir'?'':bar}${sbHtml()}${meta}${body}`);
}
function recStats(){try{if(!S||S.ph!=='fin'||S.__rec===S.rid+'|'+S.n)return;const key=(room&&room.code||'')+'|'+(S.pl.map(p=>p.s).join(','));if(window.__recKey===key)return;window.__recKey=key;
const me=S.pl.find(p=>p.i===ME.id);if(!me||S.pl.length<2)return;const st=X.store.get('stats',{gp:0,w:0,l:0,d:0,vs:{}});st.gp++;const best=Math.max(...S.pl.map(p=>p.s));const uniq=S.pl.filter(p=>p.s===best).length===1;
if(me.s===best&&uniq)st.w++;else if(me.s<best)st.l++;else st.d++;
S.pl.forEach(p=>{if(p.i===ME.id)return;const v=st.vs[p.n]||(st.vs[p.n]={w:0,l:0,d:0});if(me.s>p.s)v.w++;else if(me.s<p.s)v.l++;else v.d++;});X.store.set('stats',st);}catch(e){}}
function finView(){
  recStats();
  const rows=S.pl.map((p,i)=>({p,i})).sort((a,b)=>b.p.s-a.p.s);const tie=rows.length>1&&rows[0].p.s===rows[1].p.s;
  sfx.win();shell(`<div class="panel center"><div class="big-emoji trophy">${tie?'🤝':'🏆'}</div><h2>${tie?'تعادل!':'الفائز: '+esc(rows[0].p.n)}</h2>${S.tn?(()=>{const t=tmTotals(S.pl,S.tn).map((v,k)=>({v,k})).sort((a,b)=>b.v-a.v);return `<div class="rank">${t.map((x,j)=>`<div class="rk" style="border-inline-start:6px solid ${TM[x.k][1]}"><span class="who">${j+1}. فريق ${TM[x.k][0]}</span><span>${x.v} نقطة</span></div>`).join('')}</div>`;})():''}<div class="rank">${rows.map((x,k)=>`<div class="rk"><span class="who">${k+1}. ${avh(x.p.a)}${esc(x.p.n)}${x.p.i===ME.id?' (أنت)':''}</span><span>${x.p.s} نقطة</span></div>`).join('')}</div>
  ${room.host?'<button class="btn big" data-o="again">العب تاني بنفس الغرفة</button>':'<p class="warn">صاحب الغرفة ممكن يبدأ جولة جديدة...</p>'}<button class="btn ghost" data-o="leave">خروج</button></div>`);
}
function updateBar(){
  const b=document.getElementById('obar');if(!b||!S)return;
  const r=remain(),tot=S.lim||20;b.style.width=Math.min(100,r/tot*100)+'%';b.className=r<6?'low':'';
}
function startUi(){
  if(uiTimer)return;
  uiTimer=setInterval(()=>{if(!S)return;updateBar();const r=remain();if(['q','wr','vt'].includes(S.ph)&&r<=5&&r>0.2&&Math.abs(r-Math.round(r))<0.12)sfx.tick();},200);
}


// ---------- events ----------
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||!t.dataset.o)return;
  const a=t.dataset.o,v=t.dataset.v;
  switch(a){
    case 'create':return create();
    case 'join':return join();
    case 'leave':{if(room&&!room.host&&NET)NET.send({t:'bye',id:ME.id});leave();return X.home();}
    case 'ans':return doAnswer(+t.dataset.k);
    case 'help':return doHelp(v);
    case 'vote':return doVote(+t.dataset.k);
    case 'fake':return doFake();
    case 'tvlink':{const u=location.origin+location.pathname+'?tv='+S.code;if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>warn('اتنسخ لينك شاشة التلفزيون. افتحه على الشاشة.')).catch(()=>prompt('افتح اللينك ده على التلفزيون',u));else prompt('افتح اللينك ده على التلفزيون',u);return;}
    case 'skip':if(H&&H.ph==='rv')hostNext();return;
    case 'ivs':if(H&&H.ph==='id')impVoteStart();return;
    case 'inx':if(H&&H.ph==='ir')impNext();return;
    case 'ivote':{if(mine.k!==undefined||!S||S.ph!=='iv')return;const k=+t.dataset.k;mine.k=k;if(room.host)impVote(ME.id,S.r,k);else NET.send({t:'iv',id:ME.id,r:S.r,k});return view();}
    case 'rans':{const el=document.getElementById('orans');return rkSend(el?el.value:'');}
    case 'rsk':return rkSend('',true);
    case 'rvq':if(room.host)rkVoteStart(ME.id);else NET.send({t:'rv',id:ME.id});return;
    case 'rvy':{if(!S||!S.rk||!S.rk.v||mine.vv)return;const kk=v==='1'?1:0;mine.vv=1;if(room.host)rkVote(ME.id,kk);else NET.send({t:'rvv',id:ME.id,k:kk});return view();}
    case 'rh':if(room.host)rkHintReq(ME.id);else NET.send({t:'rh',id:ME.id});return;
    case 'rsug':{const el=document.getElementById('orans');if(el){el.value=t.dataset.t;rkSug();try{el.focus()}catch(e){}}return;}
    case 'rkfin':if(H&&H.ph==='rk'){H.ph='fin';H.ends=0;hostBroadcast();}return;
    case 'rkc':H.cfg.rc=v;return hostBroadcast();
    case 'rkt':H.cfg.rt=+v;return hostBroadcast();
    case 'start':return hostStart();
    case 'again':{const h=H;h.rk=null;h.ph='lobby';h.r=0;h.items=[];h.ends=0;h.players.forEach(p=>{p.score=0;p.right=0});hpReset();return hostBroadcast();}
    case 'mode':H.cfg.mode=v;return hostBroadcast();
    case 'crowd':H.cfg.crowd=v==='1';if(!H.cfg.crowd&&H.cfg.maxP>16)H.cfg.maxP=16;else if(H.cfg.crowd&&H.cfg.maxP<20)H.cfg.maxP=20;return hostBroadcast();
    case 'teams':H.cfg.teams=+v;tmAssign();return hostBroadcast();
    case 'tm':{const p=H.players.find(x=>x.id===v),n=H.cfg.teams|0;if(!p||!n)return;p.tm=((p.tm|0)+1)%n;return hostBroadcast();}
    case 'rminus':case 'rplus':{const st=[5,10,15,20];let i=st.indexOf(H.cfg.n);i+=a==='rplus'?1:-1;i=Math.max(0,Math.min(st.length-1,i));H.cfg.n=st[i];return hostBroadcast();}
    case 'invite':{const txt='تعالى العب دغدغ معايا! ادخل من اللينك واكتب اسمك بس: '+joinUrl()+' (الكود: '+S.code+')';if(navigator.share){navigator.share({text:txt}).catch(()=>{});}else if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>{msg='';t.textContent='✅ اتنسخ';});}return;}
    case 'hb':mine.hb=!mine.hb;return view();
    case 'kick':return hostKick(v);
    case 'addbot':if(room.host)return hostAddBot(ME.id);NET.send({t:'bot',id:ME.id});return;
    case 'botx':if(room.host)return hostDelBot(v,ME.id);NET.send({t:'botx',id:ME.id,v:v});return;
    case 'hskip':if(H&&['q','wr','vt'].includes(H.ph)){if(H.ph==='q')hostReveal();else if(H.ph==='wr')hostVoteStart();else hostReveal();}return;
    case 'hend':if(H&&H.ph!=='lobby'&&H.ph!=='fin'){H.ph='fin';H.ends=0;hostBroadcast();}return;
    case 'qr':qrOn=!qrOn;return view();
    case 'tosettings':{const e=document.getElementById('rsettings');if(e)e.scrollIntoView({behavior:'smooth',block:'start'});return;}
    case 'mp':H.cfg.maxP=Math.max(2,Math.min(H.cfg.crowd?20:16,H.cfg.maxP+(+v)));return hostBroadcast();
    case 'appr':H.cfg.appr=v==='1';return hostBroadcast();
    case 'cats':return X.catsBrowser({get:()=>H.cfg.cats,set:c=>{H.cfg.cats=c;try{localStorage.setItem('lo3ba_cats',JSON.stringify(c))}catch(e){}},onDone:()=>hostBroadcast()});
    case 'ok':{const i=H.pending.findIndex(x=>x.id===v);if(i<0)return;const pj=H.pending.splice(i,1)[0];let nm=pj.name,k=2;while(H.players.some(x=>x.name===nm))nm=pj.name.slice(0,12)+' '+k++;{const np={id:pj.id,name:nm,av:pj.av,score:0,right:0};H.players.push(np);tmPlace(np);}return hostBroadcast();}
    case 'no':{const i=H.pending.findIndex(x=>x.id===v);if(i<0)return;const pj=H.pending.splice(i,1)[0];NET.send({t:'kick',to:pj.id,why:'صاحب الغرفة رفض طلبك.'});return view();}
    case 'diff':H.cfg.diff=+v;return hostBroadcast();
    case 'rounds':H.cfg.n=+v;return hostBroadcast();
    case 'catall':H.cfg.cats=shuffle(Object.keys(CATS)).slice(0,6);return hostBroadcast();
    case 'cat':{const c=H.cfg.cats,i=c.indexOf(v);if(i>=0){if(c.length>1)c.splice(i,1);}else if(c.length<6)c.push(v);return hostBroadcast();}
  }
});
document.addEventListener('input',e=>{if(e.target.id==='orans')rkSug();});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(e.target.id==='orans'){e.preventDefault();rkSend(e.target.value);return;}if(e.target.id==='ofake')doFake();if(e.target.id==='oname'||e.target.id==='ocode'){const c=(document.getElementById('ocode')||{}).value;c?join():create();}});
document.addEventListener('change',e=>{if(e.target.id==='orng'&&H&&H.ph==='lobby'){H.cfg.n=Math.max(10,Math.min(30,+e.target.value||10));hostBroadcast();}});
(function(){const m=/[?&]tv=([A-Za-z0-9]{5})/.exec(location.search);if(m)setTimeout(()=>tvCode(m[1]),400);})();
return {open,leave,joinCode,debug:()=>({S,H,room})};
}

;
// @ts-nocheck
