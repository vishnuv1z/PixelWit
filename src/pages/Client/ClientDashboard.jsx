import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientRequests } from '../../api/requests';
import { AuthContext } from '../../context/AuthContext';

const STATUS_BADGE = {
  PENDING_QUOTE: { bg: '#fff3cd', color: '#856404', label: 'Pending Quote' },
  ACCEPTED:      { bg: '#d1e7dd', color: '#0f5132', label: 'Accepted' },
  NEGOTIATED:    { bg: '#fff3cd', color: '#856404', label: 'Negotiated' },
  IN_PROGRESS:   { bg: '#cfe2ff', color: '#084298', label: 'In Progress' },
  REJECTED:      { bg: '#f8d7da', color: '#842029', label: 'Rejected' },
  DELIVERED:     { bg: '#d1ecf1', color: '#0c5460', label: 'Delivered' },
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: color + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22
              }}><i className={`bi ${icon}`} /></div>
            <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
          </div>
          <p className="mb-0 text-muted small fw-semibold text-uppercase" style={{ letterSpacing: 0.5 }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ req, onClick }) {
  const badge = STATUS_BADGE[req.status] || { bg: '#e9ecef', color: '#495057', label: req.status };
  return (
    <div
      className="d-flex align-items-center justify-content-between p-3 mb-2 rounded"
      style={{ background: '#f8f9fa', cursor: 'pointer', transition: 'background 0.15s' }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = '#e9ecef'}
      onMouseLeave={e => e.currentTarget.style.background = '#f8f9fa'}
    >
      <div>
        <p className="mb-0 fw-semibold">{req.title}</p>
        <small className="text-muted">Editor: {req.editorId?.name || 'Unknown'} · ₹{req.proposedBudget}</small>
      </div>
      <span className="badge rounded-pill px-3 py-2"
        style={{ background: badge.bg, color: badge.color, fontSize: 12 }}>
        {badge.label}
      </span>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    listClientRequests(user._id)
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user]);

  const active     = requests.filter(r => r.status === 'IN_PROGRESS');
  const pending    = requests.filter(r => ['PENDING_QUOTE', 'ACCEPTED', 'NEGOTIATED'].includes(r.status));
  const delivered  = requests.filter(r => r.status === 'DELIVERED');

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h3>
        <p className="text-muted mb-0">Here's an overview of your editing projects.</p>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <StatCard icon="bi-lightning-charge-fill" label="Active Jobs" value={active.length}    color="#0d6efd" />
        <StatCard icon="bi-hourglass-split" label="Pending Confirmation" value={pending.length}   color="#f59e0b" />
        <StatCard icon="bi-box-seam" label="Delivered" value={delivered.length} color="#10b981" />
        <StatCard icon="bi-check-circle-fill" label="Total Requests" value={requests.length}  color="#8b5cf6" />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="row g-4">

          {/* Active Requests */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Active Requests</h6>
                  <span className="badge bg-primary rounded-pill">{active.length}</span>
                </div>
                {active.length === 0
                  ? <p className="text-muted small">No active jobs right now.</p>
                  : active.map(r => (
                      <RequestRow key={r._id} req={r} onClick={() => navigate(`/client/request/${r._id}`)} />
                    ))}
              </div>
            </div>
          </div>

          {/* Pending Confirmation */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Pending Confirmation</h6>
                  <span className="badge bg-warning text-dark rounded-pill">{pending.length}</span>
                </div>
                {pending.length === 0
                  ? <p className="text-muted small">No requests awaiting action.</p>
                  : pending.map(r => (
                      <RequestRow key={r._id} req={r} onClick={() => navigate(`/client/request/${r._id}`)} />
                    ))}
              </div>
            </div>
          </div>

          {/* Delivered Work */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Delivered Work</h6>
                  <span className="badge bg-info text-dark rounded-pill">{delivered.length}</span>
                </div>
                {delivered.length === 0
                  ? <p className="text-muted small">No deliverables yet.</p>
                  : delivered.map(r => (
                      <RequestRow key={r._id} req={r} onClick={() => navigate(`/client/request/${r._id}`)} />
                    ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Quick Actions</h6>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-primary w-100 text-start px-4"
                    onClick={() => navigate('/client/browse')}>
                    Browse Editors
                  </button>
                  <button className="btn btn-outline-primary w-100 text-start px-4"
                    onClick={() => navigate('/client/requests')}>
                    View All My Requests
                  </button>
                  <button className="btn btn-outline-secondary w-100 text-start px-4"
                    onClick={() => navigate('/client/deliverables')}>
                    My Deliverables
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}