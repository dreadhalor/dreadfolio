import React from 'react';
import ReactDOM from 'react-dom/client';
// import { App } from './app';
import 'dread-ui/style.scss';
import './index.scss';
// import { IntroProvider } from './providers/intro-provider.tsx';
import { HomepageProvider } from './providers/homepage-provider.tsx';
import { Page } from './components/page/page';
import { DreadUiProvider } from 'dread-ui';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      {/* <IntroProvider> */}
      <HomepageProvider>
        {/* <App /> */}
        <Page />
      </HomepageProvider>
      {/* </IntroProvider> */}
    </DreadUiProvider>
  </React.StrictMode>,
);
