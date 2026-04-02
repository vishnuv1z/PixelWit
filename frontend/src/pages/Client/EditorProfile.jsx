import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { getEditorReviews } from '../../api/requests';
import { AuthContext } from '../../context/AuthContext';

function StarDisplay({ rating, size = 18 }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

export default function EditorProfile() {
  const { user } = useContext(AuthContext);
  const { id }   = useParams();
  const nav      = useNavigate();

  const [editor,  setEditor]  = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/users/editors/${id}`),
      getEditorReviews(id),
    ])
      .then(([editorRes, reviewsRes]) => {
        setEditor(editorRes.data);
        setReviews(reviewsRes.data);
      })
      .catch(() => setEditor(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container-fluid px-4 py-5 text-center">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!editor) return (
    <div className="container-fluid px-4">
      <div className="alert alert-warning">Editor not found</div>
    </div>
  );

  const isOwnProfile = user && user.role === 'EDITOR' && user._id === editor._id;
  const profilePhoto = editor.profilePhoto || 'https://via.placeholder.com/90';
  const skills       = Array.isArray(editor.skills)    ? editor.skills    : [];
  const portfolio    = Array.isArray(editor.portfolio) ? editor.portfolio : [];

  // Calculate average from the reviews collection
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1100 }}>

      {/* HEADER */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <div className="d-flex align-items-center gap-4">
            <div style={{ position: 'relative' }}>
              <img
                src={profilePhoto} alt="Profile"
                className="rounded-circle"
                width="90" height="90"
                style={{ objectFit: 'cover', border: '3px solid #e9ecef' }}
              />
              <span style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: editor.availability === 'AVAILABLE' ? '#22c55e' : '#ef4444',
                border: '2px solid #fff'
              }} />
            </div>
            <div>
              <h2 className="mb-1 fw-bold">{editor.name}</h2>
              <p className="text-muted mb-2">{editor.about}</p>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="badge bg-info fs-6">₹{editor.hourlyRate || 0}/hr</span>
                {reviews.length > 0 && (
                  <span className="d-flex align-items-center gap-1">
                    <StarDisplay rating={avgRating} size={16} />
                    <span className="fw-bold ms-1">{avgRating}</span>
                    <span className="text-muted small">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </span>
                )}
                <span className={`fw-semibold ${editor.availability === 'AVAILABLE' ? 'text-success' : 'text-danger'}`}>
                  {editor.availability === 'AVAILABLE' ? '🟢 Available' : '🔴 Working on a project'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          {user?.role === 'CLIENT' && (
            <button className="btn btn-primary me-2"
              onClick={() => nav('/client/create-request', { state: { editor } })}>
              Send Request
            </button>
          )}
          {isOwnProfile && (
            <button className="btn btn-outline-secondary" onClick={() => nav('/editor/edit-profile')}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <hr />

      {/* ABOUT */}
      <section className="mb-4">
        <h5 className="fw-bold mb-2">About</h5>
        <p className="text-muted">{editor.description || 'No description provided.'}</p>
      </section>

      {/* SKILLS */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h5 className="fw-bold mb-2">Skills</h5>
          <div className="d-flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} style={{
                background: '#f0f4ff', color: '#494949',
                fontSize: 13, fontWeight: 600,
                padding: '5px 14px', borderRadius: 20,
              }}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="mb-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <h5 className="fw-bold mb-0">Reviews</h5>
          {reviews.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              <StarDisplay rating={avgRating} size={20} />
              <span className="fw-bold fs-5">{avgRating}</span>
              <span className="text-muted">/ 5 · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-4" style={{ background: '#f8f9fa', borderRadius: 12 }}>
            <p style={{ fontSize: 32 }}>💬</p>
            <p className="text-muted mb-0">No reviews yet. Be the first to leave one!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map((r, i) => (
              <div key={r._id || i} style={{
                background: '#fff',
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: '16px 20px',
              }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#0d6efd22',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#0d6efd', fontSize: 14,
                    }}>
                      {r.clientName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold" style={{ fontSize: 14 }}>{r.clientName}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <StarDisplay rating={r.rating} size={16} />
                    <span className="fw-semibold ms-1" style={{ fontSize: 13 }}>{r.rating}</span>
                  </div>
                </div>
                {r.comment && (
                  <p className="mb-0 text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PORTFOLIO */}
      <section>
        <h5 className="fw-bold mb-3">Portfolio</h5>
        {portfolio.length === 0 ? (
          <p className="text-muted">No portfolio yet.</p>
        ) : (
          <div className="row g-3">
            {portfolio.map((item, i) => (
              <div key={i} className="col-sm-6 col-md-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: 10, overflow: 'hidden' }}>
                  {item.type === 'image' ? (
                    <img src={item.src} alt="Portfolio" className="card-img-top"
                      style={{ height: 180, objectFit: 'cover' }} />
                  ) : (
                    <video controls className="w-100" style={{ maxHeight: 180, objectFit: 'cover' }}>
                      <source src={item.src} />
                    </video>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}