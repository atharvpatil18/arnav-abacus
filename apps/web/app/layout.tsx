import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Arnav Abacus',
  description: 'Learning management system for Arnav Abacus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}