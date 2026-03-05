import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BrowseEditors() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [editors, setEditors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔑 Search comes from Home page
  const [search, setSearch] = useState(location.state?.search || '');
  const [service, setService] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
  const fetchEditors = async () => {
    try {
      const res = await API.get("/api/users/editors");
      setEditors(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to load editors", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEditors();
}, []);

  useEffect(() => {
    let data = [...editors];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.skills || []).some(skill =>
          skill.toLowerCase().includes(q)
        )
      );
    }

    if (service) {
      data = data.filter(e =>
        (e.skills || []).includes(service)
      );
    }

    if (minRating) {
      data = data.filter(e => Number(e.rating) >= Number(minRating));
    }

    if (maxBudget) {
      data = data.filter(e => Number(e.hourlyRate) <= Number(maxBudget));
    }

    setFiltered(data);
  }, [search, service, minRating, maxBudget, editors]);

  return (
    <div className="container-fluid px-4">
      {/* Search bar */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="input-group input-group-lg">
            <input
              className="form-control"
              placeholder="Search by editor name or services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-dark">
              Search
            </button>
          </div>

        </div>
      </div>

      <div className="row">
        {/* FILTERS */}
        <div className="col-md-3 mb-4">
          <div className="card p-3 filter-panel">
            <h5 className="mb-3">Filters</h5>

            {/* Service */}
            <div className="mb-3">
              <label className="form-label">Service</label>
              <select
                className="form-select"
                value={service}
                onChange={e => setService(e.target.value)}
              >
                <option value="">All</option>
                <option value="Photo Editing">Photo Editing</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Thumbnail Design">Thumbnail Design</option>
                <option value="Color Grading">Color Grading</option>
              </select>
            </div>

            {/* Rating */}
            <div className="mb-3">
              <label className="form-label">Minimum Rating</label>
              <select
                className="form-select"
                value={minRating}
                onChange={e => setMinRating(e.target.value)}
              >
                <option value="">Any</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
              </select>
            </div>

            {/* Budget */}
            <div className="mb-3">
              <label className="form-label">Max Budget (₹/hr)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 800"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
              />
            </div>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setService('');
                setMinRating('');
                setMaxBudget('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* EDITOR GRID */}
        <div className="col-md-9">
          {loading ? (
            <div className="spinner-border text-primary" />
          ) : filtered.length === 0 ? (
            <div className="alert alert-info">No editors found, Try adjusting your filters or search terms.</div>
          ) : (
            <div className="row g-4">
              {filtered.map(editor => (
                <div key={editor.id} className="col-md-6">
                  <div
                    className="card h-100 shadow-sm border editor-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(`/client/editor/${editor.id}`)
                    }
                  >
                    <div className="card-body">
                      <div className="d-flex gap-3">
                        <img
                          src={editor.profilePhoto}
                          alt="Profile"
                          className="rounded-circle"
                          width="70"
                          height="70"
                          style={{ objectFit: 'cover' }}
                        />

                        <div>
                          <h5 className="mb-1">{editor.name}</h5>
                          <p className="text-muted small mb-1">
                            {editor.about}
                          </p>

                          <div className="d-flex gap-2 align-items-center">
                            <span className="badge bg-success">
                              ⭐ {editor.rating}
                            </span>
                            <span className="badge bg-info">
                              ₹{editor.hourlyRate}/hr
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {user && user.role === 'CLIENT' && (
                      <div className="card-footer bg-white border-0 text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={e => {
                            e.stopPropagation();
                            navigate('/client/create-request', {
                              state: { editor }
                            });
                          }}
                        >
                          Create Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}