'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../components/AuthForm';

export default function SignUpPage() {
  const router = useRouter();

  const handleSignUpSuccess = () => {
    // Redirect to home page after successful signup 
    // (or potentially a 'check your email' page if confirmation is required)
    // The AuthForm component itself shows the 'Check email' message if needed.
    // We only redirect here if signup doesn't require confirmation OR after confirmation.
    // For simplicity, we'll redirect home.
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center pt-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <AuthForm mode="signup" onSuccess={handleSignUpSuccess} />
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            &larr; Go back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 