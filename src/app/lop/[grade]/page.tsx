import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChapterCard from '@/components/ChapterCard';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import type { IChapter } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ grade: string }>;
}

const GRADE_INFO: Record<number, { label: string; color: string; icon: string }> = {
  10: { label: 'Toán 10', color: '#22c55e', icon: '📗' },
  11: { label: 'Toán 11', color: '#3b82f6', icon: '📘' },
  12: { label: 'Toán 12', color: '#ef4444', icon: '📕' },
};

export default async function GradePage({ params }: PageProps) {
  const { grade: gradeStr } = await params;
  const grade = parseInt(gradeStr) as 10 | 11 | 12;
  const info = GRADE_INFO[grade] || GRADE_INFO[10];

  await connectDB();
  const chapters = await Chapter.find({ grade }).sort({ order: 1 }).lean() as unknown as IChapter[];

  return (
    <>
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="content-section">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <Link href="/">Trang chủ</Link>
            <span className="separator">›</span>
            <span style={{ color: info.color }}>{info.icon} {info.label}</span>
          </div>

          {/* Header */}
          <div className="section-header">
            <h1 className="section-title" style={{ color: info.color }}>
              {info.icon} {info.label} — Kết nối tri thức
            </h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {chapters.length} chương
            </span>
          </div>

          {/* Chapter Grid */}
          {chapters.length > 0 ? (
            <div className="chapter-grid">
              {chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.slug}
                  chapter={JSON.parse(JSON.stringify(chapter))}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Chưa có dữ liệu</h3>
              <p>
                Vui lòng gọi API seed để tạo dữ liệu chương:
                <br />
                <code style={{ color: 'var(--color-primary-light)' }}>POST /api/seed</code>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}


export async function generateMetadata({ params }: PageProps) {
  const { grade } = await params;
  const info = GRADE_INFO[parseInt(grade)] || GRADE_INFO[10];
  return {
    title: `${info.label} — PTex Mô Phỏng Toán`,
    description: `Các mô phỏng trực quan cho chương trình ${info.label} — Kết nối tri thức`,
  };
}
