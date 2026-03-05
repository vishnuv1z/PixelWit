import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // optional

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if using TS
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
