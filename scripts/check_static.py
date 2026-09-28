from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {'.git', 'node_modules'}
EXTERNAL = re.compile(r'^(?:https?:|mailto:|tel:|javascript:|data:|#)', re.I)

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {'href', 'src'} and value:
                self.links.append(value)

errors = []
checked = 0
for html in ROOT.rglob('*.html'):
    if any(part in SKIP_DIRS for part in html.parts):
        continue
    parser = LinkParser()
    parser.feed(html.read_text(encoding='utf-8-sig'))
    for raw in parser.links:
        if EXTERNAL.match(raw):
            continue
        path = unquote(raw.split('#', 1)[0].split('?', 1)[0]).strip()
        if not path:
            continue
        target = (html.parent / path).resolve()
        try:
            target.relative_to(ROOT.resolve())
        except ValueError:
            errors.append(f'{html.relative_to(ROOT)} -> outside root: {raw}')
            continue
        checked += 1
        if not target.exists():
            errors.append(f'{html.relative_to(ROOT)} -> missing: {raw}')

if errors:
    print('STATIC_LINK_CHECK_FAIL')
    for err in errors:
        print(err)
    sys.exit(1)
print(f'STATIC_LINK_CHECK_PASS checked={checked}')
