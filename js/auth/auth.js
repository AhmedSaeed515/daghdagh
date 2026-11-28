/* Optional account sign-in (Firebase Auth, free Spark plan). Guests keep working with the device id. */
(function(){
'use strict';
var CFG={apiKey:"AIzaSyA7XJvp5sTyrhHlyorOZfdARPweNBo3KTE",authDomain:"daghdagh-falta.firebaseapp.com",projectId:"daghdagh-falta",storageBucket:"daghdagh-falta.firebasestorage.app",messagingSenderId:"959964818874",appId:"1:959964818874:web:9966fb4f2c70e172960183"};
var V='10.12.2',BASE='https://www.gstatic.com/firebasejs/'+V+'/';
var A=null,user=null,loading=null,readyRes,ready=new Promise(function(r){readyRes=r;});
var AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function jget(k){try{return JSON.parse(ls('lo3ba_'+k)||'""')||'';}catch(e){return '';}}
function jset(k,v){ls('lo3ba_'+k,JSON.stringify(v));}
function pidOf(uid){var h1=2166136261,h2=5381,i,c;for(i=0;i<uid.length;i++){c=uid.charCodeAt(i);h1=Math.imul(h1^c,16777619)>>>0;h2=(Math.imul(h2,33)+c)>>>0;}var s='';for(i=0;i<4;i++){s+=AL[(h1>>>(i*8))&31];}for(i=0;i<4;i++){s+=AL[(h2>>>(i*8))&31];}return s;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function loadScript(u){return new Promise(function(res,rej){var s=document.createElement('script');s.src=u;s.onload=res;s.onerror=function(){rej(new Error('load'));};document.head.appendChild(s);});}
function load(){
  if(loading)return loading;
  loading=loadScript(BASE+'firebase-app-compat.js').then(function(){return loadScript(BASE+'firebase-auth-compat.js');}).then(function(){
    firebase.initializeApp(CFG);A=firebase.auth();A.languageCode='ar';
    A.onAuthStateChanged(function(u){user=u;if(u){adopt(u);}readyRes(u);});
    return A.getRedirectResult().catch(function(){});
  }).catch(function(){loading=null;readyRes(null);});
  return loading;
}
function adopt(u){
  ls('lo3ba_pid',pidOf(u.uid));
  var nm=u.displayName||'',ph=u.photoURL||'',av=/^av:/.test(ph)?ph.slice(3):'';
  var cn=jget('myname'),ca=jget('myav'),ch=false;
  if(nm&&nm!==cn){jset('myname',nm.slice(0,14));ch=true;}
  if(av&&av!==ca){jset('myav',av);ch=true;}
  if((!nm&&cn)||(!av&&ca))push();
  if(ch&&!ls('lo3ba_adopted_'+u.uid)){ls('lo3ba_adopted_'+u.uid,'1');setTimeout(function(){location.reload();},50);}
  else ls('lo3ba_adopted_'+u.uid,'1');
}
function push(){
  if(!user)return Promise.resolve();
  var nm=String(jget('myname')||'').slice(0,14),av=jget('myav')||'';
  if(nm===(user.displayName||'')&&('av:'+av)===(user.photoURL||''))return Promise.resolve();
  return user.updateProfile({displayName:nm||null,photoURL:av?('av:'+av):null}).catch(function(){});
}
var ERR={'auth/invalid-email':'الإيميل مش مظبوط','auth/missing-password':'اكتب الباسورد','auth/weak-password':'الباسورد ضعيف، خليه 6 حروف على الأقل','auth/email-already-in-use':'الإيميل ده عليه حساب، جرّب تسجيل الدخول','auth/invalid-credential':'الإيميل أو الباسورد غلط','auth/wrong-password':'الإيميل أو الباسورد غلط','auth/user-not-found':'مفيش حساب بالإيميل ده','auth/too-many-requests':'محاولات كتير، استنى شوية وجرّب','auth/network-request-failed':'مفيش نت، جرّب تاني','auth/popup-closed-by-user':'اتقفلت نافذة جوجل','auth/cancelled-popup-request':'','auth/user-disabled':'الحساب ده متوقف'};
function msg(e){return (e&&ERR[e.code]!==undefined?ERR[e.code]:'حصلت مشكلة، جرّب تاني')||'';}
function say(t,ok){var e=document.getElementById('lgaMsg');if(e){e.textContent=t;e.className='lga-msg'+(ok?' ok':'');}}
function busy(b){var m=document.getElementById('lga');if(m)m.classList.toggle('busy',!!b);}
function close(){var m=document.getElementById('lga');if(m)m.remove();}
function open(mode){
  close();mode=mode||'in';
  var m=document.createElement('div');m.id='lga';m.className='lga';
  m.innerHTML='<div class="lga-box" role="dialog" aria-modal="true"><button class="lga-x" data-lga="close" aria-label="قفل">×</button><h3>'+(mode==='up'?'حساب جديد':'تسجيل الدخول')+'</h3>'
  +'<button class="btn big lga-g" data-lga="google">ادخل بحساب جوجل</button><div class="lga-or">أو بالإيميل</div>'
  +'<input id="lgaE" type="email" inputmode="email" autocomplete="email" placeholder="الإيميل" dir="ltr">'
  +'<input id="lgaP" type="password" autocomplete="'+(mode==='up'?'new-password':'current-password')+'" placeholder="الباسورد" dir="ltr">'
  +'<div id="lgaMsg" class="lga-msg"></div>'
  +'<button class="btn" data-lga="'+(mode==='up'?'signup':'signin')+'">'+(mode==='up'?'اعمل الحساب':'دخول')+'</button>'
  +'<div class="lga-l"><button class="link" data-lga="'+(mode==='up'?'tin':'tup')+'">'+(mode==='up'?'عندي حساب':'مفيش حساب؟ اعمل واحد')+'</button>'+(mode==='up'?'':'<button class="link" data-lga="reset">نسيت الباسورد</button>')+'</div></div>';
  document.body.appendChild(m);
  load();
}
function vals(){var e=document.getElementById('lgaE'),p=document.getElementById('lgaP');return {e:e?e.value.trim():'',p:p?p.value:''};}
function run(fn){busy(1);say('');load().then(function(){if(!A)throw {code:'auth/network-request-failed'};return fn();}).then(function(r){busy(0);if(r==='stay')return;done();},function(e){busy(0);say(msg(e));});}
function done(){close();ready.then(function(){setTimeout(function(){location.reload();},300);});}
function google(){
  run(function(){var p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
    return A.signInWithPopup(p).catch(function(e){if(e&&(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')){return A.signInWithRedirect(p).then(function(){return 'stay';});}throw e;});});
}
document.addEventListener('click',function(ev){
  var t=ev.target.closest&&ev.target.closest('[data-lga]');if(!t)return;
  ev.preventDefault();ev.stopPropagation();
  var a=t.dataset.lga,v;
  if(a==='open')return open('in');
  if(a==='close')return close();
  if(a==='google')return google();
  if(a==='tup')return open('up');if(a==='tin')return open('in');
  if(a==='signin'){v=vals();if(!v.e||!v.p)return say('اكتب الإيميل والباسورد');return run(function(){return A.signInWithEmailAndPassword(v.e,v.p);});}
  if(a==='signup'){v=vals();if(!v.e||!v.p)return say('اكتب الإيميل والباسورد');return run(function(){return A.createUserWithEmailAndPassword(v.e,v.p).then(function(c){user=c.user;return push();});});}
  if(a==='reset'){v=vals();if(!v.e)return say('اكتب إيميلك الأول');busy(1);load().then(function(){return A.sendPasswordResetEmail(v.e);}).then(function(){busy(0);say('بعتنالك رابط تغيير الباسورد على الإيميل',1);},function(e){busy(0);say(msg(e));});return;}
  if(a==='out'){load().then(function(){return A?A.signOut():null;}).then(function(){ls('lo3ba_pid',null);ls('lo3ba_acct',null);location.reload();});return;}
},true);
function card(){
  var u=user,cached=ls('lo3ba_acct');
  if(u||cached){var em=u?u.email:cached;return '<div class="lga-card"><div><b>حسابك</b><small dir="ltr">'+esc(em||'')+'</small><small>الاسم والأفاتار وكرسيك في اللعب محفوظين على حسابك.</small></div><button class="btn sm ghost" data-lga="out">خروج</button></div>';}
  return '<div class="lga-card"><div><b>سجّل دخول</b><small>احفظ اسمك وأفاتارك وكرسيك في اللعب حتى لو غيّرت الموبايل.</small></div><button class="btn sm" data-lga="open">دخول</button></div>';
}
window.LGAuth={card:card,push:push,ready:function(){return ready;},user:function(){return user;},open:open,pidOf:pidOf};
ls('lo3ba_acct',ls('lo3ba_acct'));
window.addEventListener('load',function(){setTimeout(function(){load().then(function(){ready.then(function(u){ls('lo3ba_acct',u?(u.email||'حساب'):null);});});},800);});
})();
