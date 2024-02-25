import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.tsx';
import 'dread-ui/style.scss';
import './index.scss';
import { HomePageProvider } from './providers/home-page-provider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePageProvider>
      <App />
    </HomePageProvider>
  </React.StrictMode>,
);
