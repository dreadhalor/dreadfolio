import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn, constructMetadata } from '@digitalhippo/lib/utils';
import { Navbar } from '@digitalhippo/components/navbar/navbar';
import { Providers } from '@digitalhippo/components/providers';
import { Toaster } from 'sonner';
import { Footer } from '@digitalhippo/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = constructMetadata({
  title: 'DigitalHippo - the marketplace for digital assets',
  description:
    'DigitalHippo is an open-source marketplace for high-quality digital goods.',
  image: '/thumbnail.png',
  icons: '/favicon.ico',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='h-full p-0'>
      <body
        className={cn(
          'relative h-full p-0 font-sans antialiased',
          inter.className,
        )}
      >
        <main className='relative flex min-h-full flex-col'>
          <Providers>
            <Navbar />
            <div className='flex-1 flex-grow'>{children}</div>
            <Footer />
          </Providers>
        </main>
        <Toaster position='top-center' richColors />
      </body>
    </html>
  );
}
