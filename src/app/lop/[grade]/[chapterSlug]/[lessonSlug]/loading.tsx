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
            <div className="skeleton" style={{ width: 80, height: 14 }} />
            <span className="separator">›</span>
            <div className="skeleton" style={{ width: 50, height: 14 }} />
          </div>

          <div className="sim-header">
            <div className="skeleton" style={{ width: 320, height: 26, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 200, height: 16 }} />
          </div>

          <div className="sim-wrapper">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '5/4', borderRadius: 24 }} />
            <div className="skeleton" style={{ width: '100%', height: 80, borderRadius: 16 }} />
          </div>
        </div>
      </main>
    </>
  );
}
