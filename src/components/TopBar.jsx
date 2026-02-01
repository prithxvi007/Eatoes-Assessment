'use client';

import { Bell, Search, User } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-end justify-between px-6 py-4">
       
        <div className="flex items-center space-x-4">
          
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">Restaurant Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}