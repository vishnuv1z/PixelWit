import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2 mb-0">
      <div className="container-fluid px-4">
        <Link className="navbar-brand logo-text" to="/">
          <span className="logo-pixel">Pixel</span>
          <span className="logo-wit">Wit</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          {/* Left links */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/client/browse">
                Browse Editors
              </Link>
            </li>
          </ul>

          {/* Right side */}
          <ul className="navbar-nav align-items-center gap-2">

            {/* NOT LOGGED IN */}
            {!user && (
              <>
                <li className="nav-item">
                  <Link
                    to="/signup/editor"
                    className="btn btn-warning btn-sm"
                  >
                    Become an Editor
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/signup/client"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Join Us
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            )}

            {/* LOGGED IN */}
            {user && (
              <>
                {/* Greeting */}
                <li className="nav-item me-2">
                  <span className="nav-link">
                    Hi, <strong>{user.name}</strong>
                  </span>
                </li>

                {/* USER DROPDOWN */}
                <li className="nav-item dropdown position-static">
                  <button
                    type="button"
                    className="nav-link dropdown-toggle p-0 user-dropdown-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle fs-4 user-icon"></i>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    {/* CLIENT OPTIONS */}
                    {user.role === 'CLIENT' && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/client/dashboard">
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/client/requests">
                            My Requests
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/client/deliverables">
                            My Deliverables
                          </Link>
                        </li>
                      </>
                    )}

                    {/* EDITOR OPTIONS */}
                    {user.role === 'EDITOR' && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/editor/dashboard">
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/editor/work-requests">
                          Work Requests
                        </Link>
                      </li>

                      <li>
                        <Link className="dropdown-item" to="/editor/deliverables">
                          Upload Deliverables
                        </Link>
                      </li>

                      <li>
                        <Link className="dropdown-item" to="/editor/edit-profile">
                          Edit Profile
                        </Link>
                      </li>
                    </>
                  )}

                    {/* ADMIN OPTIONS */}
                    {user.role === 'ADMIN' && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/admin/analytics">
                            Analytics Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/users">
                            User Management
                          </Link>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}