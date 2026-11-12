import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, postPath, postEncodedPath } from '../../lib/blog';
import { OPEN_PAGES, pagePath, pageEncodedPath } from '../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { BranchPair, IconArrow, JsonLd, SectionHead } from '../../components/Common';
import { BRAND, shareMeta } from '../../lib/site';

const TITLE = `누수 노트 — 누수 궁금증 정리 | ${BRAND}`;
const DESC = `계량기 별침 보는 법, 보일러 압력이 떨어지는 이유, 아래층 천장 얼룩이 생겼을 때 할 일처럼 ${BRAND} 상담에서 자주 받는 질문을 한 편씩 정리합니다.`;
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/blog/', types: { 'application/rss+xml': '/rss.xml' } },
  ...shareMeta('blog', `${BRAND} 누수 노트`, { title: TITLE, description: DESC, url: '/blog/' }),
};

const fmt = (d: string) => d.replace(/-/g, '.');

export default function BlogIndex() {
  const posts = getPosts();
  // 글이 없을 때도 목록이 비지 않게 열린 대표 페이지로 이어 준다
  const hubs = OPEN_PAGES.filter((p) => (p.unit === '시·군' || p.unit === '구') && !p.mod).slice(0, 10);
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '누수 노트', path: '/blog/' }]),
        itemListJsonLd(posts.length
          ? posts.map((p) => ({ name: p.title, path: postEncodedPath(p) }))
          : hubs.map((p) => ({ name: p.kw, path: pageEncodedPath(p) }))),
      ]} />
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><span>누수 노트</span></nav>
          <h1 className="page-title">누수 노트</h1>
          <p className="page-lead">상담 전화에서 자주 듣는 질문을 한 편에 하나씩 답합니다. 집집마다 공통인 확인 방법과 순서를 적고, 현장마다 다른 비용 숫자는 적지 않습니다.</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <SectionHead title="최근 글" />
          {posts.length > 0 ? (
            <ol className="post-list">
              {posts.map((p) => (
                <li key={p.slug} data-reveal>
                  <Link href={postPath(p)}>
                    <span className="meta">{fmt(p.publishedAt)}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="note">첫 글을 준비하고 있습니다. 그동안 아래 지역 안내 페이지를 참고해 주세요.</p>
          )}
        </div>
      </section>
      <section className="sec mist">
        <div className="wrap">
          <SectionHead title="지역 안내 페이지" />
          <ul className="linklist">{hubs.map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}<IconArrow /></Link></li>)}</ul>
        </div>
      </section>
      <section className="sec"><div className="wrap"><BranchPair /></div></section>
    </main>
  );
}
