import { useDrag } from '@use-gesture/react';
import { useEffect, useRef } from 'react';
import Header from './Header';
import './Window.scss';

const Window = ({
  children,
  app,
  focusedApp,
  requestFocus,
  background_ref,
  closeApp,
  setApps,
  minimizeApp,
}) => {
  const window_ref = useRef(null);
  useEffect(() => {
    app.ref = window_ref;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bind = useDrag(
    (e) => {
      if (focusedApp !== app.id) requestFocus(app.id);
      setApps((prev_apps) => {
        //why are we dividing this by 2? Fuck if I know
        //TURNS OUT IT DOESN'T HAPPEN IN PROD
        //SO FUCK IT WE AREN'T GONNA DIVIDE SHIT
        app.coords = [app.coords[0] + e.delta[0], app.coords[1] + e.delta[1]];
        const new_apps = [...prev_apps];
        return new_apps;
      });
    },
    {
      bounds: background_ref,
      pointer: {
        capture: false,
      },
    }
  );

  const focused = focusedApp === app.id;

  const getAppCoords = () => {
    const [left, top] = app.coords;
    return { left, top };
  };

  return (
    <div
      className='absolute flex-col'
      ref={window_ref}
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
      <Header
        bind={bind}
        icon={app.icon}
        title={app.title}
        focused={focused}
        closeApp={() => closeApp(app.id)}
        minimizeApp={() => minimizeApp(app.id)}
      />
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
