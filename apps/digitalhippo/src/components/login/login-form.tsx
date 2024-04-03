import React from 'react';
import { Button, buttonVariants } from '../ui/button';
import Logo from '@flowerchild/assets/logo.svg';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@flowerchild/lib/utils';
import { ArrowRight } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { trpc } from '@flowerchild/trpc/client';
import { toast } from 'sonner';
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from '@flowerchild/lib/validators/account-credentials-validator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSeller = searchParams.get('as') === 'seller';
  const origin = searchParams.get('origin');

  const continueAsSeller = () => {
    router.push('?as=seller');
  };
  const continueAsCustomer = () => {
    router.replace('/login', undefined);
  };

  const form = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isLoading } = trpc.auth.signIn.useMutation({
    onSuccess() {
      toast.success('Signed in successfully!');

      if (origin) {
        router.push(`/${origin}`);
        return;
      }

      if (isSeller) {
        router.push('/sell');
        return;
      }

      router.push('/');
      router.refresh();
    },
    onError(error) {
      if (error.data?.code === 'UNAUTHORIZED') {
        toast.error('Invalid email or password');
        return;
      }
      // generic error
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  function onSubmit(formData: TAuthCredentialsValidator) {
    mutate(formData);
  }

  return (
    <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
      <div className='flex flex-col items-center space-y-2 text-center'>
        <Logo className='mb-5 h-20 w-20' />
        <h1 className='text-2xl font-bold'>
          Sign into your {isSeller ? 'seller ' : ''}account
        </h1>
        <Link
          href='/sign-up '
          className={cn(
            buttonVariants({
              variant: 'link',
              className: 'gap-1.5',
            }),
            'text-blue-400',
          )}
        >
          Don't have an account? Sign up!
          <ArrowRight className='h-4 w-4' />
        </Link>
      </div>
      <div className='grid gap-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        className={cn(
                          form.formState.errors.email &&
                            'focus-visible:ring-red-500',
                        )}
                        placeholder='you@example.com'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        className={cn(
                          form.formState.errors.password &&
                            'focus-visible:ring-red-500',
                        )}
                        placeholder='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant='secondary' className='mt-4' type='submit'>
                Log in
              </Button>
            </div>
          </form>
        </Form>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center' aria-hidden>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>or</span>
          </div>
        </div>
        {isSeller ? (
          <Button
            variant='secondary'
            disabled={isLoading}
            onClick={continueAsCustomer}
          >
            Continue as customer
          </Button>
        ) : (
          <Button
            variant='secondary'
            disabled={isLoading}
            onClick={continueAsSeller}
          >
            Continue as seller
          </Button>
        )}
      </div>
    </div>
  );
};
