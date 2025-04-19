// No 'use client' needed, this is a Server Component
import Link from 'next/link';
import NavbarAuth from './NavbarAuth';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-purple-100 dark:border-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                Tapestry
              </span>
            </Link>
          </div>
          
          <NavbarAuth />

          {/* Keep Mobile menu static/placeholder for now */}
          <div className="md:hidden flex items-center">
            {/* Placeholder or static content for mobile */}
          </div>
        </div>
      </div>
    </nav>
  );
}
