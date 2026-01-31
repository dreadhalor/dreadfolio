import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.css';
import 'dread-ui/style.css';
import { BoardProvider } from './providers/board-context';
import { DreadUiProvider } from 'dread-ui';
import { Toaster } from './components/simple-toaster';

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
