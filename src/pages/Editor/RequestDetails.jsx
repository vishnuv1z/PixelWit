import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function RequestDetails(){

  const { id } = useParams();
  const [request,setRequest]=useState(null);

  useEffect(()=>{
    api.getRequest(id).then(setRequest);
  },[id]);

  if(!request)
    return <div className="container p-4">Loading...</div>;

  return(
    <div className="container-fluid px-4">

      <div className="card shadow">
        <div className="card-body">

          <h3>{request.service}</h3>

          <p><strong>Client:</strong> {request.clientName}</p>
          <p><strong>Budget:</strong> ₹{request.budget}</p>

          <hr/>

          <h5>Description</h5>
          <p>{request.description}</p>

          <h5>Status</h5>
          <span className="badge bg-info">
            {request.status}
          </span>

        </div>
      </div>

    </div>
  );
}