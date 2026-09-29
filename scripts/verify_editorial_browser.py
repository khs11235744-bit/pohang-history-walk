"""Local/live acceptance smoke; no use of the user's signed-in browser profile."""
from pathlib import Path
import argparse, functools, http.server, socketserver, threading, json, time
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',required=True);parser.add_argument('--output',required=True);parser.add_argument('--base-url');args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1];OUT=Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=None
if args.base_url:BASE=args.base_url.rstrip('/')+'/'
else:
 server=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();BASE=f'http://127.0.0.1:{server.server_address[1]}/'
results=[];errors=[]
def record(name,detail=True):results.append({'test':name,'result':'PASS','detail':detail})
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=args.browser,headless=True)
  context=browser.new_context(viewport={'width':1440,'height':980});page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  for width in [390,768,1440]:
   page.set_viewport_size({'width':width,'height':980})
   for file in ['index.html','guide-a.html','guide-b.html','guide-c.html','plan-a.html','plan-b.html','plan-c.html']:
    page.goto(BASE+file,wait_until='domcontentloaded',timeout=45000)
    if file.startswith('plan-'):page.wait_for_function("document.documentElement.dataset.depthReady==='editorial-v18'",timeout=20000)
    page.wait_for_timeout(200)
    metrics=page.evaluate('({viewport:innerWidth,width:document.documentElement.scrollWidth,h1:document.querySelector("h1").getBoundingClientRect().top})')
    assert metrics['width']<=width+1,(file,width,metrics)
    assert page.locator('h1').count()==1,(file,'h1')
    page.screenshot(path=str(OUT/f'{file[:-5]}-{width}.png'))
    record(f'{file} / {width}px',metrics)
    if width==390:
     assert not page.locator('#primary-nav').is_visible();page.locator('.nav-toggle').click();assert page.locator('#primary-nav').is_visible()
     page.keyboard.press('Escape');assert not page.locator('#primary-nav').is_visible();assert page.locator('.nav-toggle').evaluate('(e)=>e===document.activeElement')
    if file.startswith('guide-'):
     assert metrics['h1']<350,(file,metrics)
     count=page.locator('.guide-chapter').count();page.locator('#reader-search').fill('자료');page.wait_for_timeout(240)
     assert page.locator('#reader-search-results li').count()>0
     page.locator('#reader-search').fill('<img src=x onerror=alert(1)>');page.wait_for_timeout(240)
     assert page.locator('#reader-search-results img').count()==0 and page.locator('#reader-search-results li').count()==0
     assert page.locator('.guide-chapter').count()==count
     page.locator('#reader-search').fill('')
     page.locator('[data-reader-size="large"]').click();assert page.evaluate('getComputedStyle(document.querySelector(".guide-body p")).fontSize')=='21px'
     page.locator('[data-reader-size="normal"]').click()
     ids=page.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids)),(file,'duplicate ids')
    if file.startswith('plan-'):
     n=page.locator('#stops > article.stop').count();assert n>=4
     assert page.locator('.depth-inplace').count()>=3
     assert not page.locator('.depth-inplace').first.get_attribute('open')
     ids=page.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids)),(file,'duplicate ids')
     page.locator('#field-tools summary').first.click();page.locator('#field-mode').select_option('rain');page.wait_for_timeout(100)
     assert page.locator('#stops > article.stop').count()==n
     assert page.locator('#stops > article.stop[hidden]').count()==0
     page.locator('#field-mode').select_option('normal')
     phones=page.locator('a[href^="tel:"]').evaluate_all('(e)=>e.map(x=>x.getAttribute("href"))');assert all(x[4:].isdigit() and len(x[4:]) in [9,10,11] for x in phones),phones
  record('responsive menu / search / font / IDs / rain / telephone')
  # Saved reading settings and print disclosures.
  page.goto(BASE+'guide-a.html',wait_until='domcontentloaded');page.locator('[data-reader-size="large"]').click();page.reload(wait_until='domcontentloaded')
  assert page.locator('[data-reader-size="large"]').get_attribute('aria-pressed')=='true'
  before=page.locator('details[open]').count();page.evaluate('dispatchEvent(new Event("beforeprint"))');assert page.locator('details:not([open])').count()==0
  page.evaluate('dispatchEvent(new Event("afterprint"))');assert page.locator('details[open]').count()==before
  record('font persistence and print disclosure restore')
  page.goto(BASE+'plan-a.html',wait_until='domcontentloaded');page.wait_for_function("document.documentElement.dataset.depthReady==='editorial-v18'")
  page.locator('.field-ops summary').first.click();box=page.locator('[data-headcount]').first;box.check();page.reload(wait_until='domcontentloaded');assert page.locator('[data-headcount]').first.is_checked();record('existing headcount storage')
  # Route fallback without a map library must retain place content.
  fallback=browser.new_context();fallback.route('**/*leaflet*.js',lambda r:r.abort());fpage=fallback.new_page();fpage.goto(BASE+'plan-b.html',wait_until='domcontentloaded');fpage.wait_for_function("document.documentElement.dataset.depthReady==='editorial-v18'")
  assert fpage.locator('#plan-map').inner_text();assert fpage.locator('#stops article.stop').count()>=4;record('map unavailable retains addresses and readers');fallback.close()
  # Text remains readable with JS disabled.
  nojs=browser.new_context(java_script_enabled=False);npage=nojs.new_page();npage.goto(BASE+'guide-c.html',wait_until='domcontentloaded');assert npage.locator('.guide-chapter').count()==15 and npage.locator('#primary-nav').is_visible();record('no-JavaScript reader');nojs.close()
  # Wait for installed, claimed cache and verify actual members before disconnecting.
  page.goto(BASE+'index.html',wait_until='domcontentloaded');page.wait_for_function('!!navigator.serviceWorker.controller',timeout=60000)
  keys=page.evaluate('async()=>{await navigator.serviceWorker.ready;return caches.keys()}');assert any('v18-editorial' in k for k in keys),keys
  cache=page.evaluate("async()=>{const c=await caches.open('pohang-history-walk-v18-editorial-20260930');return (await c.keys()).map(x=>new URL(x.url).pathname)}")
  for file in ['guide-a.html','guide-b.html','guide-c.html','assets/editorial.css','assets/editorial.js','assets/register-sw.js']:assert any(x.endswith('/'+file) for x in cache),file
  context.set_offline(True)
  for c,n in [('a',16),('b',14),('c',15)]:
   page.goto(BASE+'guide-'+c+'.html',wait_until='domcontentloaded');assert page.locator('.guide-chapter').count()==n;assert page.locator('#reader-search').is_visible();page.locator('#reader-search').fill('자료');page.wait_for_timeout(240);assert page.locator('#reader-search-results li').count()>0
  fail=page.evaluate("async()=>{try{await fetch('assets/intentionally-missing-editorial-test.js');return 'unexpected response'}catch{return 'network error'}}");assert fail=='network error',fail
  record('offline A/B/C text, CSS, JS, search and missing-asset error',{'cacheEntries':len(cache),'caches':keys})
  context.set_offline(False);page.goto(BASE+'guide-a.html',wait_until='domcontentloaded');record('online after offline')
  assert not errors,errors
  context.close();browser.close()
except Exception as e:
 results.append({'test':'failure','result':'FAIL','detail':repr(e)});raise
finally:
 (OUT/'browser-check.json').write_text(json.dumps({'base_url':BASE,'checks':results,'page_errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
 if server:server.shutdown()
 print(json.dumps({'passed':sum(x['result']=='PASS' for x in results),'failed':sum(x['result']=='FAIL' for x in results),'output':str(OUT/'browser-check.json')},ensure_ascii=False))
