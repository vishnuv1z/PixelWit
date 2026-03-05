import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function EditProfile() {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || '',
    about: user?.about || '',
    description: user?.description || '',
    hourlyRate: user?.hourlyRate || '',
    availability: user?.availability || 'AVAILABLE',
    profilePhoto: user?.profilePhoto || ''
  });

  return (
    <div className="container-fluid px-4" style={{ maxWidth: 800 }}>
      <h3 className="mb-4">Edit Profile</h3>

      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          className="form-control"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">About</label>
        <input
          className="form-control"
          value={form.about}
          onChange={e => setForm({ ...form, about: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows={4}
          value={form.description}
          onChange={e =>
            setForm({ ...form, description: e.target.value })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Hourly Rate (₹)</label>
        <input
          type="number"
          className="form-control"
          value={form.hourlyRate}
          onChange={e =>
            setForm({ ...form, hourlyRate: e.target.value })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Availability</label>
        <select
          className="form-select"
          value={form.availability}
          onChange={e =>
            setForm({ ...form, availability: e.target.value })
          }
        >
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Working on a project</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Profile Photo URL</label>
        <input
          className="form-control"
          placeholder="https://example.com/photo.jpg"
          value={form.profilePhoto}
          onChange={e =>
            setForm({ ...form, profilePhoto: e.target.value })
          }
        />
      </div>

      {form.profilePhoto && (
        <img
          src={form.profilePhoto}
          alt="Preview"
          className="rounded mb-3"
          width="120"
        />
      )}

      <button className="btn btn-primary">
        Save Changes
      </button>
    </div>
  );
}
