'use client';

import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  CreditCard,
  MessageSquare,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';
import Loading from '../loading';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/parent/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Students', href: '/parent/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Profile', href: '/parent/profile', icon: <UserCircle className="w-5 h-5" /> },
  { label: 'Attendance', href: '/parent/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: 'Reports', href: '/parent/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Fees', href: '/parent/fees', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Homework', href: '/parent/homework', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Messages', href: '/parent/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Events', href: '/parent/events', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Notifications', href: '/parent/notifications', icon: <Bell className="w-5 h-5" /> },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return <Loading />;
  }

  const displayName = user?.name || 'Parent';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/parent/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-primary-900">
                  Arnav Abacus Academy
                </h1>
                <p className="text-xs text-slate-500">Parent Portal</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <UserCircle className="w-8 h-8 text-primary-600" />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500">{user?.role || 'PARENT'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:block fixed left-0 top-[73px] h-[calc(100vh-73px)] bg-white/80 backdrop-blur-md border-r border-white/20 shadow-sm transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <Link
                href="/parent/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] z-30 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="w-64 h-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <nav className="p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <Link
                    href="/parent/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </div>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
          }`}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
