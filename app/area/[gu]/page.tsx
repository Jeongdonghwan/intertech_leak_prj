import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BRAND, BRANCHES, PHONE, shareMeta } from '../../../lib/site';
import { GUS, PLACES, openGus, guPages, pagePath, pageEncodedPath, guEncodedPath, Page } from '../../../lib/data';
import { WORD_LABEL } from '../../../lib/compose';
import { breadcrumbJsonLd, itemListJsonLd } from '../../../lib/jsonld';
import { BranchPair, JsonLd, SectionHead } from '../../../components/Common';

export const dynamicParams = false;
export function generateStaticParams() {
  return openGus().map((gu) => ({ gu }));
}
const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export function generateMetadata({ params }: { params: { gu: string } }): Metadata {
  const gu = dec(params.gu);
  const G = GUS[gu];
  if (!G) return {};
  const b = BRANCHES[G.branch];
  const title = `${G.full} 누수탐지·누수공사 지역 안내 | ${BRAND} ${b.name}`;
  const description = `${G.full} 동네별 누수·누수탐지·누수공사 안내. ${b.name} 담당, 대표번호 ${PHONE} 24시간·연중무휴. ${G.note.split('. ')[0]}.`.slice(0, 158);
  return {
    title, description, alternates: { canonical: guEncodedPath(gu) },
    ...shareMeta(`area-${gu}`, `${G.full} ${BRAND}`, { title, description, url: guEncodedPath(gu) }),
  };
}

export default function GuPage({ params }: { params: { gu: string } }) {
  const gu = dec(params.gu);
  const G = GUS[gu];
  if (!G) notFound();
  const b = BRANCHES[G.branch];
  const pages = guPages(gu);
  const byPlace = new Map<string, Page[]>();
  for (const p of pages) { const a = byPlace.get(p.place) || []; a.push(p); byPlace.set(p.place, a); }
  const words = Array.from(new Set(pages.map((p) => p.word)));
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '지역', path: '/area/' }, { name: G.full, path: guEncodedPath(gu) }]),
        itemListJsonLd(pages.map((p) => ({ name: p.kw, path: pageEncodedPath(p) }))),
      ]} />
      <section className="page-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><Link href="/area/">지역</Link><span>/</span><span>{G.full}</span></nav>
          <h1 className="page-title">{G.full} 누수탐지 · 누수공사</h1>
          <p className="page-lead">{G.note} {G.full}는 {b.name}이 맡고, 전화는 대표번호 {PHONE}로 받습니다.</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <SectionHead title="동네별 안내" sub={`다루는 주제: ${words.map(WORD_LABEL).join(' · ')}`} />
          <div className="hub">
            {Array.from(byPlace.entries()).map(([place, list]) => (
              <div key={place} className="hub-col" data-reveal>
                <h3>{PLACES[place].name}</h3>
                <p>{PLACES[place].note}</p>
                <ul>{list.map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}</Link></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="sec mist"><div className="wrap"><SectionHead title={`${G.full} 담당 지점`} /><BranchPair focus={b} /></div></section>
    </main>
  );
}
