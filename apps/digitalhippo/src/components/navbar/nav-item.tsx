import { useState } from 'react';
import { Button } from '../ui/button';
import { Category } from '@digitalhippo/config';
import { ChevronDown } from 'lucide-react';
import { cn } from '@digitalhippo/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  category: Category;
  activeItem: string | null;
  setActiveItem: (id: string | null) => void;
};
export const NavItem = ({
  category: { id, label, featured },
  activeItem,
  setActiveItem,
}: Props) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const isOpen = activeItem === id;

  const handleOpen = () => {
    if (activeItem === id) {
      setShouldAnimate(false);
      setActiveItem(null);
    } else {
      setShouldAnimate(activeItem === null);
      setActiveItem(id);
    }
  };

  return (
    <div className='flex'>
      <div className='relative flex items-center'>
        <Button
          className='gap-1.5'
          onClick={handleOpen}
          variant={isOpen ? 'secondary' : 'ghost'}
        >
          {label}
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 transition-all',
              isOpen && '-rotate-180',
            )}
          />
        </Button>
      </div>
      {isOpen ? (
        <div
          className={cn(
            'text-muted-foreground absolute inset-x-0 top-full text-sm',
            shouldAnimate && 'animate-in fade-in-10 slide-in-from-top-5',
          )}
        >
          <div
            className='absolute inset-0 top-1/2 bg-white shadow'
            aria-hidden='true'
          />
          <div className='relative bg-white'>
            <div className='mx-auto max-w-7xl px-8'>
              <div className='grid grid-cols-4 gap-x-8 gap-y-10 py-16'>
                <div className='col-span-4 col-start-1 grid grid-cols-3 gap-x-8'>
                  {featured.map(({ name, imageSrc, href }) => (
                    <div
                      key={name}
                      className='group relative text-base sm:text-sm'
                    >
                      <div className='relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75'>
                        <Image
                          src={imageSrc}
                          alt={name}
                          fill
                          className='object-cover object-center'
                        />
                      </div>
                      <Link
                        href={href}
                        className='mt-6 block font-medium text-gray-900'
                      >
                        {name}
                      </Link>
                      <p className='mt-1' aria-hidden='true'>
                        Shop now
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
