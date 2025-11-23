'use client';

import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
              404
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-20 blur-3xl"></div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          {/* Search or Navigation Suggestion */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700 mb-4">
              Looking for something specific? Try navigating from the home page or using the search feature.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              asChild
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link 
              href="/admin/dashboard"
              className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium text-purple-700"
            >
              Admin Portal
            </Link>
            <Link 
              href="/teacher/dashboard"
              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700"
            >
              Teacher Portal
            </Link>
            <Link 
              href="/parent/dashboard"
              className="p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-sm font-medium text-pink-700"
            >
              Parent Portal
            </Link>
            <Link 
              href="/auth/login"
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Need help? Contact support or visit our help center
        </p>
      </div>
    </div>
  );
}
