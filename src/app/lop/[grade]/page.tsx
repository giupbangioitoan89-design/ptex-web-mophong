import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChapterCard from '@/components/ChapterCard';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import type { IChapter } from '@/types';

// ✅ ISR: cache page for 30 minutes, rebuild on next request after expiry
export const revalidate = 1800;

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
  
  // ✅ Query both chapters and simulation counts in parallel
  const [chapters, simCounts] = await Promise.all([
    Chapter.find({ grade }).sort({ order: 1 }).lean() as unknown as IChapter[],
    Simulation.aggregate([
      { $match: { grade, isPublished: true } },
      {
        $group: {
          _id: { chapterSlug: '$chapterSlug', lessonSlug: '$lessonSlug' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Map counts to the respective chapter lessons
  const simCountMap: Record<string, Record<string, number>> = {};
  for (const s of simCounts) {
    const { chapterSlug, lessonSlug } = s._id || {};
    if (chapterSlug && lessonSlug) {
      if (!simCountMap[chapterSlug]) {
        simCountMap[chapterSlug] = {};
      }
      simCountMap[chapterSlug][lessonSlug] = s.count;
    }
  }

  const updatedChapters = chapters.map((chapter) => {
    const lessons = chapter.lessons.map((lesson) => {
      const count = simCountMap[chapter.slug]?.[lesson.slug] || 0;
      return { ...lesson, simulationCount: count };
    });
    return { ...chapter, lessons };
  });

  return (
    <>
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="content-section">
          <div className="breadcrumbs">
            <Link href="/">Trang chủ</Link>
            <span className="separator">›</span>
            <span style={{ color: info.color }}>{info.icon} {info.label}</span>
          </div>

          <div className="section-header">
            <h1 className="section-title" style={{ color: info.color }}>
              {info.icon} {info.label} — Kết nối tri thức
            </h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {updatedChapters.length} chương
            </span>
          </div>

          {updatedChapters.length > 0 ? (
            <div className="chapter-grid">
              {updatedChapters.map((chapter) => (
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

// ✅ Static metadata — no DB query needed
export async function generateMetadata({ params }: PageProps) {
  const { grade } = await params;
  const info = GRADE_INFO[parseInt(grade)] || GRADE_INFO[10];
  return {
    title: `${info.label} — PTex Mô Phỏng Toán`,
    description: `Các mô phỏng trực quan cho chương trình ${info.label} — Kết nối tri thức`,
  };
}
