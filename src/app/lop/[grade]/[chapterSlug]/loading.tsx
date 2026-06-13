import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="content-section">
          <div className="breadcrumbs">
            <div className="skeleton" style={{ width: 60, height: 14 }} />
            <span className="separator">›</span>
            <div className="skeleton" style={{ width: 70, height: 14 }} />
            <span className="separator">›</span>
            <div className="skeleton" style={{ width: 100, height: 14 }} />
          </div>

          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 14 }} />
            <div>
              <div className="skeleton" style={{ width: 120, height: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 240, height: 24 }} />
            </div>
          </div>

          <div className="lesson-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
