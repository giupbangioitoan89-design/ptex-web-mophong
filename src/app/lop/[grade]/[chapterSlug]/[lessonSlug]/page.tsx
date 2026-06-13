import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimulationBoard from '@/components/SimulationBoard';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import type { IChapter, ISimulation } from '@/types';

// ✅ ISR: cache 10 min (simulation code changes rarely)
export const revalidate = 600;

interface PageProps {
  params: Promise<{ grade: string; chapterSlug: string; lessonSlug: string }>;
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
                {simulations.length} mô phỏng tương tác — Kéo thanh trượt để khám phá
              </p>
            )}
          </div>

          {simulations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {simulations.map((sim, index) => (
                <div key={String(sim._id)} style={{ opacity: 0, animation: `fadeInUp 0.5s ease-out ${index * 0.15}s forwards` }}>
                  {simulations.length > 1 && (
                    <h2 style={{
                      fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem',
                      color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'rgba(99,102,241,0.15)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-light)',
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
                  <SimulationBoard simulation={JSON.parse(JSON.stringify(sim))} />
                </div>
              ))}
            </div>
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
