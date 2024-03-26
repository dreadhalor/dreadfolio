import { getPayloadClient } from '../get-payload';
import { publicProcedure, router } from './trpc';
import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input: { email, password } }) => {
      const payload = await getPayloadClient();
      if (!payload) {
        throw new Error('Payload not found');
      }

      // check if user exists
      const { docs } = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
      });

      if (docs.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }

      // create user
      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'user',
        },
      });

      return {
        success: true,
        sentToEmail: email,
      };
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input: { email, password }, ctx: { res } }) => {
      const payload = await getPayloadClient();
      if (!payload) {
        throw new Error('Payload not found');
      }

      try {
        await payload.login({
          collection: 'users',
          data: {
            email,
            password,
          },
          res,
        });
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      return {
        success: true,
      };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input: { token } }) => {
      const payload = await getPayloadClient();
      if (!payload) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payload not found',
        });
      }

      const isVerified = await payload.verifyEmail({
        collection: 'users',
        token,
      });

      if (!isVerified) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Cannot verify email with this token',
        });
      }

      return {
        success: true,
      };
    }),
});
