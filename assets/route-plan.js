(()=> {
 const P=window.ROUTE_PLANS[window.PLAN_CODE], E=(window.ROUTE_ESSAYS||{})[window.PLAN_CODE]||{}, N=(window.ROUTE_NOTES||{})[window.PLAN_CODE]||{}, C=(window.ROUTE_CURRICULUM||{})[window.PLAN_CODE]||{}, PR=(window.ROUTE_PRESENTATIONS||{})[window.PLAN_CODE]||{}, G=(window.ROUTE_GALLERIES||{})[window.PLAN_CODE]||[], FO=((window.FIELDTRIP_OPS||{}).food||{})[window.PLAN_CODE]||P.food;
 const OUTDOOR={
  A:['나루끝·북부시장','동빈내항','수도산·덕수공원'],
  B:['호미곶 해맞이광장·해안','수도산·덕수공원'],
  C:['대릉원·천마총','경주교촌마을·최부자댁']
 };
 let planMap=null;
 const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 const maps=s=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.lat+','+s.lon+' '+s.name);
 const phoneLink=value=>{const text=String(value||'');const match=text.match(/(?:0\d{1,2})[- .]?\d{3,4}[- .]?\d{4}/);return match?'<a href="tel:'+match[0].replace(/[^0-9]/g,'')+'">'+text+'</a>':text;};
 const isOutdoor=s=>(OUTDOOR[P.code]||[]).includes(s.name);
 const storeKey=(kind,suffix='')=>'ph-'+kind+'-'+P.code+(suffix?'-'+suffix:'');
 function distanceM(a,b,c,d){
  const R=6371000, toRad=x=>x*Math.PI/180;
  const dLat=toRad(c-a), dLon=toRad(d-b);
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
 }
 function fieldBar(){
  const hero=q('.page-hero'); if(!hero || q('#field-tools'))return;
  hero.insertAdjacentHTML('afterend',`<section class="section compact field-tools" id="field-tools"><div class="container">
   <details><summary>교사용 · 날씨·인원 점검</summary><div class="field-tools-grid"><div><h2>날씨와 현장 점검</h2><p>인원 체크는 이 기기에만 저장됩니다. 날씨를 바꿔도 요록은 계속 읽을 수 있습니다.</p></div>
   <div class="field-controls"><label>운영모드<select id="field-mode"><option value="normal">기본</option><option value="rain">비·강풍</option><option value="heat">폭염</option></select></label><a class="button alt" href="recon.html">사전답사 체크</a></div></div>
   <div id="field-mode-note" class="notice field-note" role="status" hidden></div></details>
  </div></section>`);
 }
 function render(){
  document.title=P.code+'안 '+' · '+P.title+' | 포항고 인문학 역사기행';
  if(q('#plan-code'))q('#plan-code').textContent=P.code+'안';
  q('#plan-title').textContent=P.title;
  q('#plan-tag').textContent=P.tag;
  q('#plan-hero').textContent=P.hero;
  q('#plan-photos').innerHTML=G.map(x=>'<figure><img loading="lazy" src="'+x.src+'" alt="'+x.alt+'"'+(x.fallback?' data-fallback="'+x.fallback+'" onerror="if(this.dataset.fallback){this.onerror=null;this.src=this.dataset.fallback}"':'')+'><figcaption>'+x.cap+'</figcaption></figure>').join('');
  q('#schedule-body').innerHTML=P.schedule.map(r=>'<tr>'+r.map((x,i)=>'<'+(i===0?'th':'td')+'>'+x+'</'+(i===0?'th':'td')+'>').join('')+'</tr>').join('');
  q('#stops').innerHTML=P.stops.map((s,i)=>{
    const essay=E[s.name], note=N[s.name], curriculum=C[s.name], presentation=PR[s.name], prev=P.stops[i-1], next=P.stops[i+1];
    const displayOrder=s.displayOrder||s.n;
    const nav='<div class="field-nav">'+(prev?'<a href="#stop-'+prev.n+'">← '+(prev.displayOrder||prev.n)+' 이전</a>':'<span></span>')+(next?'<a href="#stop-'+next.n+'">'+(next.displayOrder||next.n)+' 다음 →</a>':'<a href="#field-tools">운영모드 ↑</a>')+'</div>';
    const ops='<details class="field-ops"><summary>교사용 현장 체크</summary><div class="field-ops-body"><label class="headcount"><input type="checkbox" data-headcount="'+s.n+'"> 인원점검 완료</label><button type="button" class="button alt locate-btn" data-lat="'+s.lat+'" data-lon="'+s.lon+'">내 위치와 거리 확인</button><span class="geo-status" aria-live="polite"></span></div></details>';
    return '<article class="stop'+(isOutdoor(s)?' is-outdoor':'')+'" id="stop-'+s.n+'"><div class="stop-head"><div class="stop-num">'+displayOrder+'</div><div><h2>'+s.name+'</h2><div class="address">'+s.addr+'</div><div class="coord">'+(s.meta||'출입구와 승하차 위치는 별도 확인')+(s.contact?' · 문의 '+phoneLink(s.contact):'')+'</div><div class="map-links"><a target="_blank" rel="noopener" href="'+maps(s)+'">지도에서 열기</a><a href="#stop-'+s.n+'" title="이 장소 직접 링크">이 장소 바로가기</a></div></div></div>'+
    (s.visitReason?'<p class="visit-reason">'+s.visitReason+'</p>':'')+'<div class="stop-body"><div><h3>관찰할 것</h3><ol>'+s.see.map(x=>'<li>'+x+'</li>').join('')+'</ol><h3>남길 기록</h3><p>'+s.output+'</p></div><aside class="mission"><b>탐구 질문</b><p>'+s.essay+'</p>'+(!presentation&&essay?'<details><summary>3분 발표 자료</summary>'+essay.map(x=>'<p>'+x+'</p>').join('')+'</details>':'')+'</aside></div>'+
    (presentation?'<details class="student-presentation"><summary>3분 발표 자료</summary><div>'+presentation.map(x=>'<p>'+x+'</p>').join('')+'</div></details>':'')+
    ((note||curriculum)?'<div class="notice route-reading"><h3>요록</h3>'+(note?note.paras.map(x=>'<p>'+x+'</p>').join(''):'')+(curriculum?'<p><b>교과연계</b> '+curriculum.subjects.join(' · ')+'</p><p><b>핵심 개념</b> '+curriculum.concepts.join(' · ')+'</p>'+curriculum.overview.map(x=>'<p>'+x+'</p>').join(''):'')+(note&&note.sources&&note.sources.length?'<div class="source-note"><b>확인 자료</b><ul>'+note.sources.map(x=>'<li>'+(x[1]?'<a target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+'</a>':x[0])+'</li>').join('')+'</ul></div>':'')+'</div>':'')+
    (curriculum?'<details class="curriculum-reading"><summary>학습지 · 답사 전후 활동</summary><div><div class="archive-grid"><article class="archive-card"><h3>답사 전</h3><ul>'+curriculum.before.map(x=>'<li>'+x+'</li>').join('')+'</ul></article><article class="archive-card"><h3>현장</h3><ul>'+curriculum.field.map(x=>'<li>'+x+'</li>').join('')+'</ul></article><article class="archive-card"><h3>답사 후</h3><ul>'+curriculum.after.map(x=>'<li>'+x+'</li>').join('')+'</ul></article></div><div class="source-note"><b>수행평가·발표 질문</b><ol>'+curriculum.assessment.map(x=>'<li>'+x+'</li>').join('')+'</ol></div></div></details>':'')+
    ops+nav+'</article>';
  }).join('');
  q('#food').innerHTML=FO.map((f,i)=>'<article class="archive-card"><span class="kicker">후보 '+(i+1)+(f.type?' · '+f.type:'')+'</span><h3>'+f.name+'</h3><p>'+f.addr+'<br>'+phoneLink(f.phone)+'</p><p>'+f.note+'</p></article>').join('');
  q('#culture-title').textContent=P.culture.title;
  q('#culture-time').textContent=P.culture.time;
  q('#culture-steps').innerHTML=P.culture.steps.map((x,i)=>'<div class="route-item"><div class="time">'+String(i+1).padStart(2,'0')+'</div><div><h3>'+x+'</h3></div></div>').join('');
  if(P.culture.extra){q('#culture-extra').innerHTML='<strong>추가 활용</strong>'+P.culture.extra}else q('#culture-extra').remove();
  q('#newspaper').innerHTML=P.newspaper.map((x,i)=>'<article class="archive-card"><span class="kicker">기사 주제 '+(i+1)+'</span><h3>'+x+'</h3></article>').join('');
  q('#record').innerHTML=P.record.map(x=>'<li>'+x+'</li>').join('');
  q('#rain').textContent=P.rain;
  if(P.transportNote){
   const host=q('#schedule-body').closest('table').parentElement;
   const box=document.createElement('div');box.className='route-logistics';
   box.innerHTML='<p class="route-method">'+P.transportNote+'</p><details><summary>승하차·보행과 주변 대체지</summary><div class="logistics-inner"><h3>구간별 운영</h3>'+P.logistics.map(x=>'<p><b>'+x[0]+'</b> '+x[1]+'</p>').join('')+'<h3>다 넣지 않고 골라 바꾸기</h3>'+P.alternatives.map(x=>'<article><h4>'+x[0]+'</h4><p>'+x[1]+'</p><p>'+x[2]+'</p><a href="'+x[3]+'">자료·요록</a></article>').join('')+'<p><a href="route-review.html">동선 검토 전체 보기</a></p></div></details>';
   host.append(box);
  }
  const mapNode=q('#plan-map');if(mapNode){const caption=document.createElement('p');caption.className='route-method';caption.textContent='지도 점은 장소의 대표 위치입니다. 연결선은 방문 순서이며 실제 주행·보행 경로가 아닙니다. 버스 승하차 지점과 출입구는 별도 확인합니다.';mapNode.after(caption);}
  fieldBar();
  bindFieldTools();
  applyFieldMode(storage.get(storeKey('mode'))||'normal',false);
 }
 function initMap(stops=P.stops){
  if(!window.L){const node=q('#plan-map');if(node){node.classList.add('map-empty');node.textContent='지도를 불러오지 못했습니다. 아래 장소의 지도 링크와 주소를 이용하세요.'}return;}
  if(planMap){planMap.remove();planMap=null}
  planMap=L.map('plan-map',{scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(planMap);
  const pts=[];
  stops.forEach(s=>{pts.push([s.lat,s.lon]);L.marker([s.lat,s.lon]).addTo(planMap).bindPopup('<b>'+(s.displayOrder||s.n)+'. '+s.name+'</b><br>'+s.addr)});
  if(pts.length>1){L.polyline(pts,{color:'#8b3529',weight:3,opacity:.8,dashArray:'7 6'}).addTo(planMap);planMap.fitBounds(pts,{padding:[25,25]})}
  else if(pts.length===1){planMap.setView(pts[0],15)}
 }
 function applyFieldMode(mode,persist=true){
  const select=q('#field-mode'), note=q('#field-mode-note');
  if(!['normal','rain','heat'].includes(mode))mode='normal';
  if(select)select.value=mode;
  qa('.stop.is-outdoor').forEach(el=>{el.hidden=false;el.classList.toggle('weather-caution',mode!=='normal')});
  const visible=mode==='rain'?P.stops.filter(s=>!isOutdoor(s)):P.stops;
  initMap(visible);
  if(note){
   if(mode==='rain'){note.hidden=false;note.innerHTML='<strong>비·강풍 모드</strong>지도는 실내 지점을 중심으로 표시합니다. 야외 장소의 안내와 요록은 아래에 남겨 두었습니다. 실제 취소·대체 여부는 인솔교사 판단과 기관 운영상황이 우선입니다. '+P.rain}
   else if(mode==='heat'){note.hidden=false;note.innerHTML='<strong>폭염 모드</strong>야외 지점은 숨기지 않되 체류시간을 줄이고 물·그늘·휴식 확보를 우선합니다. 기상특보가 있으면 교사용 대체안으로 전환합니다.'}
   else note.hidden=true;
  }
  if(persist)storage.set(storeKey('mode'),mode);
 }
 function bindFieldTools(){
  qa('[data-headcount]').forEach(el=>{
   const key=storeKey('headcount',el.dataset.headcount);
   el.checked=storage.get(key)==='1';
   el.addEventListener('change',()=>storage.set(key,el.checked?'1':'0'));
  });
  qa('.locate-btn').forEach(btn=>btn.addEventListener('click',()=>{
   const status=btn.parentElement.querySelector('.geo-status');
   if(!navigator.geolocation){status.textContent='이 브라우저에서는 위치 확인을 지원하지 않습니다.';return}
   status.textContent='현재 위치 확인 중…';
   navigator.geolocation.getCurrentPosition(pos=>{
    const d=distanceM(pos.coords.latitude,pos.coords.longitude,Number(btn.dataset.lat),Number(btn.dataset.lon));
    const label=d<1000?Math.round(d)+'m':(d/1000).toFixed(1)+'km';
    status.textContent='표시 지점까지 직선거리 약 '+label+'입니다. 도보 거리와 다르며 GPS 오차가 있습니다. 출입구는 인솔교사 안내를 따르세요.';
   },err=>{status.textContent=err.code===1?'위치 접근이 허용되지 않았습니다. 주소와 지도 링크로 확인할 수 있습니다.':err.code===3?'위치 확인 시간이 초과되었습니다. 잠시 뒤 다시 시도하거나 지도 링크를 이용하세요.':'현재 위치를 확인할 수 없습니다. 주소와 지도 링크를 이용하세요.'},{enableHighAccuracy:false,timeout:8000,maximumAge:30000});
  }));
  q('#field-mode')?.addEventListener('change',e=>applyFieldMode(e.target.value,true));
 }
 document.addEventListener('DOMContentLoaded',render);
})();