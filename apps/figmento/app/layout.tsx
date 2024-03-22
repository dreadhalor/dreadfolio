import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@repo/utils';
import { Room } from './room';
import { CursorStateProvider } from '@figmento/providers/cursor-state-provider';
import { ReactionsProvider } from '@figmento/providers/reactions-provider';
import { PresenceProvider } from '@figmento/providers/presence-provider';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Figmento',
  description: 'A Figma-like app built with Liveblocks & Fabric.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={cn(workSans.className, 'bg-primary-grey-200')}>
        <Room>
          <PresenceProvider>
            <CursorStateProvider>
              <ReactionsProvider>{children}</ReactionsProvider>
            </CursorStateProvider>
          </PresenceProvider>
        </Room>
      </body>
    </html>
  );
}
