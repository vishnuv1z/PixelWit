import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteRequest } from '../api/requests';

const STATUS_STYLES = {
  PENDING_QUOTE: { bg: 'bg-secondary',         label: 'Pending' },
  ACCEPTED:      { bg: 'bg-success',           label: 'Accepted' },
  NEGOTIATED:    { bg: 'bg-warning text-dark', label: 'Negotiated' },
  IN_PROGRESS:   { bg: 'bg-primary',           label: 'In Progress' },
  REJECTED:      { bg: 'bg-danger',            label: 'Rejected' },
  DELIVERED:     { bg: 'bg-info text-dark',    label: 'Delivered' },
  CANCELLED:     { bg: 'bg-secondary',         label: 'Cancelled' },
  COMPLETED:     { bg: 'bg-success',           label: 'Completed' }
};

const DELETABLE_STATUSES = ['REJECTED', 'CANCELLED'];

export default function RequestCard({ req, onDelete }) {
  const navigate  = useNavigate();
  const style     = STATUS_STYLES[req.status] || { bg: 'bg-secondary', label: req.status };
  const canDelete = DELETABLE_STATUSES.includes(req.status);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this request? This cannot be undone.')) return;
    try {
      await deleteRequest(req._id);
      if (onDelete) onDelete(req._id);
    } catch {
      alert('Failed to delete request. Please try again.');
    }
  };

  return (
    <div
      className="card mb-2 shadow-sm"
      style={{ cursor: 'pointer', borderRadius: 12 }}
      onClick={() => navigate(`/client/request/${req._id}`)}
    >
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <h6 className="card-title mb-1">{req.title}</h6>
          <p className="mb-1 text-muted small">
            Editor: <strong>{req.editorId?.name || 'Unknown'}</strong>
          </p>
          <p className="mb-1 text-muted small">
            Budget: ₹{req.proposedBudget}
            {req.status === 'NEGOTIATED' && req.negotiatedBudget && (
              <span className="ms-2 text-warning fw-semibold">
                → Negotiated: ₹{req.negotiatedBudget}
              </span>
            )}
          </p>
          <small className="text-muted">Sent: {new Date(req.createdAt).toLocaleString()}</small>
        </div>
        <div className="d-flex flex-column align-items-end gap-2 ms-3" onClick={e => e.stopPropagation()}>
          <span className={`badge ${style.bg}`} style={{ whiteSpace: 'nowrap' }}>
            {style.label}
          </span>
          {canDelete && (
            <button
              className="btn btn-outline-danger btn-sm"
              style={{ fontSize: 11 }}
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
