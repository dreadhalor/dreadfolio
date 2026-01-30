import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { DreadUiProvider } from 'dread-ui';
import 'dread-ui/built-style.css';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <App />
    </DreadUiProvider>
  </React.StrictMode>,
);
