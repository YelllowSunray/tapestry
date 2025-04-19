'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Redirect to home page after successful login
    router.push('/');
    // Optionally, refresh the page to ensure layout updates based on new auth state
    router.refresh(); 
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center pt-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <AuthForm mode="signin" onSuccess={handleLoginSuccess} />
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            &larr; Go back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 