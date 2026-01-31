import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import 'dread-ui/style.css';
import './index.css';
import { AppSwitcherProvider } from './providers/app-switcher-context';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { IframeProvider, TooltipProvider } from 'dread-ui';

const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <IframeProvider>
        <TooltipProvider>
          <AppSwitcherProvider>
            <App />
          </AppSwitcherProvider>
        </TooltipProvider>
      </IframeProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
