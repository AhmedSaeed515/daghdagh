const CACHE='daghdagh-v47';
const ASSETS=['./','./index.html','./css/base.css?v=34','./css/theme.css?v=34','./js/data/flags1.js?v=34','./js/data/flags2.js?v=34','./js/data/flags3.js?v=34','./js/data/avatars.js?v=34','./js/data/category-groups.js?v=34','./js/data/qx.js?v=34','./js/data/questions/qb2a.js?v=34','./js/data/questions/qb3a.js?v=34','./js/data/questions/qb4a.js?v=34','./js/data/questions/qb5a.js?v=34','./js/data/questions/qb6a.js?v=34','./js/data/questions/qb7a.js?v=34','./js/data/questions/qb8a.js?v=34','./js/data/questions/qb9a.js?v=34','./js/data/questions/qb10a.js?v=34','./js/data/questions/qb11a.js?v=34','./js/data/questions/qb12a.js?v=34','./js/data/questions/qb1a.js?v=34','./js/data/questions/qb1b.js?v=34','./js/data/questions/qb1c.js?v=34','./js/data/extra-categories.js?v=34','./js/data/core-questions.js?v=34','./js/lib/util.js?v=34','./js/lib/store.js?v=34','./js/lib/sound.js?v=34','./js/online/online.js?v=34','./js/ui/logo.js?v=34','./js/game/question-picker.js?v=34','./js/game/report.js?v=34','./js/app/app.js?v=34','./js/main.js?v=34','./manifest.json','./assets/icon.svg','./assets/logo.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const media=['image','font','style'].includes(e.request.destination);
  if(url.origin!==location.origin&&!media)return; // let ntfy etc. go to network
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>hit)));
});
