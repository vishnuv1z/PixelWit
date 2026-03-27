import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminAnalytics() {
  // MOCK DATA
  const analytics = {
    totalUsers: 9,
    totalEditors: 7,
    totalClients: 2,

    completedProjects: 13,
    projectCategories: {
      photoEditing: 3,
      videoEditing: 4,
      thumbnails: 2,
      reels: 4
    },

    totalRevenue: 18600,
    editorEarnings: 16740,
    platformProfit: 1860,

    topEditors: [
      { name: 'Eva Robson', projects: 5 },
      { name: 'Max Reeds', projects: 4 },
      { name: 'Tony Adams', projects: 3 }
    ],

    activeProjects: 3,
    averageRating: 4.6
  };

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
          analytics.projectCategories.photoEditing,
          analytics.projectCategories.videoEditing,
          analytics.projectCategories.thumbnails,
          analytics.projectCategories.reels
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
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1300 }}>
      <h3 className="mb-4 fw-bold">Admin Analytics Dashboard</h3>

      {/* TOP CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Total Users</h6>
              <h3>{analytics.totalUsers}</h3>
              <p className="text-muted small">
                {analytics.totalEditors} Editors • {analytics.totalClients} Clients
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Projects Completed</h6>
              <h3>{analytics.completedProjects}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Total Revenue</h6>
              <h3>₹{analytics.totalRevenue.toLocaleString()}</h3>
              <p className="text-muted small">
                Platform Profit: ₹{analytics.platformProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Active Projects</h6>
              <h3>{analytics.activeProjects}</h3>
              <p className="text-muted small">
                Avg Rating ⭐ {analytics.averageRating}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="row g-4 mb-4">
        {/* PIE CHART */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3">Projects by Category</h6>
              <Pie data={pieData} />
            </div>
          </div>
        </div>

        {/* TOP EDITORS */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3">Top 3 Most Hired Editors</h6>

              {analytics.topEditors.map((ed, i) => (
                <div
                  key={i}
                  className="d-flex justify-content-between border-bottom py-2"
                >
                  <strong>{ed.name}</strong>
                  <span>{ed.projects} projects</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM INFO */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h6>Revenue Breakdown</h6>
          <p className="mb-1">
            Editors Earnings: ₹{analytics.editorEarnings.toLocaleString()}
          </p>
          <p className="mb-0">
            Platform Commission (10%): ₹{analytics.platformProfit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}