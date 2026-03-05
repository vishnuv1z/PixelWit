import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import FileUploader from '../../components/FileUploader';

export default function CreateRequest(){
  const { user } = useContext(AuthContext);
  const loc = useLocation();
  const nav = useNavigate();
  const preEditor = loc.state?.editor;
  const [form, setForm] = useState({
    title: '', description: '', proposedBudget: '', editorId: preEditor?.id || ''
  });
  const [files, setFiles] = useState([]);

  async function submit(e){
    e.preventDefault();
    if (!user) return alert('Login required');
    const payload = {
      ...form,
      clientId: user.id,
      attachments: files.map(f => f.name)
    };
    try {
      await api.createRequest(payload);
      alert('Request sent to editor');
      nav('/client/requests');
    } catch (err) {
      alert(err.message || 'Error');
    }
  }

  return (
    <div className="container-fluid px-4" style={{maxWidth:720}}>
      <h3>Create Request</h3>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Editor (select)</label>
          <input className="form-control" value={preEditor?.name || ''} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input required className="form-control" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea required className="form-control" rows={4} value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Budget (₹)</label>
          <input required type="number" className="form-control" value={form.proposedBudget} onChange={e=>setForm({...form, proposedBudget: e.target.value})} />
        </div>
        <FileUploader onFiles={setFiles} />
        <button className="btn btn-primary">Send Request</button>
      </form>
    </div>
  );
}
