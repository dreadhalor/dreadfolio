import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.scss';
import 'dread-ui/style.scss';
import { BoardProvider } from './providers/board-context';
import { DreadUiProvider } from 'dread-ui';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <BoardProvider>
        <App />
      </BoardProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
