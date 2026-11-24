import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OPEN_PAGES, PLACES, GUS, getPage, pagePath, pageEncodedPath, guPath, guEncodedPath, related } from '../../lib/data';
import { ray } from '../../lib/compose';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';
import { BRAND, shareMeta } from '../../lib/site';
import { Call, IconArrow, JsonLd } from '../../components/Common';

export const dynamicParams = false;

// 순차 오픈: lib/site.ts 의 OPEN_WAVE 이하 페이지만 생성
export function generateStaticParams() {
  return OPEN_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPage(params.slug);
  if (!p) return {};
  const r = ray(p);
  const c = r.c;
  const url = pageEncodedPath(p);
  return {
    title: r.title,
    description: c.description,
    alternates: { canonical: url },
    ...shareMeta(p.slug, `${p.kw} - ${BRAND} ${c.branch.name}`, { title: r.title, description: c.description, url }),
  };
}

// 레이 모범 구조(2026-11-24): 분류 줄 → h1(키워드+수식어) → 설명 → 핵심 요약 → 번호 절 6개(한 문단) → 사진 → FAQ → 관련 링크
export default function KeywordPage({ params }: { params: { slug: string } }) {
  const p = getPage(params.slug);
  if (!p) notFound();
  const r = ray(p);
  const c = r.c;
  const P = PLACES[p.place];
  const G = GUS[p.gu];
  const b = c.branch;
  const rel0 = related(p);
  const rel = { samePlace: rel0.samePlace.slice(0, 5), sameGu: rel0.sameGu.slice(0, 5), otherGu: rel0.otherGu.slice(0, 3) };
  const path = pageEncodedPath(p);
  const relList = [...rel.samePlace, ...rel.sameGu, ...rel.otherGu].map((x) => ({ name: x.kw, path: pageEncodedPath(x) }));
  const [lead, ...more] = c.photos;
  const strip = more.slice(0, 3);

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '지역', path: '/area/' },
            { name: G.full, path: guEncodedPath(p.gu) },
            { name: p.kw, path },
          ]),
          serviceJsonLd({ name: p.kw, type: c.wl, description: c.description, path, area: `${G.full}${P.unit === '구' || P.unit === '시·군' ? '' : ' ' + P.name}`, branch: b }),
          faqJsonLd(r.faq),
          itemListJsonLd(relList.length ? relList : [{ name: `${G.full} 지역 안내`, path: guEncodedPath(p.gu) }]),
        ]}
      />

      <section className="hero hero-kw">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <nav className="crumbs" aria-label="경로">
              <Link href="/">홈</Link><span>/</span><Link href="/area/">지역</Link><span>/</span><Link href={guPath(p.gu)}>{G.full}</Link>
            </nav>
            <p className="hero-cat">{r.cat}</p>
            <h1 className="ray-h1"><span>{p.kw}</span>{' '}<span className="hero-sub">{r.h1sub}</span></h1>
            <p className="hero-lead">{r.lead}</p>
            <div className="hero-calls"><Call b={b} /></div>
          </div>
          <div className="hero-visual">
            <figure className="arch"><img src={`/img/${lead.p.id}.webp`} alt={`${p.kw} - ${lead.caption}`} width={lead.p.w} height={lead.p.h} /></figure>
            <p className="float float-tl"><small>{G.full}</small><b>{b.name} 담당</b></p>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="answer" data-reveal>
          <h2>{p.kw} 핵심 요약</h2>
          <p>{r.summary}</p>
          <dl className="ray-facts">{r.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      </div>

      <div className="wrap ray">
        <article className="ray-article">
          {r.sections.map((x) => (
            <section key={x.h} data-reveal>
              <h2>{x.h}</h2>
              <p>{x.p}</p>
            </section>
          ))}
        </article>

        <div className="kw-strip ray-shots">
          {strip.map(({ p: x, caption }) => (
            <figure key={x.id}>
              <img src={`/img/${x.id}.webp`} alt={`${p.kw} - ${caption}`} width={x.w} height={x.h} loading="lazy" />
              <figcaption>{caption}</figcaption>
            </figure>
          ))}
        </div>

        <section className="ray-faq" id="faq">
          <h2>{p.kw} 자주 묻는 질문</h2>
          <div className="faq">{r.faq.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </section>

        <section className="ray-rel">
          <h2>{p.kw} 관련 안내</h2>
          <div className="related">
            {rel.samePlace.length > 0 && <div><h3>{P.name} 다른 안내</h3><ul>{rel.samePlace.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            {rel.sameGu.length > 0 && <div><h3>{G.full} 다른 동네</h3><ul>{rel.sameGu.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            <div><h3>다른 지역</h3><ul>
              {rel.otherGu.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}
              <li><Link href={guPath(p.gu)}>{G.full} 안내 전체<IconArrow /></Link></li>
              {relList.length < 9 && <li><Link href="/area/">지역별 안내<IconArrow /></Link></li>}
            </ul></div>
          </div>
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>{c.closing.heading}</h2>
          <p>{c.closing.text}</p>
          <div className="hero-calls"><Call b={b} /></div>
        </div>
      </section>
    </main>
  );
}
