/* Cache only this project. Navigation prefers the network; readers have offline copies. */
const CACHE='pohang-history-walk-v18-editorial-20260930';
const CORE=[
 './assets/register-sw.js','./assets/editorial.css','./assets/editorial.js','./editorial-review.html',
 './guide-a.html','./guide-b.html','./guide-c.html','./assets/depth-guides.css','./assets/depth-guides.js','./data/depth-guides.js','./assets/depth/a-chapter-5-map-2.jpg','./assets/depth/a-chapter-5-map-1.jpg',
 './','./index.html','./student.html','./learning.html','./survey.html','./teacher-evidence.html','./essays.html','./archive.html','./newspaper.html','./culture.html','./film.html','./budget.html','./plans.html','./plan-a.html','./plan-b.html','./plan-c.html','./teams.html','./teacher.html','./bus.html','./recon.html','./improvements.html',
 './assets/styles.css','./assets/app.js','./assets/evidence-analyzer.js','./assets/teacher-ops.js','./assets/recon.js','./assets/harbor.svg','./assets/coast.svg','./assets/lighthouse.svg','./assets/independence.svg','./assets/hyanggyo.svg','./assets/waterworks.svg','./assets/memorial.svg','./assets/museum.svg','./assets/fortress.svg','./assets/exile.svg','./assets/guryongpo-house.svg','./assets/ara.svg','./assets/gyeongju-tomb.svg','./assets/gyeongju-excavation.svg','./assets/gyeongju-gyochon.svg','./assets/gyeongju-museum.svg',
 './data/stops.js','./data/route-notes.js','./data/curriculum-links.js','./data/field-presentations.js','./data/fieldtrip-ops.js','./data/outcomes.js','./data/film.js','./data/budget.js','./data/plans.js','./data/routes.js','./data/route-essays.js','./data/galleries.js','./data/improvements.js','./assets/route-plan.js','./assets/lighthouse.svg','./assets/coast.svg',
 './assets/history/map-1917.jpg','./assets/history/map-1925.jpg','./assets/history/map-1936.jpg','./assets/history/map-current.png',
 './assets/history/street-honcho-1935.jpg','./assets/history/market-old.jpg','./assets/history/yeongil-bridge-1935.jpg','./assets/history/port-1935.jpg','./assets/history/harbor-boats-old.jpg',
 './assets/photos/homigot.jpg','./assets/photos/yeongil-museum.jpg','./assets/photos/student-memorial.png','./assets/photos/daereungwon.jpg','./assets/photos/jjoksaem.jpg','./assets/photos/gyochon.jpg','./assets/photos/gyeongju-museum.jpg','./assets/qr/history-trip-survey.png','./assets/qr/history-trip-pre-record.png','./assets/qr/history-trip-post-record.png'
];

const scopeURL=new URL(self.registration.scope);
function inScope(url){return url.origin===scopeURL.origin && url.pathname.startsWith(scopeURL.pathname)}
async function save(cache,request,response){
 if(response.ok && response.type!=='opaque')await cache.put(request,response.clone());
 return response;
}
self.addEventListener('install',event=>{
 // Activate the new cache without reloading open forms. New navigation gets fresh pages.
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...new Set(CORE)])).then(()=>self.skipWaiting()));
});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pohang-history-walk-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||!inScope(url))return;
 if(request.mode === 'navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),5000);
   try{return await save(cache,request,await fetch(request,{signal:controller.signal}))}
   catch{
    const hit=await cache.match(request,{ignoreSearch:true});if(hit)return hit;
    const home=await cache.match(new URL('index.html',scopeURL));
    return home||new Response('연결되지 않았고 저장된 페이지도 없습니다. 인터넷 연결 후 다시 열어 주세요.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }finally{clearTimeout(timer)}
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),hit=await cache.match(request);if(hit)return hit;
  try{return await save(cache,request,await fetch(request))}catch{return Response.error()}
 })());
});
