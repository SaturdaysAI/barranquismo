import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/base.css';

// Register the generated service worker to enable offline usage.
import { registerSW } from 'virtual:pwa-register';
registerSW();

// Create the root of the application and hydrate the router-based app.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
