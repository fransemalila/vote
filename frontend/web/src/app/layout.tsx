import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tanzania Voting Platform',
  description: 'Secure, real-time voting for Tanzania elections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen font-sans">
        <header className="bg-blue-900 text-white p-4 shadow">
          <h1 className="text-xl font-bold">Tanzania Voting Platform</h1>
        </header>
        <main className="p-4 max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
