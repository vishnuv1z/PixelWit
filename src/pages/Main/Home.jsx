import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// Maps home pill labels → exact values used in BrowseEditors service dropdown
const SERVICE_MAP = {
  'Photo Editing':      'Photo Editing',
  'Video Editing':      'Video Editing',
  'YouTube Thumbnails': 'Thumbnail Design',
  'Instagram Reels':    'Reels Editing',
  'Color Grading':      'Color Grading',
  'Poster Design':      'Poster Design',
};

export default function Home() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!searchText.trim()) {
      setError('Please enter a service to search');
      return;
    }
    setError('');
    navigate('/client/browse', { state: { search: searchText.trim() } });
  };

  return (
    <div className="hero-section d-flex align-items-center">
      <div className="container-fluid text-center text-white px-4">
        <h1 className="display-5 fw-bold mb-3">
          Find the perfect <span className="text-warning">editor</span> for your work
        </h1>

        <p className="lead mb-4">
          Photo editing, video editing, reels, thumbnails & more
        </p>

        {/* Search Bar */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-8">
            <div className="input-group input-group-lg shadow">
              <input
                type="text"
                className="form-control"
                placeholder="What service are you looking for?"
                value={searchText}
                onChange={e => { setSearchText(e.target.value); if (error) setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn btn-warning" onClick={handleSearch}>
                Search
              </button>
            </div>
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
        </div>

        {/* Category pills — pass service separately so BrowseEditors sets the dropdown */}
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {Object.keys(SERVICE_MAP).map((label) => (
            <button
              key={label}
              className="btn btn-outline-light btn-sm"
              onClick={() =>
                navigate('/client/browse', { state: { service: SERVICE_MAP[label] } })
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}