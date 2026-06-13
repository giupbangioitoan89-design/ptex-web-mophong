import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GRADE_CARDS = [
  {
    grade: 10,
    color: '#22c55e',
    desc: '7 chương · Hàm số, Vectơ, Tam giác, Tọa độ...',
    icon: '📗',
  },
  {
    grade: 11,
    color: '#3b82f6',
    desc: '7 chương · Lượng giác, Dãy số, Giới hạn, Không gian...',
    icon: '📘',
  },
  {
    grade: 12,
    color: '#ef4444',
    desc: '6 chương · Đạo hàm, Tích phân, Tọa độ KG, Xác suất...',
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
            Mô Phỏng Toán Học
            <br />
            Trực Quan
          </h1>
          <p>
            Khám phá Toán 10-11-12 qua các mô phỏng tương tác.
            Kéo, thả, điều chỉnh — hiểu bản chất toán học ngay trên trình duyệt.
          </p>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number">20</div>
              <div className="stat-label">Chương</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">Khối lớp</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Mô phỏng</div>
            </div>
          </div>
        </section>

        {/* Grade Cards */}
        <section className="grade-cards">
          {GRADE_CARDS.map(({ grade, color, desc, icon }) => (
            <Link
              key={grade}
              href={`/lop/${grade}`}
              className="grade-card animate-in"
              style={{ '--card-color': color } as React.CSSProperties}
            >
              <div
                className="grade-number"
                style={{ color }}
              >
                {icon}
              </div>
              <div className="grade-label">Toán {grade}</div>
              <div className="grade-desc">{desc}</div>
            </Link>
          ))}
        </section>

        {/* How it works */}
        <section className="content-section" style={{ marginTop: '4rem' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Cách hoạt động
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📚', title: 'Chọn bài học', desc: 'Duyệt theo lớp và chương trong chương trình Kết nối tri thức' },
              { icon: '🎯', title: 'Tương tác trực quan', desc: 'Kéo thanh trượt, thay đổi tham số, quan sát đồ thị thay đổi real-time' },
              { icon: '💡', title: 'Hiểu bản chất', desc: 'Nắm vững kiến thức qua trải nghiệm trực quan, không chỉ công thức' },
            ].map((step, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
