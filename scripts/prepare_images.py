"""source/raw 업체 등록 사진 → public/img/p*.webp (+ og 배경용 .jpg) 와 data/photos.json
   python -I scripts/prepare_images.py
_01(정사각 썸네일)은 사진 속 전화번호가 사이트 번호와 달라 쓰지 않는다.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'source' / 'raw', ROOT / 'public' / 'img'
# (원본, 지점, 장면) — 장면은 사진에 보이는 그대로
PHOTOS = [
    ('1855187116_04.jpg', 'bundang', '배관에 연결한 압력계 바늘을 확인하는 가압 시험'),
    ('1046750151_04.jpg', 'yongin', '헤드폰을 쓰고 주방 바닥의 물 새는 소리를 듣는 청음 탐지'),
    ('1855187116_02.jpg', 'bundang', '보온재를 감은 급수 배관에 시험용 호스를 연결한 모습'),
    ('1046750151_02.jpg', 'yongin', '컴프레서와 호스를 준비해 벽 쪽 배관을 점검하는 모습'),
    ('1855187116_03.jpg', 'bundang', '압력계를 단 소형 컴프레서로 배관에 압력을 거는 모습'),
    ('1046750151_03.jpg', 'yongin', '세면대 아래 욕실 바닥 배관을 살피는 모습'),
]
OUT.mkdir(parents=True, exist_ok=True)
meta = []
for i, (f, br, scene) in enumerate(PHOTOS, 1):
    im = Image.open(SRC / f).convert('RGB')
    im.thumbnail((1000, 1000), Image.LANCZOS)
    im.save(OUT / f'p{i}.webp', 'WEBP', quality=78)
    im.save(OUT / f'p{i}.jpg', 'JPEG', quality=80)
    meta.append(dict(id=f'p{i}', branch=br, scene=scene, w=im.width, h=im.height, src=f))
json.dump({'photos': meta}, open(ROOT / 'data' / 'photos.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(meta), 'photos')
