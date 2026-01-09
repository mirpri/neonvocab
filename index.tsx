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

// Disable context menu
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Disable inspection shortcuts
// Disable inspection shortcuts and handle F11
document.addEventListener('keydown', (event) => {
  // Handle F11 for Fullscreen
  if (event.key === 'F11') {
    event.preventDefault();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error("Failed to enter fullscreen", e);
      });
    } else {
      document.exitFullscreen().catch((e) => {
        console.error("Failed to exit fullscreen", e);
      });
    }
    return;
  }

  // Disable DevTools shortcuts
  if (
    event.key === 'F12' ||
    (event.ctrlKey && event.shiftKey && event.key === 'I') ||
    (event.ctrlKey && event.shiftKey && event.key === 'J') ||
    (event.ctrlKey && event.shiftKey && event.key === 'C') ||
    (event.ctrlKey && event.key === 'U')
  ) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <HashRootRedirect />
      <App />
    </HashRouter>
  </React.StrictMode>
);