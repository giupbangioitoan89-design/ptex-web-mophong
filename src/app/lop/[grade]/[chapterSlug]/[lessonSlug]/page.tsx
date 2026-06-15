import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MultiSimLayout from '@/components/MultiSimLayout';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import type { IChapter, ISimulation } from '@/types';

import { CURRICULUM } from '@/data/curriculum';

// ✅ Disable ISR cache for immediate database updates during development/preview
export const revalidate = 0;

interface PageProps {
  params: Promise<{ grade: string; chapterSlug: string; lessonSlug: string }>;
}

export async function generateStaticParams() {
  const params: { grade: string; chapterSlug: string; lessonSlug: string }[] = [];
  for (const item of CURRICULUM) {
    for (const lesson of item.lessons) {
      params.push({
        grade: String(item.grade),
        chapterSlug: item.slug,
        lessonSlug: lesson.slug,
      });
    }
  }
  return params;
}

export default async function LessonSimulationPage({ params }: PageProps) {
  const { grade: gradeStr, chapterSlug, lessonSlug } = await params;
  const grade = parseInt(gradeStr);

  await connectDB();

  // ✅ Parallel queries — saves ~200ms
  const [chapter, simulations] = await Promise.all([
    Chapter.findOne({ grade, slug: chapterSlug })
      .select('chapterNumber chapterTitle icon color lessons')
      .lean() as Promise<IChapter | null>,
    Simulation.find({ grade, chapterSlug, lessonSlug, isPublished: true })
      .sort({ order: 1 })
      .lean() as Promise<ISimulation[]>,
  ]);

  const lesson = chapter?.lessons.find((l) => l.slug === lessonSlug);
  const lessonTitle = lesson?.lessonTitle || lessonSlug;

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
            <Link href={`/lop/${grade}/${chapterSlug}`}>
              {chapter?.icon} Chương {chapter?.chapterNumber}
            </Link>
            <span className="separator">›</span>
            <span>Bài {lesson?.lessonNumber}</span>
          </div>

          <div className="sim-header">
            <h1>{lessonTitle}</h1>
            {simulations.length > 0 && (
              <p className="sim-desc">
                {simulations.length} mô phỏng tương tác — Chọn tab để chuyển đổi
              </p>
            )}
          </div>

          {simulations.length > 0 ? (
            <MultiSimLayout simulations={JSON.parse(JSON.stringify(simulations))} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔬</div>
              <h3>Chưa có mô phỏng cho bài này</h3>
              <p>Mô phỏng sẽ được bổ sung sớm. Hãy quay lại sau hoặc chọn bài khác!</p>
              <Link href={`/lop/${grade}/${chapterSlug}`} className="back-btn" style={{ marginTop: '1rem' }}>
                ← Quay lại chương
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

// ✅ No DB call for metadata — use URL params only
export async function generateMetadata({ params }: PageProps) {
  const { grade, lessonSlug } = await params;
  const title = lessonSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${title} — Mô phỏng Toán ${grade} — PTex`,
    description: `Mô phỏng trực quan Toán ${grade} — Kết nối tri thức`,
  };
}
