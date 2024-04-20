import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dredge } from './dredge';
import './index.css';
import { DredgeProvider } from './providers/dredge-provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DredgeProvider>
      <Dredge />
    </DredgeProvider>
  </React.StrictMode>,
);
