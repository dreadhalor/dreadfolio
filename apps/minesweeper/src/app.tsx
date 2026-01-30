import React from 'react';
import './app.scss';
import Icon from './components/icon';
import Window from './components/window/window';
import Minesweeper from './components/minesweeper/minesweeper';
import Taskbar from './components/taskbar/taskbar';
import { Card, CardContent, UserMenu } from 'dread-ui';
import { MinesweeperProvider } from './providers/minesweeper-provider';
import { useApp } from './providers/app-provider';
import minesweeper_icon from '@ms/assets/minesweeper/minesweeper-icon.png';

const App: React.FC = () => {
  const { apps, selectionCoords, selectionSize, openApp, bind, backgroundRef } =
    useApp();

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        {...bind()}
        ref={backgroundRef}
        className='relative w-full flex-1 overflow-hidden'
        style={{
          backgroundImage: `url(https://i.imgur.com/Zk6TR5k.jpg)`,
          backgroundSize: 'cover',
          touchAction: 'none',
        }}
      >
        <Icon
          src={minesweeper_icon}
          name={'Minesweeper'}
          coords={[40, 40]}
          selection={[selectionCoords, selectionSize]}
          onDoubleClick={openApp}
        />
        <div
          className='absolute h-10 w-10 border-2 border-blue-400 bg-blue-200 opacity-50'
          style={{
            display: selectionSize ? 'block' : 'none',
            left: selectionCoords ? `${selectionCoords[0]}px` : 0,
            top: selectionCoords ? `${selectionCoords[1]}px` : 0,
            width: selectionSize ? `${selectionSize[0]}px` : 0,
            height: selectionSize ? `${selectionSize[1]}px` : 0,
          }}
        ></div>
        {apps.map((app) => (
          <Window key={app.id} app={app} backgroundRef={backgroundRef}>
            <MinesweeperProvider app={app}>
              <Minesweeper />
            </MinesweeperProvider>
          </Window>
        ))}
        <Card className='absolute right-[40px] top-[40px] rounded-full'>
          <CardContent noHeader className='p-0'>
            <UserMenu />
          </CardContent>
        </Card>
      </div>
      <Taskbar />
    </div>
  );
};

export default App;
