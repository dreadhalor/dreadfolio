import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.tsx';
import './assets/typekit.css';
import { DreadUiProvider, TooltipProvider } from 'dread-ui';
import './index.scss';
import 'dread-ui/style.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
