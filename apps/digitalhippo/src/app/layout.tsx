import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@digitalhippo/lib/utils';
import { Navbar } from '@digitalhippo/components/navbar/navbar';

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
          <Navbar />
          <div className='flex-1 flex-grow'>{children}</div>
        </main>
      </body>
    </html>
  );
}
