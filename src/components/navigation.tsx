'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, 
  Search, 
  Plus, 
  Heart, 
  ShoppingCart, 
  Timer, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Recipes', href: '/recipes', icon: Search },
    { name: 'Create Recipe', href: '/recipes/create', icon: Plus },
  ];

  const userNavigation = [
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Shopping Lists', href: '/shopping-lists', icon: ShoppingCart },
    { name: 'Timers', href: '/timers', icon: Timer },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">RecipeFinder</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            {status === 'loading' ? (
              <div className="animate-pulse h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            ) : session ? (
              <>
                <div className="flex space-x-4">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isActive(item.href) ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      title={item.name}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  ))}
                </div>
                
                <div className="ml-4 flex items-center">
                  <div className="relative">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {session.user?.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            
            {status === 'loading' ? (
              <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            ) : session ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {session.user?.name}
                    </div>
                  </div>
                  <div className="mt-1 px-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                        isActive(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-start px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3 flex flex-col space-y-2 px-3">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}