
const plans=[{"team": "1모둠", "stop": "연오랑·세오녀", "href": "guide.html#legend", "size": 5}, {"team": "2모둠", "stop": "등대·항로표지", "href": "guide.html#lighthouse", "size": 5}, {"team": "3모둠", "stop": "어업·운반업", "href": "guide.html#fishing", "size": 5}, {"team": "4모둠", "stop": "해양환경사·플로깅", "href": "guide.html#marine-history", "size": 4}, {"team": "5모둠", "stop": "학도의용군·편지", "href": "guide.html#memorial", "size": 4}, {"team": "6모둠", "stop": "수도산·지역 전승", "href": "guide.html#waterworks", "size": 4}];
const roles=['자료·발표','기록','사진','도구·분류','주변 확인(교사 감독 보조)'];
const grid=document.getElementById('team-grid'), names=document.getElementById('names'),msg=document.getElementById('msg');
function shuffle(a){for(let i=a.length-1;i>0;i--){const x=new Uint32Array(1);crypto.getRandomValues(x);const j=x[0]%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function render(groups){
 grid.innerHTML=plans.map((p,i)=>{const arr=groups?.[i]||[];return '<section class="team-card"><div class="kicker">'+p.team+'</div><h3>'+p.stop+'</h3><div class="team-stop"><a href="'+p.href+'">발표문 바로가기 →</a></div><ol>'+Array.from({length:Math.max(p.size,arr.length)},(_,k)=>'<li><b>'+(roles[k]||'기록')+'</b> · '+(arr[k]||'________________')+'</li>').join('')+'</ol><div class="team-roles">발표 전 5분 준비 → 3~4분 발표 → 현장 질문 1개 → 사진 2장</div></section>'}).join('');
}
function assign(){
 const list=names.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!list.length){msg.textContent='명단을 입력해 주세요.';return}
 const pool=shuffle([...list]),groups=plans.map(()=>[]);pool.forEach((name,i)=>groups[i%plans.length].push(name));msg.textContent=list.length+'명을 '+groups.map(g=>g.length).join('·')+'명으로 배정했습니다.';
 localStorage.setItem('pohang-second2026-team-names',names.value);localStorage.setItem('pohang-second2026-team-groups',JSON.stringify(groups));render(groups);
}
document.getElementById('assign').onclick=assign;
document.getElementById('restore').onclick=()=>{names.value=localStorage.getItem('pohang-second2026-team-names')||'';try{render(JSON.parse(localStorage.getItem('pohang-second2026-team-groups')||'null'));msg.textContent='이 기기에 저장된 배정을 불러왔습니다.'}catch(e){render();}};
document.getElementById('clear').onclick=()=>{names.value='';localStorage.removeItem('pohang-second2026-team-names');localStorage.removeItem('pohang-second2026-team-groups');render();msg.textContent='초기화했습니다.'};
render();

