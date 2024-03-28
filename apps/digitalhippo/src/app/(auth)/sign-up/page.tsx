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
      <div className='container relative flex flex-col items-center justify-center pt-20 lg:px-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col items-center space-y-2 text-center'>
            <Logo className='h-20 w-20' />
            <h1 className='text-2xl font-bold'>Create an account</h1>
            <Link
              href='/login '
              className={buttonVariants({
                variant: 'link',
                className: 'gap-1.5',
              })}
            >
              Already have an account? Log in!
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
                    Sign up
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
