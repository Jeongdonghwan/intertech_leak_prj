import Link from 'next/link';
import { BranchPair } from '../components/Common';

export default function NotFound() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <h1 className="page-title">페이지를 찾을 수 없습니다</h1>
          <p className="page-lead">주소가 바뀌었거나 아직 열리지 않은 페이지입니다. <Link href="/area/">지역 목록</Link>에서 찾거나 가까운 지점으로 전화 주세요.</p>
        </div>
      </section>
      <div className="wrap content"><BranchPair /></div>
    </main>
  );
}
