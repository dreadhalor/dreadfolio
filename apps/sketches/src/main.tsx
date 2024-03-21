import './index.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import 'dread-ui/built-style.css';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
