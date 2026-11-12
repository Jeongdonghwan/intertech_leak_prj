import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, BRANCHES, BRANCH_LIST, HOURS, SITE_NAME, shareMeta } from '../lib/site';
import { OPEN_PAGES, GUS, PHOTOS, openGus, guPages, guPath, pagePath, pageEncodedPath } from '../lib/data';
import { TYPES } from '../lib/compose';
import { getPosts, postPath } from '../lib/blog';
import { faqJsonLd, itemListJsonLd } from '../lib/jsonld';
import { BranchPair, Call, IconArrow, JsonLd, SectionHead } from '../components/Common';

const DESC = `분당·성남은 분당점, 용인 처인·기흥·수지는 용인점. ${BRAND}는 압력계로 새는 배관을 가리고 청음으로 지점을 좁힌 뒤 그 자리만 열어 고칩니다. ${HOURS}.`;
export const metadata: Metadata = {
  title: SITE_NAME,
  description: DESC,
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
  ...shareMeta('home', `${BRAND} 분당점·용인점 누수탐지`, { title: SITE_NAME, description: DESC, url: '/' }),
};

const ph = (id: string) => PHOTOS.find((p) => p.id === id)!;

const PROCESS = [
  { k: '탐지', h: '새는 계통 가리기', t: '급수·온수·난방 배관을 하나씩 막고 압력계를 답니다. 시간이 지나 바늘이 내려가는 계통이 새는 쪽입니다. 계량기 별침과 보일러 압력 기록도 함께 봅니다.', p: 'p1' },
  { k: '원인', h: '지점 좁히기', t: '헤드폰을 쓰고 바닥 위를 옮겨 가며 물 새는 소리를 비교합니다. 소리가 가장 큰 자리, 젖은 범위, 배관 경로를 겹쳐 열 자리를 한곳으로 정합니다.', p: 'p2' },
  { k: '공사', h: '그 자리만 열고 보수', t: '표시한 자리만 작게 열어 배관을 직접 봅니다. 연결부 보수로 끝낼지 구간을 바꿀지는 열어 본 배관 상태로 정하고, 물 쓰는 바닥은 방수까지 잇습니다.', p: 'p3' },
  { k: '확인', h: '덮기 전에 다시 압력', t: '보수한 배관에 다시 압력을 걸어 바늘이 유지되는지 봅니다. 이상이 없을 때 미장과 바닥재로 마감하고, 아래층 천장이 마르는지도 같이 확인합니다.', p: 'p5' },
];

const BUILDINGS = [
  { k: '아파트', t: '세대 배관과 공용 입상관을 먼저 나눕니다. 아래층 천장 얼룩, 욕실 앞 마루 들뜸, 보일러 물 보충이 흔한 신호입니다. 관리사무소 접수와 위층 협조가 있으면 확인이 빨라집니다.' },
  { k: '상가', t: '영업시간을 피해 시험 일정을 잡습니다. 1층 화장실·주방 배수와 위층 주거가 이어진 건물은 배수 쪽부터 봅니다.' },
  { k: '빌라', t: '세대 계량기가 따로 없는 곳은 구간 밸브로 범위를 나눕니다. 위아래층이 서로 원인을 묻는 경우가 많아 근거를 남깁니다.' },
  { k: '주택', t: '보일러실에서 나가는 난방 배관과 마당 아래 수도관을 따로 봅니다. 동파 뒤 늦게 발견되는 누수가 많습니다.' },
  { k: '야외', t: '마당·주차장·창고 바닥 아래 땅속 관과 외부 수도꼭지. 계량기 별침과 지면 청음으로 지점을 찾습니다.' },
];

