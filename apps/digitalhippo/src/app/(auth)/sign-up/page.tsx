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
import { ZodError } from 'zod';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@digitalhippo/components/login/signup-form';
import { LoginSidebar } from '@digitalhippo/components/login/login-sidebar';

const Page = () => {
  const form = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const router = useRouter();

  const { mutate } = trpc.auth.createPayloadUser.useMutation({
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('This email is already in use. Sign in instead!');
        return;
      }
      if (error instanceof ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
      toast.error('Something went wrong. Please try again later.');
      return;
    },
    onSuccess: ({ sentToEmail }) => {
      toast.success(`Sent verification email to ${sentToEmail}`);
      router.push(`/verify-email?to=${sentToEmail}`);
    },
  });

  function onSubmit(formData: TAuthCredentialsValidator) {
    mutate(formData);
  }

  return (
    <>
      <div className='grid h-full w-full grid-cols-3'>
        <div>
          <LoginSidebar />
        </div>
        <div className='container relative flex flex-col items-center justify-center py-20 lg:px-0'>
          <SignupForm />
        </div>
        <div></div>
      </div>
    </>
  );
};

export default Page;
