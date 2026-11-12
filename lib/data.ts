// 데이터 로더 — data/site-pages.json(키워드 페이지), places.json(지역), photos.json(업체 등록 사진). 빌드 전용.
import pagesData from '../data/site-pages.json';
import placesData from '../data/places.json';
import photosData from '../data/photos.json';
import { OPEN_WAVE, BRANCHES, BranchKey } from './site';

export interface Page {
  n: number; no: number; kw: string; slug: string; place: string; gu: string; branch: BranchKey;
  unit: string; word: string; mod: string; prio: number; alt: string; wave: number;
}
export interface Place { name: string; gu: string; unit: string; ctx: 'apt' | 'mixed' | 'rural'; note: string; spots: string[] }
export interface Gu { full: string; branch: BranchKey; note: string }
export interface Photo { id: string; branch: BranchKey; scene: string; w: number; h: number }

export const ALL_PAGES = pagesData.pages as Page[];
export const OPEN_PAGES = ALL_PAGES.filter((p) => p.wave <= OPEN_WAVE);
export const PLACES = placesData.places as Record<string, Place>;
export const GUS = placesData.gus as Record<string, Gu>;
export const GU_ORDER = ['분당', '용인', '수지', '기흥', '처인'];
export const PHOTOS = photosData.photos as Photo[];

export const branchOf = (p: Page) => BRANCHES[p.branch];
export const pagePath = (p: Page) => `/${p.slug}/`;
export const pageEncodedPath = (p: Page) => `/${encodeURIComponent(p.slug)}/`;
export const guPath = (gu: string) => `/area/${gu}/`;
export const guEncodedPath = (gu: string) => `/area/${encodeURIComponent(gu)}/`;

const bySlug = new Map(OPEN_PAGES.map((p) => [p.slug, p]));
export function getPage(slug: string): Page | undefined {
  let key = slug;
  try { key = decodeURIComponent(slug); } catch {}
  return bySlug.get(key);
}

export const openGus = () => GU_ORDER.filter((g) => OPEN_PAGES.some((p) => p.gu === g));
export const guPages = (gu: string) => OPEN_PAGES.filter((p) => p.gu === gu);

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
};
export const seedOf = hash;
export const rotate = <T,>(arr: T[], seed: string, salt = ''): T[] => {
  if (!arr.length) return arr;
  const k = hash(`${seed}::${salt}`) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
};

// 관련 페이지 — 열린 페이지만. 같은 지역 다른 키워드 / 같은 구 다른 동네 같은 단어 / 다른 구 같은 단어
const byPlace = new Map<string, Page[]>();
for (const x of OPEN_PAGES) { const a = byPlace.get(x.place) || []; a.push(x); byPlace.set(x.place, a); }
export function related(p: Page) {
  const samePlace = rotate((byPlace.get(p.place) || []).filter((x) => x.slug !== p.slug), p.slug, 'sp').slice(0, 6);
  const sameGu = rotate(OPEN_PAGES.filter((x) => x.gu === p.gu && x.place !== p.place && x.word === p.word), p.slug, 'sg').slice(0, 6);
  const otherGu = rotate(OPEN_PAGES.filter((x) => x.gu !== p.gu && (x.unit === '구' || x.unit === '시·군') && x.word === p.word), p.slug, 'og').slice(0, 5);
  return { samePlace, sameGu, otherGu };
}

// 사진 배정 — 담당 지점 사진 먼저, 슬러그 해시로 돌림
export function photosFor(p: Page, n = 3): Photo[] {
  const own = rotate(PHOTOS.filter((x) => x.branch === p.branch), p.slug, 'ph');
  const other = rotate(PHOTOS.filter((x) => x.branch !== p.branch), p.slug, 'ph2');
  return [...own, ...other].slice(0, n);
}
