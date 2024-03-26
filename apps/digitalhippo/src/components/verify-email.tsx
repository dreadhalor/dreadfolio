'use client';

import { trpc } from '@digitalhippo/trpc/client';
import { Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from './ui/button';

type Props = {
  token: string;
};
export const VerifyEmail = ({ token }: Props) => {
  const { data, isLoading, isError } = trpc.auth.verifyEmail.useQuery({
    token,
  });

  if (isLoading) {
    return (
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-300' />
        <h3 className='text-xl font-semibold'>Verifying...</h3>
        <p className='text-muted-foreground text-center text-sm'>
          This won&apos;t take long.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center gap-2'>
        <XCircle className='h-8 w-8 text-red-600' />
        <h3 className='text-xl font-semibold'>Oh no! There was a problem...</h3>
        <p className='text-muted-foreground text-center text-sm'>
          This token is not valid or might be expired. Please try again.
        </p>
      </div>
    );
  }

  if (data?.success) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <div className='text-muted-foreground relative mb-4 h-60 w-60'>
          <Image alt='the email was sent' src='/hippo-email-sent.png' fill />
        </div>
        <h3 className='text-2xl font-semibold'>You're all set!</h3>
        <p className='text-muted-foreground mt-1 text-center'>
          Thank you for verifying your email.
        </p>
        <Link href='/login' className={buttonVariants({ className: 'mt-4' })}>
          Log in
        </Link>
      </div>
    );
  }

  return <div>VerifyEmail</div>;
};
