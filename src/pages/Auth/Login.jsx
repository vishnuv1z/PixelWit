import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ToastMessage from '../../components/ToastMessage';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [showPass, setShowPass] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      setToast({ message: 'Login successful!', type: 'success' });
      setTimeout(() => nav('/'), 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Invalid credentials, please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '65px', 
      background: '#ffffff',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        padding: '40px 36px',
      }}>

        {/* Logo / Title */}
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">
            Pixel<span style={{ color: '#ffea00' }}>Wit</span>
          </h2>
          <p className="text-muted" style={{ fontSize: 14 }}>Log in to your account</p>
        </div>

        <form onSubmit={submit}>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope text-muted" />
              </span>
              <input
                type="email"
                placeholder="Enter your e-mail"
                required
                className="form-control border-start-0 ps-0"
                style={{ boxShadow: 'none' }}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock text-muted" />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="form-control border-start-0 border-end-0 ps-0"
                style={{ boxShadow: 'none' }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <span
                className="input-group-text bg-white border-start-0"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPass(p => !p)}
              >
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            className="btn w-100 fw-semibold"
            disabled={loading}
            style={{
              background: '#ffea00',
              color: '#000',
              borderRadius: 10,
              padding: '10px 0',
              fontSize: 15,
              border: 'none',
              transition: '0.2s', // ✅ change this
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
              : 'Sign In'}
          </button>

        </form>

        {/* Footer links */}
        <div className="text-center mt-4" style={{ fontSize: 13 }}>
          <span className="text-muted">Don't have an account? </span>
          <Link to="/signup/client" className="fw-semibold text-decoration-none" style={{ color: '#0d6efd' }}>
            Join as Client
          </Link>
          <span className="text-muted mx-2">·</span>
          <Link to="/signup/editor" className="fw-semibold text-decoration-none" style={{ color: '#0d6efd' }}>
            Become an Editor
          </Link>
        </div>

      </div>

      {toast && (
        <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}