import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { HashRouter as Router } from 'react-router-dom';
import { DreadUiProvider } from 'dread-ui';
import 'dread-ui/style.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <Router basename='/'>
        <App />
      </Router>
    </DreadUiProvider>
  </React.StrictMode>,
);
