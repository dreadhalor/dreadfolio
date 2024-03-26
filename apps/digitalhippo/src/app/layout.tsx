import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@digitalhippo/lib/utils';
import { Navbar } from '@digitalhippo/components/navbar/navbar';
import { Providers } from '@digitalhippo/components/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DigitalHippo',
  description: 'Your marketplace for high-quality digital assets.',
};

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
          </Providers>
        </main>
        <Toaster position='top-center' richColors />
      </body>
    </html>
  );
}
