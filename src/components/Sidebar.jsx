'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  UtensilsCrossed, 
  ShoppingCart, 
  BarChart3,
  Settings,
  Menu
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white h-screen transition-all duration-300 sticky top-0`}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold">Restaurant Admin</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-bold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-400">Restaurant Owner</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}