import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMessage';

export default function Login() {

  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {

      await login(form);

      setToast({
        message: 'Login successful!',
        type: 'success'
      });

      setTimeout(() => {
        nav('/');
      }, 1000);

    } catch (err) {

      setToast({
        message: err.message || 'Invalid credentials',
        type: 'danger'
      });

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid px-4" style={{ maxWidth: 540 }}>

      <h3 className="mb-4">Login</h3>

      <form onSubmit={submit}>

        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            required
            className="form-control"
            value={form.email}
            onChange={e =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            required
            className="form-control"
            value={form.password}
            onChange={e =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </form>

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
