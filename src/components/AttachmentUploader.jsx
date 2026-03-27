import React, { useState, useRef } from 'react';
import API from '../api/api';

export default function AttachmentUploader({ existingUrls = [], onChange }) {
  const [items,     setItems]     = useState(
    existingUrls.map(url => ({ url, name: url.split('/').pop(), done: true }))
  );
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const notify = (updated) => {
    onChange(updated.filter(i => i.done).map(i => i.url));
  };

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setUploading(true);

    let sig;
    try {
      const res = await API.get('/upload/sign?folder=attachments');
      sig = res.data;
    } catch {
      alert('Could not connect to upload service. Check your Cloudinary config.');
      setUploading(false);
      return;
    }

    const startIndex = items.length;
    const newItems = files.map(f => ({ url: '', name: f.name, done: false, progress: 0 }));
    setItems(prev => {
      const updated = [...prev, ...newItems];
      notify(updated);
      return updated;
    });

    await Promise.all(files.map(async (file, i) => {
      const fd = new FormData();
      fd.append('file',      file);
      fd.append('api_key',   sig.apiKey);
      fd.append('timestamp', sig.timestamp);
      fd.append('signature', sig.signature);
      fd.append('folder',    sig.folder);

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded / e.total) * 100);
          setItems(prev => {
            const copy = [...prev];
            copy[startIndex + i] = { ...copy[startIndex + i], progress: pct };
            return copy;
          });
        };

        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText);
          setItems(prev => {
            const copy = [...prev];
            if (data.secure_url) {
              copy[startIndex + i] = { url: data.secure_url, name: file.name, done: true, progress: 100 };
            } else {
              copy[startIndex + i] = { ...copy[startIndex + i], error: true };
            }
            notify(copy);
            return copy;
          });
          resolve();
        };

        xhr.onerror = () => {
          setItems(prev => {
            const copy = [...prev];
            copy[startIndex + i] = { ...copy[startIndex + i], error: true };
            return copy;
          });
          resolve();
        };

        xhr.send(fd);
      });
    }));

    setUploading(false);
  };

  const remove = (idx) => {
    setItems(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      notify(updated);
      return updated;
    });
  };

  return (
    <div>
      <div
        className="border rounded p-3 text-center mb-2"
        style={{ cursor: 'pointer', background: '#f8f9fa', borderStyle: 'dashed' }}
        onClick={() => inputRef.current.click()}
      >
        {uploading
          ? <span className="text-muted">⏫ Uploading…</span>
          : <span className="text-muted">📎 Click to attach files <small>(images, videos, docs)</small></span>}
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={e => uploadFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="list-group list-group-flush">
          {items.map((item, i) => (
            <li key={i} className="list-group-item px-0 py-1 d-flex align-items-center gap-2">
              {item.done
                ? <span className="text-success">✅</span>
                : item.error
                ? <span className="text-danger">❌</span>
                : <span className="spinner-border spinner-border-sm text-primary" />}
              <span className="flex-grow-1 small text-truncate">{item.name}</span>
              {!item.done && !item.error && (
                <span className="small text-muted">{item.progress}%</span>
              )}
              {item.done && (
                <a href={item.url} target="_blank" rel="noreferrer" className="small text-primary me-1">View</a>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-danger py-0 px-1"
                style={{ fontSize: 11 }}
                onClick={() => remove(i)}
              >✕</button>
            </li>
          ))}
        </ul>
      )}
      <small className="text-muted">Files upload directly to cloud storage. Max 25MB per file.</small>
    </div>
  );
}
