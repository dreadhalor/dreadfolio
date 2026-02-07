import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.tsx';
import { DreadUiProvider, TooltipProvider } from 'dread-ui';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
