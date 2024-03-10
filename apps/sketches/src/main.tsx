import './index.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import 'dread-ui/style.scss';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
