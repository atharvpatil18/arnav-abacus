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
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white border-r border-slate-200 shadow-sm`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              Arnav Abacus
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-3">
            <nav>
              <ul className="space-y-1">
                {filteredNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        pathname === item.href
                          ? 'bg-primary-50 text-primary-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 flex items-center justify-between lg:hidden">
           <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            ☰
          </button>
          <span className="font-semibold text-slate-900">Arnav Abacus</span>
          <div className="w-8" /> {/* Spacer */}
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}