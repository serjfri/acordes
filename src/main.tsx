import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usa import.meta.env.BASE_URL para obtener la ruta base configurada en vite.config.ts
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`) // <-- CAMBIADO AQUÍ
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}