import { SITE_URL, SITE_NAME, BRAND, BRANCH_LIST, Branch, PHONE, UPDATED } from './site';

const branchLd = (b: Branch) => ({
  '@type': 'Plumber',
  '@id': `${SITE_URL}/#${b.key}`,
  name: `${BRAND} ${b.name}`,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/img/p1.jpg`,
  telephone: PHONE,
  address: { '@type': 'PostalAddress', addressCountry: 'KR', addressRegion: b.region, addressLocality: b.locality, streetAddress: b.addr.replace(/^경기 \S+ \S+ /, '') },
  geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng },
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
  areaServed: b.key === 'bundang' ? ['성남시 분당구', '판교', '수지', '죽전'] : ['용인시 처인구', '용인시 기흥구', '용인시 수지구'],
  sameAs: [b.place],
  parentOrganization: { '@id': `${SITE_URL}/#org` },
});

// 업체 — 브랜드(Organization) 1 + 지점(Plumber) 2
export const businessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: BRAND, url: `${SITE_URL}/`, logo: `${SITE_URL}/icon.png`, sameAs: BRANCH_LIST.map((b) => b.place),
      department: BRANCH_LIST.map((b) => ({ '@id': `${SITE_URL}/#${b.key}` })),
      knowsAbout: ['누수탐지', '누수공사', '층간 누수', '벽간 누수', '화장실 누수', '바닥 누수', '공용배관 누수', '노후배관', '보일러 배관 누수', '하수도 뚫음', '변기 뚫음'] },
    ...BRANCH_LIST.map(branchLd),
  ],
});

export const webSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'ko',
  publisher: { '@id': `${SITE_URL}/#org` },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: i === 0 ? BRAND : it.name, item: `${SITE_URL}${it.path}` })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const serviceJsonLd = (o: { name: string; type: string; description: string; path: string; area: string; branch: Branch }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: o.name,
  serviceType: o.type,
  description: o.description,
  url: `${SITE_URL}${o.path}`,
  areaServed: { '@type': 'Place', name: o.area },
  dateModified: UPDATED,
  provider: { '@id': `${SITE_URL}/#${o.branch.key}` },
});

// 캐러셀 ItemList — 같은 도메인 절대 URL, path 는 인코딩된 경로
export const itemListJsonLd = (items: { name: string; path: string; image?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${it.path}`, name: it.name,
    ...(it.image ? { image: `${SITE_URL}${it.image}` } : {}),
  })),
});
