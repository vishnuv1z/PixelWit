import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEditorRequests } from '../../api/requests';
import { AuthContext } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ icon, label, value, color }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 12
          }}><i className={`bi ${icon}`} /></div>
          <h4 className="fw-bold mb-0" style={{ color }}>{value}</h4>
          <p className="mb-0 text-muted small fw-semibold text-uppercase mt-1" style={{ letterSpacing: 0.5 }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ req, navigate }) {
  const STATUS = {
    PENDING_QUOTE: { bg: '#fff3cd', color: '#856404', label: 'Pending' },
    ACCEPTED:      { bg: '#d1e7dd', color: '#0f5132', label: 'Accepted' },
    NEGOTIATED:    { bg: '#fff3cd', color: '#856404', label: 'Negotiated' },
    IN_PROGRESS:   { bg: '#cfe2ff', color: '#084298', label: 'In Progress' },
    REJECTED:      { bg: '#f8d7da', color: '#842029', label: 'Rejected' },
    DELIVERED:     { bg: '#d1ecf1', color: '#0c5460', label: 'Delivered' },
    COMPLETED:     { bg: '#d1e7dd', color: '#0f5132', label: 'Completed' }
  };
  const badge = STATUS[req.status] || { bg: '#e9ecef', color: '#495057', label: req.status };
  return (
    <div
      className="d-flex align-items-center justify-content-between p-3 mb-2 rounded"
      style={{ background: '#f8f9fa', cursor: 'pointer' }}
      onClick={() => navigate(`/editor/request/${req._id}`)}
      onMouseEnter={e => e.currentTarget.style.background = '#e9ecef'}
      onMouseLeave={e => e.currentTarget.style.background = '#f8f9fa'}
    >
      <div>
        <p className="mb-0 fw-semibold">{req.title}</p>
        <small className="text-muted">₹{req.proposedBudget}{req.negotiatedBudget ? ` → ₹${req.negotiatedBudget}` : ''}</small>
      </div>
      <span className="badge rounded-pill px-3 py-2"
        style={{ background: badge.bg, color: badge.color, fontSize: 12 }}>
        {badge.label}
      </span>
    </div>
  );
}

export default function EditorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getEditorRequests(user._id)
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user]);

  const active    = requests.filter(r => r.status === 'IN_PROGRESS');
  const completed = requests.filter(r => r.status === 'DELIVERED' || r.status === 'COMPLETED');
  const pending   = requests.filter(r => r.status === 'PENDING_QUOTE');

  const totalEarnings = completed.reduce((sum, r) => {
    return sum + (r.negotiatedBudget || r.proposedBudget || 0);
  }, 0);

  const monthlyEarnings = Array(12).fill(0);
  completed.forEach(r => {
    const month = new Date(r.updatedAt || r.createdAt).getMonth();
    monthlyEarnings[month] += (r.negotiatedBudget || r.proposedBudget || 0);
  });

  const chartData = {
    labels: MONTHS,
    datasets: [{
      label: 'Earnings (₹)',
      data: monthlyEarnings,
      backgroundColor: 'rgba(13, 110, 253, 0.12)',
      borderColor: '#0d6efd',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString()}` } }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: { callback: v => `₹${v}` }
      },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1100 }}>

      <div className="mb-4">
        <h3 className="fw-bold mb-1">Editor Dashboard</h3>
        <p className="text-muted mb-0">Your performance at a glance.</p>
      </div>

      <div className="row g-3 mb-4">
        <StatCard icon="bi-cash-stack" label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} color="#10b981" />
        <StatCard icon="bi-check-circle-fill" label="Jobs Completed" value={completed.length} color="#0d6efd" />
        <StatCard icon="bi-lightning-charge-fill" label="Active Jobs" value={active.length} color="#f59e0b" />
        <StatCard icon="bi-envelope-fill" label="New Requests" value={pending.length} color="#8b5cf6" />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="row g-4">

          {/* Monthly Earnings Chart */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold mb-0">Monthly Earnings</h6>
                  <span className="text-muted small">{new Date().getFullYear()}</span>
                </div>
                {completed.length === 0
                  ? <div className="text-center py-4 text-muted">
                      <p style={{ fontSize: 40 }}><i className="bi bi-bar-chart-line-fill"></i></p>
                      <p className="small">Complete jobs to see your earnings chart here.</p>
                    </div>
                  : <Bar data={chartData} options={chartOptions} height={100} />
                }
              </div>
            </div>
          </div>

          {/* Completion Rate + Quick Actions */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Completion Rate</h6>
                {requests.length === 0 ? (
                  <p className="text-muted small">No requests yet.</p>
                ) : (
                  <>
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Completed</small>
                      <small className="fw-semibold">
                        {Math.round((completed.length / requests.length) * 100)}%
                      </small>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 8 }}>
                      <div className="progress-bar bg-success"
                        style={{ width: `${Math.round((completed.length / requests.length) * 100)}%`, borderRadius: 8 }} />
                    </div>
                    <small className="text-muted mt-2 d-block">
                      {completed.length} of {requests.length} total requests
                    </small>
                  </>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Quick Actions</h6>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-primary w-100 text-start px-4"
                    onClick={() => navigate('/editor/work-requests')}>
                    View Work Requests
                  </button>
                  <button className="btn btn-outline-primary w-100 text-start px-4"
                    onClick={() => navigate('/editor/deliverables')}>
                    Upload Deliverable
                  </button>
                  <button className="btn btn-outline-secondary w-100 text-start px-4"
                    onClick={() => navigate('/editor/edit-profile')}>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Active Jobs</h6>
                  <span className="badge bg-warning text-dark rounded-pill">{active.length}</span>
                </div>
                {active.length === 0
                  ? <p className="text-muted small">No active jobs right now.</p>
                  : active.map(r => <RequestRow key={r._id} req={r} navigate={navigate} />)}
              </div>
            </div>
          </div>

          {/* Recently Completed */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Recently Completed</h6>
                  <span className="badge bg-success rounded-pill">{completed.length}</span>
                </div>
                {completed.length === 0
                  ? <p className="text-muted small">No completed jobs yet.</p>
                  : completed.slice(-4).reverse().map(r => (
                      <RequestRow key={r._id} req={r} navigate={navigate} />
                    ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}