const FAQ = [
  { q: '분당점과 용인점 중 어디로 연락하나요?', a: '전화는 대표번호 010-3292-1914 하나로 받습니다. 성남 분당·판교 쪽은 분당점, 용인 처인·기흥·수지는 용인점이 방문하며 두 곳 모두 24시간·연중무휴입니다.' },
  { q: '누수탐지 때 바닥을 많이 뜯나요?', a: '탐지는 압력과 소리로 위치를 좁히는 작업이라 바닥을 열지 않습니다. 지점이 정해진 뒤 보수할 자리만 작게 엽니다.' },
  { q: '비용은 얼마인가요?', a: '탐지 범위, 여는 면적, 배관 보수·교체, 바닥 마감, 방수 보강에 따라 달라집니다. 통화로 예상 범위를 설명드리고, 위치를 확인한 뒤 항목별로 안내합니다.' },
  { q: '누수 말고 하수도·변기 막힘도 보나요?', a: '업체 소개에 하수도·변기 뚫음 등 설비 서비스가 함께 적혀 있습니다. 배수가 막혀 넘친 물이 누수처럼 보이는 경우도 있어 같이 확인합니다.' },
  { q: '\'30년 노하우\'는 어디서 나온 말인가요?', a: '두 지점의 네이버 플레이스 업체 소개 원문에 적힌 문구입니다.' },
];

const fmt = (d: string) => d.replace(/-/g, '.');

