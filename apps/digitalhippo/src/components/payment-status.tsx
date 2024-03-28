'use client';

import { trpc } from '@digitalhippo/trpc/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  orderEmail: string;
  orderId: string;
  isPaid: boolean;
};
export const PaymentStatus = ({ orderEmail, orderId, isPaid }: Props) => {
  const { data } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: !isPaid,
      refetchInterval: (data) => (data?.isPaid ? false : 1000),
    },
  );

  const router = useRouter();

  useEffect(() => {
    if (data?.isPaid) router.refresh();
  }, [data?.isPaid, router]);

  return (
    <div className='mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600'>
      <div>
        <p className='font-medium text-gray-900'>Shipping To</p>
        <p className=''>{orderEmail}</p>
      </div>

      <div>
        <p className='font-medium text-gray-900'>Order Status</p>
        <p className=''>{isPaid ? 'Payment successful' : 'Pending payment'}</p>
      </div>
    </div>
  );
};
