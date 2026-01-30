import React from 'react';
import ReactDOM from 'react-dom/client';
import 'dread-ui/style.css';
import './index.css';
import { HomepageProvider } from './providers/homepage-provider.tsx';
import { Page } from './components/page/page';
import { DreadUiProvider } from 'dread-ui';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <HomepageProvider>
        <Page />
      </HomepageProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
