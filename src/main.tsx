import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Empêcher le zoom gestuel (pinch-to-zoom) accidentel sur iOS Safari / PWA standalone
['gesturestart', 'gesturechange', 'gestureend'].forEach((evt) => {
  document.addEventListener(evt, (e) => e.preventDefault(), { passive: false });
});

createRoot(document.getElementById('root')!).render(<App />);
