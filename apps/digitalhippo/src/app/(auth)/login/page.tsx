'use client';
import Logo from '@digitalhippo/assets/logo.svg';
import { Button, buttonVariants } from '@digitalhippo/components/ui/button';
import { Input } from '@digitalhippo/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@digitalhippo/components/ui/form';
import { cn } from '@digitalhippo/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TAuthCredentialsValidator,
  AuthCredentialsValidator,
} from '@digitalhippo/lib/validators/account-credentials-validator';
import { trpc } from '@digitalhippo/trpc/client';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@digitalhippo/components/login/login-form';
import { LoginSidebar } from '@digitalhippo/components/login/login-sidebar';

const Page = () => {
  return (
    <>
      <div className='grid h-full w-full grid-cols-3'>
        <div>
          <LoginSidebar />
        </div>
        <div className='container relative flex flex-col items-center justify-center py-20 lg:px-0'>
          <LoginForm />
        </div>
        <div></div>
      </div>
    </>
  );
};

export default Page;
