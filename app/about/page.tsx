// 소개 — 사실만 평서문으로 (무엇을·어디서·어떻게 연락). lib/site.ts 와 페이지 데이터에 있는 것만 쓴다. 없는 정보는 줄을 내지 않는다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, BRANCH_LIST, HOURS, PHONE, UPDATED, shareMeta, tel } from '../../lib/site';
import { GUS, PHOTOS, openGus } from '../../lib/data';
import { breadcrumbJsonLd, businessJsonLd } from '../../lib/jsonld';
import { BranchPair, JsonLd, SectionHead } from '../../components/Common';

const TITLE = `소개 | ${BRAND}`;
const DESC = `${BRAND}는 누수탐지와 누수공사를 하는 곳입니다. 하는 일, 담당 지역, 지점 주소와 연락 방법을 사실대로 정리했습니다.`;
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/about/' },
  ...shareMeta('home', `${BRAND} 소개`, { title: TITLE, description: DESC, url: '/about/' }),
};

export default function About() {
  const gus = openGus().map((g) => GUS[g].full);
  return (
    <main>
      <JsonLd data={[businessJsonLd(), breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '소개', path: '/about/' }])]} />
      <section className="page-hero">
        <div className="wrap page-hero-grid">
          <div>
          <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><span>소개</span></nav>
          <h1 className="page-title">{BRAND} 소개</h1>
          <p className="page-lead">{BRAND}는 누수탐지와 누수공사를 하는 업체입니다. {BRANCH_LIST.map((b) => b.name).join('과 ')} 두 곳이 있습니다.</p>
          </div>
        <figure className="page-hero-img"><img src={`/img/${PHOTOS[0].id}.webp`} alt={`${BRAND} 소개 - ${PHOTOS[0].scene}`} width={PHOTOS[0].w} height={PHOTOS[0].h} /></figure>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <SectionHead title="하는 일" />
          <div className="prose">
            <p>누수탐지와 누수공사를 합니다. 층간, 벽간, 화장실, 바닥, 공용배관, 노후배관, 보일러 누수를 봅니다.</p>
            <p>하수도와 변기 뚫음 같은 설비 일도 합니다.</p>
          </div>
        </div>
      </section>
      <section className="sec mist">
        <div className="wrap">
          <SectionHead title="담당 지역" />
          <div className="prose">
            <p>담당 지역은 {gus.join(', ')}입니다. 동네별 안내는 <Link href="/area/">지역 안내</Link>에 있습니다.</p>
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <SectionHead title="연락 방법과 지점" />
          <div className="prose">
            <p>대표번호 <a href={tel}>{PHONE}</a>로 전화를 받습니다. 운영 시간은 {HOURS}입니다.</p>
            <p>{BRANCH_LIST.map((b, i) => <span key={b.key}>{i > 0 && ' · '}<a href={b.place} target="_blank" rel="noopener noreferrer">{b.name} 네이버 플레이스</a></span>)}</p>
          </div>
          <BranchPair />
          <p className="note">이 페이지의 최종 수정일은 <time dateTime={UPDATED}>{UPDATED}</time>입니다.</p>
        </div>
      </section>
    </main>
  );
}
