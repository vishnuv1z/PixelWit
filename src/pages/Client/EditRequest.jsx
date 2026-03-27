import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, editRequest } from '../../api/requests';
import AttachmentUploader from '../../components/AttachmentUploader';

const today = new Date().toISOString().split('T')[0];

export default function EditRequest() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,        setForm]        = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getRequest(id)
      .then(res => {
        const r = res.data;
        if (r.status !== 'PENDING_QUOTE') {
          showToast('warning', 'Only pending requests can be edited.');
          setTimeout(() => navigate(`/client/request/${id}`), 2000);
          return;
        }
        setForm({
          title:          r.title          || '',
          description:    r.description    || '',
          proposedBudget: r.proposedBudget || '',
          deadline:       r.deadline       || '',
        });
        setAttachments(r.attachments || []);
      })
      .catch(() => showToast('danger', 'Failed to load request.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await editRequest(id, { ...form, proposedBudget: Number(form.proposedBudget), attachments });
      showToast('success', '✅ Request updated successfully!');
      setTimeout(() => navigate(`/client/request/${id}`), 1500);
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container-fluid px-4 py-5 text-center">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!form) return (
    <div className="container-fluid px-4 py-4">
      {toast && <div className={`alert alert-${toast.type}`}>{toast.msg}</div>}
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 720 }}>
      <button className="btn btn-link ps-0 mb-3 text-muted" onClick={() => navigate(`/client/request/${id}`)}>
        ← Back to Request
      </button>

      <h3 className="fw-bold mb-1">Edit Request</h3>
      <p className="text-muted mb-4">Make changes to your pending request below.</p>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
          <input required className="form-control" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
          <textarea required className="form-control" rows={4} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Budget (₹) <span className="text-danger">*</span></label>
            <input required type="number" min={1} className="form-control" value={form.proposedBudget}
              onChange={e => setForm({ ...form, proposedBudget: e.target.value })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Deadline <span className="text-danger">*</span></label>
            <input required type="date" className="form-control" min={today} value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <small className="text-muted">Must be today or a future date.</small>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Attachments</label>
          <AttachmentUploader existingUrls={attachments} onChange={setAttachments} />
        </div>

        <div className="d-flex gap-3">
          <button className="btn btn-primary px-5" disabled={submitting}>
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
              : <><i className="bi bi-floppy2"></i> Save Changes</>}
          </button>
          <button type="button" className="btn btn-outline-secondary"
            onClick={() => navigate(`/client/request/${id}`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
