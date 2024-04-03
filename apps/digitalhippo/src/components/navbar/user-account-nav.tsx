'use client';

import { User } from '@flowerchild/payload-types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Link from 'next/link';
import { useAuth } from '@flowerchild/hooks/use-auth';

type Props = {
  user: User;
};
export const UserAccountNav = ({ user: { email } }: Props) => {
  const { signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='overflow-visible'>
        <Button className='relative h-full rounded-none border-b-2 border-transparent bg-transparent text-gray-600 hover:border-red-400 hover:bg-transparent data-[state=open]:border-red-400 data-[state=open]:bg-transparent'>
          My account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-60 bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-0.5 leading-none'>
            <p className='text-sm font-medium text-black'>{email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/sell'>Seller Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer' onClick={signOut}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
