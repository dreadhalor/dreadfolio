// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { App } from './app';
import './index.css';
import P5 from 'p5';
import { CubesSketch } from './sketches/cubes';

const root = document.getElementById('root')!;

// ReactDOM.createRoot(root).render(
//   <React.StrictMode>{/* <App /> */}</React.StrictMode>,
// );

new P5(CubesSketch, root);
