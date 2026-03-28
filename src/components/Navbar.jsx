import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    nav('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';
  const showPhoto = user?.role === 'EDITOR' && user?.profilePhoto;

  return (
    <nav style={{
      background: '#212529',
      borderBottom: '1px solid #222',
      padding: '0 32px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>

      {/* LEFT — Logo + nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: -0.5 }}>
            Pixel<span style={{ color: '#ffea00' }}>Wit</span>
          </span>
        </Link>

        <Link to="/client/browse" style={{
          color: '#aaa', textDecoration: 'none', fontSize: 14, fontWeight: 500,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = '#aaa'}
        >
          Browse Editors
        </Link>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* NOT LOGGED IN */}
        {!user && (
          <>
            <Link to="/signup/editor" style={{
              background: '#ffea00', color: '#000',
              padding: '6px 16px', borderRadius: 20,
              fontSize: 13, fontWeight: 700,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Become an Editor
            </Link>

            <Link to="/signup/client" style={{
              color: '#fff', border: '1px solid #444',
              padding: '6px 16px', borderRadius: 20,
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0059ff'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
            >
              Join Us
            </Link>

            <Link to="/login" style={{
              color: '#aaa', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#aaa'}
            >
              Login
            </Link>
          </>
        )}

        {/* LOGGED IN */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Greeting */}
            <span style={{ color: '#aaa', fontSize: 14 }}>
              Hi, <strong style={{ color: '#fff' }}>{user.name}</strong>
            </span>

            {/* Avatar dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: showPhoto ? 'transparent' : '#ffea00',
                  color: '#000', border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'opacity 0.15s', padding: 0, overflow: 'hidden',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {showPhoto
                  ? <img src={user.profilePhoto} alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  {/* Click-outside backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', top: 44, right: 0,
                    background: '#fff', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    minWidth: 200, zIndex: 1000,
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                  }}>

                    {/* User info header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <p className="mb-0 fw-bold" style={{ fontSize: 14 }}>{user.name}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: 12 }}>{user.email}</p>
                    </div>

                    {/* CLIENT OPTIONS */}
                    {user.role === 'CLIENT' && (
                      <>
                        {[
                          { to: '/client/dashboard',    label: 'Dashboard',       icon: 'bi-grid' },
                          { to: '/client/requests',     label: 'My Requests',     icon: 'bi-file-text' },
                          { to: '/client/deliverables', label: 'My Deliverables', icon: 'bi-folder2-open' },
                        ].map(({ to, label, icon }) => (
                          <Link key={to} to={to}
                            onClick={() => setDropdownOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 16px', color: '#222', textDecoration: 'none',
                              fontSize: 14, transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <i className={`bi ${icon} text-muted`} style={{ fontSize: 15 }} />
                            {label}
                          </Link>
                        ))}
                      </>
                    )}

                    {/* EDITOR OPTIONS */}
                    {user.role === 'EDITOR' && (
                      <>
                        {[
                          { to: '/editor/dashboard',     label: 'Dashboard',          icon: 'bi-grid' },
                          { to: '/editor/work-requests', label: 'Work Requests',       icon: 'bi-briefcase' },
                          { to: '/editor/deliverables',  label: 'Upload Deliverables', icon: 'bi-cloud-upload' },
                          { to: '/editor/edit-profile',  label: 'Edit Profile',        icon: 'bi-person-gear' },
                        ].map(({ to, label, icon }) => (
                          <Link key={to} to={to}
                            onClick={() => setDropdownOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 16px', color: '#222', textDecoration: 'none',
                              fontSize: 14, transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <i className={`bi ${icon} text-muted`} style={{ fontSize: 15 }} />
                            {label}
                          </Link>
                        ))}
                      </>
                    )}

                    {/* ADMIN OPTIONS */}
                    {user.role === 'ADMIN' && (
                      <>
                        {[
                          { to: '/admin/analytics', label: 'Analytics Dashboard', icon: 'bi-bar-chart' },
                          { to: '/admin/users',     label: 'User Management',     icon: 'bi-people' },
                        ].map(({ to, label, icon }) => (
                          <Link key={to} to={to}
                            onClick={() => setDropdownOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 16px', color: '#222', textDecoration: 'none',
                              fontSize: 14, transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <i className={`bi ${icon} text-muted`} style={{ fontSize: 15 }} />
                            {label}
                          </Link>
                        ))}
                      </>
                    )}

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid #f0f0f0' }}>
                      <button onClick={handleLogout} style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', color: '#ef4444',
                        background: 'none', border: 'none',
                        fontSize: 14, cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="bi bi-box-arrow-right" style={{ fontSize: 15 }} />
                        Logout
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}