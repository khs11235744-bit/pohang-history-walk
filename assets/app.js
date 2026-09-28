(()=> {
 const D=window.FIELDTRIP;
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 const gmaps=(lat,lon,name)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(lat+','+lon+' '+name);
 const naver=name=>'https://map.naver.com/p/search/'+encodeURIComponent(name);
 const kakao=name=>'https://map.kakao.com/?q='+encodeURIComponent(name);
 function routeHTML(stops=D.stops){
   return stops.map(s=>`<div class="route-item">
    <div class="time">${s.time}</div><div><h3>${s.name}</h3><p>${s.short||s.teaser||''}</p></div><div class="stopno">${s.no}</div>
   </div>`).join('');
 }
 function links(s){return `<div class="map-links">
   <a target="_blank" rel="noopener" href="${gmaps(s.lat,s.lon,s.name)}">좌표 열기</a>
   <a target="_blank" rel="noopener" href="${naver(s.name+' '+s.address)}">네이버지도</a>
   <a target="_blank" rel="noopener" href="${kakao(s.name+' '+s.address)}">카카오맵</a>
 </div>`}
 function studentStops(){
   return D.stops.filter(s=>!['school','school-back'].includes(s.id)).map(s=>`<article class="stop" id="${s.id}">
    <div class="stop-head"><div class="stop-num">${s.no}</div><div><h2>${s.name}</h2><div class="address">${s.address}</div><div class="coord">${s.lat.toFixed(6)}, ${s.lon.toFixed(6)} · ${s.verify}</div>${links(s)}</div></div>
    <div class="stop-body"><div>${s.historyImage?`<figure class="stop-photo"><img loading="lazy" src="${s.historyImage}" alt="${s.historyCaption||s.name}"><figcaption>${s.historyCaption||'역사 자료'}</figcaption></figure>`:''}<p class="lead">${s.teaser}</p><p>${s.abstract||''}</p></div><aside class="mission"><b>현장 미션</b><p>${s.mission||'다음 지점으로 이동하기 전, 가장 기억에 남는 장면을 한 줄로 기록한다.'}</p><a href="essays.html#${s.id}">이 장소의 3분 발표문 읽기 →</a>${s.historyImage?'<br><a href="archive.html">옛 지도·사진 더 보기 →</a>':''}</aside></div>
   </article>`).join('');
 }
 function essays(){
   return D.stops.filter(s=>s.essay).map(s=>`<article class="stop essay" id="${s.id}">
    <div class="stop-head"><div class="stop-num">${s.no}</div><div><h2>${s.essayTitle}</h2><div class="address">${s.name} · ${s.address}</div></div></div>
    <div class="abstract"><b>발표 논지.</b> ${s.abstract}</div>
    ${s.essay.map((p,i)=>`<p>${p}</p>`).join('')}
    <h3>발표 뒤 던질 질문</h3><p>${s.mission}</p>
    <div class="source-note"><b>자료 바탕:</b> ${s.sources.join(' · ')}. 본문은 현장 발표를 위해 새로 구성한 요약문이며, 식민지기 일본인 자료는 서술자의 위치와 편향을 함께 검토한다.</div>
   </article>`).join('');
 }
 function teacherRows(){
   return D.stops.map(s=>`<tr><td>${s.no}</td><td><b>${s.name}</b><br>${s.address}</td><td>${s.lat.toFixed(6)}<br>${s.lon.toFixed(6)}</td><td><span class="status ok">확인</span><br>${s.verify}</td><td>${s.time}</td></tr>`).join('');
 }
 function initMap(elId,stops=D.stops){
   const el=document.getElementById(elId); if(!el || !window.L) return;
   const map=L.map(el,{scrollWheelZoom:false}).setView([36.055,129.365],12);
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
   const pts=[];
   stops.forEach(s=>{
     if(typeof s.lat!=='number')return;
     const m=L.marker([s.lat,s.lon]).addTo(map).bindPopup(`<b>${s.no}. ${s.name}</b><br>${s.address}<br><a target="_blank" href="${gmaps(s.lat,s.lon,s.name)}">좌표 열기</a>`);
     pts.push([s.lat,s.lon]);
   });
   if(pts.length>1){L.polyline(pts,{color:'#8b3529',weight:3,opacity:.75,dashArray:'7 6'}).addTo(map);map.fitBounds(pts,{padding:[28,28]});}
 }
 function triplog(){
   const form=q('#triplog-form'); if(!form)return;
   const ids=['fact','change','question','sentence'];
   ids.forEach(id=>{const el=q('#'+id); el.value=localStorage.getItem('ph-'+id)||''; el.addEventListener('input',()=>localStorage.setItem('ph-'+id,el.value));});
   q('#save-note')?.addEventListener('click',()=>{const msg=q('#save-msg');msg.textContent='이 기기에 임시 저장했습니다.';setTimeout(()=>msg.textContent='',2500)});
   q('#export-note')?.addEventListener('click',()=>{
     const txt='2026 포항고 인문학 역사기행 — 나의 답사기\n\n'+ids.map(id=>q('label[for="'+id+'"]').innerText+'\n'+q('#'+id).value).join('\n\n');
     const blob=new Blob([txt],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='포항고_인문학기행_나의답사기.txt';a.click();URL.revokeObjectURL(a.href);
   });
 }
 document.addEventListener('DOMContentLoaded',()=>{
   q('[data-route]') && (q('[data-route]').innerHTML=routeHTML());
   q('[data-student-stops]') && (q('[data-student-stops]').innerHTML=studentStops());
   q('[data-essays]') && (q('[data-essays]').innerHTML=essays());
   q('[data-teacher-rows]') && (q('[data-teacher-rows]').innerHTML=teacherRows());
   initMap('route-map');
   triplog();
   qa('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
 });
 window.FIELDTRIP_UTIL={initMap,routeHTML,links};
})();