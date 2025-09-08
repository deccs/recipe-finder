import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe Finder',
  description: 'Discover, save, and cook delicious recipes',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        <SessionProvider>
          <div className="min-h-full flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      © {new Date().getFullYear()} Recipe Finder. All rights reserved.
                    </p>
                  </div>
                  <div className="flex space-x-6">
                    <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                      About
                    </a>
                    <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                      Contact
                    </a>
                    <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                      Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}