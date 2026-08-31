import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { App } from './app.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position='bottom-center'
      theme='dark'
      toastOptions={{
        style: {
          background: '#191922',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
        },
      }}
    />
  </StrictMode>,
);
