(()=>{
const $=s=>document.querySelector(s);
let preRows=[],postRows=[];
function parseCSV(text){const rows=[];let row=[],cell="",q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c=='"'&&n=='"'){cell+='"';i++}else if(c=='"')q=false;else cell+=c}else{if(c=='"')q=true;else if(c==","){row.push(cell);cell=""}else if(c=="\n"){row.push(cell.replace(/\r$/,""));rows.push(row);row=[];cell=""}else cell+=c}}if(cell.length||row.length){row.push(cell.replace(/\r$/,""));rows.push(row)}if(!rows.length)return[];const headers=rows[0].map(x=>x.trim());return rows.slice(1).filter(r=>r.some(x=>String(x).trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||"").trim()])))}
function keyOf(o){const keys=Object.keys(o);const pick=(re)=>{const k=keys.find(x=>re.test(x));return k?o[k]:""};const grade=pick(/^학년$/),cls=pick(/^반$/),no=pick(/^번호$/),name=pick(/^이름$/);return {grade,cls,no,name,key:[grade,cls,no,name].map(x=>String(x).trim()).join("|")}}
function get(o,res){for(const re of res){const k=Object.keys(o).find(x=>re.test(x));if(k)return o[k]||""}return""}
const F={
preQuestion:o=>get(o,[/역사적 질문 한 문장/,/확인하고 싶은 역사적 질문/]),
preLink:o=>get(o,[/어떤 교과 내용과 연결/]),
preKnowledge:o=>get(o,[/알고 있는 내용/,/기존 생각/]),
preEvidence:o=>get(o,[/어떤 증거를 찾아야/]),
preSource:o=>get(o,[/사전에 본 자료.*자료명/,/자료명 또는 출처/]),
preCritique:o=>get(o,[/그 자료를 그대로 믿기 전에/]),
preGrowth:o=>get(o,[/성장시키고 싶은 역사 탐구 역량/]),
observed:o=>get(o,[/직접 관찰한 사실 3가지/]),
question:o=>get(o,[/답사 전 탐구 질문/,/가장 중요하게 다룬 질문/]),
evidence:o=>get(o,[/가장 도움이 된 현장 증거 2가지/]),
source:o=>get(o,[/사용한 지도.*자료명/,/자료명 또는 출처/]),
critique:o=>get(o,[/작성 주체.*제작 목적/,/비판적으로 평가/]),
curriculum:o=>get(o,[/교과에서 배운 개념/,/개념이 현장에서/]),
change:o=>get(o,[/답사 전 생각과 답사 후 생각/,/생각이 달라진/]),
conclusion:o=>get(o,[/현재의 결론을 3.*5문장/,/탐구 질문에 대한 현재의 결론/]),
collaboration:o=>get(o,[/조별 활동에서 내가 실제로 한 역할/,/다른 학생의 탐구에 기여/]),
presentation:o=>get(o,[/3분 발표.*가장 중요한 주장/,/주장 1문장/]),
next:o=>get(o,[/새롭게 생긴 역사적 질문/,/추가로 조사하고 싶은/]),
outputs:o=>get(o,[/실제 남긴 결과물/]),
competency:o=>get(o,[/가장 잘 보여준 역사 탐구 역량/])
};
function esc(s){return String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function short(s,n){s=String(s||"").replace(/\s+/g," ").trim();n=n||180;return s.length>n?s.slice(0,n)+"…":s}
function course(o){return get(o,[/참여 코스/])}
function role(o){return get(o,[/조 또는/,/맡은 역할/])}
function merge(){const a=new Map(preRows.map(r=>[keyOf(r).key,r])),b=new Map(postRows.map(r=>[keyOf(r).key,r]));return [...new Set([...a.keys(),...b.keys()])].filter(k=>k!=="|||").map(k=>{const pre=a.get(k)||{},post=b.get(k)||{},id=keyOf(Object.keys(post).length?post:pre);return{id,pre,post,course:course(post)||course(pre),role:role(post)||role(pre)}}).sort((x,y)=>(x.id.grade+x.id.cls+String(x.id.no).padStart(3,"0")+x.id.name).localeCompare(y.id.grade+y.id.cls+String(y.id.no).padStart(3,"0")+y.id.name,"ko"))}
function evidence(x){const p=x.pre,o=x.post,items=[];const add=(label,v)=>{if(v)items.push(label+": "+short(v,240))};add("탐구 질문",F.question(o)||F.preQuestion(p));add("활용 자료",F.source(o)||F.preSource(p));add("사료비판",F.critique(o)||F.preCritique(p));add("현장 증거",F.evidence(o));add("교과연계",F.curriculum(o)||F.preLink(p));add("생각의 변화",F.change(o));add("근거 기반 결론",F.conclusion(o));add("협업·역할",F.collaboration(o));add("드러난 역량",F.competency(o)||F.preGrowth(p));add("후속 질문",F.next(o));return items}
function render(){const ss=merge(),complete=ss.filter(x=>Object.keys(x.pre).length&&Object.keys(x.post).length);$("#summary").innerHTML='<div class="fact-grid"><div class="fact"><b>'+ss.length+'명</b><span>학생</span></div><div class="fact"><b>'+preRows.length+'건</b><span>사전</span></div><div class="fact"><b>'+postRows.length+'건</b><span>사후</span></div><div class="fact"><b>'+complete.length+'명</b><span>연결 완료</span></div></div>';$("#students").innerHTML=ss.map((x,i)=>'<article class="stop"><div class="stop-head"><div class="stop-num">'+String(i+1).padStart(2,"0")+'</div><div><h2>'+esc(x.id.name||"이름 미확인")+'</h2><div class="address">'+esc([x.id.grade,x.id.cls&&x.id.cls+"반",x.id.no&&x.id.no+"번",x.course].filter(Boolean).join(" · "))+'</div></div></div><div class="notice"><strong>교사 검토용 세특 근거 묶음</strong><ul>'+evidence(x).map(z=>'<li>'+esc(z)+'</li>').join("")+'</ul></div><details><summary>사전 원문</summary><p><b>교과연계</b> '+esc(F.preLink(x.pre))+'</p><p><b>사전지식</b> '+esc(F.preKnowledge(x.pre))+'</p><p><b>질문</b> '+esc(F.preQuestion(x.pre))+'</p><p><b>예상 증거</b> '+esc(F.preEvidence(x.pre))+'</p><p><b>자료·비판</b> '+esc(F.preSource(x.pre))+' / '+esc(F.preCritique(x.pre))+'</p></details><details><summary>사후 원문</summary><p><b>관찰</b> '+esc(F.observed(x.post))+'</p><p><b>현장 증거</b> '+esc(F.evidence(x.post))+'</p><p><b>사료비판</b> '+esc(F.critique(x.post))+'</p><p><b>교과 개념</b> '+esc(F.curriculum(x.post))+'</p><p><b>생각 변화</b> '+esc(F.change(x.post))+'</p><p><b>결론</b> '+esc(F.conclusion(x.post))+'</p><p><b>협업</b> '+esc(F.collaboration(x.post))+'</p><p><b>발표</b> '+esc(F.presentation(x.post))+'</p><p><b>후속 질문</b> '+esc(F.next(x.post))+'</p><p><b>결과물·역량</b> '+esc(F.outputs(x.post))+' / '+esc(F.competency(x.post))+'</p></details></article>').join("");window._students=ss}
function csvEscape(v){v=String(v||"");return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function exportCSV(){const rows=[["학년","반","번호","이름","코스","역할","탐구질문","활용자료","사료비판","현장증거","교과연계","생각변화","결론","협업","대표역량","후속질문"]];(window._students||merge()).forEach(x=>rows.push([x.id.grade,x.id.cls,x.id.no,x.id.name,x.course,x.role,F.question(x.post)||F.preQuestion(x.pre),F.source(x.post)||F.preSource(x.pre),F.critique(x.post)||F.preCritique(x.pre),F.evidence(x.post),F.curriculum(x.post)||F.preLink(x.pre),F.change(x.post),F.conclusion(x.post),F.collaboration(x.post),F.competency(x.post)||F.preGrowth(x.pre),F.next(x.post)]));const blob=new Blob(["\ufeff"+rows.map(r=>r.map(csvEscape).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="2026_포항고_역사기행_세특근거요약.csv";a.click()}
async function load(input,kind){const f=input.files&&input.files[0];if(!f)return;const rows=parseCSV(await f.text());if(kind==="pre")preRows=rows;else postRows=rows;render()}
document.addEventListener("DOMContentLoaded",()=>{$("#pre-file").addEventListener("change",e=>load(e.target,"pre"));$("#post-file").addEventListener("change",e=>load(e.target,"post"));$("#export-summary").addEventListener("click",exportCSV)});
})();