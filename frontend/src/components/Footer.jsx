import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light mt-5">
      <div className="container py-5">
        <div className="row">

          {/* Brand */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">PixelWit</h5>
            <p className="text-muted">
              A mini freelance platform connecting clients with skilled editors
              for photo and video editing works.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link className="text-light text-decoration-none" to="/">Home</Link></li>
              <li><Link className="text-light text-decoration-none" to="/client/browse">Browse Editors</Link></li>
              <li><Link className="text-light text-decoration-none" to="/signup/client">Signup</Link></li>
              <li><Link className="text-light text-decoration-none" to="/login">Login</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Services</h6>
            <ul className="list-unstyled">
              <li>Photo Editing</li>
              <li>Video Editing</li>
              <li>YouTube Thumbnails</li>
              <li>Instagram Reels</li>
              <li>Color Grading</li>
            </ul>
          </div>

          {/* Credits */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Credits</h6>
            <p className="mb-1">Developed by</p>
            <p className="mb-1"><strong>Vishnu Anup</strong></p>
            <p className="mb-1">
              Built with React & Bootstrap
            </p>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-secondary text-center py-3">
        <small>
          © {new Date().getFullYear()} PixelWit. All rights reserved.
        </small>
      </div>
    </footer>
  );
}