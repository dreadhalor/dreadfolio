import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.scss';
import 'dread-ui/style.scss';
import { BoardProvider } from './providers/board-context';
import { TooltipProvider } from 'dread-ui';

// Note: Using only TooltipProvider instead of full DreadUiProvider
// to avoid Firebase initialization (AuthProvider) which caused 20s load time
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <BoardProvider>
        <App />
      </BoardProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
