import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { Users } from './collections/users';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import dotenv from 'dotenv';
import { Products } from './collections/products';
import { Media } from './collections/media';
import { Orders } from './collections/orders';
import { Categories } from './collections/categories';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const adapter = s3Adapter({
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION || '',
  },
  bucket: process.env.S3_BUCKET || '',
});

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  collections: [Users, Products, Media, Orders, Categories],
  routes: {
    admin: '/sell',
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Digital Hippo',
      favicon: '/favicon.ico',
      ogImage: '/thumbnail.jpg',
    },
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || '',
  }),
  rateLimit: {
    max: 2000,
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter,
        },
      },
    }),
  ],
});
