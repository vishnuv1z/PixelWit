import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatCard({ icon, label, value, subtext, color }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 16
          }}><i className={`bi ${icon}`} /></div>
          <h3 className="fw-bold mb-1" style={{ color }}>{value}</h3>
          <p className="mb-1 text-muted small fw-semibold text-uppercase mt-1" style={{ letterSpacing: 0.5 }}>{label}</p>
          {subtext && <small className="text-muted d-block">{subtext}</small>}
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="container-fluid px-4 py-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const pieData = {
    labels: [
      'Photo Editing',
      'Video Editing',
      'Thumbnails',
      'Reels'
    ],
    datasets: [
      {
        data: [
          analytics.projectCategories.photoEditing || 0,
          analytics.projectCategories.videoEditing || 0,
          analytics.projectCategories.thumbnails || 0,
          analytics.projectCategories.reels || 0
        ],
        backgroundColor: [
          '#ffc107',
          '#0d6efd',
          '#6f42c1',
          '#198754'
        ]
      }
    ]
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Admin Analytics</h3>
        <p className="text-muted mb-0">Platform overview and performance metrics.</p>
      </div>

      {/* TOP CARDS */}
      <div className="row g-3 mb-4">
        <StatCard 
          icon="bi-people-fill" 
          label="Total Users" 
          value={analytics.totalUsers-1} 
          subtext={`${analytics.totalEditors} Editors • ${analytics.totalClients} Clients`}
          color="#8b5cf6" 
        />
        <StatCard 
          icon="bi-check-circle-fill" 
          label="Projects Completed" 
          value={analytics.completedProjects} 
          color="#0d6efd" 
        />
        <StatCard 
          icon="bi-cash-stack"
          label="Total Revenue"
          value={`₹${(analytics.totalRevenue || 0).toLocaleString()}`}
          subtext={`Platform Profit: ₹${(analytics.platformProfit || 0).toLocaleString()}`}
          color="#10b981"
        />
        <StatCard 
          icon="bi-lightning-charge-fill" 
          label="Active Projects" 
          value={analytics.activeProjects} 
          subtext={`Avg Rating ⭐ ${analytics.averageRating || 0}`}
          color="#f59e0b" 
        />
      </div>

      {/* MIDDLE SECTION */}
      <div className="row g-4 mb-4">
        {/* PIE CHART */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">Projects by Category</h6>
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <Pie data={pieData} />
              </div>
            </div>
          </div>
        </div>

        {/* TOP EDITORS & REVENUE */}
        <div className="col-md-6 d-flex flex-column gap-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Top 3 Most Hired Editors</h6>
              {!analytics.topEditors || analytics.topEditors.length === 0 ? (
                <p className="text-muted small">No editors hired yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2 mt-3">
                  {analytics.topEditors.map((ed, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between p-3 rounded"
                      style={{ background: '#f8f9fa', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e9ecef'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f8f9fa'}
                      onClick={() => navigate(`/client/editor/${ed._id}`)}
                    >
                      <strong className="mb-0">{ed.name}</strong>
                      <span className="badge bg-primary rounded-pill px-3 py-2">{ed.projects} jobs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Revenue Breakdown</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Editor Earnings</span>
                <span className="fw-semibold">₹{(analytics.editorEarnings || 0).toLocaleString()}</span>
              </div>
              <div className="progress mb-3" style={{ height: 8, borderRadius: 8 }}>
                <div className="progress-bar bg-success" style={{ width: '90%', borderRadius: 8 }}></div>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Platform Commission (10%)</span>
                <span className="fw-semibold">₹{(analytics.platformProfit || 0).toLocaleString()}</span>
              </div>
              <div className="progress" style={{ height: 8, borderRadius: 8 }}>
                <div className="progress-bar bg-info" style={{ width: '10%', borderRadius: 8 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}