import { PaymentStatus } from '@flowerchild/components/payment-status';
import { getPayloadClient } from '@flowerchild/get-payload';
import { getServerSideUser } from '@flowerchild/lib/payload-utils';
import { cn } from '@flowerchild/lib/utils';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { OrderItem } from './order-item';
import { PriceTotalFooter } from './price-total-footer';
import { ThankYouHeader } from './thank-you-header';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const ThankYouPage = async ({ searchParams: { orderId } }: Props) => {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  const payload = await getPayloadClient();
  if (!payload) return null;

  const { docs: orders } = await payload.find({
    collection: 'orders',
    depth: 2,
    where: {
      id: {
        equals: orderId,
      },
    },
  });

  const [order] = orders;
  if (!order) return notFound();

  const orderUserId =
    typeof order.user === 'string' ? order.user : order.user.id;
  if (orderUserId !== user?.id)
    return redirect(`/login?origin=thank-you?orderId=${orderId}`);

  const orderEmail =
    typeof order.user === 'string' ? order.user : order.user.email;

  // Fetch the order items and their associated products
  const { docs: orderItems } = await payload.find({
    collection: 'order-items',
    depth: 2,
    where: {
      order: {
        equals: order.id,
      },
    },
  });

  return (
    <main className='relative lg:min-h-full'>
      <div className='hidden h-80 overflow-hidden lg:absolute lg:block lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12'>
        <Image
          fill
          src='/checkout-thank-you.webp'
          className='h-full w-full object-cover object-center'
          alt='Thank you for your purchase!'
        />
      </div>

      <div>
        <div
          className={cn(
            'mx-auto max-w-2xl px-4 py-16',
            'sm:px-6 sm:py-24',
            'lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32',
            'xl:gap-x-24',
          )}
        >
          <div className='lg:col-start-2'>
            <ThankYouHeader order={order} />

            <div className='mt-16 text-sm font-medium'>
              <div className='text-muted-foreground'>Order number:</div>
              <div className='mt-2 text-gray-900'>{order.id}</div>

              <ul className='text-muted-foreground mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium'>
                {orderItems.map((orderItem) => (
                  <OrderItem key={orderItem.id} orderItem={orderItem} />
                ))}
              </ul>

              <PriceTotalFooter order={order} />

              <PaymentStatus
                orderEmail={orderEmail}
                orderId={order.id}
                isPaid={order._isPaid}
              />

              <div className='mt-16 border-t border-gray-200 py-6 text-right'>
                <Link
                  href='/products'
                  className='text-sm font-medium text-blue-600 hover:text-blue-500'
                >
                  Continue shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ThankYouPage;
