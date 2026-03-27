import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, updateRequestStatus } from '../../api/requests';

export default function PaymentPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [req,        setReq]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [card,       setCard]       = useState({
    name:   '',
    number: '',
    expiry: '',
    cvv:    '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getRequest(id)
      .then(res => setReq(res.data))
      .catch(() => setReq(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Format card number: 1234 5678 9012 3456
  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry: MM/YY
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const validate = () => {
    const e = {};
    if (!card.name.trim())                        e.name   = 'Cardholder name is required';
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Enter a valid 16-digit card number';
    if (card.expiry.length < 5)                   e.expiry = 'Enter a valid expiry (MM/YY)';
    if (card.cvv.length < 3)                       e.cvv    = 'Enter a valid CVV';
    return e;
  };

  const handlePay = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setProcessing(true);
    // Simulate a 2s payment processing delay
    setTimeout(async () => {
      try {
        await updateRequestStatus(id, { status: 'COMPLETED' });
        setSuccess(true);
      } catch {
        setSuccess(true); // show success anyway for demo
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  const amount = req?.negotiatedBudget || req?.proposedBudget || 0;
  const editor = req?.editorId?.name   || 'Editor';

  // ── Success Screen ──
  if (success) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '85vh' }}>
      <div className="text-center" style={{ maxWidth: 440 }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: '#d1fae5', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40
        }}>✅</div>

        <h3 className="fw-bold mb-2">Payment Successful!</h3>
        <p className="text-muted mb-1">
          <strong>₹{amount.toLocaleString()}</strong> has been sent to
        </p>
        <p className="fw-semibold fs-5 mb-4" style={{ color: '#0d6efd' }}>
          {editor}'s account
        </p>

        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14, background: '#f8f9fa' }}>
          <div className="card-body p-4 text-start">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Project</span>
              <span className="small fw-semibold">{req?.title}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Amount Paid</span>
              <span className="small fw-semibold text-success">₹{amount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Paid To</span>
              <span className="small fw-semibold">{editor}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted small">Status</span>
              <span className="badge bg-success">Completed</span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary px-5"
          onClick={() => navigate('/client/requests')}
        >
          Back to My Requests
        </button>
      </div>
    </div>
  );

  // ── Payment Form ──
  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '85vh' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div className="text-center mb-4">
          <h4 className="fw-bold mb-1">Complete Payment</h4>
          <p className="text-muted small">Enter your card details to pay the editor</p>
        </div>

        {/* Amount Banner */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 mb-4 rounded-3"
          style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <div>
            <p className="mb-0 small text-muted">Paying to</p>
            <p className="mb-0 fw-semibold">{editor}</p>
          </div>
          <div className="text-end">
            <p className="mb-0 small text-muted">Amount</p>
            <p className="mb-0 fw-bold fs-5" style={{ color: '#0d6efd' }}>₹{amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body p-4">

            {/* Card visual strip */}
            <div className="rounded-3 mb-4 p-3 d-flex justify-content-between align-items-center"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d6efd)', color: '#fff' }}>
              <div>
                <p className="mb-0 small opacity-75">Card Number</p>
                <p className="mb-0 fw-semibold" style={{ letterSpacing: 2, fontSize: 15 }}>
                  {card.number || '**** **** **** ****'}
                </p>
              </div>
              <div className="text-end">
                <p className="mb-0 small opacity-75">Expiry</p>
                <p className="mb-0 fw-semibold">{card.expiry || 'MM/YY'}</p>
              </div>
            </div>

            <form onSubmit={handlePay}>
              {/* Cardholder Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Cardholder Name</label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Name on card"
                  value={card.name}
                  onChange={e => { setCard({ ...card, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Card Number */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Card Number</label>
                <input
                  className={`form-control ${errors.number ? 'is-invalid' : ''}`}
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={e => { setCard({ ...card, number: formatCardNumber(e.target.value) }); setErrors({ ...errors, number: '' }); }}
                />
                {errors.number && <div className="invalid-feedback">{errors.number}</div>}
              </div>

              {/* Expiry + CVV */}
              <div className="row mb-4">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Expiry Date</label>
                  <input
                    className={`form-control ${errors.expiry ? 'is-invalid' : ''}`}
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={e => { setCard({ ...card, expiry: formatExpiry(e.target.value) }); setErrors({ ...errors, expiry: '' }); }}
                  />
                  {errors.expiry && <div className="invalid-feedback">{errors.expiry}</div>}
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">CVV</label>
                  <input
                    className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    value={card.cvv}
                    onChange={e => { setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') }); setErrors({ ...errors, cvv: '' }); }}
                  />
                  {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={processing}
                style={{ borderRadius: 10, fontSize: 16 }}
              >
                {processing
                  ? <><span className="spinner-border spinner-border-sm me-2" />Processing Payment…</>
                  : `💳 Pay ₹${amount.toLocaleString()}`}
              </button>

              <button
                type="button"
                className="btn btn-link w-100 text-muted mt-2"
                onClick={() => navigate(`/client/request/${id}`)}
                disabled={processing}
              >
                Cancel
              </button>
            </form>

            <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 12 }}>
              🔒 This is a demo payment — no real money is charged
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}