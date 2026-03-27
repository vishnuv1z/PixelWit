import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMessage';

export default function EditorSignup() {
  const { signup, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EDITOR'
  });

  const [strength, setStrength] = useState('Weak');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  /* 🔐 Password strength checker */
  const checkStrength = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[.,@#$!%*?&]/.test(password);
    const hasLength = password.length >= 8;

    if (hasLower && hasNumber && hasSymbol && hasLength) {
      return 'Strong';
    }
    if (password.length >= 6) {
      return 'Medium';
    }
    return 'Weak';
  };

  const handlePasswordChange = (value) => {
    setForm({ ...form, password: value });
    setStrength(checkStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strength !== 'Strong') {
      setError('Password must be strong to continue');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(form);

      // Auto-login immediately after signup
      await login({ email: form.email, password: form.password });

      // Redirect to edit profile so editor fills their details
      // isNew flag shows a welcome message on the profile page
      navigate('/editor/edit-profile', { state: { isNew: true } });

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    }
  };

  return (
    <div className="container-fluid px-4" style={{ maxWidth: 520 }}>
      <h3 className="text-center mb-2">Become an Editor</h3>
      <p className="text-muted text-center mb-4">
        Start receiving paid editing projects
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
          onChange={e => handlePasswordChange(e.target.value)}
        />

        {/* Password strength indicator */}
        {form.password.length > 0 && (
          <div className="mb-3">
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
            <div className="form-text">
              Use 8+ chars with letters, number & symbol
            </div>
          </div>
        )}

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Confirm Password"
          required
          onChange={e =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <button
          className="btn btn-warning w-100"
          disabled={strength !== 'Strong'}
        >
          Create Editor Account
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