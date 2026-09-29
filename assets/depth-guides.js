/* Use the reader's canonical chapter bodies inside native, closed disclosures. */
(()=>{'use strict';
 const el=(tag,cl,text)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(text)n.textContent=text;return n};
 function start(){
  const code=window.PLAN_CODE, guide=(window.DEPTH_GUIDES||{})[code],stops=document.querySelector('#stops');
  if(!guide||!stops?.children.length||document.documentElement.dataset.depthReady)return;
  const chapters=Object.fromEntries(guide.chapters.map(c=>[c.id,c])),prefix='depth-'+code.toLowerCase()+'-';
  function fill(parent,c){
   const body=el('div','chapter-text');body.innerHTML=c.html;
   body.querySelectorAll('[id]').forEach(n=>{n.id=prefix+n.id});
   body.querySelectorAll('a[href^="#"]').forEach(a=>{a.href='guide-'+code.toLowerCase()+'.html'+a.getAttribute('href')});
   parent.append(body);
  }
  for(const [stop,ids] of Object.entries(guide.stops)){
   const article=document.getElementById('stop-'+stop);if(!article)continue;
   const panel=el('details','route-reading depth-inplace depth-content');
   panel.append(el('summary','',ids.length>1?'요록 읽기 · '+ids.length+'편':'요록 읽기'));
   const contents=el('div','');
   if(ids.length>1){const nav=el('nav','depth-inline-toc');nav.setAttribute('aria-label','이 장소의 요록');ids.forEach(id=>{const a=el('a','',chapters[id].title);a.href='#'+prefix+id;nav.append(a)});contents.append(nav)}
   ids.forEach(id=>{const c=chapters[id],section=el('section','guide-chapter');section.id=prefix+id;section.append(el('h2','',c.title));fill(section,c);contents.append(section)});
   const refs=el('p','source-note'),a=el('a','','전체 요록 · 출전 · Word 문서');a.href='guide-'+code.toLowerCase()+'.html';refs.append(a);contents.append(refs);panel.append(contents);
   const old=article.querySelector('.route-reading');if(old)old.replaceWith(panel);else article.append(panel);
  }
  const toolbar=el('div','depth-toolbar');const row=el('div','depth-links');
  const all=el('a','',code+'안 요록 전체 읽기');all.href='guide-'+code.toLowerCase()+'.html';
  const extra=el('a','','관련 해설·기록지');extra.href='#depth-supplement';row.append(all,extra);toolbar.append(row);stops.before(toolbar);
  const supplement=el('section','depth-supplement depth-content');supplement.id='depth-supplement';supplement.append(el('h2','','관련 해설·기록지·출전'));
  guide.supplement.forEach(id=>{const c=chapters[id],d=el('details','');d.id=prefix+id;d.append(el('summary','',c.title));fill(d,c);supplement.append(d)});stops.after(supplement);
  document.documentElement.dataset.depthReady='editorial-v18';document.documentElement.dataset.depthPlan=code;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