export default function Home() {
  const top = OPEN_PAGES.filter((p) => p.unit === '시·군' || p.unit === '구').slice(0, 30);
  const list = (top.length >= 10 ? top : OPEN_PAGES.slice(0, 30)).map((p) => ({ name: p.kw, path: pageEncodedPath(p) }));
  const posts = getPosts().slice(0, 4);
  const hero = ph('p1');

  return (
    <main>
      <JsonLd data={[itemListJsonLd(list), faqJsonLd(FAQ)]} />

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <h1><span><i>새는 자리를 먼저 찾고</i></span><span><i>그 자리만 엽니다</i></span></h1>
            <p className="hero-lead">압력계로 새는 배관 계통을 가리고, 청음으로 지점을 좁힌 다음 공사합니다. 덮기 전에 다시 압력을 걸어 확인합니다. 두 지점 모두 {HOURS}.</p>
            <div className="hero-calls"><Call /></div>
          </div>
          <figure className="hero-visual">
            <img src={`/img/${hero.id}.webp`} alt={`${BRAND} 누수탐지 - ${hero.scene}`} width={hero.w} height={hero.h} />
            <ol className="chart" aria-label="진단 순서">
              {PROCESS.map((s) => <li key={s.k}><b>{s.k}</b><span>{s.h}</span></li>)}
            </ol>
          </figure>
        </div>
      </section>

      <section className="sec mist" id="branches">
        <div className="wrap">
          <SectionHead title="지점 두 곳, 담당 지역이 나뉩니다" sub="성남 분당·판교는 분당점, 용인 처인·기흥·수지는 용인점이 방문합니다. 전화는 대표번호 하나로 받고, 주소와 운영 정보는 네이버 플레이스 등록 내용 그대로입니다." />
          <BranchPair />
        </div>
      </section>

      <section className="sec" id="process">
        <div className="wrap">
          <SectionHead title="탐지 · 원인 · 공사 · 확인" sub="젖은 자리와 새는 자리는 다른 경우가 많습니다. 네 단계는 순서를 바꾸지 않습니다." />
          <ol className="path reveal-group">
            {PROCESS.map((s) => {
              const x = ph(s.p);
              return (
                <li key={s.k}>
                  <span className="path-k">{s.k}</span>
                  <figure><img src={`/img/${x.id}.webp`} alt={`${s.k} 단계 - ${x.scene}`} width={x.w} height={x.h} loading="lazy" /></figure>
                  <h3>{s.h}</h3>
                  <p>{s.t}</p>
                </li>
              );
            })}
          </ol>
          <p className="note" data-reveal>사진은 두 지점이 네이버 플레이스에 올린 현장 사진입니다. 업체 소개 원문: &lsquo;최신장비와 최첨단 컴퓨터를 이용한 누수탐지&rsquo;.</p>
        </div>
      </section>

      <section className="sec slate">
        <div className="wrap">
          <SectionHead light title="누수 유형별로 보는 곳" sub="용인점 소개 원문의 유형 목록(층간·벽간·화장실·바닥·공용배관·노후배관·보일러)에 야외 배관을 더했습니다." />
          <div className="tbl-wrap" data-reveal>
            <table className="tbl">
              <thead><tr><th scope="col">유형</th><th scope="col">새는 곳</th><th scope="col">먼저 하는 확인</th></tr></thead>
              <tbody>{Object.values(TYPES).map((t) => <tr key={t.name}><th scope="row">{t.name}</th><td>{t.where}</td><td>{t.check}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionHead title="건물마다 확인 방법이 다릅니다" sub="아파트 · 상가 · 빌라 · 주택 · 야외" />
          <ul className="bldg reveal-group">
            {BUILDINGS.map((x) => <li key={x.k}><h3>{x.k}</h3><p>{x.t}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="sec tint">
        <div className="wrap split">
          <div data-reveal>
            <h2 className="h2-plain">하수도 · 변기 뚫음도 같이 봅니다</h2>
            <p>분당점 소개 원문은 &lsquo;하수도, 변기뚫음 등 설비관련 모든 서비스를 제공합니다&rsquo;입니다. 배수가 막혀 역류한 물이 바닥을 적시면 누수처럼 보이기 때문에, 누수 확인 때 배수 상태도 함께 봅니다.</p>
          </div>
          <dl className="facts" data-reveal>
            <div><dt>플레이스 업종</dt><dd>배관, 냉난방공사</dd></div>
            <div><dt>편의</dt><dd>방문접수/출장 · 예약</dd></div>
            <div><dt>영업시간</dt><dd>매일 00:00~24:00 · 연중무휴</dd></div>
          </dl>
        </div>
      </section>

      <section className="sec mist" id="area">
        <div className="wrap">
          <SectionHead title="지역별 안내" sub="구 단위로 묶었습니다. 각 지역 페이지에 담당 지점이 적혀 있습니다." />
          <div className="areas">
            {openGus().map((g) => {
              const b = BRANCHES[GUS[g].branch];
              const pages = guPages(g).filter((p) => !p.mod).slice(0, 6);
              return (
                <div key={g} className="area-col" data-reveal>
                  <h3><Link href={guPath(g)}>{GUS[g].full}</Link></h3>
                  <p className="area-br">{b.name} 담당</p>
                  <ul>{pages.map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}</Link></li>)}</ul>
                  <Link href={guPath(g)} className="more">{g} 전체 <IconArrow /></Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec" id="faq">
        <div className="wrap narrow">
          <SectionHead title="자주 묻는 질문" />
          <div className="faq">{FAQ.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </div>
      </section>

      <section className="sec mist">
        <div className="wrap">
          <SectionHead title="누수 노트" sub="상담 때 자주 받는 질문을 한 편에 하나씩 정리합니다." />
          {posts.length > 0 ? (
            <ul className="notes">{posts.map((p) => <li key={p.slug}><Link href={postPath(p)}><span>{fmt(p.publishedAt)}</span><b>{p.title}</b></Link></li>)}</ul>
          ) : (
            <p className="note">첫 글을 준비하고 있습니다. <Link href="/blog/">누수 노트</Link>에서 공개되는 글을 볼 수 있습니다.</p>
          )}
        </div>
      </section>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>언제부터, 어디가, 물을 쓰지 않을 때도 젖는지</h2>
          <p>이 세 가지를 알려 주시면 통화에서 의심 계통을 먼저 좁힙니다. 물이 계속 떨어지면 계량기 옆 메인 밸브부터 잠가 주세요.</p>
          <div className="hero-calls"><Call /></div>
        </div>
      </section>
    </main>
  );
}
