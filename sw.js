const CACHE='pohang-history-walk-v2';
const CORE=[
 './','./index.html','./student.html','./essays.html','./archive.html','./teams.html','./teacher.html','./improvements.html',
 './assets/styles.css','./assets/app.js','./assets/harbor.svg','./assets/waterworks.svg','./assets/memorial.svg','./assets/museum.svg',
 './data/stops.js','./data/improvements.js',
 './assets/history/map-1917.jpg','./assets/history/map-1925.jpg','./assets/history/map-1936.jpg','./assets/history/map-current.png',
 './assets/history/street-honcho-1935.jpg','./assets/history/market-old.jpg','./assets/history/yeongil-bridge-1935.jpg','./assets/history/port-1935.jpg','./assets/history/harbor-boats-old.jpg'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match('./student.html'))));
});