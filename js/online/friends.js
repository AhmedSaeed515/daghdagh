// Friends (real accounts, anonymous sign-in) on Supabase. Public URL + publishable key only; access is enforced by row level security.
(function(){
const URL_='https://lfvsfrfpevrjmspjaycc.supabase.co',KEY='sb_publishable_opPmE74Sx_Mk23SyFGjz6g__Epa7UKo',SK='lo3ba_sb';
let sent={},SES=null,ME=null,FR=[],INV=[],busy=false,msg='',poll=null,seen={};
try{SES=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){}
const E=s=>(typeof esc==='function'?esc(s):String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])));
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(SES))}catch(e){}};
async function raw(path,o={}){const h={apikey:KEY,'Content-Type':'application/json'};if(o.tok)h.Authorization='Bearer '+o.tok;if(o.prefer)h.Prefer=o.prefer;
 const r=await fetch(URL_+path,{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined});const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
 if(!r.ok){const er=new Error((j&&(j.message||j.msg||j.error_description))||('HTTP '+r.status));er.status=r.status;throw er;}return j;}
let sp=null;
function session(){if(!sp)sp=session1().finally(()=>{sp=null});return sp;}
async function session1(){
 if(SES&&SES.expires_at&&SES.expires_at-60>Date.now()/1000)return SES;
 if(SES&&SES.refresh_token){
  try{const j=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:SES.refresh_token}});SES=j;sv();return SES;}
  catch(e){
   try{const o=JSON.parse(localStorage.getItem(SK)||'null');if(o&&o.refresh_token&&o.refresh_token!==SES.refresh_token){SES=o;if(SES.expires_at-60>Date.now()/1000)return SES;}}catch(x){}
   throw e;}}
 const j=await raw('/auth/v1/signup',{method:'POST',body:{}});SES=j;sv();return SES;}
async function api(path,o={}){const s=await session();return raw('/rest/v1'+path,Object.assign({tok:s.access_token},o));}
async function myProfile(){
 const s=await session(),uid=s.user.id;const nm=String((localStorage.getItem('lo3ba_myname')||'').replace(/^"|"$/g,'')||'لاعب').slice(0,24);
 let av='';try{av=JSON.parse(localStorage.getItem('lo3ba_myav')||'""')}catch(e){}
 let nm2=nm;try{nm2=String(JSON.parse(localStorage.getItem('lo3ba_myname')||'""')||'لاعب').slice(0,24)}catch(e){}
 const rows=await api('/profiles?id=eq.'+uid+'&select=*');
 if(!rows.length){const r=await api('/profiles',{method:'POST',prefer:'return=representation',body:{id:uid,name:nm2,avatar:av||'😀'}});return r[0];}
 const p=rows[0];if(p.name!==nm2||(av&&p.avatar!==av)){const r=await api('/profiles?id=eq.'+uid,{method:'PATCH',prefer:'return=representation',body:{name:nm2,avatar:av||p.avatar}});return r[0]||p;}
 return p;}
async function load(){
 ME=await myProfile();
 const fs=await api('/friendships?select=*&order=created_at.desc');
 const ids=[...new Set(fs.map(f=>f.a===ME.id?f.b:f.a))];
 let ps={};if(ids.length){const rows=await api('/profiles?id=in.('+ids.join(',')+')&select=id,name,avatar,code');rows.forEach(p=>ps[p.id]=p);}
 FR=fs.map(f=>{const o=f.a===ME.id?f.b:f.a;return {id:f.id,status:f.status,mine:f.a===ME.id,other:ps[o]||null,oid:o};});
 INV=await api('/invites?select=*&to_id=eq.'+ME.id+'&order=created_at.desc&limit=5');
 INV=INV.filter(i=>Date.now()-new Date(i.created_at).getTime()<30*60000);}
