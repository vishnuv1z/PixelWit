import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMessage';

export default function EditorSignup() {
  const { signup, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'EDITOR' });
  const [strength, setStrength]       = useState('Weak');
  const [toast, setToast]             = useState(null);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checkStrength = (password) => {
    const rules = [/[a-z]/, /\d/, /[.,@#$!%*?&]/, /.{8,}/];
    return rules.every(r => r.test(password)) ? 'Strong' : password.length >= 6 ? 'Medium' : 'Weak';
  };

  const strengthColor = { Strong: '#10b981', Medium: '#f59e0b', Weak: '#ef4444' };
  const strengthWidth = { Strong: '100%', Medium: '60%', Weak: '25%' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength !== 'Strong')
      return setToast({ message: 'Password must be strong to continue', type: 'danger' });
    if (form.password !== form.confirmPassword)
      return setToast({ message: 'Passwords do not match', type: 'danger' });
    try {
      // Signup — saves plain password before hashing happens on backend
      await signup(form);
      // Auto-login with the same credentials (bcrypt.compare handles it)
      await login({ email: form.email, password: form.password });
      navigate('/editor/edit-profile', { state: { isNew: true } });
    } catch (err) {
      setToast({ message: err.response?.data?.message || err.message || 'Signup failed', type: 'danger' });
    }
  };

  return (
    <div style={{
      minHeight: '90vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f8f9fa', paddingBottom: '45px',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        padding: '40px 36px',
      }}>

        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">Pixel<span style={{ color: '#ffea00' }}>Wit</span></h2>
          <p className="text-muted" style={{ fontSize: 14 }}>Start receiving paid editing projects</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-person text-muted" />
              </span>
              <input
                className="form-control border-start-0 ps-0"
                placeholder="Enter your full name"
                required
                style={{ boxShadow: 'none' }}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope text-muted" />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="Enter your e-mail"
                required
                style={{ boxShadow: 'none' }}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock text-muted" />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                required
                style={{ boxShadow: 'none' }}
                onChange={e => {
                  setForm({ ...form, password: e.target.value });
                  setStrength(checkStrength(e.target.value));
                }}
              />
              <span className="input-group-text bg-white border-start-0"
                style={{ cursor: 'pointer' }} onClick={() => setShowPass(p => !p)}>
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
              </span>
            </div>
          </div>

          {/* Strength bar */}
          {form.password.length > 0 && (
            <div className="mb-3">
              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, marginBottom: 4 }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: strengthWidth[strength],
                  background: strengthColor[strength],
                  transition: 'width 0.3s, background 0.3s'
                }} />
              </div>
              <small style={{ color: strengthColor[strength], fontSize: 12 }}>
                {strength} password {strength !== 'Strong' && '— use 8+ chars, a number & symbol'}
              </small>
            </div>
          )}

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock-fill text-muted" />
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="••••••••"
                required
                style={{ boxShadow: 'none' }}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              />
              <span className="input-group-text bg-white border-start-0"
                style={{ cursor: 'pointer' }} onClick={() => setShowConfirm(p => !p)}>
                <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
              </span>
            </div>
          </div>

          <button
            className="btn w-100 fw-semibold"
            disabled={strength !== 'Strong'}
            style={{
              background: '#ffea00', color: '#000',
              borderRadius: 10, padding: '10px 0',
              fontSize: 15, border: 'none',
            }}
          >
            Create Editor Account
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: 13 }}>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: '#0d6efd' }}>Log in</Link>
          <span className="text-muted mx-2">·</span>
          <Link to="/signup/client" className="fw-semibold text-decoration-none" style={{ color: '#0d6efd' }}>Join as Client</Link>
        </div>
      </div>

      {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
