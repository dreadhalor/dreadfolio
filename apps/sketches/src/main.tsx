import p5 from 'p5';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import './index.css';

// p5 2's module build checks every call's arguments against its reference (the Friendly Error
// System): a schema parse per fill(), rect(), vertex()… that every sketch paid every frame. It
// only ever explains a mistake, and these sketches are finished.
p5.disableFriendlyErrors = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
