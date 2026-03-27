import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from "../../api/requests";

const STATUS_BADGE = {
  PENDING_QUOTE: 'bg-secondary',
  ACCEPTED:      'bg-success',
  NEGOTIATED:    'bg-warning text-dark',
  IN_PROGRESS:   'bg-primary',
  REJECTED:      'bg-danger',
  DELIVERED:     'bg-info text-dark',
  CANCELLED:     'bg-secondary',
};

const DELETABLE_STATUSES = ['REJECTED', 'PENDING_QUOTE', 'CANCELLED'];

export default function RequestDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [request,           setRequest]           = useState(null);
  const [toast,             setToast]             = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,          setDeleting]          = useState(false);

  useEffect(() => {
    api.getRequest(id)
      .then(res => setRequest(res.data))
      .catch(() => setRequest(null));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteRequest(id);
      navigate('/editor/work-requests');
    } catch {
      setToast({ type: 'danger', msg: 'Failed to delete request. Please try again.' });
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!request) return (
    <div className="container p-4 text-center">
      <div className="spinner-border text-primary" />
    </div>
  );

  const badgeClass = STATUS_BADGE[request.status] || 'bg-secondary';
  const canDelete  = DELETABLE_STATUSES.includes(request.status);

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 760 }}>

      <button className="btn btn-link ps-0 mb-3 text-muted" onClick={() => navigate('/editor/work-requests')}>
        ← Back to Work Requests
      </button>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      {request.status === 'IN_PROGRESS' && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 22 }}>🎉</span>
          <div><strong>Client confirmed your quote!</strong> Work has officially started. Please deliver before the deadline.</div>
        </div>
      )}

      {request.status === 'REJECTED' && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 22 }}>❌</span>
          <div><strong>You rejected this request.</strong> You can delete it to clean up your list.</div>
        </div>
      )}

      <div className="card shadow-sm" style={{ borderRadius: 14 }}>
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start mb-3">
            <h4 className="mb-0">{request.title}</h4>
            <span className={`badge ${badgeClass} fs-6`}>{request.status.replace(/_/g, ' ')}</span>
          </div>
          <hr />

          <div className="mb-3">
            <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Description</h6>
            <p className="mb-0">{request.description}</p>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Client's Budget</h6>
              <p className="mb-0 fw-semibold">₹{request.proposedBudget}</p>
            </div>
            {request.negotiatedBudget && (
              <div className="col-6">
                <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Your Negotiated Price</h6>
                <p className="mb-0 fw-bold text-warning fs-5">₹{request.negotiatedBudget}</p>
              </div>
            )}
          </div>

          {request.deadline && (
            <div className="mb-3">
              <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Deadline</h6>
              <p className="mb-0">{request.deadline}</p>
            </div>
          )}

          {request.editorNote && (
            <div className="mb-3">
              <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Your Note to Client</h6>
              <div className="alert alert-warning py-2 mb-0">💬 "{request.editorNote}"</div>
            </div>
          )}

          {/* Client attachments */}
          <div className="mb-1">
            <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Client Attachments</h6>
            {request.attachments?.length
              ? <div className="d-flex flex-wrap gap-2">
                  {request.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      className="btn btn-outline-secondary btn-sm">
                      📎 Download File {i + 1}
                    </a>
                  ))}
                </div>
              : <small className="text-muted">No attachments provided</small>}
          </div>

        </div>
      </div>

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
