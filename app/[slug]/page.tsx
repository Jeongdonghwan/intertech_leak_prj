import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OPEN_PAGES, PLACES, GUS, getPage, pagePath, pageEncodedPath, guPath, guEncodedPath, related } from '../../lib/data';
import { compose } from '../../lib/compose';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';
import { BRAND, shareMeta } from '../../lib/site';
import { BranchPair, Call, IconArrow, JsonLd, SectionHead } from '../../components/Common';

export const dynamicParams = false;

// 순차 오픈: lib/site.ts 의 OPEN_WAVE 이하 페이지만 생성
export function generateStaticParams() {
  return OPEN_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPage(params.slug);
  if (!p) return {};
  const c = compose(p);
  const url = pageEncodedPath(p);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url },
    ...shareMeta(p.slug, `${p.kw} - ${BRAND} ${c.branch.name}`, { title: c.title, description: c.description, url }),
  };
}

export default function KeywordPage({ params }: { params: { slug: string } }) {
  const p = getPage(params.slug);
  if (!p) notFound();
  const c = compose(p);
  const P = PLACES[p.place];
  const G = GUS[p.gu];
  const b = c.branch;
  const rel = related(p);
  const path = pageEncodedPath(p);
  const relList = [...rel.samePlace, ...rel.sameGu, ...rel.otherGu].map((x) => ({ name: x.kw, path: pageEncodedPath(x) }));
  const [lead, ...rest] = c.photos;

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
          faqJsonLd(c.faq),
          itemListJsonLd(relList.length ? relList : [{ name: `${G.full} 지역 안내`, path: guEncodedPath(p.gu) }]),
        ]}
      />

      <section className="hero hero-kw">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <nav className="crumbs" aria-label="경로">
              <Link href="/">홈</Link><span>/</span><Link href="/area/">지역</Link><span>/</span><Link href={guPath(p.gu)}>{G.full}</Link>
            </nav>
            <h1>{p.kw}</h1>
            <p className="hero-lead">{c.lead}</p>
            <div className="hero-calls"><Call b={b} /></div>
          </div>
          <figure className="hero-visual">
            <img src={`/img/${lead.p.id}.webp`} alt={`${p.kw} - ${lead.caption}`} width={lead.p.w} height={lead.p.h} />
            <dl className="chart chart-dl">{c.summary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </figure>
        </div>
      </section>

      <div className="wrap">
        <section className="answer" aria-label="요약" data-reveal>
          <h2>{p.kw}, 먼저 답부터</h2>
          <p>{c.answer}</p>
        </section>
      </div>

      <section className="sec">
        <div className="wrap cols">
          <div>
            <SectionHead title={c.service.heading} />
            <div className="prose" data-reveal>{c.service.paras.map((t, i) => <p key={i}>{t}</p>)}</div>
          </div>
          <aside className="side" data-reveal>
            <h3>{c.service.list.title}</h3>
            <ul className="sq">{c.service.list.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="sec mist">
        <div className="wrap">
          <SectionHead title={c.stepsHeading} />
          <ol className="path path-text reveal-group">
            {c.steps.map((st) => <li key={st.k}><span className="path-k">{st.k}</span><p>{st.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap cols">
          <div>
            <SectionHead title={c.region.heading} />
            <div className="prose" data-reveal>{c.region.paras.map((t, i) => <p key={i}>{t}</p>)}</div>
          </div>
          <aside className="side" data-reveal>
            <h3>{P.name} 주변</h3>
            <ul className="sq">{c.region.spots.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="side-note">{G.full} · {b.name} 담당</p>
          </aside>
        </div>
      </section>

      <section className="sec tint">
        <div className="wrap">
          <SectionHead title={c.mod.heading} />
          <div className="prose" data-reveal>{c.mod.paras.map((t, i) => <p key={i}>{t}</p>)}</div>
          {c.mod.table && (
            <dl className="facts facts-wide" data-reveal>{c.mod.table.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          )}
        </div>
      </section>

      <section className="sec">
        <div className="wrap signs">
          <div>
            <SectionHead title={c.signs.heading} />
            <ul className="sq sq-lg reveal-group">{c.signs.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="shots">
            {rest.map(({ p: x, caption }) => (
              <figure key={x.id} data-reveal>
                <img src={`/img/${x.id}.webp`} alt={`${p.kw} 참고 사진 - ${caption}`} width={x.w} height={x.h} loading="lazy" />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="sec slate">
        <div className="wrap">
          <SectionHead light title={c.types.heading} sub={c.types.text} />
          <div className="tbl-wrap" data-reveal>
            <table className="tbl">
              <thead><tr><th scope="col">유형</th><th scope="col">새는 곳</th><th scope="col">먼저 하는 확인</th></tr></thead>
              <tbody>{c.types.rows.map((t) => <tr key={t.name}><th scope="row">{t.name}</th><td>{t.where}</td><td>{t.check}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec mist">
        <div className="wrap">
          <SectionHead title={`${P.name} 담당 지점`} sub={c.cta} />
          <BranchPair focus={b} />
        </div>
      </section>

      <section className="sec" id="faq">
        <div className="wrap narrow">
          <SectionHead title="자주 묻는 질문" />
          <div className="faq">{c.faq.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </div>
      </section>

      <section className="sec mist">
        <div className="wrap">
          <SectionHead title="이어서 볼 안내" />
          <div className="related">
            {rel.samePlace.length > 0 && <div><h3>{P.name} 다른 안내</h3><ul>{rel.samePlace.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            {rel.sameGu.length > 0 && <div><h3>{G.full} 다른 동네</h3><ul>{rel.sameGu.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            <div><h3>다른 지역</h3><ul>
              {rel.otherGu.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}
              <li><Link href={guPath(p.gu)}>{G.full} 안내 전체<IconArrow /></Link></li>
            </ul></div>
          </div>
        </div>
      </section>

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
