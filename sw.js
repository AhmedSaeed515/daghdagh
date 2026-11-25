const CACHE='falta-v22';
const ASSETS=['./','./index.html','./theme.css?v=15','./avatars.js?v=13','./qx.js?v=13','./flags1.js?v=13','./flags2.js?v=13','./flags3.js?v=13','./qb2a.js?v=13','./qb3a.js?v=13','./qb4a.js?v=13','./qb5a.js?v=13','./qb1a.js?v=13','./qb1b.js?v=13','./qb1c.js?v=13','./manifest.json','./icon.svg','./logo.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const media=['image','font','style'].includes(e.request.destination);
  if(url.origin!==location.origin&&!media)return; // let ntfy etc. go to network
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>hit)));
});
