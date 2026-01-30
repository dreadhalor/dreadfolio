import './taskbar.scss';
import TaskbarTime from './taskbar-time';
import TaskbarWindow from './taskbar-window';
import Start from '@ms/assets/start.png';
import { useAchievements } from 'dread-ui';
import { useApp } from '@ms/providers/app-provider';

const Taskbar = () => {
  const { apps } = useApp();
  const { unlockAchievementById } = useAchievements();
  return (
    <div className='taskbar taskbar-gradient z-10 flex h-[30px] flex-row'>
      <img
        src={Start}
        alt='start'
        className='mr-[10px] h-full'
        onClick={() => unlockAchievementById('click_start', 'minesweeper')}
      />
      {apps.map((app) => (
        <TaskbarWindow app={app} key={app.id} />
      ))}
      <TaskbarTime />
    </div>
  );
};

export default Taskbar;
