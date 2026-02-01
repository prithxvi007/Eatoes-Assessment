'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-lg px-4">
        {/* Error Code */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-gray-800 opacity-10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-4xl text-white font-bold">!</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
              <p className="text-gray-600">Oops! The page you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-6">
          <p className="text-gray-600 text-lg">
            The page may have been moved, deleted, or you might have entered an incorrect URL.
          </p>
          
          {/* Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Suggestions:</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
              <li>Check the URL for typos</li>
              <li>Use the navigation menu to find your page</li>
              <li>Return to the dashboard</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}