import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import RequestCard from '../../components/RequestCard';
import { Link } from 'react-router-dom';

export default function MyRequests(){
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'CLIENT') return;

    api.listClientRequests(user.id)
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'CLIENT') {
    return (
      <div className="container-fluid px-4">
        <div className="alert alert-danger">
          This page is only available for clients.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Requests</h3>

        <Link
          className="btn btn-outline-primary btn-sm"
          to="/client/create-request"
        >
          New Request
        </Link>
      </div>

      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="alert alert-info">
          No work requests found
        </div>
      ) : (
        requests.map(req => <RequestCard key={req.id} req={req} />)
      )}
    </div>
  );
}