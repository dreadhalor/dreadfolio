import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { useDrag } from '@use-gesture/react';
import { v4 as uuidv4 } from 'uuid';
import { useAchievements } from 'dread-ui';
import minesweeper_icon from '@ms/assets/minesweeper/minesweeper-icon.png';

export interface AppType {
  id: string;
  coords: [number, number];
  icon: string;
  title: string;
  order: number;
  minimized: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

// Define the shape of the context
interface AppContextProps {
  apps: AppType[];
  setApps: React.Dispatch<React.SetStateAction<AppType[]>>;
  focusedApp: string | null;
  selectionCoords: [number, number] | null;
  selectionSize: [number, number] | null;
  openApp: () => void;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  taskbarWindowClicked: (id: string) => void;
  requestFocus: (id: string | null) => void;
  bind: ReturnType<typeof useDrag>['bind'];
  backgroundRef: React.RefObject<HTMLDivElement>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Custom hook for consuming the AppContext
export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { unlockAchievementById } = useAchievements();
  const backgroundRef = useRef<HTMLDivElement>(null);

  const [selectionCoords, setSelectionCoords] = useState<
    [number, number] | null
  >(null);
  const [selectionSize, setSelectionSize] = useState<[number, number] | null>(
    null,
  );
  const [focusedApp, setFocusedApp] = useState<string | null>(null);
  const [apps, setApps] = useState<AppType[]>([
    {
      id: uuidv4(),
      coords: [100, 100],
      icon: minesweeper_icon,
      title: 'Minesweeper',
      order: 1,
      minimized: false,
      ref: React.createRef<HTMLDivElement>(),
    },
  ]);

  // Function to get the highest order open app ID
  const getHighestOrderOpenId = (candidate_apps?: AppType[]): string | null => {
    const appsToConsider = candidate_apps || apps;
    const openApps = appsToConsider.filter((app) => !app.minimized);
    if (openApps.length === 0) return null;
    const maxOrder = Math.max(...openApps.map((app) => app.order));
    return openApps.find((app) => app.order === maxOrder)?.id ?? null;
  };

  // Function to request focus on a specific app
  const requestFocus = (id: string | null): void => {
    setFocusedApp(id);
    setApps((prev_apps) => {
      // without mutating, sort the apps by order
      const new_apps = [...prev_apps];
      new_apps.sort((a, b) => a.order - b.order);
      // place the focused app at the end
      if (id) {
        const focused_app = new_apps.find((app) => app.id === id);
        if (focused_app) {
          new_apps.splice(new_apps.indexOf(focused_app), 1);
          new_apps.push(focused_app);
        }
      }
      // assign new orders
      new_apps.forEach((app, index) => {
        app.order = index + 1;
      });
      // don't mutate the original array, just... because
      return [...prev_apps];
    });
  };

  // Function to open a new app
  const openApp = (): void => {
    const newApps = [...apps];
    const id = uuidv4();
    newApps.push({
      id,
      coords: [10, 10],
      icon: minesweeper_icon,
      title: 'Minesweeper',
      order: newApps.reduce((acc, app) => Math.max(acc, app.order), 0) + 1,
      minimized: false,
    });
    unlockAchievementById('open_window', 'minesweeper');
    if (newApps.length >= 2)
      unlockAchievementById('two_windows', 'minesweeper');
    if (newApps.length >= 5)
      unlockAchievementById('five_windows', 'minesweeper');
    setApps(newApps);
    setFocusedApp(id);
  };

  // Function to close an app
  const closeApp = (id: string): void => {
    let next_id: string | null = null;
    setApps((prev_apps) => {
      const current_apps_length = prev_apps.length;
      const remaining_apps = prev_apps.filter((app) => app.id !== id);
      if (current_apps_length > remaining_apps.length)
        unlockAchievementById('close_window', 'minesweeper');
      next_id = getHighestOrderOpenId(remaining_apps);
      return remaining_apps;
    });
    requestFocus(next_id);
  };

  // Function to minimize an app
  const minimizeApp = (id: string): void => {
    const app = apps.find((app) => app.id === id);
    if (app && !app.minimized)
      unlockAchievementById('minimize_window', 'minesweeper');
    if (app) {
      app.minimized = true;
      setApps([...apps]);
      requestFocus(getHighestOrderOpenId());
    }
  };

  // Function to handle taskbar window click
  const taskbarWindowClicked = (id: string): void => {
    const app = apps.find((app) => app.id === id);
    if (app) {
      if (app.minimized) app.minimized = false;
      else if (focusedApp === id) {
        app.minimized = true;
        unlockAchievementById('minimize_window', 'minesweeper');
      }
      setApps([...apps]);
      if (!app.minimized) requestFocus(id);
      else requestFocus(getHighestOrderOpenId());
    }
  };

  // Drag handler using useDrag
  const bind = useDrag(
    (e) => {
      if (e.active && e.target === backgroundRef.current) {
        setFocusedApp(null);
        // Get the top-left corner
        const top_left: [number, number] = [
          Math.min(e.initial[0], e.xy[0]),
          Math.min(e.initial[1], e.xy[1]),
        ];
        // Get the bottom-right corner
        const bottom_right: [number, number] = [
          Math.max(e.initial[0], e.xy[0]),
          Math.max(e.initial[1], e.xy[1]),
        ];
        // Calculate width and height
        const width = bottom_right[0] - top_left[0];
        const height = bottom_right[1] - top_left[1];
        // Set selection size and coordinates
        setSelectionSize([width, height]);
        setSelectionCoords([top_left[0], top_left[1]]);
      } else {
        setSelectionSize(null);
        setSelectionCoords(null);
      }
    },
    { bounds: backgroundRef, pointer: { capture: false } },
  );

  // Initial centering of the first app
  useEffect(() => {
    setApps((prev_apps) => {
      const new_apps = [...prev_apps];
      const app = new_apps[0];
      if (!app) return new_apps;
      if (backgroundRef.current && app.ref?.current) {
        app.coords = [
          Math.max(
            (backgroundRef.current.offsetWidth - app.ref.current.offsetWidth) /
              2,
            0,
          ),
          Math.max(
            (backgroundRef.current.offsetHeight -
              app.ref.current.offsetHeight) /
              2,
            0,
          ),
        ];
      }
      return new_apps;
    });
    requestFocus(getHighestOrderOpenId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Context value to be provided
  const contextValue: AppContextProps = {
    apps,
    setApps,
    focusedApp,
    selectionCoords,
    selectionSize,
    openApp,
    closeApp,
    minimizeApp,
    taskbarWindowClicked,
    requestFocus,
    bind,
    backgroundRef,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
