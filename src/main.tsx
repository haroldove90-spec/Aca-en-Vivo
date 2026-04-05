import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedDatabase } from './lib/seed.ts';
import { registerSW } from 'virtual:pwa-register';

// Seed database for the prototype
seedDatabase();

// Register PWA service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
