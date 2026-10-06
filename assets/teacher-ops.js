(()=> {
 const O=window.FIELDTRIP_OPS;if(!O)return;
 const byId=id=>document.getElementById(id);
 function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
 function checklist(){
  const el=byId('ops-checklists');if(!el)return;
  el.innerHTML=Object.entries(O.checklists).map(([k,items])=>'<details class="field-ops" open><summary>'+esc(k)+'</summary><div class="field-ops-body"><ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></details>').join('');
 }
 function contacts(){
  const el=byId('ops-contacts');if(!el)return;
  el.innerHTML='<div class="table-wrap"><table><thead><tr><th>구분</th><th>기관</th><th>전화</th><th>전화할 내용</th></tr></thead><tbody>'+O.contacts.map(x=>'<tr><td>'+esc(x.group)+'</td><td>'+esc(x.name)+'</td><td><b>'+esc(x.phone)+'</b></td><td>'+esc(x.task)+'</td></tr>').join('')+'</tbody></table></div>';
 }
 function food(){
  const el=byId('ops-food');if(!el)return;
  el.innerHTML=Object.entries(O.food).map(([code,rows])=>'<h3>이번 기행 중식</h3><div class="table-wrap"><table><thead><tr><th>식당</th><th>유형</th><th>전화</th><th>주소·확인사항</th></tr></thead><tbody>'+rows.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+esc(x.type)+'</td><td>'+esc(x.phone)+'</td><td>'+esc(x.addr)+'<br><small>'+esc(x.note)+'</small></td></tr>').join('')+'</tbody></table></div>').join('');
 }
 document.addEventListener('DOMContentLoaded',()=>{checklist();contacts();food()});
})();