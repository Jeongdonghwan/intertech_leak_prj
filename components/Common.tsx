// 공통 UI — 이모지 없이 선 아이콘, 각진(2px) 버튼, 지점 2곳 연락처.
import Link from 'next/link';
import { BRAND, BRANCH_LIST, HOURS, Branch, PHONE, tel } from '../lib/site';

export const JsonLd = ({ data }: { data: object | object[] }) => (
  <>{(Array.isArray(data) ? data : [data]).map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />)}</>
);

export const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const IconPhone = () => <Svg d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />;
export const IconArrow = () => <Svg d="M5 12h14M13 6l6 6-6 6" size={16} />;
export const IconPin = () => <Svg d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" size={16} />;

// 로고 글리프 — 물방울 + 측정 눈금 (파비콘과 같은 모양)
export const Glyph = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" fill="#0e7c86" />
    <path d="M16 6c3.6 4.6 6 8.1 6 11.2A6 6 0 0 1 10 17.2C10 14.1 12.4 10.6 16 6z" fill="#fff" />
    <path d="M6 26h20M9 23.5V26M16 23.5V26M23 23.5V26" stroke="#fff" strokeWidth="1.6" />
  </svg>
);

// 주 행동 — 지점명 + 번호를 버튼 글자로
export const Call = ({ dark = false }: { b?: Branch; dark?: boolean }) => (
  <a className={dark ? 'call call-line' : 'call'} href={tel} aria-label={`${BRAND} 대표번호 ${PHONE}`}>
    <IconPhone />
    <span><small>대표번호 · 24시간</small>{PHONE}</span>
    <IconArrow />
  </a>
);

export const SectionHead = ({ title, sub, light = false }: { title: string; sub?: string; light?: boolean }) => (
  <header className={light ? 'sh sh-light' : 'sh'} data-reveal>
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </header>
);

// 지점 두 곳을 나란히 — 홈·허브·키워드 페이지 공통. focus 가 있으면 그 지점을 앞에 두고 강조
export const BranchPair = ({ focus }: { focus?: Branch }) => {
  const list = focus ? [focus, ...BRANCH_LIST.filter((b) => b.key !== focus.key)] : BRANCH_LIST;
  return (
    <div className="pair">
      {list.map((b) => (
        <article key={b.key} className={focus && focus.key === b.key ? 'pair-col on' : 'pair-col'} data-reveal>
          <h3>{BRAND} <b>{b.name}</b>{focus && focus.key === b.key && <em>이 지역 담당</em>}</h3>
          <dl>
            <div><dt>주소</dt><dd>{b.addr}</dd></div>
            <div><dt>운영</dt><dd>{HOURS}</dd></div>
            <div><dt>담당</dt><dd>{b.area}</dd></div>
            <div><dt>접수</dt><dd>전화 · 방문접수/출장 · 예약</dd></div>
          </dl>
        </article>
      ))}
      <div className="pair-call"><span>두 지점 공통 대표번호</span><Call /></div>
    </div>
  );
};

// 헤더 — 흰 반투명 한 줄(로고 · 메뉴 · 대표번호), 스크롤하면 그림자
export const Header = () => (
  <header className="site-header">
    <div className="wrap header-inner">
      <Link href="/" className="logo" aria-label={`${BRAND} 홈`}>
        <Glyph size={30} />
        <span className="logo-text"><b><em>인터테크</em>누수</b><small>분당 · 용인 누수탐지</small></span>
      </Link>
      <nav className="nav" aria-label="주 메뉴">
        <Link href="/#process">진단 순서</Link>
        <Link href="/#branches">지점 안내</Link>
        <Link href="/area/">지역</Link>
        <Link href="/blog/">누수 노트</Link>
      </nav>
      <a className="head-tel" href={tel} aria-label={`대표번호 ${PHONE}`}><IconPhone /><span>{PHONE}</span></a>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="site-footer">
    <div className="wrap foot-grid">
      <div>
        <strong className="foot-brand"><Glyph size={26} />{BRAND}</strong>
        <p>누수탐지 · 누수공사 · 층간 · 벽간 · 화장실 · 바닥 · 공용배관 · 노후배관 · 보일러 누수<br />하수도 · 변기 뚫음 등 설비 · {HOURS}</p>
        <p>대표번호 <a href={tel}>{PHONE}</a></p>
        <p><Link href="/area/">지역 안내</Link> · <Link href="/blog/">누수 노트</Link> · <a href="/rss.xml">RSS</a></p>
      </div>
      {BRANCH_LIST.map((b) => (
        <ul key={b.key} className="foot-info">
          <li className="foot-head">{b.name}</li>
          <li>{b.addr}</li>
          <li><a href={b.place} target="_blank" rel="noopener noreferrer">네이버 플레이스</a></li>
        </ul>
      ))}
    </div>
    <div className="wrap foot-bottom">© {new Date().getFullYear()} {BRAND} · 상담 때 받은 주소·연락처는 방문과 안내에만 씁니다.</div>
  </footer>
);

export const StickyBar = () => (
  <div className="sticky-bar">
    <a href={tel}><IconPhone /><span>대표번호 · 24시간<b>{PHONE}</b></span></a>
  </div>
);
