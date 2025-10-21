'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layout/main-layout';
import { Plus, FileText, List, BarChart } from 'lucide-react';

const features = [
  {
    title: 'Create Test',
    description: 'Create a new test for your batch',
    href: '/teacher/tests/create',
    icon: <Plus className="h-6 w-6" />,
    color: 'bg-blue-500'
  },
  {
    title: 'View Tests',
    description: 'View and manage existing tests',
    href: '/teacher/tests/view',
    icon: <List className="h-6 w-6" />,
    color: 'bg-green-500'
  },
  {
    title: 'Grade Tests',
    description: 'Enter marks and grade tests',
    href: '/teacher/tests/grade',
    icon: <FileText className="h-6 w-6" />,
    color: 'bg-purple-500'
  },
  {
    title: 'Analytics',
    description: 'View test performance analytics',
    href: '/teacher/tests/analytics',
    icon: <BarChart className="h-6 w-6" />,
    color: 'bg-orange-500'
  }
];

export default function TeacherTestsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Test Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="block">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} text-white flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Click to access
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-1">Upcoming Tests</h3>
              <p className="text-sm text-gray-600">View scheduled tests for next week</p>
              <Link 
                href="/teacher/tests/view?filter=upcoming" 
                className="block w-full mt-3"
              >
                <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  View Schedule
                </button>
              </Link>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-1">Pending Grades</h3>
              <p className="text-sm text-gray-600">Tests waiting to be graded</p>
              <Link 
                href="/teacher/tests/grade?filter=pending" 
                className="block w-full mt-3"
              >
                <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  Grade Tests
                </button>
              </Link>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-1">Recent Results</h3>
              <p className="text-sm text-gray-600">View latest test results</p>
              <Link 
                href="/teacher/tests/view?filter=recent" 
                className="block w-full mt-3"
              >
                <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  View Results
                </button>
              </Link>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-1">Performance Trends</h3>
              <p className="text-sm text-gray-600">Analyze student performance</p>
              <Link 
                href="/teacher/tests/analytics" 
                className="block w-full mt-3"
              >
                <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  View Analytics
                </button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
