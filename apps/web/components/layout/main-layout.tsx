'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface NavItem {
  label: string;
  href: string;
  roles: ('ADMIN' | 'TEACHER' | 'PARENT')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', roles: ['ADMIN'] },
  { label: 'Students', href: '/admin/students', roles: ['ADMIN'] },
  { label: 'Batches', href: '/admin/batches', roles: ['ADMIN'] },
  { label: 'Levels', href: '/admin/levels', roles: ['ADMIN'] },
  { label: 'Fees', href: '/admin/fees', roles: ['ADMIN'] },
  { label: 'Reports', href: '/admin/reports', roles: ['ADMIN'] },
  { label: 'Dashboard', href: '/teacher/dashboard', roles: ['TEACHER'] },
  { label: 'Attendance', href: '/teacher/attendance', roles: ['TEACHER'] },
  { label: 'Tests', href: '/teacher/tests', roles: ['TEACHER'] },
  { label: 'My Profile', href: '/student/profile', roles: ['PARENT'] },
  { label: 'Attendance', href: '/student/attendance', roles: ['PARENT'] },
  { label: 'Tests', href: '/student/tests', roles: ['PARENT'] },
  { label: 'Fees', href: '/student/fees', roles: ['PARENT'] },
];

export default function MainLayout({
  children,
  userRole = 'ADMIN' // This should come from your auth context
}: {
  children: React.ReactNode;
  userRole?: string;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  // use the top-level `toast` import

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole as any));

  const handleLogout = () => {
    // Implement logout logic
    toast.success('Logged out', { description: 'You have been successfully logged out.' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold">Arnav Abacus</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              ✕
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {filteredNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`p-4 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            ☰
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}