import './index.scss';
// import P5 from 'p5';
// import { Cubes, Waves, Sand } from './sketches';
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

// new P5(Cubes, root);
// new P5(Waves, root);
// new P5(SandSketch, root).frameRate(20);
// new P5(Sand, root);