function av(a,c){try{if(window.avh&&window.AVSVG)return window.avh(a,c||'avl');}catch(e){}return '<span class="av avl" style="display:inline-block;width:46px;height:46px"></span>';}
function curRoom(){try{const r=ONL.debug().room;return r&&r.code?r.code:''}catch(e){return ''}}
function view(){
 const reqs=FR.filter(f=>f.status==='pending'&&!f.mine),out=FR.filter(f=>f.status==='pending'&&f.mine),fl=FR.filter(f=>f.status==='accepted');
 const rm=curRoom();
 const row=(f,btns)=>`<div class="rk"><span class="who" style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px">${f.other?av(f.other.avatar)+E(f.other.name):'<span style="color:var(--mut)">طلب مبعوت</span>'}</span><span style="display:flex;gap:6px">${btns}</span></div>`;
 shell(`<div class="panel center"><div class="frico"><svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.8 0 4.5 1.9 4.5 5"/></svg></div><h2>صحابي</h2>
  ${ME?`<p>كودك: <b style="font-size:26px;letter-spacing:3px;direction:ltr;display:inline-block" id="mycode">${E(ME.code)}</b></p><p style="color:var(--mut);font-size:13px">ادي الكود ده لصاحبك يضيفك.</p>`:'<p>بحمّل...</p>'}
  ${msg?`<p style="color:var(--acc)">${E(msg)}</p>`:''}
  <input id="frcode" maxlength="6" placeholder="كود صاحبك" autocomplete="off" style="direction:ltr;text-align:center;text-transform:uppercase"><button class="btn big" data-fr="add">ضيف صاحب</button></div>
  ${INV.length?`<div class="sbox"><h3>دعوات</h3>${INV.map(i=>{const f=FR.find(x=>x.oid===i.from_id);return `<div class="rk"><span class="who">${f&&f.other?E(f.other.name):'صاحب'} داعيك</span><span><button class="btn" data-fr="joinr" data-v="${E(i.room)}" data-i="${i.id}">ادخل</button> <button class="btn ghost" data-fr="dismiss" data-i="${i.id}">×</button></span></div>`}).join('')}</div>`:''}
  ${reqs.length?`<div class="sbox"><h3>طلبات صداقة</h3>${reqs.map(f=>row(f,`<button class="btn" data-fr="acc" data-v="${f.id}">قبول</button><button class="btn ghost" data-fr="rej" data-v="${f.id}">رفض</button>`)).join('')}</div>`:''}
  <div class="sbox"><h3>أصحابي (${fl.length})</h3>${fl.length?fl.map(f=>row(f,`${rm?`<button class="btn" data-fr="inv" data-v="${f.oid}">ادعيه</button>`:''}<button class="btn ghost" data-fr="del" data-v="${f.id}">حذف</button>`)).join(''):'<p style="color:var(--mut);font-size:13px">لسه مفيش أصحاب. ضيف حد بالكود بتاعه.</p>'}${rm?'':'<p style="color:var(--mut);font-size:12px">افتح غرفة أونلاين الأول عشان تدعي أصحابك لها.</p>'}</div>
  ${out.length?`<p style="color:var(--mut);font-size:13px">طلبات مبعوتة مستنية: ${out.length}</p>`:''}`,{title:'صحابي',nav:true,back:false});}
async function open(){
 msg='';if(typeof clearTimer==='function')clearTimer();try{window.setTabK&&setTabK('friends')}catch(e){}view();
 try{await load();}catch(e){msg='حصلت مشكلة في الاتصال: '+e.message;}
 view();startPoll();}
