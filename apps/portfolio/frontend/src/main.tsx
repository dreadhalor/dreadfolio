import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import 'dread-ui/built-style.css';
import './index.scss';
import { AppSwitcherProvider } from './providers/app-switcher-context';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { IframeProvider, TooltipProvider } from 'dread-ui';
import { IntroProvider } from './providers/intro-provider';
// import { Intro } from './components/intro/intro';

const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <IntroProvider>
        {/* <Intro /> */}
        <IframeProvider>
          <TooltipProvider>
            <AppSwitcherProvider>
              <App />
            </AppSwitcherProvider>
          </TooltipProvider>
        </IframeProvider>
      </IntroProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
