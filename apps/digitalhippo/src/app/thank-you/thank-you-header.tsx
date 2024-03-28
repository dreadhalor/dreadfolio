import { Order } from '@digitalhippo/payload-types';

type Props = {
  order: Order;
};
export const ThankYouHeader = ({ order }: Props) => {
  const orderEmail =
    typeof order.user === 'string' ? order.user : order.user.email;

  return (
    <>
      <p className='text-sm font-medium text-blue-600'>Order successful</p>
      <h1 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
        Thanks for ordering!
      </h1>
      {order._isPaid ? (
        <p className='text-muted-foreground mt-2 text-base'>
          Your order was processed & your assets are available to download
          below. We&apos;ve sent your receipt & order details to{' '}
          <span className='font-medium text-gray-900'>{orderEmail}</span>.
        </p>
      ) : (
        <p className='text-muted-foreground mt-2 text-base'>
          We appreciate your order, & we&apos;re currently processing it. Hang
          tight & we&apos;ll send you confirmation very soon!
        </p>
      )}
    </>
  );
};
