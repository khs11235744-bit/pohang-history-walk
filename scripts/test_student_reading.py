"""Student reader acceptance: narrative prose, book pages, no teacher-only chapters."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re,unittest
ROOT=Path(__file__).resolve().parents[1]

def guides():
    t=(ROOT/'data/depth-guides.js').read_text(encoding='utf-8')
    return json.loads(t[t.index('={')+1:].strip().rstrip(';'))

def plain(t): return BeautifulSoup(t,'html.parser').get_text(' ',strip=True)

class StudentReading(unittest.TestCase):
    def test_no_instructional_chapters_in_readers(self):
        forbidden={'ops','worksheet','assessment','chapter-2','chapter-13','chapter-14'}
        for code,g in guides().items():
            for c in g['chapters']:
                self.assertNotIn(c['id'],forbidden,(code,c['id']))
    def test_history_not_a_teaching_script(self):
        patterns=r'교사는|학생에게|학생은|학생이|학생의|학생용|현장 과제|교과 연결|기록하게|설명하게|적게 한다|발표에서는|발표자는|이번 답사|이 답사|본 요록|이 요록|이 자료집|기록지에는|살펴보자|비교해 보자|확인해 보자|원문 인용문이 아니다|버스를 다시'
        for code,g in guides().items():
            for c in g['chapters']:
                if re.match(r'^(\d{2}\. |대체 답사\.)',c['title']):
                    self.assertIsNone(re.search(patterns,plain(c['html'])),(code,c['id']))
    def test_book_not_file_pagination(self):
        for code,g in guides().items():
            text=' '.join(plain(c['html']) for c in g['chapters'])
            self.assertNotRegex(text,r'PDF|OCR|제공된 도서|제공한 도서|인쇄본과|쪽수 대조')
            if code in 'AB':self.assertIn('김진홍, 『일제의 특별한 식민지 포항』',text)
    def test_long_place_histories(self):
        for code,expected in [('A',9),('B',8),('C',9)]:
            essays=[c for c in guides()[code]['chapters'] if re.match(r'^(\d{2}\. |대체 답사\.)',c['title'])]
            self.assertEqual(len(essays),expected,code)
            for c in essays:self.assertGreaterEqual(len(plain(c['html'])),2300,(code,c['id']))
    def test_teacher_material_is_preserved_separately(self):
        p=ROOT/'teacher-reading-notes.html';self.assertTrue(p.exists())
        s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
        self.assertIn('noindex',s.select_one('meta[name=robots]')['content'])
        for code in 'abc':self.assertTrue(s.find(id=code+'-teacher-notes'))
    def test_canonical_pages_and_citations(self):
        for code,g in guides().items():
            s=BeautifulSoup((ROOT/f'guide-{code.lower()}.html').read_text(encoding='utf-8'),'html.parser')
            ids=[n['id'] for n in s.select('[id]')]
            self.assertEqual(len(ids),len(set(ids)),code)
            for a in s.select('a[href^="#"]'):self.assertIn(a['href'][1:],ids,(code,a['href']))
            for c in g['chapters']:
                sec=s.find(id=code.lower()+'-'+c['id']);self.assertIsNotNone(sec)
                for n in sec.select('.reader-next'):n.decompose()
                sec.find('h2',recursive=False).decompose()
                self.assertEqual(plain(str(sec)),plain(c['html']),(code,c['id']))
    def test_concrete_substitute_for_c_writing_lesson(self):
        g=guides()['C'];c=next(c for c in g['chapters'] if c['id']=='essay-09')
        self.assertIn('성덕대왕신종',c['title'])
        for fact in ['771','봉덕사','경덕왕','혜공왕']:self.assertIn(fact,plain(c['html']))
    def test_word_labels_current(self):
        for code in 'abc':
            text=(ROOT/f'guide-{code}.html').read_text(encoding='utf-8')
            self.assertNotIn('Word 이전판',text)
            self.assertIn('편집용 Word',text)

if __name__=='__main__':unittest.main()
