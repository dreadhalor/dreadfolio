import { cn } from '@digitalhippo/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const SidebarItem = ({
  children,
  href,
  pathname,
}: {
  children: React.ReactNode;
  href: string;
  pathname: string;
}) => {
  return (
    <Link
      className={cn(
        'hover:bg-primary/60 relative flex h-[50px] items-center border-l-4 border-transparent pl-14',
        pathname === href && 'border-accent bg-primary/60',
      )}
      href={href}
    >
      {children}
    </Link>
  );
};

export const LoginSidebar = () => {
  const pathname = usePathname();
  console.log('pathname', pathname);
  return (
    <div className='flex h-full justify-end'>
      <div className='flex w-[250px] flex-col pt-32'>
        <SidebarItem href='/login' pathname={pathname}>
          Login
        </SidebarItem>
        <SidebarItem href='/sign-up' pathname={pathname}>
          Sign Up
        </SidebarItem>
      </div>
    </div>
  );
};
