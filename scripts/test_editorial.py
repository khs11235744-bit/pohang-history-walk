"""Acceptance tests for the 2026 field-guide editorial pass (standard unittest)."""
import unittest,json,re
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
def soup(n):return BeautifulSoup((ROOT/n).read_text(encoding='utf-8'),'html.parser')
class EditorialAcceptance(unittest.TestCase):
 def test_navigation_is_available_without_css_or_js(self):
  for n in ['index.html','plan-a.html','guide-a.html','student.html']:
   s=soup(n);self.assertTrue(s.select_one('a.skip[href="#main"]'),n)
   self.assertTrue(s.select_one('#primary-nav'),n)
   self.assertTrue(s.select_one('button[aria-controls="primary-nav"]'),n)
 def test_title_precedes_reader_outline(self):
  for code in 'abc':
   s=soup(f'guide-{code}.html');h=s.find('h1');nav=s.select_one('.guide-toc')
   self.assertTrue(h and nav)
   self.assertLess(list(s.descendants).index(h),list(s.descendants).index(nav),code)
 def test_no_production_status_in_reading_ui(self):
  for code in 'abc':
   text=soup(f'guide-{code}.html').get_text(' ',strip=True)
   for phrase in ['소논문형','최신 통합 사이트','기존 사이트의','사용자가 제공한','이 자료집은 미확인','A안 심화 자료집 전체 반영']:
    self.assertNotIn(phrase,text,code)
 def test_accessible_search_and_reading_controls(self):
  for code in 'abc':
   s=soup(f'guide-{code}.html');self.assertTrue(s.select_one('#reader-search'))
   self.assertTrue(s.select_one('label[for="reader-search"]'))
   self.assertTrue(s.select_one('#reader-search-status[role="status"]'))
   self.assertTrue(s.select_one('[data-reader-size]'))
 def test_history_and_routes_preserved(self):
  self.assertEqual(len(soup('guide-a.html').select('.guide-chapter')),12)
  self.assertEqual(len(soup('guide-b.html').select('.guide-chapter')),11)
  self.assertEqual(len(soup('guide-c.html').select('.guide-chapter')),12)
  for code in 'abc':
   self.assertGreater(len(soup(f'guide-{code}.html').select_one('.guide-body').get_text()),24000)
  a=soup('guide-a.html').get_text()
  for date in ['1835','1983','1930','1932','1923','1926','1950']:
   self.assertIn(date,a)
 def test_audit_has_100_distinct_evidenced_items(self):
  path=ROOT/'docs/editorial-audit-100.json';self.assertTrue(path.exists())
  entries=json.loads(path.read_text())['items'];self.assertEqual(len(entries),100)
  self.assertEqual([x['id'] for x in entries],list(range(1,101)))
  for x in entries:
   for k in ['before','after','path','verification']:self.assertTrue(x.get(k),(x['id'],k))
 def test_single_reader_source_and_unique_ids(self):
  for code in 'abc':
   s=soup(f'guide-{code}.html');ids=[e['id'] for e in s.select('[id]')]
   self.assertEqual(len(ids),len(set(ids)),code)
   for a in s.select('a[href^="#"]'):
    self.assertIn(a['href'][1:],ids,(code,a['href']))
 def test_service_worker_network_fallback_is_not_html_for_scripts(self):
  sw=(ROOT/'sw.js').read_text()
  self.assertIn("request.mode === 'navigate'",sw)
  self.assertNotIn("catch(()=>caches.match('./student.html'))",sw)
  self.assertIn('pohang-history-walk-v20',sw)
 def test_reading_panels_have_native_disclosure(self):
  js=(ROOT/'assets/depth-guides.js').read_text()
  self.assertIn("el('details'",js)
  self.assertNotIn('전체 반영',js)
 def test_minimum_typographic_accessibility(self):
  css=(ROOT/'assets/editorial.css').read_text() if (ROOT/'assets/editorial.css').exists() else ''
  for rule in ['prefers-reduced-motion',':focus-visible','scroll-margin','font-size: 1rem','min-height: 44px']:
   self.assertIn(rule,css)
if __name__=='__main__':unittest.main()
