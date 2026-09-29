"""Acceptance tests for place-led historical essays and desk-checked logistics."""
import unittest,json,re
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
def data(name):
 t=(ROOT/'data'/name).read_text(encoding='utf-8');return json.loads(t[t.index('={')+1:].strip().rstrip(';'))
class FieldHistory(unittest.TestCase):
 def test_a_groups_neighboring_stops_without_changing_stable_ids(self):
  a=data('routes.js')['A'];self.assertEqual([s['n'] for s in a['stops']],['01','04','03','02','05','06'])
  self.assertIn('같은',a['stops'][0]['visitReason']);self.assertIn('제남헌',a['stops'][0]['visitReason'])
 def test_homigot_is_history_first(self):
  b=data('routes.js')['B'];self.assertIn('등대',b['stops'][0]['name']);self.assertIn('국립등대박물관',str(b['schedule']))
  for bad in ['100년 뒤의 사료','미래의 사료','해안쓰레기는 미래','검증동선']:
   self.assertNotIn(bad,str(b));self.assertNotIn(bad,(ROOT/'guide-b.html').read_text(encoding='utf-8'))
 def test_history_readers_remain_substantial(self):
  d=data('depth-guides.js')
  for code,ids in {'A':['chapter-3'],'B':['essay-01','essay-02','essay-03','essay-04','essay-08']}.items():
   for c in d[code]['chapters']:
    if c['id'] in ids:self.assertGreater(len(BeautifulSoup(c['html'],'html.parser').get_text()),2300,(code,c['id']))
 def test_source_and_static_reader_are_identical(self):
  d=data('depth-guides.js')
  for code in 'AB':
   s=BeautifulSoup((ROOT/f'guide-{code.lower()}.html').read_text(encoding='utf-8'),'html.parser')
   for c in d[code]['chapters']:
    sec=s.find(id=code.lower()+'-'+c['id']);self.assertIsNotNone(sec)
    for nav in sec.select('.reader-next'):nav.decompose()
    sec.find('h2',recursive=False).decompose()
    self.assertEqual(sec.get_text(' ',strip=True),BeautifulSoup(c['html'],'html.parser').get_text(' ',strip=True),(code,c['id']))
 def test_toc_is_current(self):
  d=data('depth-guides.js')
  for code in 'AB':
   s=BeautifulSoup((ROOT/f'guide-{code.lower()}.html').read_text(encoding='utf-8'),'html.parser')
   self.assertEqual([a.get_text(' ',strip=True) for a in s.select('.guide-toc a')],[c['title'] for c in d[code]['chapters']])
 def test_review_does_not_claim_actual_coach_travel(self):
  text=BeautifulSoup((ROOT/'route-review.html').read_text(encoding='utf-8'),'html.parser').get_text(' ',strip=True)
  for needed in ['현장 실측','OSRM','승하차','대체','제남헌','국립등대박물관','흥해향교','구룡포']:self.assertIn(needed,text)
 def test_map_distinguishes_pin_order_from_roads(self):
  text=(ROOT/'assets/route-plan.js').read_text(encoding='utf-8');self.assertIn('실제 주행',text);self.assertIn('displayOrder',text)
 def test_leg_buffers_are_explicit(self):
  for code in 'AB':
   p=data('routes.js')[code];self.assertTrue(p['transportNote']);self.assertTrue(p['logistics']);self.assertTrue(p['alternatives'])
 def test_lighthouse_date_has_named_source(self):
  b=data('depth-guides.js')['B'];text=str(b)
  for expected in ['1908','1706','263','450']:self.assertIn(expected,text)
if __name__=='__main__':unittest.main()
