import type { ReactNode } from 'react';
import 'blue-comet/styles.css';
import './globals.css';

export const metadata = {
  title: 'Blue Comet · Next.js example',
  description: 'Demo of blue-comet integrated into a Next.js App Router blog.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
