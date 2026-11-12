"""페이지별 og 이미지(1200x630 JPEG) → public/og/<key>.jpg  (home, area, blog, area-<구>, <키워드 슬러그>, blog-<글 슬러그>)
   python -I scripts/make_og.py           # 없는 것만 생성
   python -I scripts/make_og.py --force   # 전부 다시
배경 = 인터테크누수 플레이스 등록 사진(public/img/p*.jpg) 어둡게, 글자 = 굵은 한글 키워드 + 담당 지점 번호.
네이버는 og 이미지를 가운데 정사각형으로 잘라 보여 주므로 글자는 가운데 630px 안쪽에 둔다.
"""
import datetime, json, os, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
W, H = 1200, 630
SAFE_L, SAFE_W = 300, 600  # 가운데 정사각형(285~915) 안쪽
BRAND = '인터테크누수'
PHONE = '대표번호 010-3292-1914'  # lib/site.ts PHONE 과 맞출 것
PHONES = {'bundang': f'분당점 담당 · {PHONE}', 'yongin': f'용인점 담당 · {PHONE}'}
BOTH = f'분당점 · 용인점 · {PHONE}'
NAVY, ACCENT = (29, 42, 54), (78, 196, 206)  # 남회색 바탕 · 청록 글자
# 윈도우는 맑은 고딕, 리눅스(예약 작업)는 Noto CJK — fonts-noto-cjk 패키지
_FONTS = [(r'C:\Windows\Fonts\malgunbd.ttf', r'C:\Windows\Fonts\malgun.ttf'),
          ('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'),
          ('/usr/share/fonts/google-noto-cjk/NotoSansCJK-Bold.ttc', '/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc')]
BOLD, REG = next((f for f in _FONTS if Path(f[0]).exists()), _FONTS[0])


def fnv(s):  # lib/data.ts hash 와 같은 FNV-1a
    h = 2166136261
    for ch in s:
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return h


def base(path):
    im = Image.open(path).convert('RGB')
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im = ImageEnhance.Brightness(im.crop((l, t, l + W, t + H))).enhance(0.38)
    return Image.blend(im, Image.new('RGB', (W, H), NAVY), 0.35)


def wrap(d, text, font, maxw):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + [cur] if cur else lines


def render(bases, key, title, sub, phone=BOTH):
    im = bases[fnv(key) % len(bases)].copy()
    d = ImageDraw.Draw(im)
    size = 76
    while True:
        f = ImageFont.truetype(BOLD, size)
        lines = wrap(d, title, f, SAFE_W)
        if (len(lines) <= 3 and all(d.textlength(x, font=f) <= SAFE_W for x in lines)) or size <= 40:
            break
        size -= 4
    y = 300 - len(lines) * size * 0.62
    d.rectangle((SAFE_L, y - 34, SAFE_L + 70, y - 26), fill=ACCENT)
    for ln in lines:
        d.text((SAFE_L, y), ln, font=f, fill='white'); y += size * 1.2
    d.text((SAFE_L, y + 14), sub, font=ImageFont.truetype(REG, 28), fill=(214, 226, 236))
    d.text((SAFE_L, 520), BRAND, font=ImageFont.truetype(BOLD, 28), fill=ACCENT)
    d.text((SAFE_L, 558), phone, font=ImageFont.truetype(BOLD, 24 if phone == BOTH else 28), fill=(214, 226, 236))
    im.save(OUT / f'{key}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)


def blog_posts():  # content/blog/*.md ('_' 시작 = 비공개, 공개일이 빌드일보다 미래면 제외 — lib/blog.ts 와 같은 규칙) → [(slug, title)]
    today = os.environ.get('BUILD_DATE') or (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)).strftime('%Y-%m-%d')
    out = []
    for f in sorted((ROOT / 'content' / 'blog').glob('[!_]*.md')):
        head = f.read_text(encoding='utf-8').split('\n---', 1)[0]  # 첫 '---' ~ 닫는 '---' 앞
        meta = dict(re.findall(r'^(\w+):\s*(.*?)\s*$', head, re.M))
        date = meta.get('date') or meta.get('publishedAt') or ''
        if meta.get('slug') and meta.get('title') and re.fullmatch(r'\d{4}-\d{2}-\d{2}', date) and date <= today:
            out.append((meta['slug'], meta['title'].strip('\'"')))
    return out


def main():
    force = '--force' in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    pages = json.loads((ROOT / 'data' / 'site-pages.json').read_text(encoding='utf-8'))['pages']
    gus = json.loads((ROOT / 'data' / 'places.json').read_text(encoding='utf-8'))['gus']
    jobs = [('home', '새는 자리를 먼저 찾고 그 자리만 엽니다', '분당점 · 용인점 · 24시간 연중무휴', BOTH),
            ('area', '지역별 누수탐지 안내', '성남 분당 · 용인 처인 · 기흥 · 수지', BOTH),
            ('blog', '누수 노트', '상담 때 자주 받는 질문 정리', BOTH)] +            [(f'area-{g}', f"{v['full']} 누수탐지·누수공사", '동네별 안내 · 담당 지점', PHONES[v['branch']]) for g, v in gus.items()] +            [(p['slug'], p['kw'], '탐지 · 원인 · 공사 · 확인', PHONES[p['branch']]) for p in pages] +            [(f'blog-{s}', t, '누수 노트', BOTH) for s, t in blog_posts()]
    jobs = [j for j in jobs if force or not (OUT / f'{j[0]}.jpg').exists()]
    bases = [base(p) for p in sorted((ROOT / 'public' / 'img').glob('p*.jpg'))] if jobs else []
    for i, (key, title, sub, phone) in enumerate(jobs, 1):
        render(bases, key, title, sub, phone)
        if i % 200 == 0:
            print(i, '/', len(jobs))
    print('생성', len(jobs))


if __name__ == '__main__':
    assert fnv('a') == 0xE40C292C  # FNV-1a 기준값
    main()
