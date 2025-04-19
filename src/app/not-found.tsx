import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-800 dark:text-gray-200">Page Not Found</h2>
        <p className="mt-4 mb-8 text-gray-600 dark:text-gray-300">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 