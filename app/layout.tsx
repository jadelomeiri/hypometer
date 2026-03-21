import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'HypeOmeter',
  description: 'Separate AI substance from AI vibes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
