import { TRANSACTION_FEE } from '@digitalhippo/config';
import { formatPrice } from '@digitalhippo/lib/utils';
import { Order, Product } from '@digitalhippo/payload-types';

type Props = {
  order: Order;
};
export const PriceTotalFooter = ({ order }: Props) => {
  const orderSubTotal = (order.products as Product[]).reduce(
    (acc, product) => acc + product.price,
    0,
  );

  return (
    <div className='text-muted-foreground space-y-6 border-t border-gray-200 pt-6 text-sm font-medium'>
      <div className='flex justify-between'>
        <p>Subtotal</p>
        <p>{formatPrice(orderSubTotal)}</p>
      </div>
      <div className='flex justify-between'>
        <p>Transaction Fee</p>
        <p>{formatPrice(TRANSACTION_FEE)}</p>
      </div>

      <div className='flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900'>
        <p className='text-base'>Total</p>
        <p className='text-base'>
          {formatPrice(orderSubTotal + TRANSACTION_FEE)}
        </p>
      </div>
    </div>
  );
};
