import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="content-section">
          {/* Breadcrumb skeleton */}
          <div className="breadcrumbs">
            <div className="skeleton" style={{ width: 60, height: 14 }} />
            <span className="separator">›</span>
            <div className="skeleton" style={{ width: 80, height: 14 }} />
          </div>

          {/* Title skeleton */}
          <div className="section-header">
            <div className="skeleton" style={{ width: 280, height: 28 }} />
          </div>

          {/* Cards skeleton */}
          <div className="chapter-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
