import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) return;
    try {
      const res = await axios.patch(`http://localhost:5000/api/admin/users/${id}/block`);
      if (res.data.success) fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle block status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL: Are you absolutely sure you want to delete this user? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      if (res.data.success) fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleEditClick = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${editUser._id}`, editForm);
      if (res.data.success) {
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Filtered Data
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    const matchRole = roleFilter ? u.role === roleFilter : true;
    
    let matchStatus = true;
    if (statusFilter === 'ACTIVE') matchStatus = !u.isBlocked;
    if (statusFilter === 'BLOCKED') matchStatus = u.isBlocked;

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 1200, minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">User Management</h3>
          <p className="text-muted mb-0">View, edit, block, or delete users across the platform.</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Search by name or email..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="CLIENT">Client</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
            <div className="col-md-1">
              <button 
                className="btn btn-outline-secondary w-100" 
                onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }}
                title="Clear Filters"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people" style={{ fontSize: 40 }}></i>
              <p className="mt-2">No users found matching your filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3">User</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Joined</th>
                    <th className="pe-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img 
                            src={u.profilePhoto || `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                            alt={u.name} 
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-0 fw-bold">{u.name}</h6>
                            <small className="text-muted">{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${
                          u.role === 'ADMIN' ? 'bg-danger' : 
                          u.role === 'EDITOR' ? 'bg-primary' : 'bg-success'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.isBlocked ? (
                          <span className="badge bg-secondary rounded-pill px-3 py-2 text-white"><i className="bi bi-lock-fill me-1"></i> Blocked</span>
                        ) : (
                          <span className="badge bg-light text-dark border rounded-pill px-3 py-2"><i className="bi bi-check-circle-fill text-success me-1"></i> Active</span>
                        )}
                      </td>
                      <td className="py-3 text-muted small">
                        {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-sm btn-light border shadow-sm" onClick={() => setViewUser(u)} title="View Details">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-light border shadow-sm" 
                            onClick={() => handleEditClick(u)} 
                            title="Edit User"
                            disabled={currentUser && currentUser._id === u._id}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className={`btn btn-sm shadow-sm ${u.isBlocked ? 'btn-success' : 'btn-warning'}`} 
                            onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                            title={u.isBlocked ? "Unblock User" : "Block User"}
                            disabled={currentUser && currentUser._id === u._id}
                          >
                            <i className={`bi ${u.isBlocked ? 'bi-unlock' : 'bi-lock'}`}></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger shadow-sm" 
                            onClick={() => handleDelete(u._id)} 
                            title="Delete User"
                            disabled={currentUser && currentUser._id === u._id}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- VIEW MODAL OVERLAY --- */}
      {viewUser && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: 500, borderRadius: 16 }}>
            <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center pt-4 px-4 pb-0">
              <h5 className="fw-bold mb-0">User Details</h5>
              <button className="btn-close" onClick={() => setViewUser(null)}></button>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img 
                  src={viewUser.profilePhoto || `https://ui-avatars.com/api/?name=${viewUser.name}&background=random`} 
                  alt={viewUser.name} 
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }}
                />
                <h5 className="fw-bold mb-1">{viewUser.name}</h5>
                <p className="text-muted mb-2">{viewUser.email}</p>
                <span className={`badge px-3 py-2 rounded-pill ${viewUser.role === 'EDITOR' ? 'bg-primary' : 'bg-success'}`}>{viewUser.role}</span>
              </div>
              
              <hr />
              
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <small className="text-muted d-block fw-semibold mb-1">Status</small>
                  {viewUser.isBlocked ? <span className="text-danger fw-bold"><i className="bi bi-lock-fill"></i> Blocked</span> : <span className="text-success fw-bold">Active</span>}
                </div>
                <div className="col-6">
                  <small className="text-muted d-block fw-semibold mb-1">Joined</small>
                  <span>{viewUser.updatedAt ? new Date(viewUser.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>

              {viewUser.role === 'EDITOR' && (
                <>

                {viewUser.about && (
                  <div className="mt-3 mb-4">
                    <small className="text-muted d-block fw-semibold mb-1">About</small>
                    <p className="small mb-0 rounded p-2 bg-light">{viewUser.about}</p>
                  </div>
                )}

                  <div className="mb-4">
                    <small className="text-muted d-block fw-semibold mb-1">Skills</small>
                    <div className="d-flex flex-wrap gap-1">
                      {viewUser.skills?.length > 0 
                        ? viewUser.skills.map(s => <span key={s} className="badge bg-light text-dark border">{s}</span>)
                        : <span className="text-muted small">No skills listed</span>
                      }
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted d-block fw-semibold mb-1">Hourly Rate</small>
                      <span>{viewUser.hourlyRate ? `₹${viewUser.hourlyRate}/hr` : '—'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block fw-semibold mb-1">Rating</small>
                      <span>⭐ {viewUser.rating || 0} ({viewUser.reviewCount} reviews)</span>
                    </div>
                  </div>
                </>
              )}
              
            </div>
            <div className="card-footer bg-white border-top-0 pb-4 px-4 text-end">
              <button className="btn btn-secondary px-4 rounded-pill" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL OVERLAY --- */}
      {editUser && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: 450, borderRadius: 16 }}>
            <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center pt-4 px-4 pb-0">
              <h5 className="fw-bold mb-0">Edit User</h5>
              <button className="btn-close" onClick={() => setEditUser(null)}></button>
            </div>
            <form onSubmit={submitEdit}>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <input type="text" className="form-control" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Role</label>
                  <select className="form-select" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} required>
                    <option value="CLIENT">Client</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="card-footer bg-white border-top-0 pb-4 px-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light border rounded-pill px-4" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
