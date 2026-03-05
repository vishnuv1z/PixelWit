import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

export default function EditorProfile() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.getEditor(id)
      .then(setEditor)
      .catch(() => setEditor(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid px-4">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="container-fluid px-4">
        <div className="alert alert-warning">Editor not found</div>
      </div>
    );
  }

  const isOwnProfile =
    user &&
    user.role === 'EDITOR' &&
    Number(user.id) === Number(editor.id);

  /* ✅ SAFE DEFAULTS */
  const profilePhoto =
    editor.profilePhoto || 'https://via.placeholder.com/90';
  const hourlyRate = editor.hourlyRate || 0;
  const availability = editor.availability || 'BUSY';
  const rating = editor.rating || 0;
  const reviews = Array.isArray(editor.reviews) ? editor.reviews : [];
  const skills = Array.isArray(editor.skills) ? editor.skills : [];
  const portfolio = Array.isArray(editor.portfolio)
    ? editor.portfolio
    : [];

  return (
    <div className="container-fluid px-4" style={{ maxWidth: 1100 }}>
      {/* HEADER */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <div className="d-flex align-items-center gap-3">
            <img
              src={profilePhoto}
              alt="Profile"
              className="rounded-circle"
              width="90"
              height="90"
              style={{ objectFit: 'cover' }}
            />

            <div>
              <h2 className="mb-1">{editor.name}</h2>
              <p className="text-muted mb-1">{editor.about}</p>

              <span className="badge bg-info me-2">
                ₹{hourlyRate}/hr
              </span>

              <span
                className={`fw-semibold ${
                  availability === 'AVAILABLE' ? 'text-success' : 'text-danger'
                }`}
              >
                {availability === 'AVAILABLE' ? '🟢 Available' : '🔴 Working on a project'}
              </span>

            </div>
          </div>
        </div>

        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          {/* CLIENT */}
          {user && user.role === 'CLIENT' && (
            <button
              className="btn btn-primary me-2"
              onClick={() =>
                nav('/client/create-request', { state: { editor } })
              }
            >
              Send Request
            </button>
          )}

          {/* EDITOR */}
          {isOwnProfile && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => nav('/editor/edit-profile')}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <hr />

      {/* ABOUT */}
      <section className="mb-4">
        <h5>About</h5>
        <p>{editor.description || 'No description provided.'}</p>
      </section>

      {/* RATING */}
      <section className="mb-4">
        <h5>Rating</h5>
        <p>
          ⭐ {rating} / 5
          <span className="text-muted">
            {' '}({reviews.length} reviews)
          </span>
        </p>
      </section>

      {/* SKILLS */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h5>Skills</h5>
          <div className="d-flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="badge bg-secondary">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="mb-4">
        <h5>Reviews</h5>

        {reviews.length > 0 ? (
          reviews.map(r => (
            <div key={r.id} className="border rounded p-3 mb-2">
              <strong>{r.clientName}</strong>
              <span className="ms-2 text-warning">
                {'⭐'.repeat(r.rating)}
              </span>
              <p className="mb-0 text-muted">{r.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-muted">No reviews yet.</p>
        )}
      </section>

      {/* PORTFOLIO */}
      <section>
        <h5>Portfolio</h5>
        <div className="row g-3">
          {portfolio.map(item => (
            <div key={item.id} className="col-sm-6 col-md-4">
              <div className="card">
                {item.type === 'image' ? (
                  <img
                    src={item.src}
                    alt="Portfolio"
                    className="card-img-top"
                  />
                ) : (
                  <video
                    controls
                    className="w-100"
                    style={{ maxHeight: 220, objectFit: 'cover' }}
                  >
                    <source src={item.src} />
                  </video>
                )}
              </div>
            </div>
          ))}

          {portfolio.length === 0 && (
            <p className="text-muted">No portfolio yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}