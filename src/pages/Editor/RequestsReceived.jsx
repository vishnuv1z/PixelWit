import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function RequestsReceived() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getEditorRequests(user.id)
      .then(data => {
        setRequests(data || []);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false)); // ✅ STOP LOADING

  }, [user]);

  const updateStatus = (id, status) => {
    api.updateRequestStatus(id, status)
      .then(updated => {
        setRequests(prev =>
          prev.map(r => r.id === id ? updated : r)
        );
      });
  };

  const deleteRequest = (id) => {
  api.deleteRequest(id).then(()=>{
    setRequests(prev =>
      prev.filter(r => r.id !== id)
    );
  });
};

  return (
    <div className="container-fluid px-4">
      <h3 className="mb-4">Work Requests</h3>

      {loading && <div className="spinner-border" />}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" />
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {requests.map(req => (
          <div
            key={req.id}
            className="card shadow-sm request-card"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/editor/request/${req.id}`)
            }
          >
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>
                  <h5 className="mb-1">{req.service}</h5>
                  <p className="text-muted mb-1">
                    Client: {req.clientName}
                  </p>
                </div>

                {/* AMOUNT */}
                <div className="text-end">
                  <h4 className="fw-bold text-success">
                    ₹ {req.budget || 0}
                  </h4>
                </div>

              </div>

              <p className="mt-2 text-muted">
                {req.description?.slice(0,120)}...
              </p>

              <div className="d-flex justify-content-between align-items-center mt-3">

                <span className="badge bg-secondary">
                  {req.status}
                </span>

                {/* STOP CARD CLICK */}
                <div onClick={(e)=>e.stopPropagation()}>

                  {req.status === "PENDING_QUOTE" && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={()=>updateStatus(req.id,"ACCEPTED")}
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={()=>deleteRequest(req.id)}
                      >
                        Reject
                      </button>

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={()=>navigate(`/editor/negotiate/${req.id}`)}
                      >
                        Negotiate
                      </button>
                    </>
                  )}

                  {req.status === "ACCEPTED" && (
                    <span className="badge bg-success fs-6">
                      ACCEPTED
                    </span>
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