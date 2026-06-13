import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GRADE_CARDS = [
  {
    grade: 10,
    color: 'var(--grade-10)',
    bgColor: 'var(--grade-10-bg)',
    label: 'Toán 10',
    chapters: 7,
    desc: 'Hàm số bậc 2 · Vectơ · Tam giác · Tọa độ mặt phẳng',
    icon: '📗',
  },
  {
    grade: 11,
    color: 'var(--grade-11)',
    bgColor: 'var(--grade-11-bg)',
    label: 'Toán 11',
    chapters: 7,
    desc: 'Lượng giác · Dãy số · Giới hạn · Hình không gian',
    icon: '📘',
  },
  {
    grade: 12,
    color: 'var(--grade-12)',
    bgColor: 'var(--grade-12-bg)',
    label: 'Toán 12',
    chapters: 6,
    desc: 'Đạo hàm · Tích phân · Tọa độ KG · Xác suất',
    icon: '📕',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <section className="hero">
          <h1>
            Toán Học
            <br />
            Trực Quan
          </h1>
          <p className="subtitle">
            Mô phỏng tương tác cho Toán 10-11-12 · Kết nối tri thức.
            <br />
            Kéo thanh trượt, quan sát đồ thị — hiểu ngay bản chất.
          </p>

          <div className="cta-row">
            <Link href="/lop/10" className="cta-btn primary">
              🚀 Bắt đầu khám phá
            </Link>
            <Link href="/lop/12" className="cta-btn secondary">
              📐 Lớp 12 — Đạo hàm
            </Link>
          </div>

          {/* Stats Pill */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-number">20</span>
              <span className="stat-label">Chương</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">63</span>
              <span className="stat-label">Bài</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Khối lớp</span>
            </div>
          </div>
        </section>

        {/* Grade Cards */}
        <section className="grade-cards">
          {GRADE_CARDS.map(({ grade, color, bgColor, label, chapters, desc, icon }) => (
            <Link
              key={grade}
              href={`/lop/${grade}`}
              className="grade-card animate-in"
              style={{ '--card-color': color } as React.CSSProperties}
            >
              <div className="glow" />
              <div className="grade-icon">{icon}</div>
              <div className="grade-label">{label}</div>
              <div className="grade-desc">{desc}</div>
              <div
                className="grade-chapters"
                style={{ background: bgColor, color }}
              >
                📚 {chapters} chương
              </div>
            </Link>
          ))}
        </section>

        {/* How it works */}
        <section className="content-section" style={{ marginTop: '4rem' }}>
          <h2
            className="section-title"
            style={{ textAlign: 'center', marginBottom: '1.5rem' }}
          >
            Đơn giản 3 bước
          </h2>
          <div className="features-grid">
            {[
              {
                icon: '📚',
                title: '1. Chọn bài',
                desc: 'Duyệt theo lớp → chương → bài',
              },
              {
                icon: '🎯',
                title: '2. Tương tác',
                desc: 'Kéo slider, thay đổi tham số, xem đồ thị đổi real-time',
              },
              {
                icon: '💡',
                title: '3. Hiểu ngay',
                desc: 'Quan sát trực quan, nắm vững bản chất toán học',
              },
            ].map((step, i) => (
              <div key={i} className="feature-card animate-in">
                <div className="feat-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
