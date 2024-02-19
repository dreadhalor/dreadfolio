import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.tsx';
import './index.css';
import p5 from 'p5';
import { sketch } from './sketch.ts';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

new p5(sketch, root);
