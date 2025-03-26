import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { LoadingProvider } from '@/components/loading-provider';
import { cn } from '@/lib/utils';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'olang',
  description: 'olang',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="size-full">
      <body
        className={cn(
          'size-full antialiased',
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
