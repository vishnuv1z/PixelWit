import React from 'react';
import { Link } from 'react-router-dom';

export default function EditorCard({ editor }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{editor.name}</h5>
        <p className="mt-auto">
          <Link to={`/client/editor/${editor.id}`} className="btn btn-primary btn-sm">View Profile</Link>
        </p>
      </div>
    </div>
  );
}