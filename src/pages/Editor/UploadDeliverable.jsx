import React, { useEffect, useState, useContext, useRef } from 'react';import { AuthContext } from '../../context/AuthContext';

import API from '../../api/api';

/* ── helpers ── */
const fmt = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const fileIcon = (type = '') => {
  if (type.startsWith('video')) return <i className="bi bi-camera-reels" />;
  if (type.startsWith('image')) return <i className="bi bi-image" />;
  if (type.includes('pdf'))     return <i className="bi bi-file-earmark-pdf" />;
  if (type.includes('zip') || type.includes('rar')) return <i className="bi bi-folder2-open" />;
  return <i className="bi bi-file-earmark" />;
};

const isImage = (url = '') => /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
const isVideo = (url = '') => /\.(mp4|mov|webm|avi)(\?|$)/i.test(url);

export default function UploadDeliverable() {
  const { user } = useContext(AuthContext);
  const isEditor = user?.role === 'EDITOR';
  const isClient = user?.role === 'CLIENT';

  /* requests in progress */
  const [requests, setRequests]   = useState([]);
  const [selectedId, setSelectedId] = useState('');

  /* upload state */
  const [files, setFiles]         = useState([]);        // queued files
  const [uploads, setUploads]     = useState([]);        // { name, progress, status, url, error }
  const [uploading, setUploading] = useState(false);
  const [note, setNote]           = useState('');
  const [dragOver, setDragOver]   = useState(false);

  /* deliverables already uploaded */
  const [deliverables, setDeliverables] = useState([]);
  const [loadingDels, setLoadingDels]   = useState(false);
  const fileRef = useRef();

  /* Load active requests (IN_PROGRESS or DELIVERED) */
  useEffect(() => {
    if (!user?._id) return;
    const endpoint = isEditor
      ? `/requests/editor/${user._id}`
      : `/requests/client/${user._id}`;
    API.get(endpoint).then(res => {
      const active = (res.data || []).filter(r =>
        ['IN_PROGRESS', 'DELIVERED'].includes(r.status)
      );
      setRequests(active);
      if (active.length === 1) setSelectedId(active[0]._id);
    });
  }, [user, isEditor]);

  /* Load existing deliverables when a request is selected */
  useEffect(() => {
    if (!selectedId) { setDeliverables([]); return; }
    setLoadingDels(true);
    API.get(`/requests/${selectedId}/deliverables`)
      .then(res => setDeliverables(res.data || []))
      .catch(() => setDeliverables([]))
      .finally(() => setLoadingDels(false));
  }, [selectedId]);

  /* File picker / drag-drop */
  const addFiles = (incoming) => {
    const arr = Array.from(incoming);
    setFiles(prev => [...prev, ...arr]);
  };
  const removeQueued = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  /* Upload all queued files */
  const handleUpload = async () => {
    if (!selectedId) return alert('Please select a request first.');
    if (files.length === 0) return alert('Please select at least one file.');

    setUploading(true);
    const results = files.map(f => ({ name: f.name, progress: 0, status: 'waiting', url: null, error: null }));
    setUploads([...results]);

    /* Get Cloudinary signature once */
    let sig;
    try {
      const sigRes = await API.get('/upload/sign');
      sig = sigRes.data;
    } catch {
      alert('Could not connect to upload service. Check your Cloudinary config.');
      setUploading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploads(prev => prev.map((u, idx) => idx === i ? { ...u, status: 'uploading' } : u));

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', sig.timestamp);
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      // NOTE: do NOT append extra fields (like context) that aren't included in the signature
      // or Cloudinary will reject with 401. The note is saved to our own backend instead.

      const resourceType = file.type.startsWith('video') ? 'video' : 'auto';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`;

      try {
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setUploads(prev => prev.map((u, idx) => idx === i ? { ...u, progress: pct } : u));
            }
          };
          xhr.onload = async () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              /* Save URL + note to our backend */
              await API.post(`/requests/${selectedId}/deliverables`, {
                url:          data.secure_url,
                publicId:     data.public_id,
                originalName: file.name,
                fileType:     file.type,
                uploadedBy:   user._id,
                note:         note.trim() || undefined
              });
              setUploads(prev => prev.map((u, idx) =>
                idx === i ? { ...u, status: 'done', progress: 100, url: data.secure_url } : u
              ));
              setDeliverables(prev => [...prev, {
                url: data.secure_url, originalName: file.name, fileType: file.type, uploadedAt: new Date()
              }]);
              resolve();
            } else {
              // Parse and show the real Cloudinary error
              let errMsg = `Upload failed (${xhr.status})`;
              try {
                const errData = JSON.parse(xhr.responseText);
                errMsg = errData?.error?.message || errMsg;
              } catch {}
              console.error('Cloudinary error:', xhr.responseText);
              reject(new Error(errMsg));
            }
          };
          xhr.onerror = () => reject(new Error('Network error — check CORS or internet connection'));
          xhr.send(fd);
        });
      } catch (err) {
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, status: 'error', error: err.message } : u
        ));
      }
    }

    setFiles([]);
    setNote('');
    setUploading(false);
  };

  const selectedReq = requests.find(r => r._id === selectedId);

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: 820 }}>
      <h3 className="mb-1 fw-bold">
        {isEditor ? <><i className="bi bi-upload"></i> Upload Deliverables</> : <><i className="bi bi-download"></i> My Deliverables</>}
      </h3>
      <p className="text-muted mb-4">
        {isEditor
          ? 'Upload completed work files directly to the cloud. Large files are supported.'
          : 'View and download files uploaded by your editor.'}
      </p>

      {/* Request selector */}
      <div className="mb-4">
        <label className="form-label fw-semibold">Select Request</label>
        {requests.length === 0 ? (
          <div className="alert alert-info">
            No active requests found. Only requests with status <strong>In Progress</strong> or <strong>Delivered</strong> appear here.
          </div>
        ) : (
          <select
            className="form-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">— choose a request —</option>
            {requests.map(r => (
              <option key={r._id} value={r._id}>
                {r.title}
                {isClient && r.editorId?.name ? ` — Editor: ${r.editorId.name}` : ''}
                {' '}({r.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected request info chip */}
      {selectedReq && (
        <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 border bg-light">
          <div>
            <p className="mb-0 fw-semibold">{selectedReq.title}</p>
            <small className="text-muted">
              Budget: ₹{selectedReq.negotiatedBudget || selectedReq.proposedBudget}
              {selectedReq.deadline ? ` · Deadline: ${selectedReq.deadline}` : ''}
            </small>
          </div>
          <span className={`ms-auto badge ${selectedReq.status === 'DELIVERED' ? 'bg-info text-dark' : 'bg-primary'}`}>
            {selectedReq.status.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* ── EDITOR: Upload area ── */}
      {isEditor && selectedId && (
        <div className="card shadow-sm mb-4" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h5 className="mb-3">Upload Files</h5>

            {/* Drag & Drop zone */}
            <div
              className={`border rounded-3 p-4 text-center mb-3 ${dragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-dashed'}`}
              style={{ cursor: 'pointer', borderStyle: 'dashed', transition: 'all .2s' }}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            >
              <div style={{ fontSize: 40 }}><i className="bi bi-cloud-arrow-up"></i></div>
              <p className="mb-1 fw-semibold">Drop files here or click to browse</p>
              <small className="text-muted">Videos, images, ZIPs, PDFs — any size</small>
              <input
                ref={fileRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {/* Queued files */}
            {files.length > 0 && (
              <div className="mb-3">
                <p className="fw-semibold mb-2">Queued ({files.length})</p>
                {files.map((f, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded-2 bg-light">
                    <span style={{ fontSize: 22 }}>{fileIcon(f.type)}</span>
                    <div className="flex-grow-1">
                      <p className="mb-0 small fw-semibold">{f.name}</p>
                      <small className="text-muted">{fmt(f.size)}</small>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeQueued(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Optional note */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Note to client <span className="text-muted fw-normal">(optional)</span></label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Final edited video with color grading applied"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={uploading}
              />
            </div>

            {/* Upload progress */}
            {uploads.length > 0 && (
              <div className="mb-3">
                {uploads.map((u, i) => (
                  <div key={i} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-semibold">{u.name}</small>
                      <small className={u.status === 'done' ? 'text-success' : u.status === 'error' ? 'text-danger' : 'text-muted'}>
                        {u.status === 'done' ? '✅ Done' : u.status === 'error' ? `❌ ${u.error}` : u.status === 'waiting' ? 'Waiting…' : `${u.progress}%`}
                      </small>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className={`progress-bar ${u.status === 'error' ? 'bg-danger' : u.status === 'done' ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${u.progress}%`, transition: 'width .3s' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn btn-primary px-4"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Uploading…</>
              ) : (
                <><i className="bi bi-cloud-upload"></i> Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Deliverables list (both roles) ── */}
      {selectedId && (
        <div className="card shadow-sm" style={{ borderRadius: 14 }}>
          <div className="card-body p-4">
            <h5 className="mb-3">
              {isEditor ? <><i className="bi bi-file-arrow-up"></i> Uploaded Deliverables</> : <><i className="bi bi-file-arrow-down"></i> Files from Editor</>}
            </h5>

            {loadingDels ? (
              <div className="text-center py-3"><div className="spinner-border text-primary" /></div>
            ) : deliverables.length === 0 ? (
              <div className="alert alert-light border text-muted mb-0">
                {isEditor ? 'No files uploaded yet for this request.' : 'No deliverables received yet. Check back once the editor uploads.'}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {deliverables.map((d, i) => (
                  <div key={i} className="border rounded-3 overflow-hidden bg-light">
                    {/* Preview */}
                    {isImage(d.url) && (
                      <img src={d.url} alt={d.originalName} style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                    )}
                    {isVideo(d.url) && (
                      <video controls style={{ width: '100%', maxHeight: 260, background: '#000' }}>
                        <source src={d.url} />
                      </video>
                    )}
                    <div className="p-3 d-flex align-items-center gap-3">
                      <span style={{ fontSize: 26 }}>{fileIcon(d.fileType)}</span>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-semibold small">{d.originalName || 'File'}</p>
                        <small className="text-muted">
                          {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : ''}
                          {d.uploadedBy?.name ? ` · by ${d.uploadedBy.name}` : ''}
                        </small>
                      </div>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="btn btn-sm btn-outline-primary"
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}