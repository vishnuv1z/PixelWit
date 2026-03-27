import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/api';

const ALL_SKILLS = [
  'Photo Editing', 'Video Editing', 'Color Grading', 'Thumbnail Design',
  'Reels Editing', 'Poster Design', 'After Effects', 'Premiere Pro',
  'Lightroom', 'Photoshop', 'Canva', 'DaVinci Resolve'
];

export default function EditProfile() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isNew    = location.state?.isNew === true;
  const photoRef = useRef();

  const getUserId = () => {
    if (user?._id) return user._id;
    try {
      const stored = localStorage.getItem('pixelwit_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed._id || parsed.id || null;
      }
    } catch {}
    return null;
  };

  const [userId, setUserId] = useState(getUserId);

  useEffect(() => {
    if (user?._id) {
      setUserId(user._id);
    } else {
      try {
        const stored = localStorage.getItem('pixelwit_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const id = parsed._id || parsed.id || null;
          if (id) setUserId(id);
        }
      } catch {}
    }
  }, [user]);

  const [form, setForm] = useState({
    name:         user?.name         || '',
    about:        user?.about        || '',
    description:  user?.description  || '',
    hourlyRate:   user?.hourlyRate   || '',
    availability: user?.availability || 'AVAILABLE',
    profilePhoto: user?.profilePhoto || '',
    skills:       user?.skills       || [],
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        name:         f.name         || user.name         || '',
        about:        f.about        || user.about        || '',
        description:  f.description  || user.description  || '',
        hourlyRate:   f.hourlyRate   || user.hourlyRate   || '',
        availability: f.availability || user.availability || 'AVAILABLE',
        profilePhoto: f.profilePhoto || user.profilePhoto || '',
        skills:       f.skills.length ? f.skills : (user.skills || []),
      }));
    }
  }, [user]);

  const [photoUploading,    setPhotoUploading]    = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [toast,             setToast]             = useState(null);
  const [customSkill,       setCustomSkill]       = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,          setDeleting]          = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setPhotoUploading(true);
    try {
      const sigRes = await API.get('/upload/sign');
      const sig    = sigRes.data;
      const fd = new FormData();
      fd.append('file',      file);
      fd.append('api_key',   sig.apiKey);
      fd.append('timestamp', sig.timestamp);
      fd.append('signature', sig.signature);
      fd.append('folder',    sig.folder);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        setForm(f => ({ ...f, profilePhoto: data.secure_url }));
      } else {
        showToast('danger', 'Photo upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch {
      showToast('danger', 'Failed to upload photo. Check your Cloudinary config.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }));
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setCustomSkill('');
  };

  const handleSave = async () => {
    const id = getUserId();
    if (!id) return showToast('danger', 'Session error — please log out and log back in.');
    if (!form.name.trim())  return showToast('danger', 'Name is required.');
    if (!form.about.trim()) return showToast('danger', 'About is required.');
    if (!form.hourlyRate)   return showToast('danger', 'Hourly rate is required.');

    setSaving(true);
    try {
      const res = await API.put(`/users/${id}`, { ...form, hourlyRate: Number(form.hourlyRate), isProfileComplete: true });
      updateUser(res.data.user);
      setUserId(res.data.user._id);
      showToast('success', '✅ Profile saved successfully!');
      if (isNew) setTimeout(() => navigate('/editor/work-requests'), 1800);
    } catch (err) {
      showToast('danger', err.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = getUserId();
    if (!id) return;
    setDeleting(true);
    try {
      await API.delete(`/users/${id}`);
      logout();
      navigate('/');
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Delete failed. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!userId) {
    return (
      <div className="container-fluid px-4 py-5 text-center">
        <div className="spinner-border text-primary mb-3" />
        <p className="text-muted">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 760 }}>

      {isNew && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
          <span style={{ fontSize: 26 }}>👋</span>
          <div><strong>Welcome to PixelWit!</strong> Complete your profile so clients can find and hire you.</div>
        </div>
      )}

      <h3 className="mb-1 fw-bold">Edit Profile</h3>
      <p className="text-muted mb-4">This is what clients see when they browse editors.</p>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      {/* Profile Photo */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: 14 }}>
        <div className="card-body p-4">
          <h5 className="mb-3">Profile Photo</h5>
          <div className="d-flex align-items-center gap-4">
            <div style={{ position: 'relative' }}>
              <img
                src={form.profilePhoto || 'https://via.placeholder.com/100x100?text=Photo'}
                alt="Profile" className="rounded-circle"
                style={{ width: 100, height: 100, objectFit: 'cover', border: '3px solid #dee2e6' }}
              />
              {photoUploading && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner-border spinner-border-sm text-white" />
                </div>
              )}
            </div>
            <div>
              <button className="btn btn-outline-primary btn-sm mb-2 d-block"
                onClick={() => photoRef.current.click()} disabled={photoUploading}>
                {photoUploading ? 'Uploading…' : <><i className="bi bi-camera-fill"></i> Upload Photo</>}
              </button>
              <small className="text-muted d-block">JPG or PNG. Uploads to cloud.</small>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handlePhotoUpload(e.target.files[0])} />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: 14 }}>
        <div className="card-body p-4">
          <h5 className="mb-3">Basic Info</h5>

          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
            <input className="form-control" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">About <span className="text-danger">*</span></label>
            <input className="form-control" placeholder="e.g. Professional Video & Photo Editor"
              value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
            <small className="text-muted">Short tagline shown on your card in Browse Editors.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Description</label>
            <textarea className="form-control" rows={4}
              placeholder="Tell clients about your experience, style, and what makes you stand out..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Hourly Rate (₹) <span className="text-danger">*</span></label>
              <input type="number" className="form-control" placeholder="e.g. 700" min={0}
                value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Availability</label>
              <select className="form-select" value={form.availability}
                onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}>
                <option value="AVAILABLE">🟢 Available</option>
                <option value="BUSY">🔴 Working on a project</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: 14 }}>
        <div className="card-body p-4">
          <h5 className="mb-1">Skills</h5>
          <p className="text-muted small mb-3">Select all that apply. These are used by clients to filter editors.</p>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {ALL_SKILLS.map(skill => (
              <button key={skill} type="button"
                className={`btn btn-sm ${form.skills.includes(skill) ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => toggleSkill(skill)}>
                {form.skills.includes(skill) ? '✓ ' : ''}{skill}
              </button>
            ))}
          </div>

          {form.skills.length > 0 && (
            <div className="mb-3">
              <small className="text-muted fw-semibold d-block mb-1">Selected:</small>
              <div className="d-flex flex-wrap gap-1">
                {form.skills.map(s => (
                  <span key={s} className="badge bg-dark d-flex align-items-center gap-1">
                    {s}
                    <button type="button" className="btn-close btn-close-white" style={{ fontSize: 8 }}
                      onClick={() => toggleSkill(s)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
            <input type="text" className="form-control" placeholder="Add custom skill..."
              value={customSkill} onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomSkill()} />
            <button className="btn btn-outline-dark" onClick={addCustomSkill}>Add</button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex gap-3 align-items-center mb-4">
        <button className="btn btn-primary px-5" onClick={handleSave} disabled={saving || photoUploading}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
            : isNew ? <><i className="bi bi-check2"></i> Save & Continue</> : <><i className="bi bi-floppy2"></i> Save Changes</>
          }
        </button>
        {!isNew && (
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
        )}
        {isNew && (
          <button className="btn btn-link text-muted" onClick={() => navigate('/editor/work-requests')}>
            Skip for now
          </button>
        )}
      </div>

      {/* Delete Account*/}
      <div className="card border-danger mb-4" style={{ borderRadius: 14 }}>
        <div className="card-body p-4">
          <h5 className="text-danger mb-1">Delete Account</h5>
          <p className="text-muted small mb-3">
            Permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
          </p>
          {!showDeleteConfirm ? (
            <button className="btn btn-outline-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete My Account
            </button>
          ) : (
            <div className="alert alert-danger p-3 mb-0">
              <p className="fw-semibold mb-2">Are you absolutely sure?</p>
              <p className="small mb-3">Your profile, skills, and all data will be permanently removed.</p>
              <div className="d-flex gap-2">
                <button className="btn btn-danger btn-sm px-4" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><span className="spinner-border spinner-border-sm me-1" />Deleting…</> : 'Yes, Delete My Account'}
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
