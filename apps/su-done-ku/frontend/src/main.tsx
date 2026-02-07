import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { BoardProvider } from './providers/board-context';
import { DreadUiProvider } from 'dread-ui';
import { Toaster } from './components/simple-toaster';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <BoardProvider>
        <App />
        <Toaster />
      </BoardProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
