(()=> {
 const P=window.ROUTE_PLANS[window.PLAN_CODE], E=(window.ROUTE_ESSAYS||{})[window.PLAN_CODE]||{}, G=(window.ROUTE_GALLERIES||{})[window.PLAN_CODE]||[];
 const q=s=>document.querySelector(s);
 const maps=(s)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.lat+','+s.lon+' '+s.name);
 function render(){
  document.title='Plan '+P.code+' · '+P.title+' | 포항고 인문학 역사기행';
  q('#plan-code').textContent='PLAN '+P.code;
  q('#plan-title').textContent=P.title;
  q('#plan-tag').textContent=P.tag;
  q('#plan-hero').textContent=P.hero;
  q('#plan-photos').innerHTML=G.map(x=>'<figure><img loading="lazy" src="'+x.src+'" alt="'+x.alt+'"><figcaption>'+x.cap+'</figcaption></figure>').join('');
  q('#schedule-body').innerHTML=P.schedule.map(r=>'<tr>'+r.map((x,i)=>'<'+(i===0?'th':'td')+'>'+x+'</'+(i===0?'th':'td')+'>').join('')+'</tr>').join('');
  q('#stops').innerHTML=P.stops.map(s=>{
    const essay=E[s.name];
    return '<article class="stop" id="stop-'+s.n+'"><div class="stop-head"><div class="stop-num">'+s.n+'</div><div><h2>'+s.name+'</h2><div class="address">'+s.addr+'</div><div class="coord">'+s.lat.toFixed(6)+', '+s.lon.toFixed(6)+(s.meta?' · '+s.meta:'')+(s.contact?' · 문의 '+s.contact:'')+'</div><div class="map-links"><a target="_blank" href="'+maps(s)+'">지도에서 열기</a></div></div></div>'+
    '<div class="stop-body"><div><h3>가서 볼 것</h3><ol>'+s.see.map(x=>'<li>'+x+'</li>').join('')+'</ol><h3>학생 결과물</h3><p>'+s.output+'</p></div><aside class="mission"><b>발표 주제</b><p>'+s.essay+'</p>'+(essay?'<details><summary>3분 발표문 펼치기</summary>'+essay.map(x=>'<p>'+x+'</p>').join('')+'</details>':'<a href="essays.html">A안 발표문 전체 보기 →</a>')+'</aside></div></article>';
  }).join('');
  q('#food').innerHTML=P.food.map((f,i)=>'<article class="archive-card"><span class="kicker">후보 '+(i+1)+'</span><h3>'+f.name+'</h3><p>'+f.addr+'<br><b>'+f.phone+'</b></p><p>'+f.note+'</p></article>').join('');
  q('#culture-title').textContent=P.culture.title;
  q('#culture-time').textContent=P.culture.time;
  q('#culture-steps').innerHTML=P.culture.steps.map((x,i)=>'<div class="route-item"><div class="time">'+String(i+1).padStart(2,'0')+'</div><div><h3>'+x+'</h3></div></div>').join('');
  if(P.culture.extra){q('#culture-extra').innerHTML='<strong>추가 활용</strong>'+P.culture.extra}else q('#culture-extra').remove();
  q('#newspaper').innerHTML=P.newspaper.map((x,i)=>'<article class="archive-card"><span class="kicker">ARTICLE '+(i+1)+'</span><h3>'+x+'</h3><p>현장사진·학생 인터뷰·사료를 결합해 600~900자 기사로 발전시킵니다.</p></article>').join('');
  q('#record').innerHTML=P.record.map(x=>'<li>'+x+'</li>').join('');
  q('#rain').textContent=P.rain;
  initMap();
 }
 function initMap(){
  if(!window.L)return;
  const m=L.map('plan-map',{scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m);
  const pts=[];
  P.stops.forEach(s=>{pts.push([s.lat,s.lon]);L.marker([s.lat,s.lon]).addTo(m).bindPopup('<b>'+s.n+'. '+s.name+'</b><br>'+s.addr)});
  L.polyline(pts,{color:'#8b3529',weight:3,opacity:.8,dashArray:'7 6'}).addTo(m);m.fitBounds(pts,{padding:[25,25]});
 }
 document.addEventListener('DOMContentLoaded',render);
})();