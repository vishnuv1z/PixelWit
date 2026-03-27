import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function NegotiateRequest() {
  const { id } = useParams();
  const nav = useNavigate();

  const [request, setRequest]     = useState(null);
  const [amount, setAmount]       = useState(1000);
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    API.get(`/requests/${id}`)
      .then(res => {
        setRequest(res.data);
        setAmount(res.data.proposedBudget || 1000);
      })
      .catch(() => setError("Failed to load request."));
  }, [id]);

  const sendQuote = async () => {
    setSubmitting(true);
    setError("");
    try {
      await API.put(`/requests/${id}`, {
        status: "NEGOTIATED",
        negotiatedBudget: amount,
        editorNote: note.trim() || undefined
      });
      nav("/editor/work-requests");
    } catch {
      setError("Failed to send quote. Please try again.");
      setSubmitting(false);
    }
  };

  if (error && !request) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!request) return (
    <div className="container mt-4 text-center">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <button className="btn btn-link ps-0 mb-3 text-muted" onClick={() => nav("/editor/work-requests")}>
        ← Back
      </button>

      <h3>Negotiate Price</h3>
      <p className="text-muted">
        Request: <strong>{request.title}</strong><br />
        Client's Budget: <strong>₹{request.proposedBudget}</strong>
      </p>

      <label className="form-label fw-semibold">Your Proposed Price</label>
      <h4 className="text-success mb-1">₹ {amount}</h4>
      <input
        type="range"
        min="500"
        max="50000"
        step="100"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="form-range mb-3"
      />

      <div className="mb-3">
        <label className="form-label fw-semibold">Note to Client <span className="text-muted fw-normal">(optional)</span></label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Explain why you're proposing a different price..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <button
        className="btn btn-warning px-4"
        onClick={sendQuote}
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Send Quote to Client"}
      </button>
    </div>
  );
}
