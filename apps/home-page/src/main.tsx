import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import 'dread-ui/style.scss';
import './index.scss';
import { IntroProvider } from './providers/intro-provider.tsx';
import { HomepageProvider } from './providers/homepage-provider.tsx';
import { Page } from './components/page/page';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntroProvider>
      <HomepageProvider>
        {/* <App /> */}
        <Page />
      </HomepageProvider>
    </IntroProvider>
  </React.StrictMode>,
);
