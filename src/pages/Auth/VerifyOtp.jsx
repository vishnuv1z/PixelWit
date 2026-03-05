import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VerifyOtp(){
  const { verifyOtp } = useContext(AuthContext);
  const loc = useLocation();
  const nav = useNavigate();
  const email = loc.state?.email || '';
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      alert('Verified. Now login.');
      nav('/login');
    } catch (err) {
      alert(err.message || 'Invalid OTP');
    } finally { setLoading(false); }
  }

  return (
    <div className="container-fluid px-4" style={{maxWidth:540}}>
      <h3 className="mb-3">Verify your email</h3>
      <p>OTP sent to <strong>{email || 'your email'}</strong>. (demo OTP is <code>123456</code>)</p>
      <form onSubmit={submit}>
        <div className="mb-3">
          <input required className="form-control" placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
      </form>
    </div>
  );
}
