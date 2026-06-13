import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import type { IChapter } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ grade: string; chapterSlug: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { grade: gradeStr, chapterSlug } = await params;
  const grade = parseInt(gradeStr);

  await connectDB();

  const chapter = await Chapter.findOne({ grade, slug: chapterSlug }).lean() as unknown as IChapter | null;

  if (!chapter) {
    return (
      <>
        <Navbar />
        <div className="content-section">
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3>Không tìm thấy chương</h3>
            <p>
              <Link href={`/lop/${grade}`} style={{ color: 'var(--color-primary-light)' }}>
                ← Quay lại Toán {grade}
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  // Get simulation counts per lesson
  const simCounts = await Simulation.aggregate([
    { $match: { grade, chapterSlug, isPublished: true } },
    { $group: { _id: '$lessonSlug', count: { $sum: 1 } } },
  ]);
  const simCountMap: Record<string, number> = {};
  for (const s of simCounts) {
    simCountMap[s._id] = s.count;
  }

  return (
    <>
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="content-section">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <Link href="/">Trang chủ</Link>
            <span className="separator">›</span>
            <Link href={`/lop/${grade}`}>Toán {grade}</Link>
            <span className="separator">›</span>
            <span>{chapter.icon} Chương {chapter.chapterNumber}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '2rem',
                width: '56px', height: '56px',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${chapter.color}20`,
              }}>
                {chapter.icon}
              </span>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Chương {chapter.chapterNumber} · Tập {chapter.volume}
                </div>
                <h1 className="section-title">{chapter.chapterTitle}</h1>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="lesson-list">
            {chapter.lessons.map((lesson) => {
              const simCount = simCountMap[lesson.slug] || 0;
              return (
                <Link
                  key={lesson.slug}
                  href={`/lop/${grade}/${chapterSlug}/${lesson.slug}`}
                  className="lesson-item animate-in"
                >
                  <div className="lesson-number" style={{ background: `${chapter.color}20`, color: chapter.color }}>
                    {lesson.lessonNumber}
                  </div>
                  <div className="lesson-info">
                    <div className="lesson-title">{lesson.lessonTitle}</div>
                    <div className="lesson-meta">
                      {simCount > 0
                        ? `🎯 ${simCount} mô phỏng`
                        : '📝 Chưa có mô phỏng'}
                    </div>
                  </div>
                  <div className="lesson-arrow">→</div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { grade, chapterSlug } = await params;
  await connectDB();
  const chapter = await Chapter.findOne({ grade: parseInt(grade), slug: chapterSlug }).lean() as unknown as IChapter | null;
  return {
    title: chapter
      ? `${chapter.chapterTitle} — Toán ${grade} — PTex Mô Phỏng`
      : `Chương — PTex Mô Phỏng`,
    description: chapter
      ? `Mô phỏng trực quan cho ${chapter.chapterTitle} — Toán ${grade} Kết nối tri thức`
      : '',
  };
}
