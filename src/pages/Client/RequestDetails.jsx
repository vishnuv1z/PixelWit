import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, updateRequestStatus, deleteRequest, submitReview } from '../../api/requests';
import { AuthContext } from '../../context/AuthContext';

const STATUS_BADGE = {
  PENDING_QUOTE: 'bg-secondary',
  ACCEPTED:      'bg-success',
  NEGOTIATED:    'bg-warning text-dark',
  IN_PROGRESS:   'bg-primary',
  REJECTED:      'bg-danger',
  DELIVERED:     'bg-info text-dark',
  CANCELLED:     'bg-secondary',
  COMPLETED:     'bg-success',
};

const DELETABLE_STATUSES = ['REJECTED', 'PENDING_QUOTE', 'CANCELLED', 'COMPLETED'];

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex gap-1 mb-1">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{
            fontSize: 32, cursor: 'pointer',
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >★</span>
      ))}
    </div>
  );
}

export default function RequestDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [req,               setReq]               = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [submitting,        setSubmitting]        = useState(false);
  const [toast,             setToast]             = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,          setDeleting]          = useState(false);

  // Review state
  const [rating,          setRating]          = useState(0);
  const [comment,         setComment]         = useState('');
  const [reviewSubmitting,setReviewSubmitting] = useState(false);
  const [reviewDone,      setReviewDone]      = useState(false);

  useEffect(() => {
    getRequest(id)
      .then(res => {
        setReq(res.data);
        setReviewDone(res.data.reviewed === true);
      })
      .catch(() => setReq(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDecision = async (decision) => {
    setSubmitting(true);
    try {
      const res = await updateRequestStatus(id, { status: decision });
      setReq(res.data);
      setToast({
        type: decision === 'IN_PROGRESS' ? 'success' : 'danger',
        msg:  decision === 'IN_PROGRESS'
          ? '✅ Work has officially started! The editor has been notified.'
          : '❌ Request rejected. The editor has been notified.',
      });
    } catch {
      setToast({ type: 'danger', msg: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRequest(id);
      navigate('/client/requests');
    } catch {
      setToast({ type: 'danger', msg: 'Failed to delete request. Please try again.' });
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!rating) return setToast({ type: 'danger', msg: 'Please select a star rating.' });
    setReviewSubmitting(true);
    try {
      await submitReview({
        clientId:   user._id,
        clientName: user.name,
        requestId:  id,
        rating,
        comment,
      });
      setReviewDone(true);
      setToast({ type: 'success', msg: '⭐ Review submitted! Thank you for your feedback.' });
    } catch (err) {
      setToast({ type: 'danger', msg: err.response?.data?.message || 'Failed to submit review.' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container-fluid px-4 text-center mt-5">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!req) return (
    <div className="container-fluid px-4 mt-4">
      <div className="alert alert-warning">Request not found.</div>
    </div>
  );

  const badgeClass   = STATUS_BADGE[req.status] || 'bg-secondary';
  const isNegotiated = req.status === 'NEGOTIATED';
  const isInProgress = req.status === 'IN_PROGRESS';
  const isDelivered  = req.status === 'DELIVERED';
  const isCompleted  = req.status === 'COMPLETED';
  const isPending    = req.status === 'PENDING_QUOTE';
  const canDelete    = DELETABLE_STATUSES.includes(req.status);

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 760, minHeight: '100vh' }}>

      <button className="btn btn-link ps-0 mb-3 text-muted" onClick={() => navigate('/client/requests')}>
        ← Back to My Requests
      </button>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`} role="alert">
          {toast.msg}
          <button type="button" className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      {isInProgress && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 22 }}>🚀</span>
          <div><strong>Work is in progress!</strong> The editor has started working on your request.</div>
        </div>
      )}

      {isDelivered && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 22 }}>📦</span>
          <div><strong>Work delivered!</strong> Review the deliverable and pay the editor to complete the project.</div>
        </div>
      )}

      {isCompleted && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 22 }}>🎉</span>
          <div><strong>Project completed!</strong> Payment was sent to the editor successfully.</div>
        </div>
      )}

      {req.status === 'REJECTED' && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 22 }}>❌</span>
          <div><strong>This request was rejected.</strong> You can delete it to clean up your list.</div>
        </div>
      )}

      {/* Main card */}
      <div className="card shadow-sm" style={{ borderRadius: 14 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h4 className="mb-0">{req.title}</h4>
            <span className={`badge ${badgeClass} fs-6`}>{req.status.replace(/_/g, ' ')}</span>
          </div>
          <hr />

          <div className="mb-3">
            <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Editor</h6>
            <p className="mb-0 fw-semibold">{req.editorId?.name || 'Unknown'}</p>
          </div>

          <div className="mb-3">
            <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Description</h6>
            <p className="mb-0">{req.description}</p>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Your Budget</h6>
              <p className="mb-0 fw-semibold">₹{req.proposedBudget}</p>
            </div>
            {req.negotiatedBudget && (
              <div className="col-6">
                <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Editor's Negotiated Price</h6>
                <p className="mb-0 fw-bold text-warning fs-5">₹{req.negotiatedBudget}</p>
              </div>
            )}
          </div>

          {req.deadline && (
            <div className="mb-3">
              <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Deadline</h6>
              <p className="mb-0">{req.deadline}</p>
            </div>
          )}

          {req.editorNote && (
            <div className="mb-3">
              <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Editor's Note</h6>
              <div className="alert alert-warning py-2 mb-0">💬 "{req.editorNote}"</div>
            </div>
          )}

          <div className="mb-1">
            <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Attachments</h6>
            {req.attachments?.length
              ? <div className="d-flex flex-wrap gap-2">
                  {req.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      className="badge bg-light text-dark border text-decoration-none">
                      📎 File {i + 1}
                    </a>
                  ))}
                </div>
              : <small className="text-muted">No attachments</small>}
          </div>
        </div>
      </div>

      {/* PENDING */}
      {isPending && (
        <div className="card mt-3 border-secondary shadow-sm" style={{ borderRadius: 14 }}>
          <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h6 className="mb-1">⏳ Waiting for editor response</h6>
              <p className="text-muted small mb-0">The editor hasn't responded yet. You can still edit your request.</p>
            </div>
            <button className="btn btn-outline-primary" onClick={() => navigate(`/client/request/${id}/edit`)}>
              ✏️ Edit Request
            </button>
          </div>
        </div>
      )}

      {/* ACCEPTED */}
      {req.status === 'ACCEPTED' && (
        <div className="card mt-3 border-success shadow-sm" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h5 className="mb-1">🎉 Editor accepted your request!</h5>
            <p className="text-muted mb-3">
              <strong>{req.editorId?.name || 'The editor'}</strong> is ready to work for{' '}
              <strong className="text-success fs-5">₹{req.proposedBudget}</strong>.
            </p>
            <div className="d-flex gap-3">
              <button className="btn btn-success px-4" disabled={submitting} onClick={() => handleDecision('IN_PROGRESS')}>
                {submitting ? 'Processing…' : '🚀 Confirm & Start Work'}
              </button>
              <button className="btn btn-outline-danger px-4" disabled={submitting} onClick={() => handleDecision('REJECTED')}>
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEGOTIATED */}
      {isNegotiated && (
        <div className="card mt-3 border-warning shadow-sm" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h5 className="mb-1">⚖️ Editor sent a new quote</h5>
            <p className="text-muted mb-3">
              The editor proposed{' '}
              <strong className="text-warning fs-5">₹{req.negotiatedBudget || req.proposedBudget}</strong>.
            </p>
            <div className="d-flex gap-3">
              <button className="btn btn-success px-4" disabled={submitting} onClick={() => handleDecision('IN_PROGRESS')}>
                {submitting ? 'Processing…' : '✅ Accept & Start Work'}
              </button>
              <button className="btn btn-outline-danger px-4" disabled={submitting} onClick={() => handleDecision('REJECTED')}>
                ❌ Reject Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERED — pay */}
      {isDelivered && (
        <div className="card mt-3 shadow-sm" style={{ borderRadius: 14, borderTop: '4px solid #0d6efd' }}>
          <div className="card-body p-4">
            <h5 className="mb-1">💳 Pay the Editor</h5>
            <p className="text-muted mb-3">
              Satisfied with the work? Pay <strong>{req.editorId?.name || 'the editor'}</strong> to complete the project.
            </p>
            <div className="d-flex align-items-baseline gap-2 mb-4">
              <span className="fw-bold fs-3 text-success">₹{(req.negotiatedBudget || req.proposedBudget).toLocaleString()}</span>
              {req.negotiatedBudget && (
                <span className="text-muted text-decoration-line-through small">₹{req.proposedBudget}</span>
              )}
            </div>
            <button className="btn btn-primary px-5 py-2" onClick={() => navigate(`/client/pay/${id}`)}>
              💳 Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED — review form */}
      {isCompleted && (
        <div className="card mt-3 shadow-sm" style={{ borderRadius: 14, borderTop: '4px solid #f59e0b' }}>
          <div className="card-body p-4">
            {reviewDone ? (
              <div className="text-center py-2">
                <p style={{ fontSize: 36 }}>⭐</p>
                <h6 className="fw-bold mb-1">Review Submitted!</h6>
                <p className="text-muted small mb-0">Thanks for rating <strong>{req.editorId?.name}</strong>. Your feedback helps the community.</p>
              </div>
            ) : (
              <>
                <h5 className="mb-1">⭐ Rate Your Experience</h5>
                <p className="text-muted small mb-4">
                  How was working with <strong>{req.editorId?.name}</strong>? Your review helps other clients.
                </p>

                <StarPicker value={rating} onChange={setRating} />
                {rating > 0 && (
                  <small className="text-muted mb-3 d-block">
                    {['','Poor','Fair','Good','Great','Excellent!'][rating]}
                  </small>
                )}

                <textarea
                  className="form-control mb-3"
                  rows={3}
                  placeholder="Share your experience with this editor... (optional)"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ resize: 'none' }}
                />

                <button
                  className="btn btn-warning px-5 fw-semibold"
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting || rating === 0}
                >
                  {reviewSubmitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                    : '⭐ Submit Review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE */}
      {canDelete && (
        <div className="card border-danger mt-3" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h6 className="text-danger mb-1">🗑️ Delete Request</h6>
            <p className="text-muted small mb-3">Permanently remove this request from your list.</p>
            {!showDeleteConfirm ? (
              <button className="btn btn-outline-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete Request
              </button>
            ) : (
              <div className="d-flex gap-2 align-items-center">
                <span className="small text-danger fw-semibold">Are you sure?</span>
                <button className="btn btn-danger btn-sm px-3" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><span className="spinner-border spinner-border-sm me-1" />Deleting…</> : 'Yes, Delete'}
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}