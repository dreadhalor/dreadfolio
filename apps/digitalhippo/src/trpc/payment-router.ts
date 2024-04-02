import { z } from 'zod';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { getPayloadClient } from '../get-payload';
import { stripe } from '../lib/stripe';
import type Stripe from 'stripe';

export const paymentRouter = router({
  createSession: privateProcedure
    .input(
      z.object({
        products: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { products } = input;
      const productIds = products.map(({ productId }) => productId);

      if (products.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No products to purchase',
        });
      }

      const payload = await getPayloadClient();
      if (!payload) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payload not found',
        });
      }

      const { docs: databaseProducts } = await payload.find({
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
        depth: 1,
      });

      const filteredProducts = databaseProducts.filter(({ priceId }) =>
        Boolean(priceId),
      );

      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map(({ id }) => id),
          user: user.id,
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      for (const { productId, quantity } of products) {
        const product = filteredProducts.find((p) => p.id === productId);
        if (product) {
          line_items.push({
            price: product.priceId!,
            quantity,
            adjustable_quantity: {
              enabled: false,
            },
          });
        }
      }

      line_items.push({
        price: 'price_1Oz8z007WpqPgCkfm5iHOqqg',
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ['card'],
          mode: 'payment',
          metadata: {
            userId: user.id,
            orderId: order.id,
          },
          line_items,
        });

        return { url: stripeSession.url };
      } catch (error) {
        console.error(error);

        return { url: null };
      }
    }),

  pollOrderStatus: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input: { orderId } }) => {
      const payload = await getPayloadClient();
      if (!payload) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payload not found',
        });
      }

      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: {
          id: {
            equals: orderId,
          },
        },
      });

      const [order] = orders;

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      return { isPaid: order._isPaid };
    }),
});
