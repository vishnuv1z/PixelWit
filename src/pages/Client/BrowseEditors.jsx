import React, { useEffect, useState, useContext } from "react";
import EditorCard from "../../components/EditorCard";
import EditorSkeleton from "../../components/EditorSkeleton";
import API from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function BrowseEditors() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [editors, setEditors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pre-populate from Home page navigation state
  const [search, setSearch]       = useState(location.state?.search  || "");
  const [service, setService]     = useState(location.state?.service || "");
  const [minRating, setMinRating] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const res = await API.get("/users/editors"); // ✅ correct route
        await new Promise(resolve => setTimeout(resolve, 800)); // demo delay
        console.log("Editors from DB:", res.data);
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
      data = data.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          (e.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (service) {
      data = data.filter((e) => (e.skills || []).includes(service));
    }

    if (minRating) {
      data = data.filter((e) => Number(e.rating) >= Number(minRating));
    }

    if (maxBudget) {
      data = data.filter((e) => Number(e.hourlyRate) <= Number(maxBudget));
    }

    setFiltered(data);
  }, [search, service, minRating, maxBudget, editors]);

  return (
    <div className="container-fluid px-4">

      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="input-group input-group-lg">
            <input
              className="form-control"
              placeholder="Search editors or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-dark">Search</button>
          </div>
        </div>
      </div>

      <div className="row">

        {/* FILTER PANEL */}
        <div className="col-md-3 mb-4">
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '20px 18px',
            border: '1px solid #000000',
            borderTop: '1px solid #000000',
            borderBottom: '1px solid #000000',
            position: 'sticky',
            top: 20
          }}>
            <h5 className="mb-4 fw-bold" style={{ color: '#212529' }}>Filters</h5>

            <div className="mb-3">
              <label className="form-label small fw-semibold text text-muted" style={{ letterSpacing: 0.6 }}>Service</label>
              <select
                className="form-select form-select-sm"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">All</option>
                <option value="Photo Editing">Photo Editing</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Thumbnail Design">Thumbnail Design</option>
                <option value="Reels Editing">Reels Editing</option>
                <option value="Color Grading">Color Grading</option>
                <option value="Poster Design">Poster Design</option>
                <option value="After Effects">After Effects</option>
                <option value="Premiere Pro">Premiere Pro</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text text-muted" style={{ letterSpacing: 0.6 }}>Minimum Rating</label>
              <select
                className="form-select form-select-sm"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any</option>
                <option value="4">4★ & above</option>
                <option value="4.5">4.5★ & above</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text text-muted" style={{ letterSpacing: 0.6 }}>Max Budget (₹/hr)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="e.g. 800"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
            </div>

            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => {
                setSearch("");
                setService("");
                setMinRating("");
                setMaxBudget("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* EDITORS */}
        <div className="col-md-9">
          {loading ? (
            <div className="row g-4">
              {Array(6).fill().map((_, i) => (
                <div key={i} className="col-md-6">
                  <EditorSkeleton />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="alert alert-info">
              No editors found. Try adjusting your filters.
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((editor) => (
                <div key={editor._id} className="col-md-6">
                  <EditorCard
                    editor={editor}
                    isClient={user?.role === 'CLIENT'}
                    onCreateRequest={(ed) => navigate('/client/create-request', { state: { editor: ed } })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}