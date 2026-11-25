const CACHE='daghdagh-v37';
const ASSETS=['./','./index.html','./css/base.css?v=24','./css/theme.css?v=24','./js/data/flags1.js?v=24','./js/data/flags2.js?v=24','./js/data/flags3.js?v=24','./js/data/avatars.js?v=24','./js/data/category-groups.js?v=24','./js/data/qx.js?v=24','./js/data/questions/qb2a.js?v=24','./js/data/questions/qb3a.js?v=24','./js/data/questions/qb4a.js?v=24','./js/data/questions/qb5a.js?v=24','./js/data/questions/qb6a.js?v=24','./js/data/questions/qb1a.js?v=24','./js/data/questions/qb1b.js?v=24','./js/data/questions/qb1c.js?v=24','./js/data/extra-categories.js?v=24','./js/data/core-questions.js?v=24','./js/lib/util.js?v=24','./js/lib/store.js?v=24','./js/lib/sound.js?v=24','./js/online/online.js?v=24','./js/app/app.js?v=24','./js/main.js?v=24','./manifest.json','./assets/icon.svg','./assets/logo.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const media=['image','font','style'].includes(e.request.destination);
  if(url.origin!==location.origin&&!media)return; // let ntfy etc. go to network
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>hit)));
});
