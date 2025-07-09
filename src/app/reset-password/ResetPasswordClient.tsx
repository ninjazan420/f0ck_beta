'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RandomLogo } from '@/components/RandomLogo';
import { Footer } from '@/components/Footer';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [username, setUsername] = useState('');

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setTokenValid(true);
          setUsername(data.username || '');
        } else {
          setError(data.error || 'Invalid or expired reset token');
        }
      } catch (err) {
        setError('Failed to verify reset token');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
        <div className="w-full flex justify-center py-8">
          <RandomLogo />
        </div>
        <div className="container mx-auto px-4 py-4 max-w-lg flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying reset token...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tokenValid || error) {
    return (
      <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
        <div className="w-full flex justify-center py-8">
          <RandomLogo />
        </div>
        <div className="container mx-auto px-4 py-4 max-w-lg flex-grow">
          <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
              Invalid Reset Link
            </h2>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 mb-6">
              {error || 'The password reset link is invalid or has expired.'}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This could happen if:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>The link has expired (links are valid for 1 hour)</li>
              <li>The link has already been used</li>
              <li>The link was copied incorrectly</li>
            </ul>
            
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full text-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Request New Reset Link
              </Link>
              
              <Link
                href="/login"
                className="block w-full text-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
        <div className="w-full flex justify-center py-8">
          <RandomLogo />
        </div>
        <div className="container mx-auto px-4 py-4 max-w-lg flex-grow">
          <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
                Password Reset Successful
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              
              <Link
                href="/login"
                className="inline-block mt-6 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
            Create New Password
          </h2>
          
          {username && (
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Setting new password for: <strong>{username}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your new password"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative h-12 w-full mt-6 rounded-lg overflow-hidden transition-all duration-500 group"
            >
              <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]">
                <div className="absolute inset-0 bg-[#170928] rounded-lg opacity-90"></div>
              </div>
              <div className="absolute inset-[2px] bg-[#170928] rounded-lg opacity-95"></div>
              <div className="absolute inset-[2px] bg-gradient-to-r from-[#170928] via-[#1d0d33] to-[#170928] rounded-lg opacity-90"></div>
              <div className="absolute inset-[2px] bg-gradient-to-b from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30 rounded-lg opacity-80"></div>
              <div className="absolute inset-[2px] bg-gradient-to-br from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50 rounded-lg"></div>
              <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(199,135,246,0.15)] rounded-lg"></div>
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-lg font-normal bg-gradient-to-b from-[#D69DDE] to-[#B873F8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(199,135,246,0.4)] tracking-tighter">
                  {loading ? 'Updating Password...' : 'Update Password'}
                </span>
              </div>
              <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>
      <div className="container mx-auto px-4 py-4 max-w-lg flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}