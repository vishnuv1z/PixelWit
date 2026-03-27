import React, { useEffect, useState, useContext } from 'react';
import { getEditorRequests, updateRequestStatus, deleteRequest } from "../../api/requests";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function RequestsReceived() {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getEditorRequests(user._id)
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const res = await updateRequestStatus(id, { status });
      setRequests(prev => prev.map(r => r._id === id ? res.data : r));
    } catch (err) {
      console.error(err);
    }
  };

  const removeRequest = async (id) => {
    try {
      await deleteRequest(id);
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid px-4">
      <h3 className="mb-4">Work Requests</h3>

      {loading && (
        <div className="text-center my-4"><div className="spinner-border text-primary" /></div>
      )}

      {!loading && requests.length === 0 && (
        <div className="alert alert-info">No work requests found.</div>
      )}

      <div className="d-flex flex-column gap-3">
        {requests.map(req => (
          <div
            key={req._id}
            className="card shadow-sm"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/editor/request/${req._id}`)}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">{req.title}</h5>
                  <p className="text-muted mb-1">Client: {req.clientId?.name}</p>
                </div>
                <div className="text-end">
                  <h4 className="fw-bold text-success">₹ {req.proposedBudget || 0}</h4>
                </div>
              </div>

              <p className="mt-2 text-muted">
                {req.description?.slice(0, 120)}{req.description?.length > 120 ? '...' : ''}
              </p>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-muted">{req.deadline ? `Deadline: ${req.deadline}` : ''}</span>
                <div onClick={e => e.stopPropagation()}>
                  {req.status === "PENDING_QUOTE" && (
                    <>
                      <button className="btn btn-success btn-sm me-2"
                        onClick={() => updateStatus(req._id, "ACCEPTED")}>
                        Accept
                      </button>
                      <button className="btn btn-danger btn-sm me-2"
                        onClick={() => updateStatus(req._id, "REJECTED")}>
                        Reject
                      </button>
                      <button className="btn btn-warning btn-sm"
                        onClick={() => navigate(`/editor/negotiate/${req._id}`)}>
                        Negotiate
                      </button>
                    </>
                  )}

                  {req.status === "ACCEPTED" && (
                    <span className="badge bg-success fs-6">ACCEPTED</span>
                  )}

                  {req.status === "REJECTED" && (
                    <>
                      <span className="badge bg-danger fs-6 me-2">REJECTED</span>
                      <button className="btn btn-outline-danger btn-sm"
                        onClick={() => removeRequest(req._id)}>
                        🗑️ Delete
                      </button>
                    </>
                  )}

                  {req.status === "NEGOTIATED" && (
                    <span className="badge bg-warning text-dark fs-6">NEGOTIATED</span>
                  )}

                  {req.status === "IN_PROGRESS" && (
                    <span className="badge bg-primary fs-6">IN PROGRESS</span>
                  )}

                  {req.status === "DELIVERED" && (
                    <span className="badge bg-info text-dark fs-6">DELIVERED</span>
                  )}

                  {req.status === "COMPLETED" && (
                    <span className="badge bg-success text-dark fs-6">COMPLETED</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}