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
  AuthCredentials,
  AuthCredentialsValidator,
} from '@digitalhippo/lib/validators/account-credentials-validator';
import { trpc } from '@digitalhippo/trpc/client';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

const Page = () => {
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

  const form = useForm<AuthCredentials>({
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

  function onSubmit(formData: AuthCredentials) {
    mutate(formData);
  }

  return (
    <>
      <div className='container relative flex flex-col items-center justify-center pt-20 lg:px-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col items-center space-y-2 text-center'>
            <Logo className='h-20 w-20' />
            <h1 className='text-2xl font-bold'>
              Sign into your {isSeller ? 'seller ' : ''}account
            </h1>
            <Link
              href='/sign-up '
              className={buttonVariants({
                variant: 'link',
                className: 'gap-1.5',
              })}
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
                  <Button className='mt-4' type='submit'>
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
                <span className='bg-background text-muted-foreground px-2'>
                  or
                </span>
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
      </div>
    </>
  );
};

export default Page;
