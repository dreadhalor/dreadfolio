import { cn } from '@repo/utils';
import { appIconSizeSmall, apps, perspective } from '../constants';
import { AppIcon } from './app-icon';
import { useAppSwitcher } from '../providers/app-switcher-context';

type NavbarProps = {
  parentRef?: React.RefObject<HTMLDivElement>;
};
const Navbar = ({ parentRef }: NavbarProps) => {
  const { isOpen, setIsOpen } = useAppSwitcher();

  return (
    <div
      className={cn(
        'absolute bottom-0 flex w-full overflow-visible bg-transparent',
        isOpen ? 'pointer-events-none' : 'pointer-events-auto',
      )}
      style={{
        perspective,
        height: appIconSizeSmall,
      }}
      onClick={(e) => {
        setIsOpen(true);
        e.stopPropagation();
      }}
    >
      <AppIcon index={-1} parentRef={parentRef} isSelectionBox />
      {apps.map((_, index) => (
        <AppIcon key={index} index={index} parentRef={parentRef} />
      ))}
    </div>
  );
};

export { Navbar };
