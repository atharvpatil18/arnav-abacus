'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { Calculator, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    login({ email, password });
    // Note: isLoading state will be reset by the mutation's onSuccess/onError
    // We can remove the manual reset since the page will redirect on success
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-lg p-3 rounded-2xl border border-white/10">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Arnav Abacus Academy</h1>
            </div>
            <p className="text-primary-100 text-lg max-w-md">
              Empowering minds through the ancient art of mental math. Join our community of learners today.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 transform hover:scale-105 transition-transform duration-300 hover:bg-white/10">
              <div className="flex items-start gap-4">
                <div className="bg-secondary-500/20 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Track Student Progress</h3>
                  <p className="text-primary-200 text-sm">Monitor attendance, tests, and skill development in real-time</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 transform hover:scale-105 transition-transform duration-300 hover:bg-white/10">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Comprehensive Analytics</h3>
                  <p className="text-primary-200 text-sm">Get insights into performance trends and learning patterns</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 transform hover:scale-105 transition-transform duration-300 hover:bg-white/10">
              <div className="flex items-start gap-4">
                <div className="bg-rose-500/20 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Smart Communication</h3>
                  <p className="text-primary-200 text-sm">Multi-channel notifications via Email, SMS, and WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-primary-300 text-sm">
            © 2025 Arnav Abacus Academy. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="bg-primary-600 p-3 rounded-2xl">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Arnav Abacus Academy
              </h1>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-slate-500">
                  Sign in to access your dashboard
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="h-12 px-4 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02]"
                  loading={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Need help?{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
