import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, BRANCHES, shareMeta } from '../../lib/site';
import { GUS, PLACES, openGus, guPages, guPath, guEncodedPath } from '../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { BranchPair, IconArrow, JsonLd, SectionHead } from '../../components/Common';

const TITLE = `지역별 누수탐지 안내 — 분당·용인 | ${BRAND}`;
const DESC = `성남시 분당구는 분당점, 용인시 처인·기흥·수지구는 용인점이 맡습니다. 구별로 동네 안내 페이지와 담당 지점 번호를 정리했습니다.`;
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/area/' },
  ...shareMeta('area', `${BRAND} 지역별 안내`, { title: TITLE, description: DESC, url: '/area/' }),
};

export default function AreaIndex() {
  const gus = openGus();
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '지역', path: '/area/' }]),
        itemListJsonLd(gus.map((g) => ({ name: `${GUS[g].full} 누수탐지`, path: guEncodedPath(g) }))),
      ]} />
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><span>지역</span></nav>
          <h1 className="page-title">지역별 누수탐지 안내</h1>
          <p className="page-lead">{DESC}</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <SectionHead title="구별 안내" />
          <ul className="gu-list reveal-group">
            {gus.map((g) => {
              const b = BRANCHES[GUS[g].branch];
              const places = Array.from(new Set(guPages(g).map((p) => PLACES[p.place].name)));
              return (
                <li key={g}>
                  <Link href={guPath(g)}>
                    <h3>{GUS[g].full}<IconArrow /></h3>
                    <p>{GUS[g].note}</p>
                    <p className="gu-meta">{b.name} {b.phone} · 안내 {guPages(g).length}곳 · {places.slice(0, 8).join(', ')}{places.length > 8 ? ' 외' : ''}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className="sec mist"><div className="wrap"><SectionHead title="지점 연락처" /><BranchPair /></div></section>
    </main>
  );
}
