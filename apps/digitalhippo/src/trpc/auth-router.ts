import { getPayloadClient } from '../get-payload';
import { publicProcedure, router } from './trpc';
import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator';
import { TRPCError } from '@trpc/server';

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
      const user = await payload.create({
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
});
