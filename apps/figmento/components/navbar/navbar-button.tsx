import { Button } from '../ui/button';
import { NavElement, shapeElements } from '@figmento/constants';
import { cn } from '@repo/utils';
import { forwardRef } from 'react';
import { useNavbar } from '@figmento/providers/navbar-provider';
import { ShapesMenuElement } from '../../constants/index';

type Props = {
  item: NavElement;
  className?: string;
  children?: React.ReactNode;
};
export const NavbarButton = forwardRef<HTMLLIElement, Props>(
  ({ item: { id, icon: Icon }, className, children, ...props }: Props, ref) => {
    const { activeElement, handleActiveElement } = useNavbar();
    const isActive =
      activeElement === id ||
      (id === ShapesMenuElement.id &&
        shapeElements.some((elem) => elem.id === activeElement));
    return (
      <li className='list-none' {...props} ref={ref}>
        <Button
          className={cn(
            'group h-12 rounded-none p-0',
            isActive ? 'bg-primary-green active' : 'hover:bg-primary-grey-200',
            className,
          )}
          onClick={() => handleActiveElement(id)}
        >
          <span
            className={cn(
              'flex h-full w-full items-center justify-start gap-2 px-2.5 group-[.active]:invert',
            )}
          >
            {<Icon className='h-5 w-5' />}
            {children}
          </span>
        </Button>
      </li>
    );
  },
);
