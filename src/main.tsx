import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically check and apply PWA service worker updates immediately on mobile & desktop
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.update();
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
