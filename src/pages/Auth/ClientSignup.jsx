import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMessage';

export default function ClientSignup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT'
  });

  const [strength, setStrength] = useState('Weak');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const checkStrength = (password) => {
    const rules = [
      /[a-z]/,
      /\d/,
      /[.,@#$!%*?&]/,
      /.{8,}/
    ];
    return rules.every(r => r.test(password))
      ? 'Strong'
      : password.length >= 6
      ? 'Medium'
      : 'Weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strength !== 'Strong') {
      setError('Please choose a strong password');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(form);

      // ✅ Toast instead of alert
      setToast({
        message: 'Account created successfully! Verify OTP to continue.',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="container-fluid px-4" style={{ maxWidth: 520 }}>
      <h3 className="text-center mb-2">Join PixelWit</h3>
      <p className="text-muted text-center mb-4">
        Hire professional editors easily
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          placeholder="Full Name"
          required
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="form-control mb-3"
          type="email"
          placeholder="Email"
          required
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          required
          onChange={e => {
            setForm({ ...form, password: e.target.value });
            setStrength(checkStrength(e.target.value));
          }}
        />

        {form.password.length > 0 && (
          <small
            className={
              strength === 'Strong'
                ? 'text-success'
                : strength === 'Medium'
                ? 'text-warning'
                : 'text-danger'
            }
          >
            Password Strength: <strong>{strength}</strong>
          </small>
        )}

        <input
          className="form-control my-3"
          type="password"
          placeholder="Confirm Password"
          required
          onChange={e =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <button
          className="btn btn-primary w-100"
          disabled={strength !== 'Strong'}
        >
          Create Account
        </button>
      </form>

      <div className="text-center mt-3">
        <small>
          Already have an account? <Link to="/login">Log in</Link>
        </small>
      </div>

      {/* ✅ Toast */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}