async function act(t){
 const k=t.dataset.fr,v=t.dataset.v;if(busy)return;busy=true;msg='';
 try{
  if(k==='add'){const c=(document.getElementById('frcode')||{}).value||'';if(c.trim().length<4){msg='اكتب كود صاحبك';}else{const r=await api('/rpc/add_friend',{method:'POST',body:{c:c.trim()}});msg={sent:'اتبعت الطلب ✓',notfound:'الكود ده مش موجود',self:'ده كودك انت 🙂',exists:'انتو أصحاب أو فيه طلب قبل كده'}[r]||r;}}
  else if(k==='acc'||k==='rej')await api('/rpc/respond_friend',{method:'POST',body:{fid:+v,accept:k==='acc'}});
  else if(k==='del')await api('/friendships?id=eq.'+v,{method:'DELETE'});
  else if(k==='inv'){const rc=curRoom();if(rc){await api('/invites',{method:'POST',body:{from_id:ME.id,to_id:v,room:rc}});msg='اتبعتله الدعوة ✓';sent[v]=1;t.textContent='اتبعتت ✓';t.disabled=true;busy=false;if(document.getElementById('frinv'))return;}}
  else if(k==='dismiss'){await api('/invites?id=eq.'+t.dataset.i,{method:'DELETE'});}
  else if(k==='joinr'){await api('/invites?id=eq.'+t.dataset.i,{method:'DELETE'}).catch(()=>{});busy=false;return ONL.joinCode(v);}
  await load();
 }catch(e){msg='حصلت مشكلة: '+e.message;}
 busy=false;view();}
function banner(){
 let b=document.getElementById('invbn');
 const i=INV.find(x=>!seen[x.id]);
 if(!i){if(b)b.remove();return;}
 const f=FR.find(x=>x.oid===i.from_id);
 if(!b){b=document.createElement('div');b.id='invbn';b.style.cssText='position:fixed;top:8px;left:8px;right:8px;z-index:99;background:var(--ink,#222);color:#fff;border-radius:12px;padding:10px 12px;display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:14px';document.body.appendChild(b);}
 b.innerHTML=`<span>${E(f&&f.other?f.other.name:'صاحب')} داعيك للعب</span><span><button class="btn" id="invgo">ادخل</button> <button class="btn ghost" id="invno">×</button></span>`;
 b.querySelector('#invgo').onclick=()=>{seen[i.id]=1;b.remove();api('/invites?id=eq.'+i.id,{method:'DELETE'}).catch(()=>{});ONL.joinCode(i.room);};
 b.querySelector('#invno').onclick=()=>{seen[i.id]=1;b.remove();};}
function startPoll(){if(poll)return;poll=setInterval(async()=>{if(busy||document.hidden)return;try{await load();banner();if(document.getElementById('mycode')&&document.getElementById('frcode')&&document.activeElement!==document.getElementById('frcode'))view();}catch(e){}},6000);}
async function sync(){try{await load();banner();startPoll();}catch(e){}}
function fill(){const b=document.getElementById('frinv');if(!b)return;
 const go=()=>{const fl=FR.filter(f=>f.status==='accepted'&&f.other);b.innerHTML=fl.length?fl.map(f=>`<div class="rk"><span class="who" style="display:flex;align-items:center;gap:10px;font-weight:800">${av(f.other.avatar)}${E(f.other.name)}</span><button class="btn sm" data-fr="inv" data-v="${f.oid}" ${sent[f.oid]?'disabled':''}>${sent[f.oid]?'اتبعتت ✓':'ادعيه'}</button></div>`).join(''):'<p style="color:var(--mut);font-size:13px">لسه مفيش أصحاب. ضيفهم من تاب صحابي.</p>';};
 if(ME)go();else{b.textContent='بحمّل...';load().then(go).catch(()=>{b.textContent='مش قادر أحمّل الأصحاب';});}}
function box(){return '<h3>ادعي من أصحابك</h3><div class="rank" id="frinv"></div>';}
window.SBX={session:()=>session(),raw};
window.FR={open,act,sync,fill,box,boot:()=>{let n='';try{n=JSON.parse(localStorage.getItem('lo3ba_myname')||'""')}catch(e){}if(SES||n){sync();}}};
})();
setTimeout(()=>window.FR&&FR.boot(),2000);
