(()=> {
 const COMMON=[
  ['행사 기본','집결·출발·귀교 시각을 실제 차량 운행시간과 대조'],
  ['버스','45인승 승하차 지점·회차·합법 대기 위치를 기사와 확인'],
  ['집결','학생 27명 내외이 차도와 분리되어 설 수 있는 공간 확인'],
  ['화장실','각 권역의 사용 가능한 화장실 위치·운영시간 확인'],
  ['보행','계단·경사·횡단보도·공사구간·보행지원 대체동선 확인'],
  ['좌표','공개 핀과 실제 출입구의 차이를 휴대전화 GPS로 확인'],
  ['안전','비상대피·응급상황 집결지와 인솔교사 역할 분담 확인'],
  ['기상','비·강풍·폭염 특보 시 대체 동선과 실내 체류공간 확인'],
  ['중식','학생 27명 내외·인솔교사 동시수용·단일메뉴·알레르기 대체·학교회계 결제 확인'],
  ['보험','단체여행자보험·학교안전공제 등 학교 절차 확인']
 ];
 const ROUTES={
  A:[
   ['영일민속박물관','45인승 주차·회차와 학생 집결 위치'],
   ['나루끝','대로권 안전 하차지와 원도심 보행 시작점'],
   ['동빈내항','포항개항지정기념비 실제 핀·간독창고/적산가옥 접근 가능성'],
   ['원도심','동빈문화창고/꿈틀로 10월 17일 프로그램과 단체수용'],
   ['수도산','계단·보행시간·40명 해설 지점'],
   ['학도의용군','탑산길 대형차 진입·영상실 단체동선·회차']
  ],
  B:[["호미곶", "연오랑·세오녀상·등대 외관·박물관 도보 동선과 집결 지점"], ["해양 플로깅", "지정 육상 구간·수거/배출·장갑/집게·손 위생·기상 중단 기준"], ["해경", "협의 성립 여부·설명 범위·미성립 시 박물관 활동"], ["북구 중식", "수화식당·27명 내외와 교사 수용·메뉴·주차·결제"], ["학도의용군", "탑산길 대형차 진입·회차·전시·충혼탑·편지비 동선"], ["수도산", "배수지·모갈거사비 진입·계단/경사·해설 지점·귀교 여유"]],
  C:[
   ['대릉원','관광버스 하차지·천마총 단체입장 절차'],
   ['쪽샘유적발굴관','10:00 입장·12:00~13:00 휴게와 해설 가능 여부'],
   ['중식','40명 단체메뉴·차량 대기·학교회계 결제'],
   ['교촌·최부자댁','관광버스 접근·집결공간·보행동선'],
   ['국립경주박물관','초중고 학생단체 사전예약 완료 여부'],
   ['귀교','경주 출발시각과 16:30 종료 버퍼 재확인']
  ]
 };
 const q=s=>document.querySelector(s);
 const key=(route,i)=>'ph-recon-second2026-'+route+'-'+i;
 function render(){
  const route=q('#recon-route').value;
  localStorage.setItem('ph-recon-route',route);
  const items=[...COMMON,...ROUTES[route]];
  q('#recon-list').innerHTML='<div class="recon-grid">'+items.map((x,i)=>`<label class="check-row"><input type="checkbox" data-i="${i}" ${localStorage.getItem(key(route,i))==='1'?'checked':''}><span><b>${x[0]}</b><small>${x[1]}</small></span></label>`).join('')+'</div>';
  q('#recon-list').querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{localStorage.setItem(key(route,el.dataset.i),el.checked?'1':'0');update()}));
  update();
 }
 function update(){
  const boxes=[...q('#recon-list').querySelectorAll('input')];
  q('#recon-count').textContent=boxes.filter(x=>x.checked).length+' / '+boxes.length;
 }
 function exportTxt(){
  const route=q('#recon-route').value, rows=[...q('#recon-list').querySelectorAll('.check-row')];
  const text='2026 포항고 인문학 역사기행 사전답사 체크 — 호미곶·학도의용군·수도산'+'\n\n'+rows.map(row=>(row.querySelector('input').checked?'[완료] ':'[미확인] ')+row.querySelector('b').textContent+' — '+row.querySelector('small').textContent).join('\n');
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'}), a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='포항고_사전답사_PLAN_'+route+'.txt';a.click();URL.revokeObjectURL(a.href);
 }
 document.addEventListener('DOMContentLoaded',()=>{
  q('#recon-route').value='B';
  q('#recon-route').addEventListener('change',render);
  q('#export-recon').addEventListener('click',exportTxt);
  q('#reset-recon').addEventListener('click',()=>{const route=q('#recon-route').value;[...q('#recon-list').querySelectorAll('input')].forEach((el,i)=>{el.checked=false;localStorage.removeItem(key(route,i))});update()});
  render();
 });
})();