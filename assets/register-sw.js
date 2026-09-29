/* Open forms are never reloaded automatically. A refresh requires a button press. */
(()=>{'use strict';
 if(!('serviceWorker' in navigator))return;
 let reloading=false,registration=null;
 const hadController=Boolean(navigator.serviceWorker.controller);
 function promptUpdate(reg){
  if(document.getElementById('site-update'))return;
  const box=document.createElement('aside');box.id='site-update';box.className='update-message';box.setAttribute('aria-label','자료집 업데이트');
  const text=document.createElement('p');text.textContent='새 자료집이 준비되었습니다. 작성 중인 기록을 저장한 뒤 새로고침해 주세요.';
  const yes=document.createElement('button');yes.type='button';yes.textContent='새 자료로 열기';
  const later=document.createElement('button');later.type='button';later.textContent='나중에';
  yes.addEventListener('click',()=>{if(reg?.waiting){reloading=true;reg.waiting.postMessage({type:'ACTIVATE_UPDATE'})}else location.reload()});
  later.addEventListener('click',()=>box.remove());box.append(text,yes,later);document.body.append(box);
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)location.reload();else if(hadController)promptUpdate(registration)});
 window.addEventListener('load',async()=>{
  const status=document.getElementById('offline-status');
  try{
   const reg=registration=await navigator.serviceWorker.register('./sw.js');if(reg.waiting)promptUpdate(reg);
   reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&hadController)promptUpdate(reg)})});
   navigator.serviceWorker.ready.then(async()=>{
    try{const cache=await caches.open('pohang-history-walk-v18-editorial-20260930');const all=await Promise.all(['guide-a.html','guide-b.html','guide-c.html','assets/editorial.css','assets/editorial.js'].map(p=>cache.match(new URL(p,reg.scope))));if(status)status.textContent=all.every(Boolean)?'A·B·C 요록 오프라인 저장됨':'기본 자료를 저장하는 중입니다.'}catch{if(status)status.textContent='오프라인 저장 상태를 확인하지 못했습니다.'}
   });
  }catch{if(status)status.textContent='오프라인 저장을 사용할 수 없습니다. 연결된 상태에서 읽어 주세요.'}
 });
})();
