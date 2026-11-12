"""키워드 엑셀 → data/site-pages.json (사이트 라우트의 단일 출처) + keywords/인터테크누수_키워드_페이지.xlsx

  python -I scripts/build_pages.py

원본: keywords/인터테크누수_키워드.xlsx (region_kw_prj 복사본) '키워드' 시트
  - '생성 대상' 열이 O 인 행만 페이지가 된다. 순서 = 우선순위 → 순번.
  - 앞의 BASE 행(1,000) = 오픈 4묶음(누적 25→50→75→100%, rebatch.py --plan 과 같은 방식)
  - 나중에 엑셀에서 O 를 더 찍으면 그 행들은 EXTRA_SIZE 씩 묶음 5, 6, … (오픈 뒤 추가분, data/drip.json extra 에 날짜 등록)
담당 지점: 분당구(성남) = 분당점, 용인시·처인·기흥·수지 = 용인점 (data/places.json gus.*.branch)
"""
import json, math, sys
from collections import Counter
from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'drip'))
from rebatch import rebatch  # noqa: E402

ROOT = HERE.parent
SRC = ROOT / 'keywords' / '인터테크누수_키워드.xlsx'
OUT_XLSX = ROOT / 'keywords' / '인터테크누수_키워드_페이지.xlsx'
SITE_URL = 'http://127.0.0.1:18992'  # lib/site.ts 기본값과 같게 (도메인 정해지면 둘 다)
BASE, EXTRA_SIZE = 1000, 400

places = json.loads((ROOT / 'data' / 'places.json').read_text(encoding='utf-8'))
PL, GUS = places['places'], places['gus']
WORDS = {'누수', '누수탐지', '누수공사', '누수수리', '화장실누수', '천장누수', '배관누수', '수도누수', '아파트누수', '누수탐지업체'}

ws = load_workbook(SRC, read_only=True)['키워드']
it = ws.iter_rows(values_only=True)
head = list(next(it))
col = {h: head.index(h) for h in head}
rows = []
for r in it:
    if not r[col['키워드']] or (r[col['생성 대상']] or '').strip().upper() != 'O':
        continue
    place, word = r[col['지역(대표)']], r[col['단어']]
    assert place in PL, f'지역 데이터 없음: {place}'
    assert word in WORDS, word
    rows.append(dict(n=r[col['순번']], kw=r[col['키워드']], prio=r[col['우선순위']], place=place, word=word,
                     mod=r[col['수식어']] or '', unit=r[col['지역단위']], slug=r[col['슬러그']], alt=r[col['표기변형(alt)']] or ''))

rows.sort(key=lambda x: (x['prio'], x['n']))
pages = []
for i, r in enumerate(rows, 1):
    gu = PL[r['place']]['gu']
    pages.append(dict(n=r['n'], no=i, kw=r['kw'], slug=r['slug'], place=r['place'], gu=gu, branch=GUS[gu]['branch'],
                      unit=r['unit'], word=r['word'], mod=r['mod'], prio=r['prio'], alt=r['alt'], wave=1))
assert all(v == 1 for v in Counter(p['slug'] for p in pages).values()), '슬러그 중복'
base, extra = pages[:BASE], pages[BASE:]
rebatch(base, plan=[25, 50, 75, 100])
for i, p in enumerate(extra):
    p['wave'] = 5 + i // EXTRA_SIZE
json.dump({'pages': pages}, open(ROOT / 'data' / 'site-pages.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

# ---- 키워드 엑셀 (첫 시트 = 키워드). 행 순서 = 오픈 순서 ----
wb = Workbook()
ws = wb.active
ws.title = '키워드'
ws.append(['순번', '키워드', '우선순위', '지역', '구', '지역 단위', '단어', '수식어', '담당 지점', 'URL', '오픈 묶음'])
BR = {'bundang': '분당점', 'yongin': '용인점'}
for p in pages:
    ws.append([p['n'], p['kw'], p['prio'], PL[p['place']]['name'], p['gu'], p['unit'], p['word'], p['mod'], BR[p['branch']],
               f"{SITE_URL}/{p['slug']}/", p['wave']])
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF')
    c.fill = PatternFill('solid', fgColor='1D2A36')
    c.alignment = Alignment(horizontal='center')
for k, w in zip('ABCDEFGHIJK', [6, 30, 8, 12, 6, 9, 12, 9, 9, 56, 9]):
    ws.column_dimensions[k].width = w
ws.freeze_panes = 'A2'
wb.save(OUT_XLSX)

sys.stdout.reconfigure(encoding='utf-8')
c = Counter(p['wave'] for p in pages)
acc = 0
for w in sorted(c):
    acc += c[w]
    print(f'묶음 {w}: {c[w]} (누적 {acc}) 우선순위 {dict(Counter(p["prio"] for p in pages if p["wave"] == w))}')
print('지점:', dict(Counter(p['branch'] for p in pages)))
