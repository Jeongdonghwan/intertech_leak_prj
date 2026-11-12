import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getPost, postPath, postEncodedPath, ogKey } from '../../../lib/blog';
import { breadcrumbJsonLd } from '../../../lib/jsonld';
import { BranchPair, IconArrow, JsonLd, SectionHead } from '../../../components/Common';
import { BRAND, SITE_URL, shareMeta } from '../../../lib/site';

export const dynamicParams = false;

// 글이 0편이면 정적 export 가 빈 목록을 거부하므로 자리표시 1개 → notFound (sitemap·목록에는 안 나감, deploy.sh 가 지움)
export function generateStaticParams() {
  const posts = getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: '_none' }];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPost(params.slug);
  if (!p) return {};
  const url = postEncodedPath(p);
  const share = shareMeta(ogKey(p), `${p.title} - ${BRAND}`, { title: p.title, description: p.description, url });
  return {
    title: `${p.title} | ${BRAND}`,
    description: p.description,
    alternates: { canonical: url },
    ...share,
    openGraph: { ...share.openGraph, type: 'article', publishedTime: p.publishedAt },
  };
}

const fmt = (d: string) => d.replace(/-/g, '.');

// 본문 인라인: [글자](/경로) 만 링크로. 내부 경로만 Link, 나머지는 글자만
const Inline = ({ text }: { text: string }) => (
  <>{text.split(/(\[[^\]]+\]\([^)]+\))/g).map((t, i) => {
    const m = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return t;
    return m[2].startsWith('/') ? <Link key={i} href={m[2]}>{m[1]}</Link> : m[1];
  })}</>
);

export default function BlogPost({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();
  const path = postEncodedPath(p);
  const others = getPosts().filter((x) => x.slug !== p.slug).slice(0, 5);

  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '누수 노트', path: '/blog/' }, { name: p.title, path }]),
        {
          '@context': 'https://schema.org', '@type': 'Article',
          headline: p.title, description: p.description, inLanguage: 'ko',
          datePublished: p.publishedAt, dateModified: p.publishedAt,
          image: `${SITE_URL}/og/${encodeURIComponent(ogKey(p))}.jpg`,
          mainEntityOfPage: `${SITE_URL}${path}`,
          author: { '@id': `${SITE_URL}/#org` },
          publisher: { '@id': `${SITE_URL}/#org` },
          keywords: p.keyword,
        },
      ]} />
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><Link href="/blog/">누수 노트</Link></nav>
          <h1 className="page-title">{p.title}</h1>
          <p className="page-lead">{fmt(p.publishedAt)} · {BRAND}</p>
        </div>
      </section>
      <div className="wrap content">
        <article className="prose post">
          {p.sections.map((s, i) => (
            <section key={s.h} data-reveal>
              <h2>{s.h}</h2>
              {s.blocks.map((b, j) => {
                if (typeof b === 'string') return <p key={j} className={i === 0 && j === 0 ? 'first' : ''}><Inline text={b} /></p>;
                const Tag = b.ol ? 'ol' : 'ul';
                return <Tag key={j}>{b.items.map((t, k) => <li key={k}><Inline text={t} /></li>)}</Tag>;
              })}
            </section>
          ))}
        </article>
        {others.length > 0 && (
          <section className="sec">
            <SectionHead title="다른 글" />
            <ul className="linklist">{others.map((x) => <li key={x.slug}><Link href={postPath(x)}>{x.title}<IconArrow /></Link></li>)}</ul>
          </section>
        )}
        <section className="sec">
          <SectionHead title="가까운 지점으로 연락하세요" sub="성남 분당·판교는 분당점, 용인 처인·기흥·수지는 용인점입니다." />
          <BranchPair />
        </section>
        <p><Link href="/blog/" className="more">누수 노트 전체 <IconArrow /></Link></p>
      </div>
    </main>
  );
}
