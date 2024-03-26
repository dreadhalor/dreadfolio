import dotenv from 'dotenv';
import path from 'path';
import type { InitOptions } from 'payload/config';
import payload, { Payload } from 'payload';

type PayloadCache = {
  client: Payload | null;
  promise: Promise<Payload> | null;
};

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

let cached = (global as any).payload as PayloadCache | undefined;

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
}

type Args = {
  initOptions?: Partial<InitOptions>;
};
export const getPayloadClient = async ({ initOptions }: Args = {}) => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('Missing PAYLOAD_SECRET environment variable');
  }

  if (cached?.client) {
    return cached.client;
  }

  if (cached && !cached?.promise) {
    cached.promise = payload.init({
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    });
  }

  try {
    if (cached) cached.client = (await cached?.promise) ?? null;
  } catch (error) {
    if (cached) cached.promise = null;
    console.error(error);
    throw error;
  }

  if (!cached) return null;
  return cached.client;
};
