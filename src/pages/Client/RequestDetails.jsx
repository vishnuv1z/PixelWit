import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function RequestDetails(){
  const { id } = useParams();
  const [req, setReq] = useState(null);

  useEffect(()=> {
    api.getRequest(id).then(setReq).catch(()=>setReq(null));
  }, [id]);

  if (!req) return <div className="container-fluid px-4"><div className="alert alert-warning">Request not found</div></div>;

  return (
    <div className="container-fluid px-4" style={{maxWidth:800}}>
      <h3>{req.title}</h3>
      <p className="text-muted">Status: <strong>{req.status}</strong></p>
      <p>{req.description}</p>
      <p><strong>Budget:</strong> ₹{req.proposedBudget}</p>
      <div>
        <h5>Attachments</h5>
        {req.attachments && req.attachments.length ? req.attachments.map((a, i)=> <div key={i}><small>{a}</small></div>) : <small>No attachments</small>}
      </div>
    </div>
  );
}
