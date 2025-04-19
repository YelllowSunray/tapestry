'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; content: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const client = supabase as SupabaseClient;
      let response;

      if (isSignUp) {
        // Sign Up
        response = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        // Sign In
        response = await client.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (response.error) {
        throw response.error;
      }

      setMessage({
        type: 'success',
        content: isSignUp
          ? 'Check your email for the confirmation link!'
          : 'Successfully signed in!',
      });
      
      if (!isSignUp) {
        onSuccess();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        content: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <div className="mt-8">
          <div className="mt-6">
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-md p-4 ${
                    message.type === 'error' ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <p
                    className={`text-sm ${
                      message.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading
                    ? 'Loading...'
                    : isSignUp
                    ? 'Sign up'
                    : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {isSignUp ? 'sign in' : 'sign up'}
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 