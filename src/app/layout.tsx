import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Thai Document Generator - MFEC',
  description: 'Automatically generate professional Thai user manuals and product documents following MFEC format standards using advanced AI technology.',
  keywords: ['Thai documents', 'MFEC', 'AI document generation', 'user manuals', 'product documentation'],
  authors: [{ name: 'MFEC Public Company Limited' }],
  creator: 'MFEC Public Company Limited',
  publisher: 'MFEC Public Company Limited',
  robots: 'index, follow',
  openGraph: {
    title: 'Thai Document Generator - MFEC',
    description: 'Automatically generate professional Thai user manuals and product documents following MFEC format standards using advanced AI technology.',
    type: 'website',
    locale: 'th_TH',
    siteName: 'Thai Document Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thai Document Generator - MFEC',
    description: 'Automatically generate professional Thai user manuals and product documents following MFEC format standards using advanced AI technology.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}