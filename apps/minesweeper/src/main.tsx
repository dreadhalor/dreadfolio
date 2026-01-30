import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { DreadUiProvider } from 'dread-ui';
import { AppProvider } from '@ms/providers/app-provider';
import 'dread-ui/style.scss';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
