/* Small progressive enhancements. All history remains readable without JavaScript. */
(()=>{'use strict';
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}};
 document.documentElement.classList.add('js');
 function init(){
  const nav=q('#primary-nav'), toggle=q('[aria-controls="primary-nav"]');
  if(nav&&toggle){
   const narrow=matchMedia('(max-width:760px)');
   function set(open){toggle.setAttribute('aria-expanded',String(open));nav.dataset.collapsed=String(!open);toggle.textContent=open?'닫기':'메뉴';}
   set(!narrow.matches);
   toggle.addEventListener('click',()=>set(toggle.getAttribute('aria-expanded')!=='true'));
   narrow.addEventListener('change',e=>set(!e.matches));
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&narrow.matches&&toggle.getAttribute('aria-expanded')==='true'){set(false);toggle.focus()}});
   nav.addEventListener('click',e=>{if(e.target.closest('a')&&narrow.matches)set(false)});
  }
  qa('.table-wrap').forEach(t=>{t.tabIndex=0;t.setAttribute('role','region');if(!t.getAttribute('aria-label'))t.setAttribute('aria-label',t.previousElementSibling?.textContent.slice(0,75)||'자료 표 · 좌우로 이동');t.querySelectorAll('thead th').forEach(x=>x.scope='col')});
  qa('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
  const outline=q('.reader-outline');
  if(outline){const m=matchMedia('(min-width:761px)');outline.open=m.matches;m.addEventListener('change',e=>outline.open=e.matches)}
  const chapters=qa('.guide-body>.guide-chapter'), input=q('#reader-search'), results=q('#reader-search-results'), status=q('#reader-search-status');
  if(input&&chapters.length){
   const index=chapters.filter(c=>!c.id.endsWith('cover')).map(c=>({id:c.id,title:c.querySelector('h2')?.textContent||'',text:c.textContent.replace(/\s+/g,' ')}));
   let timer;
   input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{
    const term=input.value.trim().toLocaleLowerCase();results.replaceChildren();if(!term){status.textContent='';return}
    const matches=index.filter(c=>c.text.toLocaleLowerCase().includes(term));
    status.textContent=matches.length?`‘${input.value.trim()}’ 포함 ${matches.length}개 장`:'찾는 말이 없습니다. 장소명이나 다른 낱말을 입력해 보세요.';
    matches.forEach(c=>{const li=document.createElement('li'),a=document.createElement('a'),p=document.createElement('p');a.href='#'+c.id;a.textContent=c.title;
     const at=c.text.toLocaleLowerCase().indexOf(term);p.textContent=(at>35?'…':'')+c.text.slice(Math.max(0,at-35),at+115)+'…';li.append(a,p);results.append(li)});
   },160)});
   input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';input.dispatchEvent(new Event('input'))}});
  }
  const sizes=qa('[data-reader-size]');
  function size(v){if(!['normal','large'].includes(v))v='normal';document.documentElement.style.setProperty('--reader-size',v==='large'?'21px':matchMedia('(max-width:760px)').matches?'17px':'18px');sizes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readerSize===v)));storage.set('ph-reader-size',v)}
  if(sizes.length){size(storage.get('ph-reader-size')||'normal');sizes.forEach(b=>b.addEventListener('click',()=>size(b.dataset.readerSize)))}
  const key='ph-reader-place-'+(document.body.dataset.guide||''),resume=q('#reader-resume'), saved=storage.get(key);
  if(resume&&saved&&document.getElementById(saved)){resume.hidden=false;resume.href='#'+saved;resume.textContent='이전에 읽던 장: '+(document.getElementById(saved).querySelector('h2')?.textContent||'이어 읽기')}
  if(chapters.length&&'IntersectionObserver' in window){
   const obs=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!active)return;
    const id=active.target.id;qa('.guide-toc a').forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});storage.set(key,id);
   },{rootMargin:'-12% 0px -65% 0px'});chapters.forEach(c=>obs.observe(c));
  }
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}if(!id)return;const target=document.getElementById(id);if(!target)return;
   let p=target.parentElement;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement}
   if(target.tagName==='DETAILS')target.open=true;
   setTimeout(()=>{target.scrollIntoView({behavior:'auto',block:'start'});target.tabIndex=-1;target.focus({preventScroll:true})},20);
  }
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
  const old=[];
  window.addEventListener('beforeprint',()=>{qa('details').forEach(d=>{old.push([d,d.open]);d.open=true})});
  window.addEventListener('afterprint',()=>{old.splice(0).forEach(([d,v])=>d.open=v)});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
