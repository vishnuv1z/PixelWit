export default function EditorSkeleton() {
  const s = {
    pulse: {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-pulse 1.5s infinite',
      borderRadius: 6,
    }
  };

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #e5e7eb', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '20px 20px 16px',
      }}>

        <div className="d-flex align-items-center gap-3 mb-3">
          <div style={{ ...s.pulse, width: 66, height: 66, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...s.pulse, height: 14, width: '60%', marginBottom: 8 }} />
            <div style={{ ...s.pulse, height: 11, width: '80%' }} />
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <div style={{ ...s.pulse, height: 12, width: 70 }} />
          <div style={{ ...s.pulse, height: 12, width: 50 }} />
        </div>

        <div style={{ ...s.pulse, height: 11, width: '100%', marginBottom: 6 }} />
        <div style={{ ...s.pulse, height: 11, width: '90%',  marginBottom: 6 }} />
        <div style={{ ...s.pulse, height: 11, width: '70%',  marginBottom: 14 }} />

        <div className="d-flex gap-2 mb-4">
          <div style={{ ...s.pulse, height: 22, width: 72, borderRadius: 20 }} />
          <div style={{ ...s.pulse, height: 22, width: 60, borderRadius: 20 }} />
          <div style={{ ...s.pulse, height: 22, width: 50, borderRadius: 20 }} />
        </div>

        <div style={{ ...s.pulse, height: 38, width: '100%', borderRadius: 25 }} />

      </div>
    </>
  );
}