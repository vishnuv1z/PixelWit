import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRequest } from '../../api/requests';
import { AuthContext } from '../../context/AuthContext';
import AttachmentUploader from '../../components/AttachmentUploader';

const today = new Date().toISOString().split('T')[0];

export default function CreateRequest() {
  const { user }   = useContext(AuthContext);
  const loc        = useLocation();
  const nav        = useNavigate();
  const preEditor  = loc.state?.editor;

  const [form, setForm] = useState({
    title: '', description: '', proposedBudget: '', deadline: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return showToast('danger', 'You must be logged in to send a request.');
    setSubmitting(true);
    try {
      await createRequest({
        ...form,
        proposedBudget: Number(form.proposedBudget),
        clientId:   user._id,
        editorId:   preEditor?._id,
        attachments,
        status:     'PENDING_QUOTE'
      });
      showToast('success', '✅ Request sent to editor!');
      setTimeout(() => nav('/client/requests'), 1500);
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 720 }}>
      <h3 className="fw-bold mb-1">Create Request</h3>
      <p className="text-muted mb-4">Fill in the details for your editing project.</p>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Editor</label>
          <input className="form-control bg-light" value={preEditor?.name || 'Unknown'} disabled />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
          <input
            required className="form-control"
            placeholder="Enter your title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
          <textarea
            required className="form-control" rows={4}
            placeholder="Describe what you need, your style preferences, any references..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Budget (₹) <span className="text-danger">*</span></label>
            <input
              required type="number" min={1} className="form-control"
              placeholder="e.g. 1500"
              value={form.proposedBudget}
              onChange={e => setForm({ ...form, proposedBudget: e.target.value })}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Deadline <span className="text-danger">*</span></label>
            <input
              required type="date" className="form-control"
              min={today}
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Attach Files</label>
          <AttachmentUploader onChange={setAttachments} />
        </div>

        <button className="btn btn-primary px-5" disabled={submitting}>
          {submitting
            ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
            : 'Send Request'}
        </button>
      </form>
    </div>
  );
}
