import React, { useEffect, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import Header from './header';
import './window.css';
import { AppType, useApp } from '@ms/providers/app-provider';

interface WindowProps {
  children: React.ReactNode;
  app: AppType;
  backgroundRef: React.RefObject<HTMLDivElement>;
}

const Window: React.FC<WindowProps> = ({ children, app, backgroundRef }) => {
  const { setApps, focusedApp, requestFocus } = useApp();

  const windowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    app.ref = windowRef;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bind = useDrag(
    (e) => {
      if (focusedApp !== app.id) requestFocus(app.id);
      setApps((prev_apps) => {
        app.coords = [app.coords[0] + e.delta[0], app.coords[1] + e.delta[1]];
        const new_apps = [...prev_apps];
        return new_apps;
      });
    },
    {
      bounds: backgroundRef,
      pointer: {
        capture: false,
      },
    },
  );

  const focused = focusedApp === app.id;

  const getAppCoords = () => {
    const [left, top] = app.coords;
    return { left, top };
  };

  return (
    <div
      className='window absolute flex-col'
      ref={windowRef}
      style={{
        ...getAppCoords(),
        zIndex: app.order,
        display: app.minimized ? 'none' : 'flex',
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        requestFocus(app.id);
      }}
    >
      <Header app={app} bind={bind} />
      <div
        className='border-x-[3px] border-b-[3px] bg-[#ece9d8]'
        style={{
          borderColor: focused ? '#0831d9' : '#6582f5',
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default Window;
