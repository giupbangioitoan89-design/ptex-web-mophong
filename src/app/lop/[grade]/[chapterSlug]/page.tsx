import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import type { IChapter } from '@/types';

import { CURRICULUM } from '@/data/curriculum';

// ✅ ISR: cache for 30 min (sim counts may change more often)
export const revalidate = 1800;

interface PageProps {
  params: Promise<{ grade: string; chapterSlug: string }>;
}

export async function generateStaticParams() {
  const params: { grade: string; chapterSlug: string }[] = [];
  for (const item of CURRICULUM) {
    params.push({
      grade: String(item.grade),
      chapterSlug: item.slug,
    });
  }
  return params;
}

export default async function ChapterPage({ params }: PageProps) {
  const { grade: gradeStr, chapterSlug } = await params;
  const grade = parseInt(gradeStr);

  await connectDB();

  // ✅ Run both queries in parallel
  const [chapter, simCounts] = await Promise.all([
    Chapter.findOne({ grade, slug: chapterSlug }).lean() as Promise<IChapter | null>,
    Simulation.aggregate([
      { $match: { grade, chapterSlug, isPublished: true } },
      { $group: { _id: '$lessonSlug', count: { $sum: 1 } } },
    ]),
  ]);

  if (!chapter) {
    return (
      <>
        <Navbar />
        <div className="content-section">
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3>Không tìm thấy chương</h3>
            <p>
              <Link href={`/lop/${grade}`} className="back-btn">
                ← Quay lại Toán {grade}
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  const simCountMap: Record<string, number> = {};
  for (const s of simCounts) {
    simCountMap[s._id] = s.count;
  }

  return (
    <>
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="content-section">
          <div className="breadcrumbs">
            <Link href="/">Trang chủ</Link>
            <span className="separator">›</span>
            <Link href={`/lop/${grade}`}>Toán {grade}</Link>
            <span className="separator">›</span>
            <span>{chapter.icon} Chương {chapter.chapterNumber}</span>
          </div>

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

          <div className="lesson-list">
            {chapter.lessons.map((lesson) => {
              const simCount = simCountMap[lesson.slug] || 0;
              return (
                <Link
                  key={lesson.slug}
                  href={`/lop/${grade}/${chapterSlug}/${lesson.slug}`}
                  className={`lesson-item animate-in ${simCount > 0 ? 'has-sim' : ''}`}
                >
                  <div className="lesson-number" style={{ background: simCount > 0 ? `${chapter.color}20` : 'rgba(255,255,255,0.05)', color: simCount > 0 ? chapter.color : 'var(--text-muted)' }}>
                    {lesson.lessonNumber}
                  </div>
                  <div className="lesson-info">
                    <div className="lesson-title">{lesson.lessonTitle}</div>
                    <div className="lesson-meta">
                      {simCount > 0
                        ? `🎯 ${simCount} mô phỏng tương tác`
                        : '📝 Sắp có mô phỏng'}
                    </div>
                  </div>
                  <div className="lesson-arrow">{simCount > 0 ? '▶' : '→'}</div>
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

// ✅ Metadata without extra DB call
export async function generateMetadata({ params }: PageProps) {
  const { grade, chapterSlug } = await params;
  return {
    title: `Chương — Toán ${grade} — PTex Mô Phỏng`,
    description: `Mô phỏng trực quan Toán ${grade} — ${chapterSlug} — Kết nối tri thức`,
  };
}
