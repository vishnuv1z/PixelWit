import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditorCard({ editor, onCreateRequest, isClient }) {
  const navigate  = useNavigate();
  const available = editor.availability === 'AVAILABLE';

  // Consistent colored ring per editor based on name initial
  const ringColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const ringColor  = ringColors[(editor.name?.charCodeAt(0) || 0) % ringColors.length];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
      onClick={() => navigate(`/client/editor/${editor._id}`)}
    >
      <div style={{ padding: '20px 20px 16px', flexGrow: 1 }}>

        {/* Header — photo + name */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={editor.profilePhoto || 'https://via.placeholder.com/66'}
              alt={editor.name}
              style={{
                width: 66, height: 66, borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${ringColor}`,
              }}
            />
            <span
              title={available ? 'Available' : 'Busy'}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 12, height: 12, borderRadius: '50%',
                background: available ? '#22c55e' : '#ef4444',
                border: '2px solid #fff',
              }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: 16 }}>
              {editor.name}
            </h6>
            <p className="mb-0 text-muted text-truncate" style={{ fontSize: 12 }}>
              {editor.about || 'Freelance Editor'}
            </p>
          </div>
        </div>

        {/* Stats — rate · rating · review count */}
        <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: 13 }}>
          <span className="fw-bold" style={{ color: '#111' }}>
            ₹{editor.hourlyRate || '—'}/hr
          </span>
          <span style={{ color: '#d1d5db' }}>·</span>
          {editor.rating > 0 ? (
            <span className="d-flex align-items-center gap-1">
              <span style={{ color: '#f59e0b' }}>
                <i className="bi bi-star-fill"></i>
                </span>
              <span className="fw-semibold">{editor.rating}</span>
              {editor.reviewCount > 0 && (
                <span className="text-muted" style={{ fontSize: 12 }}>({editor.reviewCount})</span>
              )}
            </span>
          ) : (
            <span className="text-muted" style={{ fontSize: 12 }}>No reviews yet</span>
          )}
        </div>

        {/* Description (3-line clamp) */}
        {editor.description && (
          <p style={{
            fontSize: 13, color: '#374151', lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 14,
          }}>
            {editor.description}
          </p>
        )}

        {/* Skills */}
        {editor.skills?.length > 0 && (
          <div className="d-flex flex-wrap gap-1">
            {editor.skills.slice(0, 3).map(skill => (
              <span key={skill} style={{
                background: '#f0f4ff',
                color: '#374151',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 20,
              }}>
                {skill}
              </span>
            ))}
            {editor.skills.length > 3 && (
              <span style={{
                background: '#f8f9fa', color: '#6c757d',
                fontSize: 11, fontWeight: 600,
                padding: '3px 10px', borderRadius: 20,
              }}>
                +{editor.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ padding: '4px 20px 20px' }} onClick={e => e.stopPropagation()}>
        <button
          className="w-100"
          style={{
            background: '#ffea00', color: '#000000',
            border: 'none', borderRadius: 25,
            padding: '10px 0', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#ffea0093'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffea00'}
          onClick={() => navigate(`/client/editor/${editor._id}`)}
        >
          See Profile
        </button>

        {isClient && (
          <button
            className="w-100 mt-2"
            style={{
              background: 'transparent', color: '#000000',
              border: '1px solid #ffea00', borderRadius: 25,
              padding: '8px 0', fontWeight: 500,
              fontSize: 13, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f5ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={e => { e.stopPropagation(); onCreateRequest(editor); }}
          >
            Create Request
          </button>
        )}
      </div>
    </div>
  );
}