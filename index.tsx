import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useNavigate } from 'react-router-dom';
import App from './App';

function HashRootRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  return null;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <HashRootRedirect />
      <App />
    </HashRouter>
  </React.StrictMode>
);