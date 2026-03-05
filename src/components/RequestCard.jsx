import React from 'react';

export default function RequestCard({ req }) {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex justify-content-between">
        <div>
          <h6 className="card-title">{req.title}</h6>
          <p className="mb-1 text-muted">Budget: ₹{req.proposedBudget} • Status: <strong>{req.status}</strong></p>
          <small className="text-muted">Sent: {new Date(req.createdAt).toLocaleString()}</small>
        </div>
        <div className="text-end">
          <span className="badge bg-info">{req.status}</span>
        </div>
      </div>
    </div>
  );
}