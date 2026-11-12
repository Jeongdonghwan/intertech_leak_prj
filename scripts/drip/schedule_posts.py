"""써 둔 글(content/blog/*.md, '_' 시작 제외)에 공개일을 채운다 — 오픈일부터 하루 1편·2편 번갈아(30일 45편).

  python -I scripts/drip/schedule_posts.py <오픈일 YYYY-MM-DD> [--dir content/blog] [--dry]

- 순서 = 키워드 큐(content/blog/_data/keywordQueue.json) 순서. 큐에 없는 글은 뒤에 파일명 순.
- 각 글의 프런트매터 date·publishedAt 을 채운다(이미 있으면 덮어씀). lib/blog.ts 는 date 가 빌드일 이하인 글만 공개.
- 큐의 해당 키워드를 done + publishedSlug + publishedAt 으로 표시한다.
- 날짜 규칙은 drip_status.py 의 postsPerDay 1.5 와 같다: k일째 글 수 = floor((k+1)*1.5) - floor(k*1.5) → 1,2,1,2,…
"""
import datetime as dt, json, math, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def dates(start, n, per_day=1.5):
    out, k = [], 0
    while len(out) < n:
        out += [start + dt.timedelta(k)] * (math.floor((k + 1) * per_day) - math.floor(k * per_day))
        k += 1
    return out[:n]


def set_field(text, key, val):
    head, sep, body = text.partition('\n---\n')  # 첫 '---' ~ 닫는 '---'
    if re.search(rf'^{key}:.*$', head, re.M):
        head = re.sub(rf'^{key}:.*$', f'{key}: {val}', head, count=1, flags=re.M)
    else:
        head += f'\n{key}: {val}'
    return head + sep + body


def main():
    a = sys.argv[1:]
    if not a or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', a[0]):
        raise SystemExit(__doc__)
    start = dt.date.fromisoformat(a[0])
    d = Path(a[a.index('--dir') + 1]) if '--dir' in a else ROOT / 'content' / 'blog'
    qpath = d / '_data' / 'keywordQueue.json'
    q = json.loads(qpath.read_text(encoding='utf-8')) if qpath.exists() else {'queue': []}
    order = {x['keyword']: i for i, x in enumerate(q['queue'])}
    posts = []
    for f in sorted(d.glob('[!_]*.md')):
        meta = dict(re.findall(r'^(\w+):\s*(.*?)\s*$', f.read_text(encoding='utf-8').split('\n---', 1)[0], re.M))
        posts.append((order.get(meta.get('keyword', ''), 10**6), f.name, f, meta))
    posts.sort()
    sched = dates(start, len(posts))
    for (_, _, f, meta), day in zip(posts, sched):
        iso = day.isoformat()
        if '--dry' not in a:
            t = f.read_text(encoding='utf-8')
            f.write_text(set_field(set_field(t, 'date', iso), 'publishedAt', iso), encoding='utf-8', newline='\n')
        for x in q['queue']:
            if x['keyword'] == meta.get('keyword'):
                x.update(status='done', publishedSlug=meta.get('slug'), publishedAt=iso)
        print(iso, meta.get('slug'))
    if q['queue'] and '--dry' not in a:
        q['done'] = sum(1 for x in q['queue'] if x['status'] == 'done')
        qpath.write_text(json.dumps(q, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{len(posts)}편: {sched[0] if sched else "-"} ~ {sched[-1] if sched else "-"}')


def demo():
    s = dates(dt.date(2026, 12, 1), 45)
    assert [x.day for x in s[:5]] == [1, 2, 2, 3, 4] and s[-1] == dt.date(2026, 12, 30), s[-1]
    t = 'slug: a\ndate:\ntitle: x\n---\n## h\nbody'
    assert 'date: 2026-12-01' in set_field(t, 'date', '2026-12-01') and 'publishedAt: 2026-12-01' in set_field(t, 'publishedAt', '2026-12-01')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    demo()
    main()
