'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isClientArea = pathname?.startsWith('/client');
  const isAdminArea = pathname?.startsWith('/admin');

  if (isClientArea) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/client/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CreditPro
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/client/dashboard"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/client/dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/client/new-request"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/client/new-request' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                New Request
              </Link>
              <Link
                href="/client/requests"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/client/requests' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                My Requests
              </Link>
              <Link
                href="/client/profile"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/client/profile' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Profile
              </Link>
              <Link href="/login" className="ml-2 px-4 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return null;
}
