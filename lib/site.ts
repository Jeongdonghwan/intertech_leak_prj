// 사이트 설정 — 연락처·도메인은 이 파일만 고치면 전 페이지에 반영된다.
// 근거: 네이버 플레이스 2곳 수집본(source/place_1855187116.json 분당점, source/place_1046750151.json 용인점, 2026-11-12).
//   플레이스 상호는 '누수'로 등록돼 있고 대표키워드·소개글에 '인터테크누수'·'인터테크' — 브랜드는 인터테크누수.
//   전화: 두 지점 플레이스 썸네일 이미지에 공통으로 적힌 010-3292-1914 를 대표번호로 쓴다(사용자 규칙: 010·대표번호 우선).
//   플레이스 0507 안심번호(분당점 0507-1447-1915, 용인점 0507-1387-7233)는 쓰지 않는다.

export const SITE_URL = process.env.SITE_URL || 'https://xn--od1by81a54d7vk81a2e.kr'; // TODO 도메인 확정 후 교체
export const BRAND = '인터테크누수';
export const SITE_NAME = `${BRAND} | 분당·용인 누수탐지·누수공사`;

export type BranchKey = 'bundang' | 'yongin';
export interface Branch {
  key: BranchKey; name: string; phone: string; addr: string; jibun: string; region: string; locality: string;
  area: string; intro: string; lat: string; lng: string; place: string;
}
export const PHONE = '010-3292-1914'; // 대표번호 — 모든 전화 버튼·헤더·JSON-LD
export const tel = `tel:${PHONE.replace(/[^0-9]/g, '')}`;
export const BRANCHES: Record<BranchKey, Branch> = {
  bundang: {
    key: 'bundang', name: '분당점', phone: PHONE,
    addr: '경기 성남시 분당구 서현로210번길 14 지하3층 b301호', jibun: '서현동 248-3', region: '경기도', locality: '성남시 분당구',
    area: '분당 · 판교 · 수지 · 죽전 · 용인 · 성남', // 플레이스 소개 원문
    intro: '분당전지역 누수탐지 공사전문 업체입니다. 30년 노하우를 만나보세요. 하수도, 변기뚫음 등 설비관련 모든 서비스를 제공합니다.',
    lat: '37.3862377', lng: '127.1245931', place: 'https://m.place.naver.com/place/1855187116/home',
  },
  yongin: {
    key: 'yongin', name: '용인점', phone: PHONE,
    addr: '경기 용인시 기흥구 언동로217번길 31', jibun: '중동 1139', region: '경기도', locality: '용인시 기흥구',
    area: '용인시 전지역', // 플레이스 소개 원문
    intro: '30년 노하우! 용인시 전지역 누수 전문! 아파트, 상가, 빌라, 주택, 야외 등 / 층간, 벽간, 화장실, 바닥, 공용배관, 노후배관, 보일러 등',
    lat: '37.2788417', lng: '127.1479282', place: 'https://m.place.naver.com/place/1046750151/home',
  },
};
export const BRANCH_LIST = [BRANCHES.bundang, BRANCHES.yongin];
export const HOURS = '24시간 · 연중무휴'; // 두 플레이스 모두 '24시간 영업 / 연중무휴'

// 순차 오픈: 이 묶음 이하의 페이지만 빌드·사이트맵·내부링크에 포함된다.
//   1~4 = 키워드 1,000개를 우선순위 순으로 25%씩 (data/drip.json, scripts/drip/). 5+ = 오픈 뒤 추가분
export const OPEN_WAVE = Number(process.env.OPEN_WAVE || 1);
export const UPDATED = '2026-11-16'; // content revision date - bump when page text changes

export const telOf = (b: Branch) => `tel:${b.phone.replace(/[^0-9]/g, '')}`;
export const absUrl = (path: string) => `${SITE_URL}${path}`;

// og·트위터 카드: public/og/<key>.jpg (scripts/make_og.py 로 생성)
export const shareMeta = (key: string, alt: string, o: { title?: string; description?: string; url?: string } = {}) => {
  const images = [{ url: `${SITE_URL}/og/${encodeURIComponent(key)}.jpg`, width: 1200, height: 630, alt }];
  return {
    openGraph: { type: 'website' as const, siteName: SITE_NAME, locale: 'ko_KR', ...o, images },
    twitter: { card: 'summary_large_image' as const, title: o.title, description: o.description, images },
  };
};

// 서치어드바이저(네이버)·서치콘솔(구글) HTML 태그 소유확인 — content 값만. 도메인 확정 후 받아서 넣는다.
export const NAVER_VERIFY = 'd72b16abdc93714d95bcb525eb76ab61003d980f';
export const GOOGLE_VERIFY = '';
