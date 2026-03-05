import React from 'react';

export default function FileUploader({ onFiles, accept = 'image/*,video/*' }) {
  return (
    <div className="mb-3">
      <label className="form-label">Attach files</label>
      <input className="form-control" type="file" accept={accept} multiple onChange={e => onFiles && onFiles(Array.from(e.target.files))} />
      <div className="form-text">Images and short videos only. Max 25MB per file (demo not enforced).</div>
    </div>
  );
}
