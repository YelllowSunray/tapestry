'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess: () => void; // Callback for successful authentication
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validate passwords match for signup
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isSignUp) {
        // Sign Up
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Optional: Redirect after email confirmation if enabled
            // emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (response.error) {
          if (response.error.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw response.error;
        }

        // Only show confirmation message if there's no error and it's a new user
        if (!response.error && response.data.user?.identities?.length === 0) {
          setMessage('Check your email for the confirmation link!');
        } else if (!response.error) {
          setMessage('Account created successfully! Redirecting...');
          onSuccess();
        }
      } else {
        // Sign In
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (response.error) {
          if (response.error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          }
          throw response.error;
        }
        
        onSuccess(); // Call success callback
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Handle specific error messages
      if (err.message) {
        setError(err.message);
      } else if (err.error_description) {
        setError(err.error_description);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
        {isSignUp ? 'Create Account' : 'Login'}
      </h2>
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // Supabase default minimum password length
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {message && (
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          </div>
        )}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <Link 
          href={isSignUp ? '/login' : '/signup'} 
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </Link>
      </div>
    </div>
  );
} 