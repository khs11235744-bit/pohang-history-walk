/* Add full reading texts after the existing route renderer; keep operations/data intact. */
(() => {
  'use strict';
  function start() {
    const code=window.PLAN_CODE, guide=(window.DEPTH_GUIDES||{})[code];
    if(!guide || document.documentElement.dataset.depthReady) return;
    const stops=document.querySelector('#stops');
    if(!stops || !stops.children.length) return;
    const chapters=Object.fromEntries(guide.chapters.map(c=>[c.id,c]));
    const prefix='depth-'+code.toLowerCase()+'-';
    const el=(tag,cl,text)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(text)n.textContent=text;return n;};
    function chapter(id) {
      const c=chapters[id], n=el('section','guide-chapter');n.id=prefix+id;
      n.append(el('h2','',c.title));const body=el('div','');body.innerHTML=c.html;n.append(body);return n;
    }
    for(const [stop,ids] of Object.entries(guide.stops)) {
      const article=document.getElementById('stop-'+stop);if(!article)continue;
      const old=article.querySelector('.route-reading');
      const panel=el('div','notice route-reading depth-inplace depth-content');
      const label=el('p','guide-kicker',code+'안 · 소논문형 심화 요록');panel.append(label);
      const nav=el('nav','depth-inline-toc');nav.setAttribute('aria-label','이 장소의 심화 요록');
      ids.forEach(id=>{const a=el('a','',chapters[id].title);a.href='#'+prefix+id;nav.append(a);});panel.append(nav);
      ids.forEach(id=>panel.append(chapter(id)));
      const refs=el('p','');const a=el('a','','자료집 전체 목차·출전 보기');a.href='guide-'+code.toLowerCase()+'.html#'+code.toLowerCase()+'-toc';refs.append(a);panel.append(refs);
      if(old) old.replaceWith(panel);else article.append(panel);
    }
    const toolbar=el('div','depth-toolbar');
    toolbar.append(el('strong','',code+'안 심화 자료집 전체 반영'));
    toolbar.append(el('p','','아래 장소별 요록을 긴 본문으로 교체했습니다. 학생 3분 발표·현장 체크·학습지는 유지했습니다. 연결 해설과 사후 기록은 아래 보충 자료에서 읽을 수 있습니다.'));
    const row=el('div','depth-links');const all=el('a','','전체 자료집·인쇄');all.href='guide-'+code.toLowerCase()+'.html';
    const extra=el('a','','연결 해설·학습 기록·출전');extra.href='#depth-supplement';row.append(all,extra);toolbar.append(row);stops.before(toolbar);
    const supplement=el('section','depth-supplement depth-content');supplement.id='depth-supplement';
    supplement.append(el('h2','','연결 해설·학습 기록·출전'));
    guide.supplement.forEach(id=>{
      const c=chapters[id], d=el('details','');d.id=prefix+id;
      d.append(el('summary','',c.title));const content=el('div','');content.innerHTML=c.html;d.append(content);supplement.append(d);
    });
    stops.after(supplement);
    document.documentElement.dataset.depthReady='20260929-v1';
    document.documentElement.dataset.depthPlan=code;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
