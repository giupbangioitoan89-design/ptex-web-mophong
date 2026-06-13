import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimulationBoard from '@/components/SimulationBoard';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import type { IChapter, ISimulation } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ grade: string; chapterSlug: string; lessonSlug: string }>;
}

export default async function LessonSimulationPage({ params }: PageProps) {
  const { grade: gradeStr, chapterSlug, lessonSlug } = await params;
  const grade = parseInt(gradeStr);

  await connectDB();

  const chapter = await Chapter.findOne({ grade, slug: chapterSlug }).lean() as unknown as IChapter | null;
  const simulations = await Simulation.find({
    grade,
    chapterSlug,
    lessonSlug,
    isPublished: true,
  })
    .sort({ order: 1 })
    .lean() as unknown as ISimulation[];

  // Find the lesson info
  const lesson = chapter?.lessons.find((l) => l.slug === lessonSlug);
  const lessonTitle = lesson?.lessonTitle || lessonSlug;

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
            <Link href={`/lop/${grade}/${chapterSlug}`}>
              {chapter?.icon} Chương {chapter?.chapterNumber}
            </Link>
            <span className="separator">›</span>
            <span>Bài {lesson?.lessonNumber}</span>
          </div>

          {/* Header */}
          <div className="sim-header">
            <h1>{lessonTitle}</h1>
            {simulations.length > 0 && (
              <p className="sim-desc">
                {simulations.length} mô phỏng tương tác — Kéo thanh trượt để khám phá
              </p>
            )}
          </div>

          {/* Simulations */}
          {simulations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {simulations.map((sim, index) => (
                <div key={String(sim._id)} style={{ opacity: 0, animation: `fadeInUp 0.5s ease-out ${index * 0.15}s forwards` }}>
                  {simulations.length > 1 && (
                    <h2 style={{
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{
                        width: '28px', height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(99,102,241,0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-light)',
                      }}>
                        {index + 1}
                      </span>
                      {sim.title}
                    </h2>
                  )}
                  {simulations.length === 1 && sim.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      {sim.description}
                    </p>
                  )}
                  <SimulationBoard
                    simulation={JSON.parse(JSON.stringify(sim))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔬</div>
              <h3>Chưa có mô phỏng cho bài này</h3>
              <p>
                Mô phỏng sẽ được bổ sung sớm. Hãy quay lại sau hoặc chọn bài khác!
              </p>
              <Link
                href={`/lop/${grade}/${chapterSlug}`}
                className="back-btn"
                style={{ marginTop: '1rem' }}
              >
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

export async function generateMetadata({ params }: PageProps) {
  const { grade, chapterSlug, lessonSlug } = await params;
  await connectDB();
  const chapter = await Chapter.findOne({
    grade: parseInt(grade),
    slug: chapterSlug,
  }).lean() as unknown as IChapter | null;
  const lesson = chapter?.lessons.find((l) => l.slug === lessonSlug);
  return {
    title: lesson
      ? `${lesson.lessonTitle} — Mô phỏng Toán ${grade} — PTex`
      : `Mô phỏng — PTex`,
    description: lesson
      ? `Mô phỏng trực quan: ${lesson.lessonTitle} — Toán ${grade} Kết nối tri thức`
      : '',
  };
}
